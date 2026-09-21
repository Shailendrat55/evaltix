import { useState, useEffect, useRef } from "react";
import {
  getQuestions,
  getQuestionById,
  deleteQuestion,
  bulkUploadMCQCsv,
  createQuestion, // <-- assumed export; rename to match your api.js
} from "../../api/api";
import AddQuestionModal from "../../components/AddQuestionModal";
import {
  BookOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Circle,
  Code2,
  FileText,
  ListChecks,
  Loader2,
  Tag,
  Upload,
} from "lucide-react";

const DIFFICULTY_STYLES = {
  Easy: "bg-[#e2f3ec] text-[#0f7a5f]",
  Medium: "bg-[#fbeed9] text-[#b3781f]",
  Hard: "bg-[#fbe9e9] text-[#c23b3b]",
};

const TYPE_STYLES = {
  MCQ: "bg-[#edf4ff] text-[#4667d0]",
  Descriptive: "bg-[#f5ecff] text-[#7b5cc9]",
  Coding: "bg-[#eaf9f7] text-[#0f7a5f]",
};

const TYPE_ICONS = {
  MCQ: ListChecks,
  Descriptive: FileText,
  Coding: Code2,
};

const TYPE_TO_API = {
  MCQ: "MCQ",
  Coding: "CODING",
  Descriptive: "DESCRIPTIVE",
};

const EMPTY_MCQ_OPTION = () => ({ text: "", correct: false });
const EMPTY_STARTER = () => ({ language: "javascript", code: "" });
const EMPTY_TEST_CASE = () => ({ input: "", expectedOutput: "", isHidden: true });

function emptyForm() {
  return {
    uiType: "MCQ",
    title: "",
    question: "",
    category: "",
    difficulty: "Medium",
    marks: 1,
    negativeMarks: 0,
    allowMultipleCorrect: false,
    options: [EMPTY_MCQ_OPTION(), EMPTY_MCQ_OPTION()],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    languages: [EMPTY_STARTER()],
    testCases: [EMPTY_TEST_CASE()],
    instructions: "",
    minWords: "",
    maxWords: "",
  };
}

const PAGE_SIZE = 9;

