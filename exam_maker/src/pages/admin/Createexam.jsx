import {
  FileText,
  Clock3,
  BookOpen,
  Save,
  Send,
  CheckCircle2,
  ListChecks,
  CalendarDays,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layers,
  Trash2,
  ListOrdered,
  GripVertical,
} from "lucide-react";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  createExam,
  updateExam,
  getExams,
  getExamById,
  getQuestions,
} from "../../api/api";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

const DIFFICULTY_STYLES = {
  Easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Hard: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export default function CreateExam() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    examDate: "",
    duration: 60,
    passing: 70,
    difficulty: "Medium",
    shuffle: true,
    negative: false,
  });

  // ---- question bank state ----
  const [allQuestions, setAllQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // ---- question picker controls ----
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showSelectedPanel, setShowSelectedPanel] = useState(false);
  const [selectedPanelSearch, setSelectedPanelSearch] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const examId = searchParams.get("id");
  const isEditMode = Boolean(examId);

  const update = (key, value) => setForm({ ...form, [key]: value });

  // Debounce the search box so filtering thousands of rows doesn't run on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchInput.trim().toLowerCase());
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await getQuestions();
      setAllQuestions(response.data || []);
    } catch (error) {
      console.error("Failed to load question bank", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Distinct filter options, derived once the bank is loaded
  const { typeOptions, difficultyOptions } = useMemo(() => {
    const types = new Set();
    const difficulties = new Set();
    allQuestions.forEach((q) => {
      if (q.type) types.add(q.type);
      if (q.difficulty) difficulties.add(q.difficulty);
    });
    return {
      typeOptions: Array.from(types),
      difficultyOptions: Array.from(difficulties),
    };
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesSearch =
        !debouncedSearch ||
        q.title?.toLowerCase().includes(debouncedSearch);
      const matchesType = typeFilter === "all" || q.type === typeFilter;
      const matchesDifficulty =
        difficultyFilter === "all" || q.difficulty === difficultyFilter;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  }, [allQuestions, debouncedSearch, typeFilter, difficultyFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);
  const pagedQuestions = filteredQuestions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allOnPageSelected =
    pagedQuestions.length > 0 &&
    pagedQuestions.every((q) => selectedIdSet.has(q.id));

  const toggleQuestion = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const pageIds = pagedQuestions.map((q) => q.id);
      if (allOnPageSelected) {
        return prev.filter((id) => !pageIds.includes(id));
      }
      const merged = new Set(prev);
      pageIds.forEach((id) => merged.add(id));
      return Array.from(merged);
    });
  };

  const removeSelected = (id) => {
    setSelectedIds((prev) => prev.filter((qId) => qId !== id));
  };

  const clearAllSelected = () => setSelectedIds([]);

  // Order here follows selectedIds order, not bank order — this becomes the
  // exam's fixed question order whenever shuffle is turned off.
  const selectedQuestions = useMemo(
    () =>
      selectedIds
        .map((id) => allQuestions.find((q) => q.id === id))
        .filter(Boolean),
    [selectedIds, allQuestions]
  );

  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= selectedIds.length) return;
    setSelectedIds((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDropAt = (index) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      return;
    }
    moveQuestion(dragIndex, index);
    setDragIndex(null);
  };

  const visibleSelectedQuestions = useMemo(() => {
    const term = selectedPanelSearch.trim().toLowerCase();
    if (!term) return selectedQuestions;
    return selectedQuestions.filter((q) =>
      q.title?.toLowerCase().includes(term)
    );
  }, [selectedQuestions, selectedPanelSearch]);

  const hasActiveFilters =
    debouncedSearch || typeFilter !== "all" || difficultyFilter !== "all";

  const clearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setTypeFilter("all");
    setDifficultyFilter("all");
    setPage(1);
  };

  const handleSubmit = async (status) => {
    if (!form.title.trim()) {
      alert("Please enter an exam title.");
      return;
    }

    if (!form.description.trim()) {
      alert("Please enter an exam description.");
      return;
    }

    if (!form.examDate) {
      alert("Please select an exam date.");
      return;
    }

    if (status === "Published" && selectedIds.length === 0) {
      alert("Select at least one question before publishing.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      examDate: form.examDate,
      duration: Number(form.duration),
      questions: selectedIds.length,
      questionIds: selectedIds,
      passing: Number(form.passing),
      difficulty: form.difficulty,
      shuffle: form.shuffle,
      negative: form.negative,
      status,
    };

    setPublishing(true);

    try {
      if (isEditMode) {
        // UPDATE
        await updateExam(examId, payload);

        alert(
          status === "Published"
            ? "Exam published successfully!"
            : "Exam saved as draft successfully!"
        );
      } else {
        // CREATE
        await createExam(payload);

        alert(
          status === "Published"
            ? "Exam published successfully!"
            : "Exam saved as draft successfully!"
        );
      }

      navigate("/admin/exams");

    } catch (error) {
      console.error("Exam save error:", error);

      alert(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save exam"
      );
    } finally {
      setPublishing(false);
    }
  };

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

  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId]);

  const formatDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const loadExam = async () => {
    try {
      setLoading(true);

      const response = await getExamById(examId);

      const exam = response?.data?.data || response?.data;

      if (!exam) {
        alert("Exam not found");
        navigate("/admin/exams");
        return;
      }

      setForm({
        title: exam.title || "",
        description: exam.description || "",
        examDate: exam.start_time
          ? formatDateTimeLocal(exam.start_time)
          : "",
        duration: exam.duration ?? 60,
        passing: exam.passing_percentage ?? 70,
        difficulty: exam.difficulty || "Medium",
        shuffle: exam.shuffle_questions ?? true,
        negative: exam.negative_marking ?? false,
      });

      // Load assigned questions
      if (Array.isArray(exam.questions)) {
        setSelectedIds(
          exam.questions.map((q) => q.question_id)
        );
      } else {
        setSelectedIds([]);
      }

    } catch (error) {
      console.error("Failed to load exam", error);
      alert("Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditMode ? "Update Exam" : "Create Exam"}
          </h1>
          <p className="text-slate-400 mt-2">
            Configure your assessment before publishing.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSubmit("Draft")}
            disabled={publishing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 transition-colors"
          >
            <Save size={18} />
            {publishing ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("Published")}
            disabled={publishing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <Send size={18} />
            {publishing
              ? "Saving..."
              : isEditMode
                ? "Publish Exam"
                : "Publish Exam"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-blue-500" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-slate-400">Exam Title</label>
                <input
                  className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 outline-none focus:ring-2 ring-blue-500"
                  placeholder="Frontend React Assessment"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Description</label>
                <textarea
                  rows="5"
                  className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 outline-none focus:ring-2 ring-blue-500"
                  placeholder="Write exam instructions..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Exam Date</label>
                <div className="relative mt-2">
                  <CalendarDays
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="datetime-local"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-10 outline-none focus:ring-2 ring-blue-500 [color-scheme:dark]"
                    value={form.examDate}
                    onChange={(e) => update("examDate", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock3 className="text-amber-400" />
              <h2 className="text-xl font-semibold">Exam Settings</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-slate-400">Duration (mins)</label>
                <input
                  type="number"
                  className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                  value={form.duration}
                  onChange={(e) => update("duration", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Passing %</label>
                <input
                  type="number"
                  className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
                  value={form.passing}
                  onChange={(e) => update("passing", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-5">
              <BookOpen className="text-green-400" />
              <h2 className="text-xl font-semibold">Difficulty</h2>
            </div>

            <div className="flex gap-4">
              {["Easy", "Medium", "Hard"].map((level) => (
                <button
                  key={level}
                  onClick={() => update("difficulty", level)}
                  className={`px-6 py-3 rounded-xl transition ${form.difficulty === level
                    ? "bg-blue-600"
                    : "bg-slate-800 hover:bg-slate-700"
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5">
            <Toggle
              label="Shuffle Questions"
              checked={form.shuffle}
              onChange={() => update("shuffle", !form.shuffle)}
            />
            <Toggle
              label="Enable Negative Marking"
              checked={form.negative}
              onChange={() => update("negative", !form.negative)}
            />
          </div>

          {/* Question Order — only matters when shuffle is off */}
          {!form.shuffle && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <ListOrdered className="text-purple-400" />
                <h2 className="text-xl font-semibold">Question Order</h2>
              </div>
              <p className="text-sm text-slate-400 mb-5">
                Shuffle is off, so questions will be presented in this exact
                order. Drag to reorder, or use the arrows.
              </p>

              {selectedQuestions.length === 0 ? (
                <p className="text-slate-500 text-sm py-6 text-center">
                  Select questions below to set their order.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropAt(index)}
                      onDragEnd={() => setDragIndex(null)}
                      className={`flex items-center gap-3 p-3 rounded-xl border bg-slate-950 transition-colors ${dragIndex === index
                        ? "border-blue-600 opacity-50"
                        : "border-slate-700"
                        }`}
                    >
                      <GripVertical
                        size={16}
                        className="text-slate-600 cursor-grab shrink-0"
                      />
                      <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-200 truncate flex-1">
                        {q.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveQuestion(index, index - 1)}
                          disabled={index === 0}
                          aria-label={`Move "${q.title}" up`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(index, index + 1)}
                          disabled={index === selectedQuestions.length - 1}
                          aria-label={`Move "${q.title}" down`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Question Picker — redesigned for large banks */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <ListChecks className="text-cyan-400" />
              <h2 className="text-xl font-semibold">Assign Questions</h2>

              <button
                onClick={() => setShowSelectedPanel(true)}
                className="ml-auto flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors"
              >
                <Layers size={14} />
                {selectedIds.length} selected
              </button>
            </div>

            {/* Search + filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search questions by title..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 pl-9 text-sm outline-none focus:ring-2 ring-blue-500"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
              >
                <option value="all">All types</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
              >
                <option value="all">All difficulties</option>
                {difficultyOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Result count + select all on page */}
            {!loadingQuestions && allQuestions.length > 0 && (
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                <span>
                  {filteredQuestions.length} question
                  {filteredQuestions.length === 1 ? "" : "s"} found
                  {hasActiveFilters ? " (filtered)" : ""}
                </span>

                {pagedQuestions.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      className="accent-blue-600"
                    />
                    Select all on this page
                  </label>
                )}
              </div>
            )}

            {loadingQuestions ? (
              <p className="text-slate-500 text-sm py-6 text-center">
                Loading question bank...
              </p>
            ) : allQuestions.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">
                No questions in your bank yet.
              </p>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">
                  No questions match your search.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {pagedQuestions.map((q) => {
                    const checked = selectedIdSet.has(q.id);
                    return (
                      <label
                        key={q.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checked
                          ? "border-blue-600 bg-blue-500/10"
                          : "border-slate-700 bg-slate-950 hover:bg-slate-800"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleQuestion(q.id)}
                          className="mt-1 accent-blue-600"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 truncate">
                            {q.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-400">
                              {q.type}
                            </span>
                            {q.difficulty && (
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[q.difficulty] ||
                                  "border-slate-700 text-slate-400"
                                  }`}
                              >
                                {q.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>

                  <span className="text-xs text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="sticky top-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Exam Summary</h2>

            <div className="space-y-5">
              <Summary title="Exam Date" value={formatExamDate(form.examDate)} />
              <Summary title="Duration" value={`${form.duration} mins`} />
              <Summary title="Questions" value={selectedIds.length} />
              <Summary title="Passing" value={`${form.passing}%`} />
              <Summary title="Difficulty" value={form.difficulty} />
              <Summary
                title="Question Order"
                value={form.shuffle ? "Shuffled" : "Custom order"}
              />
            </div>

            <div className="border-t border-slate-800 mt-6 pt-6">
              <button
                type="button"
                onClick={() => handleSubmit("Published")}
                disabled={publishing}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold flex justify-center items-center gap-2 disabled:opacity-60 transition-colors"
              >
                <CheckCircle2 size={18} />
                {publishing ? "Saving..." : "Publish Exam"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected questions drawer */}
      {showSelectedPanel && (
        <SelectedPanel
          questions={visibleSelectedQuestions}
          totalCount={selectedQuestions.length}
          search={selectedPanelSearch}
          onSearchChange={setSelectedPanelSearch}
          onRemove={removeSelected}
          onClearAll={clearAllSelected}
          onClose={() => {
            setShowSelectedPanel(false);
            setSelectedPanelSearch("");
          }}
        />
      )}
    </div>
  );
}

function SelectedPanel({
  questions,
  totalCount,
  search,
  onSearchChange,
  onRemove,
  onClearAll,
  onClose,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 flex flex-col"
      >
        <div className="flex items-center gap-3 p-5 border-b border-slate-800">
          <Layers className="text-blue-400" size={18} />
          <h3 className="text-lg font-semibold">
            Selected Questions
            <span className="text-slate-500 font-normal ml-2 text-sm">
              ({totalCount})
            </span>
          </h3>
          <button
            onClick={onClose}
            className="ml-auto text-slate-500 hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search selected..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 pl-9 text-sm outline-none focus:ring-2 ring-blue-500"
            />
          </div>

          {totalCount > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300"
            >
              <Trash2 size={14} />
              Remove all selected
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {totalCount === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">
              No questions selected yet.
            </p>
          ) : questions.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">
              No selected questions match that search.
            </p>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-700 bg-slate-950"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{q.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-400">
                      {q.type}
                    </span>
                    {q.difficulty && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[q.difficulty] ||
                          "border-slate-700 text-slate-400"
                          }`}
                      >
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(q.id)}
                  className="text-slate-500 hover:text-rose-400 mt-0.5"
                  aria-label={`Remove ${q.title}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Summary({ title, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{title}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-4 transition-all duration-300 hover:border-blue-500/40 hover:bg-slate-800">
      <div>
        <h4 className="text-sm font-semibold text-white">{label}</h4>
        <p className="text-xs text-slate-400">
          {checked ? "Enabled" : "Disabled"}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-8 w-14 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${checked
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30"
          : "bg-slate-600"
          }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-300 ${checked ? "left-7" : "left-1"
            }`}
        />
      </button>
    </div>
  );
}