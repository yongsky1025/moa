import { useEffect, useRef, useState } from "react";

export function useDelayedLoading(
  loading: boolean,
  delayMs = 180,
  minVisibleMs = 0,
) {
  const [showLoading, setShowLoading] = useState(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    let timerId: number | undefined;

    if (loading) {
      if (!showLoading) {
        timerId = window.setTimeout(() => {
          shownAtRef.current = Date.now();
          setShowLoading(true);
        }, delayMs);
      }
      return () => {
        if (timerId) {
          window.clearTimeout(timerId);
        }
      };
    }

    if (!showLoading) {
      return;
    }

    const shownAt = shownAtRef.current ?? Date.now();
    const elapsedMs = Date.now() - shownAt;
    const remainingMs = Math.max(0, minVisibleMs - elapsedMs);

    const hideTimerId = window.setTimeout(() => {
      shownAtRef.current = null;
      setShowLoading(false);
    }, remainingMs);

    return () => {
      window.clearTimeout(hideTimerId);
    };
  }, [delayMs, loading, minVisibleMs, showLoading]);

  return showLoading;
}

