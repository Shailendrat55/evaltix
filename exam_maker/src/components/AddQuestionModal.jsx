import { useState, useEffect } from "react";

import {
  BookOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Code2,
  FileText,
  CheckCircle2,
  Circle,
  X,
  Loader2
} from "lucide-react";

import { createQuestion, updateQuestion } from "../api/api";

const EMPTY_MCQ_OPTION = () => ({
  text: "",
  correct: false
});

const EMPTY_STARTER = () => ({
  language: "javascript",
  code: ""
});

const EMPTY_TEST_CASE = () => ({
  input: "",
  expectedOutput: "",
  isHidden: true
});


const TYPE_TO_API = {
  MCQ: "MCQ",
  Coding: "CODING",
  Descriptive: "DESCRIPTIVE"
};


function emptyForm() {

  return {
    uiType: "MCQ",

    title: "",
    question: "",
    category: "",
    difficulty: "Medium",
    status: "DRAFT",
    marks: 1,
    negativeMarks: 0,

    allowMultipleCorrect: false,

    options: [
      EMPTY_MCQ_OPTION(),
      EMPTY_MCQ_OPTION()
    ],

    timeLimitMs: 2000,
    memoryLimitMb: 256,

    languages: [
      EMPTY_STARTER()
    ],

    testCases: [
      EMPTY_TEST_CASE()
    ],

    instructions: "",
    minWords: "",
    maxWords: ""
  };
}

