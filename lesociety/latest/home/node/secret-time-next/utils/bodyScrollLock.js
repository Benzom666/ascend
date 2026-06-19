const BODY_SCROLL_LOCK_STATE_KEY = "__lesocietyBodyScrollLockState";

const getScrollLockState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!window[BODY_SCROLL_LOCK_STATE_KEY]) {
    window[BODY_SCROLL_LOCK_STATE_KEY] = {
      locks: new Set(),
      scrollY: 0,
      previous: null,
    };
  }

  return window[BODY_SCROLL_LOCK_STATE_KEY];
};

export const lockBodyScroll = (lockKey = "default") => {
  if (typeof window === "undefined") {
    return;
  }

  const state = getScrollLockState();
  if (!state || state.locks.has(lockKey)) {
    return;
  }

  const { body, documentElement } = document;

  if (state.locks.size === 0) {
    state.scrollY = window.scrollY || window.pageYOffset || 0;
    state.previous = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      bodyTouchAction: body.style.touchAction,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      htmlOverflow: documentElement.style.overflow,
      htmlTouchAction: documentElement.style.touchAction,
      htmlOverscrollBehavior: documentElement.style.overscrollBehavior,
    };

    body.dataset.scrollLock = "true";
    body.style.position = "fixed";
    body.style.top = `-${state.scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.overscrollBehavior = "none";
    documentElement.style.overflow = "hidden";
    documentElement.style.touchAction = "none";
    documentElement.style.overscrollBehavior = "none";
  }

  state.locks.add(lockKey);
};

export const unlockBodyScroll = (lockKey = "default") => {
  if (typeof window === "undefined") {
    return;
  }

  const state = getScrollLockState();
  if (!state || !state.locks.has(lockKey)) {
    return;
  }

  state.locks.delete(lockKey);

  if (state.locks.size > 0) {
    return;
  }

  const { body, documentElement } = document;
  const previous = state.previous || {};
  const scrollY = state.scrollY || 0;

  delete body.dataset.scrollLock;
  body.style.position = previous.bodyPosition || "";
  body.style.top = previous.bodyTop || "";
  body.style.left = previous.bodyLeft || "";
  body.style.right = previous.bodyRight || "";
  body.style.width = previous.bodyWidth || "";
  body.style.overflow = previous.bodyOverflow || "";
  body.style.touchAction = previous.bodyTouchAction || "";
  body.style.overscrollBehavior = previous.bodyOverscrollBehavior || "";
  documentElement.style.overflow = previous.htmlOverflow || "";
  documentElement.style.touchAction = previous.htmlTouchAction || "";
  documentElement.style.overscrollBehavior = previous.htmlOverscrollBehavior || "";

  state.previous = null;
  state.scrollY = 0;

  window.scrollTo(0, scrollY);
};
