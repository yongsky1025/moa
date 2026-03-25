import { useEffect, useState } from "react";

export function useDelayedLoading(loading: boolean, delayMs = 180) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return;
    }

    const timerId = window.setTimeout(() => {
      setShowLoading(true);
    }, delayMs);

    return () => window.clearTimeout(timerId);
  }, [loading, delayMs]);

  return showLoading;
}

