import { Loader2 } from "lucide-react";

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
};

/**
 * Props:
 * - size: "sm" | "md" | "lg" (default "md")
 * - label: string (optional) — text shown next to/below the spinner
 * - fullScreen: boolean (optional) — centers in the full viewport, useful for page-level loading states
 * - className: string (optional) — extra classes for the wrapper
 */
export default function LoadingSpinner({
  size = "md",
  label,
  fullScreen = false,
  className = "",
}) {
  const iconSize = SIZE_MAP[size] ?? SIZE_MAP.md;

  const content = (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 size={iconSize} className="text-indigo-600 animate-spin" />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        {content}
      </div>
    );
  }
  return content;
}