import { apiRequest } from "utils/Utilities";
import { getEligibleDateImages } from "utils/dateState";
import { readCreateDateFlow, writeCreateDateFlow } from "utils/createDateFlow";

/**
 * Pre-fetches the data needed by the create-date review page so the preview
 * photo renders instantly when the user reaches it, instead of waiting 2-5
 * seconds for the dates API call + image network download.
 *
 * Strategy:
 *  1. Call the same `date` API the review page uses, in parallel with whatever
 *     the user is doing on an earlier step.
 *  2. Compute the eligible images (those not used by another active date).
 *  3. Persist the chosen `image_index` into the create-date flow store so the
 *     review page can initialize `currentImageIndex` synchronously on first
 *     render.
 *  4. Warm the browser cache for the actual image URL via `new Image()` so the
 *     <Image> tag renders instantly.
 *
 * Safe to call from multiple steps - results are deduped while in-flight, and
 * the function never throws.
 */

const normalizeImageList = (list = []) => {
  if (!Array.isArray(list)) return [];

  return list
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === "string") {
        return { url: item, index };
      }
      if (typeof item === "object") {
        const url = item.url || item.location || "";
        const idx = Number.isFinite(Number(item.index))
          ? Number(item.index)
          : index;
        return url ? { url, index: idx } : null;
      }
      return null;
    })
    .filter(Boolean)
    .reduce((acc, item) => {
      if (acc.some((existing) => existing.url === item.url)) return acc;
      acc.push(item);
      return acc;
    }, []);
};

let inFlightPrefetch = null;
let lastPrefetchKey = null;

const buildPrefetchKey = (user, isEditMode) =>
  `${user?.user_name || ""}|${(user?.images || []).length}|${
    (user?.un_verified_images || []).length
  }|${isEditMode ? 1 : 0}`;

const preloadImage = (url) => {
  if (!url || typeof window === "undefined") return;
  try {
    const img = new window.Image();
    // Hints to the browser that this is a high-priority image.
    if ("decoding" in img) img.decoding = "async";
    if ("fetchPriority" in img) img.fetchPriority = "high";
    img.src = url;
  } catch (err) {
    // Ignore preload failures - this is a best-effort optimization.
  }
};

export const prefetchReviewImage = ({ user, isEditMode = false } = {}) => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!user?.user_name) return Promise.resolve(null);

  const key = buildPrefetchKey(user, isEditMode);

  // Dedupe: if a prefetch with the same inputs is already running, reuse it.
  if (inFlightPrefetch && lastPrefetchKey === key) {
    return inFlightPrefetch;
  }

  lastPrefetchKey = key;

  inFlightPrefetch = (async () => {
    try {
      const previewImages = normalizeImageList([
        ...(user?.images || []),
        ...(user?.un_verified_images || []),
      ]);

      if (!previewImages.length) return null;

      const flow = readCreateDateFlow();
      const editImageIndex = Number(flow?.editImageIndex);

      const res = await apiRequest({
        url: "date",
        params: {
          user_name: user.user_name,
          current_page: 1,
          per_page: 10000,
        },
        timeout: 15000,
      });

      const dates = res?.data?.data?.dates || [];
      const editingDate = dates.find(
        (date) => String(date?._id) === String(flow?.dateId)
      );
      const preferredEditImageIndex = Number.isFinite(editImageIndex)
        ? editImageIndex
        : Number(editingDate?.image_index);

      const available = getEligibleDateImages(previewImages, dates, {
        includeIndex:
          isEditMode && Number.isFinite(preferredEditImageIndex)
            ? preferredEditImageIndex
            : null,
      });

      if (!available.length) return null;

      // Pick the same image the review page would pick.
      const savedIndex = Number(flow?.image_index);
      let selectedIndex;
      if (
        isEditMode &&
        Number.isFinite(preferredEditImageIndex) &&
        available.some((img) => img.index === preferredEditImageIndex)
      ) {
        selectedIndex = preferredEditImageIndex;
      } else if (
        Number.isFinite(savedIndex) &&
        available.some((img) => img.index === savedIndex)
      ) {
        selectedIndex = savedIndex;
      } else {
        selectedIndex = available[0].index;
      }

      // Persist so the review page renders the correct image on first paint.
      try {
        writeCreateDateFlow({ image_index: selectedIndex });
      } catch (err) {
        // Non-fatal.
      }

      // Warm the browser cache for the URL the review page will use.
      // The review page prefers `effectiveUser.images[currentImageIndex]`, so
      // try that first, falling back to the eligible image's url.
      const userImageUrl =
        Array.isArray(user?.images) && user.images[selectedIndex]
          ? typeof user.images[selectedIndex] === "string"
            ? user.images[selectedIndex]
            : user.images[selectedIndex]?.url ||
              user.images[selectedIndex]?.location
          : null;
      const fallbackUrl = available.find((img) => img.index === selectedIndex)?.url;

      preloadImage(userImageUrl || fallbackUrl);

      return { selectedIndex, available };
    } catch (err) {
      // Fail silently - the review page has its own fetch as a fallback.
      return null;
    } finally {
      inFlightPrefetch = null;
    }
  })();

  return inFlightPrefetch;
};

export default prefetchReviewImage;
