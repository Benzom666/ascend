const normalizeStatus = (value) => {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  return value;
};

const normalizeDateModerationStatus = (value) => {
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : value.trim().toLowerCase();
  }
  return value;
};

export const isActiveDate = (date = {}) => {
  // SIMPLIFIED: Match old repo logic
  // Just check if date is published (date_status === true)
  // Backend API already filters out blocked/deleted/warned dates (status 3, 4, 6)
  // So we only get valid dates from API - just check if published
  const publishStatus = normalizeStatus(date?.date_status);
  return (
    publishStatus === true ||
    publishStatus === 1 ||
    publishStatus === "1" ||
    publishStatus === "true"
  );
};

export const isDraftDate = (date = {}) => {
  const status = normalizeStatus(date?.date_status);
  return (
    status === false || status === 0 || status === "0" || status === "false"
  );
};

export const normalizeImageIndex = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0
    ? numericValue
    : fallback;
};

export const getActiveDateCount = (dates = []) =>
  dates.filter((date) => isActiveDate(date)).length;

export const getLatestDraftDate = (dates = []) =>
  [...dates]
    .filter((date) => isDraftDate(date))
    .sort((left, right) => {
      const leftTime = new Date(left?.updated_at || left?.created_at || 0).getTime();
      const rightTime = new Date(right?.updated_at || right?.created_at || 0).getTime();
      return rightTime - leftTime;
    })[0];

const resolveImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (typeof image === "object") {
    return image.url || image.location || "";
  }
  return "";
};

export const getNormalizedImages = (images = []) =>
  images
    .map((image, index) => ({
      url: resolveImageUrl(image),
      index,
    }))
    .filter((image) => image.url);

export const getUsedActiveImageIndices = (dates = []) =>
  new Set(
    dates
      .filter((date) => isActiveDate(date))
      .map((date) => normalizeImageIndex(date?.image_index))
  );

export const getEligibleDateImages = (
  images = [],
  dates = [],
  options = {}
) => {
  const { includeIndex = null } = options;
  const normalizedImages = getNormalizedImages(images);
  const usedIndices = getUsedActiveImageIndices(dates);

  if (Number.isFinite(includeIndex)) {
    usedIndices.delete(includeIndex);
  }

  return normalizedImages.filter((image) => !usedIndices.has(image.index));
};
