const EDIT_PROFILE_FLOW_KEY = "lesociety_edit_profile_flow_v1";

const DEFAULT_STATE = {
  page: 0,
  step2Draft: null,
  step3Draft: null,
};

const readStorage = () => {
  if (typeof window === "undefined") {
    return { ...DEFAULT_STATE };
  }

  try {
    const raw = window.sessionStorage.getItem(EDIT_PROFILE_FLOW_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (error) {
    console.log("Failed to read edit profile flow state", error);
    return { ...DEFAULT_STATE };
  }
};

const writeStorage = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(EDIT_PROFILE_FLOW_KEY, JSON.stringify(state));
  } catch (error) {
    console.log("Failed to write edit profile flow state", error);
  }
};

const toSerializableImageValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.url || value.location || value.preview || "";
  }
  return "";
};

const sanitizeStep2Draft = (draft = {}) => ({
  tagline: typeof draft.tagline === "string" ? draft.tagline : "",
  description: typeof draft.description === "string" ? draft.description : "",
  imageUpload: toSerializableImageValue(draft.imageUpload),
  imageUpload2: toSerializableImageValue(draft.imageUpload2),
  imageUpload3: toSerializableImageValue(draft.imageUpload3),
  imageUpload4: toSerializableImageValue(draft.imageUpload4),
});

const sanitizeStep3Draft = (draft = {}) => ({
  height:
    typeof draft.height === "number" || typeof draft.height === "string"
      ? draft.height
      : "",
  max_education:
    typeof draft.max_education === "string" ? draft.max_education : "",
  is_smoker: typeof draft.is_smoker === "string" ? draft.is_smoker : "",
  occupation: typeof draft.occupation === "string" ? draft.occupation : "",
});

const buildStep2InitialValues = ({ user = {}, isEdit = false, draft = null }) => {
  const liveImages = Array.isArray(user?.images) ? user.images : [];
  const pendingImages = Array.isArray(user?.un_verified_images)
    ? user.un_verified_images
    : [];
  const getInitialImage = (index) => {
    if (isEdit) {
      return pendingImages[index] || liveImages[index] || "";
    }

    return liveImages[index] || "";
  };

  const baseValues = {
    tagline:
      isEdit && user?.un_verified_tagline ? user.un_verified_tagline : user?.tagline || "",
    description:
      isEdit && user?.un_verified_description
        ? user.un_verified_description
        : user?.description || "",
    imageUpload: getInitialImage(0),
    imageUpload2: getInitialImage(1),
    imageUpload3: getInitialImage(2),
    imageUpload4: getInitialImage(3),
  };

  if (!draft) {
    return baseValues;
  }

  const sanitizedDraft = sanitizeStep2Draft(draft);
  return Object.entries(sanitizedDraft).reduce((accumulator, [key, value]) => {
    if (value === "") {
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, { ...baseValues });
};

const buildStep3InitialValues = ({ user = {}, draft = null }) => {
  const pendingDetails = user?.un_verified_profile_details || {};
  const baseValues = {
    height: pendingDetails.height ?? user?.height ?? "",
    max_education: pendingDetails.max_education ?? user?.max_education ?? "",
    is_smoker: pendingDetails.is_smoker ?? user?.is_smoker ?? "",
    occupation: pendingDetails.occupation ?? user?.occupation ?? "",
  };

  if (!draft) {
    return baseValues;
  }

  const sanitizedDraft = sanitizeStep3Draft(draft);
  return Object.entries(sanitizedDraft).reduce((accumulator, [key, value]) => {
    if (value === "") {
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, { ...baseValues });
};

const loadEditProfileFlowState = () => readStorage();

const saveEditProfileFlowState = (updates = {}) => {
  const nextState = { ...readStorage(), ...updates };
  writeStorage(nextState);
  return nextState;
};

const clearEditProfileFlowState = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(EDIT_PROFILE_FLOW_KEY);
  } catch (error) {
    console.log("Failed to clear edit profile flow state", error);
  }
};

module.exports = {
  EDIT_PROFILE_FLOW_KEY,
  loadEditProfileFlowState,
  saveEditProfileFlowState,
  clearEditProfileFlowState,
  sanitizeStep2Draft,
  sanitizeStep3Draft,
  buildStep2InitialValues,
  buildStep3InitialValues,
};