const AddQuestionModal = ({
  open,
  onClose,
  onCreated,
  onUpdated,
  editingQuestion,
}) => {
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const resetAndClose = () => {
    setForm(emptyForm());
    setError("");
    onClose();
  };

  // ---- MCQ helpers ----
  const updateOption = (idx, patch) => {
    const options = form.options.map((o, i) => (i === idx ? { ...o, ...patch } : o));
    set({ options });
  };
  const addOption = () => {
    if (form.options.length >= 6) return;
    set({ options: [...form.options, EMPTY_MCQ_OPTION()] });
  };
  const removeOption = (idx) => {
    if (form.options.length <= 2) return;
    set({ options: form.options.filter((_, i) => i !== idx) });
  };
  const toggleCorrect = (idx) => {
    const options = form.options.map((o, i) => {
      if (form.allowMultipleCorrect) {
        return i === idx ? { ...o, correct: !o.correct } : o;
      }
      return { ...o, correct: i === idx };
    });
    set({ options });
  };

  // ---- Coding helpers ----
  const updateLanguage = (idx, patch) => {
    set({ languages: form.languages.map((l, i) => (i === idx ? { ...l, ...patch } : l)) });
  };
  const addLanguage = () => set({ languages: [...form.languages, EMPTY_STARTER()] });
  const removeLanguage = (idx) => {
    if (form.languages.length <= 1) return;
    set({ languages: form.languages.filter((_, i) => i !== idx) });
  };

  const updateTestCase = (idx, patch) => {
    set({ testCases: form.testCases.map((t, i) => (i === idx ? { ...t, ...patch } : t)) });
  };
  const addTestCase = () => set({ testCases: [...form.testCases, EMPTY_TEST_CASE()] });
  const removeTestCase = (idx) => {
    if (form.testCases.length <= 1) return;
    set({ testCases: form.testCases.filter((_, i) => i !== idx) });
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required.";
    if (!form.question.trim()) return "Question text is required.";

    if (form.uiType === "MCQ") {
      const filled = form.options.filter((o) => o.text.trim());
      if (filled.length < 2) return "Add at least 2 options.";
      if (!form.options.some((o) => o.correct)) return "Mark at least one option correct.";
    }

    if (form.uiType === "Coding") {
      if (form.languages.some((l) => !l.code.trim())) return "Add starter code for every language.";
      const hasVisible = form.testCases.some((t) => !t.isHidden && t.input && t.expectedOutput);
      if (!hasVisible) return "Add at least one visible (example) test case.";
    }

    if (form.uiType === "Descriptive") {
      if (!form.instructions.trim()) return "Instructions are required.";
    }

    return "";
  };

  // Shapes the form into a payload the backend can accept.
  const buildPayload = () => {
    const basePayload = {
      type: TYPE_TO_API[form.uiType] || "MCQ",
      title: form.title.trim(),
      description: form.question.trim(),
      difficulty: form.difficulty.toUpperCase(),
      status: form.status || "DRAFT",
      marks: Number(form.marks) || 1,
      negativeMarks: Number(form.negativeMarks) || 0,
      category: form.category.trim() || "General",
      tags: form.category.trim() ? [form.category.trim()] : ["General"],
    };

    if (form.uiType === "MCQ") {
      return {
        ...basePayload,
        options: form.options
          .filter((option) => option.text.trim())
          .map((option, index) => ({
            optionText: option.text.trim(),
            isCorrect: Boolean(option.correct),
            optionOrder: index + 1,
          })),
      };
    }

    if (form.uiType === "Coding") {
      return {
        ...basePayload,

        timeLimit: Number(form.timeLimitMs) || 2000,

        memoryLimit: Number(form.memoryLimitMb) || 256,

        starterCodes: form.languages.map((language) => ({
          language: language.language,
          starterCode: language.code.trim(),
        })),

        testCases: form.testCases.map((testCase) => ({
          input: testCase.input.trim(),
          expectedOutput: testCase.expectedOutput.trim(),
          isHidden: Boolean(testCase.isHidden),
          weight: Number(testCase.weight) || 1,
        })),
      };
    }

    return {
      ...basePayload,
      instructions: form.instructions.trim(),
      minWords: Number(form.minWords) || 0,
      maxWords: Number(form.maxWords) || 0,
    };
  };

  const TYPE_TABS = [
    { key: "MCQ", label: "MCQ", icon: ListChecks },
    { key: "Coding", label: "Coding", icon: Code2 },
    { key: "Descriptive", label: "Descriptive", icon: FileText },
  ];

  useEffect(() => {
    if (!open) return;

    // CREATE mode
    if (!editingQuestion) {
      setForm(emptyForm());
      setError("");
      return;
    }

    // EDIT mode
    const question = editingQuestion;

    setForm({
      uiType:
        question.type === "CODING"
          ? "Coding"
          : question.type === "DESCRIPTIVE"
            ? "Descriptive"
            : "MCQ",

      title: question.title || "",

      question: question.description || "",

      category:
        question.tags?.[0] ||
        question.category ||
        "",

      difficulty:
        question.difficulty
          ? question.difficulty.charAt(0) +
          question.difficulty.slice(1).toLowerCase()
          : "Medium",

      status: question.status || "DRAFT",

      marks: question.marks ?? 1,

      negativeMarks: question.negativeMarks ?? 0,

      // MCQ
      allowMultipleCorrect:
        question.allowMultipleCorrect ?? false,

      options:
        question.options?.length
          ? question.options.map((option) => ({
            text: option.optionText || "",
            correct: Boolean(option.isCorrect),
          }))
          : [
            EMPTY_MCQ_OPTION(),
            EMPTY_MCQ_OPTION(),
          ],

      // Coding
      timeLimitMs:
        question.timeLimit ?? 2000,

      memoryLimitMb:
        question.memoryLimit ?? 256,

      languages:
        question.starterCodes?.length
          ? question.starterCodes.map((code) => ({
            language: code.language,
            code: code.starterCode || "",
          }))
          : [EMPTY_STARTER()],

      testCases:
        question.testCases?.length
          ? question.testCases.map((testCase) => ({
            input: testCase.input || "",
            expectedOutput:
              testCase.expectedOutput || "",
            isHidden:
              Boolean(testCase.isHidden),
          }))
          : [EMPTY_TEST_CASE()],

      // Descriptive
      instructions:
        question.instructions || "",

      minWords:
        question.minWords ?? "",

      maxWords:
        question.maxWords ?? "",
    });
  }, [open, editingQuestion]);

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload = buildPayload();

      console.log(
        editingQuestion
          ? "UPDATE QUESTION PAYLOAD:"
          : "CREATE QUESTION PAYLOAD:"
      );

      console.log(JSON.stringify(payload, null, 2));

      let response;

      if (editingQuestion) {
        response = await updateQuestion(
          editingQuestion.id,
          payload
        );
        console.log("QUESTION UPDATED:", response.data);
      } else {
        response = await createQuestion(payload);
      }

      console.log(
        editingQuestion
          ? "QUESTION UPDATED:"
          : "QUESTION CREATED:",
        response.data
      );

      const updatedQuestion =
        response.data?.data ?? response.data;

      if (editingQuestion) {
        onUpdated?.(updatedQuestion);
      } else {
        onCreated?.(updatedQuestion);
      }

      resetAndClose();

    } catch (err) {
      console.error(
        editingQuestion
          ? "Update question error:"
          : "Create question error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        (
          editingQuestion
            ? "Failed to update question."
            : "Failed to create question."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };
if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold">
              {editingQuestion ? "Edit Question" : "Add Question"}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {editingQuestion
                ? "Update this question in your question bank."
                : "Create a reusable question for your bank."}
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 px-6 pt-5">
          {TYPE_TABS.map(({ key, label, icon: Icon }) => {
            const active = form.uiType === key;
            return (
              <button
                key={key}
                onClick={() => set({ uiType: key })}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${active
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Common fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="Short internal name for this question"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Question
              </label>
              <textarea
                value={form.question}
                onChange={(e) => set({ question: e.target.value })}
                placeholder="What should the candidate be asked?"
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Category / Tag
              </label>
              <input
                value={form.category}
                onChange={(e) => set({ category: e.target.value })}
                placeholder="e.g. React"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => set({ difficulty: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Marks
              </label>
              <input
                type="number"
                min={1}
                value={form.marks}
                onChange={(e) => set({ marks: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Negative marks
              </label>
              <input
                type="number"
                min={0}
                value={form.negativeMarks}
                onChange={(e) => set({ negativeMarks: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* MCQ fields */}
          {form.uiType === "MCQ" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">
                  Options (2–6) — tap the circle to mark correct
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={form.allowMultipleCorrect}
                    onChange={(e) => set({ allowMultipleCorrect: e.target.checked })}
                    className="accent-blue-600"
                  />
                  Allow multiple correct
                </label>
              </div>

              {form.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCorrect(idx)}
                    className={opt.correct ? "text-green-400" : "text-slate-500 hover:text-slate-300"}
                    aria-label="Mark correct"
                  >
                    {opt.correct ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <input
                    value={opt.text}
                    onChange={(e) => updateOption(idx, { text: e.target.value })}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
                  />
                  <button
                    onClick={() => removeOption(idx)}
                    disabled={form.options.length <= 2}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500"
                    aria-label="Remove option"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                onClick={addOption}
                disabled={form.options.length >= 6}
                className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-40 flex items-center gap-1"
              >
                <Plus size={14} /> Add option
              </button>
            </div>
          )}

          {/* Coding fields */}
          {form.uiType === "Coding" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Time limit (ms)
                  </label>
                  <input
                    type="number"
                    value={form.timeLimitMs}
                    onChange={(e) => set({ timeLimitMs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Memory limit (MB)
                  </label>
                  <input
                    type="number"
                    value={form.memoryLimitMb}
                    onChange={(e) => set({ memoryLimitMb: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">
                  Starter code per language
                </label>
                {form.languages.map((lang, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-700 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={lang.language}
                        onChange={(e) => updateLanguage(idx, { language: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 ring-blue-500"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                      <button
                        onClick={() => removeLanguage(idx)}
                        disabled={form.languages.length <= 1}
                        className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-red-400 disabled:opacity-30"
                        aria-label="Remove language"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <textarea
                      value={lang.code}
                      onChange={(e) => updateLanguage(idx, { code: e.target.value })}
                      placeholder="function solve() {}"
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 ring-blue-500 resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={addLanguage}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus size={14} /> Add language
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">
                  Test cases — mark at least one visible so candidates see an example
                </label>
                {form.testCases.map((tc, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-700 rounded-xl p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={tc.input}
                        onChange={(e) => updateTestCase(idx, { input: e.target.value })}
                        placeholder="Input"
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 ring-blue-500"
                      />
                      <input
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(idx, { expectedOutput: e.target.value })}
                        placeholder="Expected output"
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => updateTestCase(idx, { isHidden: e.target.checked })}
                          className="accent-blue-600"
                        />
                        Hidden (grading only)
                      </label>
                      <button
                        onClick={() => removeTestCase(idx)}
                        disabled={form.testCases.length <= 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 disabled:opacity-30"
                        aria-label="Remove test case"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addTestCase}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus size={14} /> Add test case
                </button>
              </div>
            </div>
          )}

          {/* Descriptive fields */}
          {form.uiType === "Descriptive" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Grading instructions
                </label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => set({ instructions: e.target.value })}
                  placeholder="What should the evaluator look for in the candidate's answer?"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Min words
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.minWords}
                    onChange={(e) => set({ minWords: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Max words
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxWords}
                    onChange={(e) => set({ maxWords: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
          <button
            onClick={resetAndClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 font-semibold text-sm"
          >
            {submitting && (
              <Loader2 size={16} className="animate-spin" />
            )}

            {submitting
              ? editingQuestion
                ? "Updating..."
                : "Creating..."
              : editingQuestion
                ? "Update question"
                : "Create question"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default AddQuestionModal;