export default function Questions() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    totalCount: 0,
    totalPages: 1,
  });

  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState(null); // { success, failed, errors }
  const fileInputRef = useRef(null);

  const categories = ["All", ...new Set(questions.map((q) => q.category))];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  // Filtering applies within the currently loaded page only.
  const filtered = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || q.category === category;
    const matchesDifficulty =
      difficulty === "All" || q.difficulty === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleCreated = (created) => {
    if (!created) return;
    const uiType =
      created.type === "CODING"
        ? "Coding"
        : created.type === "DESCRIPTIVE"
          ? "Descriptive"
          : "MCQ";

    setQuestions((prev) => [
      {
        id: created.id ?? prev.length + 1,
        text: created.question ?? "",
        category: created.tags?.[0] ?? "General",
        difficulty:
          (created.difficulty ?? "MEDIUM").charAt(0) +
          (created.difficulty ?? "MEDIUM").slice(1).toLowerCase(),
        type: uiType,
      },
      ...prev,
    ]);
  };

  useEffect(() => {
    fetchQuestions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchQuestions = async (pageToFetch = 1) => {
    try {
      setLoading(true);
      const response = await getQuestions(pageToFetch, PAGE_SIZE);

      setQuestions(
        (response.data || []).map((q) => ({
          id: q.id,
          text: q.title,
          category: q.tags?.[0] || "General",
          difficulty:
            q.difficulty.charAt(0) + q.difficulty.slice(1).toLowerCase(),
          type:
            q.type === "CODING"
              ? "Coding"
              : q.type === "DESCRIPTIVE"
                ? "Descriptive"
                : "MCQ",
        }))
      );

      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmed) return;

    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      // if that was the last item on this page and we're not on page 1, step back a page
      setPagination((prev) => {
        if (questions.length === 1 && prev.page > 1) {
          setPage(prev.page - 1);
        }
        return prev;
      });
    } catch (error) {
      console.error("Delete question error:", error);
      alert("Failed to delete question.");
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await getQuestionById(id);
      setEditingQuestion(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Get question error:", error);
      alert("Failed to load question.");
    }
  };

  const handleCsvButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCsvFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setCsvResult(null);
    setCsvUploading(true);

    try {
      const response = await bulkUploadMCQCsv(file);
      const { createdCount, totalRows, errors } = response.data;

      setCsvResult({
        success: createdCount,
        failed: totalRows - createdCount,
        errors: (errors || []).map((e) => `Row ${e.row}: ${e.message}`),
      });

      if (createdCount > 0) {
        // new rows land on page 1 (most recent first) — jump there so the user sees them
        if (page === 1) {
          await fetchQuestions(1);
        } else {
          setPage(1);
        }
      }
    } catch (err) {
      console.error("CSV upload error:", err);
      const serverMessage = err?.response?.data?.message;
      setCsvResult({
        success: 0,
        failed: 0,
        errors: [serverMessage || "Could not upload the CSV file."],
      });
    } finally {
      setCsvUploading(false);
    }
  };

  const goToPrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const goToNextPage = () => {
    setPage((p) => Math.min(pagination.totalPages || 1, p + 1));
  };

  return (
    <div className="min-h-screen bg-[#f9f8f4] text-[#241f13] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-[#6b6354] mt-2">
            Browse, filter and manage all questions in your library.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvFileChange}
          />
          <button
            onClick={handleCsvButtonClick}
            disabled={csvUploading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#f3efe7] font-semibold border border-[#e5e1d5] disabled:opacity-60 text-[#241f13]"
            title="Bulk import MCQ questions from a CSV file"
          >
            {csvUploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {csvUploading ? "Uploading..." : "Upload MCQ CSV"}
          </button>

          <button
            onClick={() => {
              setEditingQuestion(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#b3781f] hover:bg-[#96631a] font-semibold text-white"
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>
      </div>

      {/* CSV result banner */}
      {csvResult && (
        <div
          className={`mb-6 rounded-2xl border p-4 text-sm ${csvResult.errors.length
              ? "bg-[#fbeed9] border-[#f1d7a7] text-[#b3781f]"
              : "bg-[#e2f3ec] border-[#cfe8df] text-[#0f7a5f]"
            }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">
                {csvResult.success} question{csvResult.success === 1 ? "" : "s"} imported
                {csvResult.failed > 0 && `, ${csvResult.failed} failed`}
              </p>
              {csvResult.errors.length > 0 && (
                <ul className="mt-2 space-y-1 list-disc list-inside text-xs opacity-90 max-h-32 overflow-y-auto">
                  {csvResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => setCsvResult(null)}
              className="p-1 rounded-lg hover:bg-white/10 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Stat strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-[#e5e1d5] p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6b6354]">Total Questions</p>
            <h2 className="text-3xl font-bold mt-2 text-[#241f13]">{pagination.totalCount}</h2>
          </div>
          <div className="bg-[#fbeed9] text-[#b3781f] p-3 rounded-xl">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e1d5] p-6">
          <p className="text-sm text-[#6b6354] mb-3">By Difficulty (this page)</p>
          <div className="flex gap-2">
            {["Easy", "Medium", "Hard"].map((d) => (
              <span
                key={d}
                className={`${DIFFICULTY_STYLES[d]} px-3 py-1 rounded-full text-xs font-medium`}
              >
                {d}: {questions.filter((q) => q.difficulty === d).length}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e1d5] p-6">
          <p className="text-sm text-[#6b6354] mb-3">Categories (this page)</p>
          <h2 className="text-3xl font-bold text-[#241f13]">{categories.length - 1}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#e5e1d5] p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-[#f9f8f4] border border-[#e5e1d5] rounded-xl px-4 py-2.5">
          <Search size={18} className="text-[#6b6354]" />
          <input
            className="bg-transparent outline-none w-full text-sm placeholder:text-[#6b6354] text-[#241f13]"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-[#6b6354] text-sm">
          <Filter size={16} />
          Filters
        </div>

        <select
          className="bg-[#f9f8f4] border border-[#e5e1d5] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#b3781f] text-[#241f13]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="bg-[#f9f8f4] border border-[#e5e1d5] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#b3781f] text-[#241f13]"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-[#6b6354] gap-2">
          <Loader2 size={20} className="animate-spin" />
          Loading questions...
        </div>
      )}

      {/* Questions Card Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((q) => {
              const TypeIcon = TYPE_ICONS[q.type] || FileText;
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-[#e5e1d5] p-5 flex flex-col justify-between hover:border-[#d8cdae] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`${TYPE_STYLES[q.type]} flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium`}
                      >
                        <TypeIcon size={12} />
                        {q.type}
                      </span>
                      <span
                        className={`${DIFFICULTY_STYLES[q.difficulty]} px-3 py-1 rounded-full text-xs font-medium`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-[#241f13] text-sm leading-relaxed line-clamp-4">
                      {q.text}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#e5e1d5]">
                    <span className="flex items-center gap-1.5 text-xs text-[#6b6354]">
                      <Tag size={12} />
                      {q.category}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(q.id)}
                        className="p-2 rounded-lg border border-[#e5e1d5] hover:bg-[#f3efe7] text-[#241f13]"
                        title="Edit question"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 rounded-lg border border-[#f0c4c4] hover:bg-[#fbe9e9] text-[#c23b3b]"
                        title="Delete question"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-full p-12 text-center text-[#6b6354] bg-white rounded-2xl border border-[#e5e1d5]">
                No questions match your filters.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 text-sm text-[#6b6354]">
            <span>
              Showing {filtered.length} of {questions.length} on this page
              {pagination.totalCount > 0 &&
                ` · ${pagination.totalCount} total`}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-[#e5e1d5] hover:bg-[#f3efe7] disabled:opacity-40 disabled:hover:bg-transparent text-[#241f13]"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 rounded-lg bg-[#b3781f] text-white">
                {pagination.page} / {pagination.totalPages || 1}
              </span>
              <button
                onClick={goToNextPage}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-[#e5e1d5] hover:bg-[#f3efe7] disabled:opacity-40 disabled:hover:bg-transparent text-[#241f13]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      <AddQuestionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingQuestion(null);
        }}
        editingQuestion={editingQuestion}
        onCreated={handleCreated}
        onUpdated={(updated) => {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === updated.id
                ? {
                  ...q,
                  text: updated.title,
                  category: updated.tags?.[0] || "General",
                  difficulty:
                    updated.difficulty.charAt(0) +
                    updated.difficulty.slice(1).toLowerCase(),
                  type:
                    updated.type === "CODING"
                      ? "Coding"
                      : updated.type === "DESCRIPTIVE"
                        ? "Descriptive"
                        : "MCQ",
                }
                : q
            )
          );

          setModalOpen(false);
          setEditingQuestion(null);
        }}
      />
    </div>
  );
}