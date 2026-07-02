type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleCallbackLike = (deadline: IdleDeadlineLike) => void;

type EventPoint = {
  clientX: number;
  clientY: number;
};

const IDLE_CALLBACK_FALLBACK_DELAY_MS = 1200;

export function supportsPointerEvents() {
  return typeof window !== "undefined" && "PointerEvent" in window;
}

export function supportsResizeObserver() {
  return typeof window !== "undefined" && "ResizeObserver" in window;
}

export function supportsBackdropFilter() {
  if (typeof globalThis.CSS === "undefined" || typeof globalThis.CSS.supports !== "function") {
    return false;
  }

  return (
    globalThis.CSS.supports("backdrop-filter", "blur(1px)") ||
    globalThis.CSS.supports("-webkit-backdrop-filter", "blur(1px)")
  );
}

export function scheduleIdleCallback(callback: IdleCallbackLike) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const idleId = window.requestIdleCallback((deadline) => callback(deadline));
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = globalThis.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 0,
    });
  }, IDLE_CALLBACK_FALLBACK_DELAY_MS);

  return () => globalThis.clearTimeout(timeoutId);
}

export function isTouchEvent(event: Event): event is TouchEvent {
  return "touches" in event || "changedTouches" in event;
}

export function getEventPoint(event: Event): EventPoint | null {
  if (isTouchEvent(event)) {
    const touch =
      event.type === "touchend" || event.type === "touchcancel"
        ? event.changedTouches[0]
        : event.touches[0] ?? event.changedTouches[0];

    return touch
      ? {
          clientX: touch.clientX,
          clientY: touch.clientY,
        }
      : null;
  }

  if (
    "clientX" in event &&
    "clientY" in event &&
    typeof event.clientX === "number" &&
    typeof event.clientY === "number"
  ) {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }

  return null;
}

export function observeElementRect(element: Element, onMeasure: () => void) {
  onMeasure();

  if (supportsResizeObserver()) {
    const resizeObserver = new ResizeObserver(() => {
      onMeasure();
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }

  if (typeof window === "undefined") {
    return () => {};
  }

  const handleResize = () => {
    onMeasure();
  };

  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}
