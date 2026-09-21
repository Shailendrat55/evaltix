/**
 * Skeleton placeholder shown while the exam list is loading.
 * Props:
 * - rows: number (optional, default 3) — how many placeholder cards to render
 */
export default function ExamListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse flex gap-5"
        >
          <div className="h-14 w-14 rounded-xl bg-slate-100 shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-1/3 bg-slate-100 rounded mb-3" />
            <div className="h-3 w-1/2 bg-slate-100 rounded mb-4" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div className="h-14 w-24 bg-slate-100 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}