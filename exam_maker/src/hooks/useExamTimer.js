// hooks/candidate/useExamTimer.js
import { useState, useEffect, useRef } from "react";

/**
 * @param {string} expiresAt - ISO timestamp from backend
 * @param {() => void} onExpire - called once when timer hits 0
 */
export default function useExamTimer(expiresAt, onExpire) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now())
  );
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    hasExpiredRef.current = false;

    const interval = setInterval(() => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      setRemainingMs(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (remainingMs <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpire?.();
    }
  }, [remainingMs, onExpire]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const isCritical = totalSeconds <= 60;
  const isWarning = totalSeconds <= 300 && !isCritical;

  return { remainingMs, totalSeconds, formatted, isCritical, isWarning };
}