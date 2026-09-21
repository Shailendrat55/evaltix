const STATUS_CONFIG = {
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-slate-100 text-slate-600",
  },
  SUBMITTED: {
    label: "Under Evaluation",
    className: "bg-amber-100 text-amber-700",
  },
  PENDING_EVALUATION: {
    label: "Under Evaluation",
    className: "bg-amber-100 text-amber-700",
  },
  EVALUATED: {
    label: "Evaluated",
    className: "bg-emerald-100 text-emerald-700",
  },
  COMPLETED: {
    label: "Evaluated",
    className: "bg-emerald-100 text-emerald-700",
  },
};

/**
 * Props:
 * - status: string — one of the keys above (case-insensitive)
 * - className: string (optional) — extra classes to merge in
 */
export default function StatusBadge({ status, className = "" }) {
  const config =
    STATUS_CONFIG[status?.toUpperCase()] ?? {
      label: status ?? "Unknown",
      className: "bg-slate-100 text-slate-500",
    };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}