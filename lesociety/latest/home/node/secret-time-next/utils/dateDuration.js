export const DATE_DURATION_LABELS = {
  "1/2H": "1-2 hours",
  "1H": "2-3 hours",
  "2H": "3-4 hours",
  "3H": "Full evening (4+ hours)",
};

export const formatDateDuration = (value = "") => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "";
  }

  return DATE_DURATION_LABELS[normalizedValue] || normalizedValue;
};
