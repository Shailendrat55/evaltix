import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Clock3,
  ListChecks,
  ShieldAlert,
  CircleCheck,
  ArrowLeft,
  Camera,
} from "lucide-react";

export default function ExamInstructions() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const exam = location.state?.exam;
  const [error] = useState(null);

  const handleProceedToCheck = () => {
    navigate(`/exam/check/${assignmentId}`, { state: { exam } });
  };

  const rules = [
    `${exam?.duration ?? "—"} minutes to complete the exam.`,
    `${exam?.total_questions === 1 ? "1 question" : `${exam?.total_questions ?? "—"} questions`} in total.`,
    "Camera and microphone access is required throughout.",
    "Do not refresh or close this tab once started.",
    "Auto-submits when the timer reaches zero.",
    exam?.negative_marking ? "Incorrect answers carry negative marking." : null,
  ].filter(Boolean);

  return (
    <div className="h-screen bg-slate-50 flex flex-col p-4 md:p-6 overflow-hidden">
      <div className="max-w-xl w-full mx-auto flex flex-col flex-1 min-h-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-3 shrink-0"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6 flex flex-col flex-1 min-h-0 overflow-y-auto">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            Before you begin
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 mb-4">
            {exam?.title ?? "Exam"}
          </h1>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <StatPill
              icon={<Clock3 size={14} />}
              label="Duration"
              value={exam?.duration ? `${exam.duration} min` : "—"}
            />
            <StatPill
              icon={<ListChecks size={14} />}
              label="Questions"
              value={exam?.total_questions ?? "—"}
            />
            <StatPill
              icon={<ShieldAlert size={14} />}
              label="Passing"
              value={
                exam?.passing_percentage ? `${exam.passing_percentage}%` : "—"
              }
            />
          </div>

          <div className="border-t border-slate-100 pt-4 mb-4">
            <h2 className="text-xs font-medium text-slate-900 mb-2.5">
              Please read before starting
            </h2>
            <ul className="space-y-2">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CircleCheck
                    size={15}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />
                  <span className="text-[13px] text-slate-600 leading-snug">
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4">
            <Camera size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-indigo-900 leading-snug">
              Next, you'll be asked to allow camera and microphone access —
              required to begin.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-[13px] text-rose-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleProceedToCheck}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors mt-auto"
          >
            Continue to System Check
          </button>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-slate-50 border border-slate-100 rounded-lg py-2.5 px-1 text-center">
      <span className="text-slate-400">{icon}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </span>
    </div>
  );
}