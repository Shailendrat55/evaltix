// hooks/candidate/useAttempt.js
import { useState, useEffect, useCallback } from "react";
import { getAttempt } from "../api/api";

export default function useAttempt(attemptId) {
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [answeredMap, setAnsweredMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!attemptId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getAttempt(attemptId);

      console.log("GET ATTEMPT RESPONSE:", response);

      const data = response.data;

      console.log("ATTEMPT:", data.attempt);
      console.log("QUESTIONS:", data.questions);

      setAttempt({
        ...data.attempt,
        examTitle: data.exam?.title,
      });

      const attemptQuestions = data.questions || [];

      setQuestions(attemptQuestions);

      const seededAnswers = {};
      const seededAnswered = {};

      attemptQuestions.forEach((q) => {
        if (q.savedAnswer) {
          seededAnswers[q.attemptQuestionId] = q.savedAnswer;
          seededAnswered[q.attemptQuestionId] = true;
        }
      });

      setAnswers(seededAnswers);
      setAnsweredMap(seededAnswered);
    } catch (err) {
      console.error("Failed to load attempt:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load exam"
      );
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    load();
  }, [load]);

  const markAnswered = useCallback((attemptQuestionId) => {
    setAnsweredMap((prev) => ({
      ...prev,
      [attemptQuestionId]: true,
    }));
  }, []);

  const setAnswer = useCallback((attemptQuestionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [attemptQuestionId]: value,
    }));
  }, []);

  return {
    attempt,
    questions,
    answers,
    answeredMap,
    loading,
    error,
    reload: load,
    markAnswered,
    setAnswer,
  };
}