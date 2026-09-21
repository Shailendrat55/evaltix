import { useState, useEffect } from "react";
import useExamTimer from "../../../hooks/useExamTimer";

/**
 * Props:
 * - examTitle: string
 * - currentQuestion: number (1-indexed)
 * - totalQuestions: number
 * - expiresAt: string (ISO timestamp from backend)
 * - onExpire: () => void  (called once when timer hits 0)
 */
export default function ExamHeader({
  examTitle,
  currentQuestion,
  totalQuestions,
  expiresAt,
  onExpire,
}) {
  const { formatted, isCritical, isWarning } = useExamTimer(expiresAt, onExpire);

  const timerClasses = [
    "font-mono text-lg font-semibold px-3 py-1 rounded-md min-w-[76px] text-center transition-colors duration-300",
    isCritical
      ? "text-red-700 bg-red-100 animate-pulse"
      : isWarning
      ? "text-amber-700 bg-amber-100"
      : "text-gray-700 bg-gray-100",
  ].join(" ");

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-baseline gap-4">
        <span className="font-semibold text-base text-gray-900">
          {examTitle}
        </span>
        <span className="text-sm text-gray-500">
          Question {currentQuestion} of {totalQuestions}
        </span>
      </div>

      <div className="flex items-center">
        <span className={timerClasses}>{formatted}</span>
      </div>
    </header>
  );
}