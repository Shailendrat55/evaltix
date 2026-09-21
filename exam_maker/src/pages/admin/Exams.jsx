import {
  Plus,
  FileText,
  Clock3,
  ListChecks,
  CalendarDays,
  Target,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getExams, updateExam } from "../../api/api";

const DIFFICULTY_STYLES = {
  Easy: "bg-[#e2f3ec] text-[#0f7a5f] border-[#cfe8df]",
  Medium: "bg-[#fbeed9] text-[#b3781f] border-[#f1d7a7]",
  Hard: "bg-[#fbe9e9] text-[#c23b3b] border-[#f0c4c4]",
};

const STATUS_STYLES = {
  Published: "bg-[#edf4ff] text-[#4667d0] border-[#cfe0ff]",
  Draft: "bg-[#f3f1e9] text-[#6b6354] border-[#e5e1d5]",
};

export default function ExamsListPage() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await getExams();
      const payload = response?.data;
      const examList = Array.isArray(payload)
        ? payload
        : payload?.exams || payload?.data || [];
      setExams(Array.isArray(examList) ? examList : []);
    } catch (error) {
      console.error("Failed to load exams", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm("Delete this exam? This can't be undone.")) return;

  //   try {
  //     setDeletingId(id);
  //     await deleteExam(id);
  //     setExams((prev) => prev.filter((e) => e.id !== id));
  //   } catch (error) {
  //     console.error("Failed to delete exam", error);
  //     alert("Failed to delete exam");
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  const formatExamDate = (value) => {
    if (!value) return "Not set";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const filteredExams = useMemo(() => {
    if (!query.trim()) return exams;
    const q = query.toLowerCase();
    return exams.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
    );
  }, [exams, query]);

  return (
    <div className="min-h-screen bg-[#f9f8f4] text-[#241f13] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exams</h1>
          <p className="text-[#6b6354] mt-2">
            {loading ? "Loading exams..." : `${filteredExams.length} exam${filteredExams.length !== 1 ? "s" : ""} on the roster`}
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6354]"
            />
            <input
              placeholder="Search exams..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-white border border-[#e5e1d5] rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 ring-[#b3781f] text-sm w-56 text-[#241f13] placeholder:text-[#6b6354]"
            />
          </div>

          <button
            onClick={() => navigate("/admin/createexam")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#b3781f] hover:bg-[#96631a] font-semibold text-white"
          >
            <Plus size={18} />
            Add Exam
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {filteredExams.map((exam) => (
    <div
      key={exam.id}
      className="
        group
        relative
        flex
        flex-col
        min-h-[290px]
        rounded-2xl
        border border-[#e5e1d5]
        bg-white
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#d8cdae]
        hover:bg-[#fffdfb]
        hover:shadow-xl
        hover:shadow-[#b3781f]/5
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#fbeed9]
              ring-1
              ring-[#f1d7a7]
            "
          >
            <FileText
              size={20}
              className="text-[#b3781f]"
            />
          </div>

          <div className="min-w-0">
            <h3
              className="
                truncate
                text-base
                font-semibold
                text-[#241f13]
              "
              title={exam.title}
            >
              {exam.title || "Untitled Exam"}
            </h3>

            <p className="mt-1 text-xs text-[#6b6354]">
              Exam ID: {exam.id}
            </p>
          </div>
        </div>

        {/* Status */}
        <span
          className={`
            shrink-0
            rounded-full
            border
            px-2.5
            py-1
            text-[11px]
            font-semibold
            uppercase
            tracking-wide
            ${
              STATUS_STYLES[exam.status] ||
              STATUS_STYLES.Draft
            }
          `}
        >
          {exam.status || "Draft"}
        </span>
      </div>

      {/* Description */}
      <div className="mt-5">
        <p
          className="
            line-clamp-2
            min-h-[40px]
            text-sm
            leading-5
            text-[#6b6354]
          "
        >
          {exam.description ||
            "No description provided for this exam."}
        </p>
      </div>

      {/* Exam Information */}
      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-3
          rounded-xl
          border
          border-[#e5e1d5]
          bg-[#f9f8f4]
          p-4
        "
      >
        {/* Start Time */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#6b6354]">
            <CalendarDays size={15} />
            <span className="text-xs">
              Start Time
            </span>
          </div>

          <p
            className="
              mt-1
              truncate
              text-sm
              font-medium
              text-[#241f13]
            "
            title={formatExamDate(exam.start_time)}
          >
            {formatExamDate(exam.start_time)}
          </p>
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-center gap-2 text-[#6b6354]">
            <Clock3 size={15} />
            <span className="text-xs">
              Duration
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-[#241f13]">
            {exam.duration ?? 0} mins
          </p>
        </div>

        {/* Questions */}
        <div>
          <div className="flex items-center gap-2 text-[#6b6354]">
            <ListChecks size={15} />
            <span className="text-xs">
              Questions
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-[#241f13]">
            {exam.total_questions ?? 0}
          </p>
        </div>

        {/* Passing */}
        <div>
          <div className="flex items-center gap-2 text-[#6b6354]">
            <Target size={15} />
            <span className="text-xs">
              Passing
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-[#241f13]">
            {exam.passing_percentage ?? 0}%
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="
          mt-auto
          flex
          items-center
          justify-between
          gap-3
          border-t
          border-[#e5e1d5]
          pt-5
        "
      >
        {/* Difficulty */}
        <span
          className={`
            rounded-full
            border
            px-3
            py-1
            text-xs
            font-semibold
            ${
              DIFFICULTY_STYLES[exam.difficulty] ||
              DIFFICULTY_STYLES.Medium
            }
          `}
        >
          {exam.difficulty || "Medium"}
        </span>

        {/* Actions */}
        <div
          className="
            flex
            items-center
            gap-1
            opacity-70
            transition-opacity
            group-hover:opacity-100
          "
        >
          <button
  onClick={() =>
    navigate(`/admin/createexam?id=${exam.id}`)
  }
  aria-label="Edit exam"
  title="Edit exam"
  className="
    rounded-lg
    p-2
    text-[#6b6354]
    transition
    hover:bg-[#f3efe7]
    hover:text-[#241f13]
  "
>
  <Pencil size={16} />
</button>

          <button
            onClick={() => handleDelete(exam.id)}
            disabled={deletingId === exam.id}
            aria-label="Delete exam"
            title="Delete exam"
            className="
              rounded-lg
              p-2
              text-[#6b6354]
              transition
              hover:bg-[#fbe9e9]
              hover:text-[#c23b3b]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}