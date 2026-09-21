import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import StatusBadge from "../../components/candidate/common/StatusBadge";
import LoadingSpinner from "../../components/candidate/common/LoadingSpinner";
import { getAttemptSummary } from "../../api/api";

export default function ExamSubmitted() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        // Expected shape: { examTitle, totalQuestions, answeredCount, status }
        const data = await getAttemptSummary(attemptId);
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) setError("Could not load submission details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading submission..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-7 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-100 rounded-full p-3">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          Exam Submitted
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          {summary?.examTitle ?? "Your exam"} has been submitted successfully.
        </p>

        <div className="flex justify-center mb-5">
          <StatusBadge status="SUBMITTED" />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3 mb-5">
            {error}
          </div>
        )}

        {summary && (
          <div className="text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-3 mb-6 flex justify-between">
            <span>Questions Attempted</span>
            <span className="font-medium text-slate-900">
              {summary.answeredCount} / {summary.totalQuestions}
            </span>
          </div>
        )}

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Your responses will be reviewed by our evaluation team. You'll be
          notified once your results are available.
        </p>

        <button
          onClick={() => navigate("/CandidateDashboard")}
          className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}