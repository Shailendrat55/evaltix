import { AlertTriangle, X } from "lucide-react";

/**
 * Props:
 * - open: boolean
 * - answeredCount: number
 * - totalQuestions: number
 * - onCancel: () => void
 * - onConfirm: () => void
 * - submitting: boolean (optional) — shows a loading state on confirm
 */
export default function ConfirmSubmitModal({
  open,
  answeredCount,
  totalQuestions,
  onCancel,
  onConfirm,
  submitting = false,
}) {
  if (!open) return null;

  const unanswered = totalQuestions - answeredCount;
  const hasUnanswered = unanswered > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-submit-title"
    >
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div
            className={`shrink-0 mt-0.5 rounded-full p-2 ${
              hasUnanswered ? "bg-amber-100" : "bg-indigo-100"
            }`}
          >
            <AlertTriangle
              size={18}
              className={hasUnanswered ? "text-amber-600" : "text-indigo-600"}
            />
          </div>
          <div>
            <h2
              id="confirm-submit-title"
              className="text-base font-semibold text-slate-900"
            >
              Submit exam?
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {hasUnanswered
                ? `You have ${unanswered} unanswered question${
                    unanswered === 1 ? "" : "s"
                  }. Once submitted, you won't be able to make changes.`
                : "You've answered all questions. Once submitted, you won't be able to make changes."}
            </p>
          </div>
        </div>

        <div className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mb-5 flex justify-between">
          <span>Answered</span>
          <span className="font-medium text-slate-900">
            {answeredCount} / {totalQuestions}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}