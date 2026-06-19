export const CREATE_DATE_PROGRESS_FROM_STEP_KEY = "create_date_progress_from_step";

export const getCreateDateProgressWidth = (step, totalSteps = 6) => {
  const safeStep = Math.max(0, Math.min(totalSteps - 1, Number(step) || 0));
  return safeStep === totalSteps - 1
    ? 100
    : ((safeStep + 0.5) / totalSteps) * 100;
};

export const markCreateDateProgressFromStep = (step) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    CREATE_DATE_PROGRESS_FROM_STEP_KEY,
    String(Number(step) || 0)
  );
};

export const clearCreateDateProgressFromStep = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CREATE_DATE_PROGRESS_FROM_STEP_KEY);
};

export const consumeCreateDateProgressFromStep = () => {
  if (typeof window === "undefined") return null;

  const rawValue = window.sessionStorage.getItem(
    CREATE_DATE_PROGRESS_FROM_STEP_KEY
  );
  window.sessionStorage.removeItem(CREATE_DATE_PROGRESS_FROM_STEP_KEY);

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const peekCreateDateProgressFromStep = () => {
  if (typeof window === "undefined") return null;

  const rawValue = window.sessionStorage.getItem(
    CREATE_DATE_PROGRESS_FROM_STEP_KEY
  );
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};
