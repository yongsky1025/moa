let installed = false;

const ACTIVE_CLASS = "is-scroll-active";
const ACTIVE_KEEP_MS = 700;

export function installGlobalScrollbarSystem() {
  if (installed || typeof window === "undefined") {
    return;
  }
  installed = true;

  const root = document.documentElement;
  let clearTimer: ReturnType<typeof setTimeout> | null = null;

  const activate = () => {
    root.classList.add(ACTIVE_CLASS);
    if (clearTimer) {
      clearTimeout(clearTimer);
    }
    clearTimer = setTimeout(() => {
      root.classList.remove(ACTIVE_CLASS);
    }, ACTIVE_KEEP_MS);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "PageUp" ||
      event.key === "PageDown" ||
      event.key === "Home" ||
      event.key === "End" ||
      event.key === " "
    ) {
      activate();
    }
  };

  document.addEventListener("scroll", activate, { passive: true, capture: true });
  window.addEventListener("wheel", activate, { passive: true });
  window.addEventListener("touchmove", activate, { passive: true });
  window.addEventListener("keydown", handleKeydown);
}

