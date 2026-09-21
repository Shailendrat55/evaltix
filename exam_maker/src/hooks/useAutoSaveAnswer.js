// hooks/candidate/useAutoSaveAnswer.js
import { useRef, useState, useCallback, useEffect } from "react";
import { saveAnswer } from "../api/api";

const DEBOUNCE_MS = 600;

/**
 * @param {string} attemptId
 */
export default function useAutoSaveAnswer(attemptId) {
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const timeoutRef = useRef(null);
  const pendingRef = useRef(null); // { attemptQuestionId, answer } waiting to be flushed

  const performSave = useCallback(
    async (attemptQuestionId, answer) => {
      setStatus("saving");
      try {
        await saveAnswer(attemptId, { attemptQuestionId, answer });
        setStatus("saved");
        pendingRef.current = null;
      } catch (err) {
        setStatus("error");
      }
    },
    [attemptId]
  );

  const queueSave = useCallback(
    (attemptQuestionId, answer) => {
      pendingRef.current = { attemptQuestionId, answer };
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        performSave(attemptQuestionId, answer);
      }, DEBOUNCE_MS);
    },
    [performSave]
  );

  // Force an immediate save of whatever is pending (e.g. before navigation)
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pendingRef.current) {
      const { attemptQuestionId, answer } = pendingRef.current;
      performSave(attemptQuestionId, answer);
    }
  }, [performSave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { status, queueSave, flush };
}