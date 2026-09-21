import { useEffect, useState, useRef } from "react";
import { Search, Plus, Upload, X, FileSpreadsheet, Download, Trash2, Pencil, Loader2 } from "lucide-react";
import { getallCandidates, getExams, createUser, assignExamToCandidate, updateAssignment } from "../../api/api";

function mapExam(exam, index) {
  return {
    id: exam.id ?? exam._id ?? index,
    name: exam.name || exam.title || exam.examName || "Unnamed exam",
  };
}

function mapCandidate(candidate, index) {
  return {
    assignmentId: candidate.assignmentId ?? null,

    id: candidate.id ?? index,

    name: candidate.name || "—",

    email: candidate.email || "—",

    exam: candidate.examTitle || candidate.exam?.name || "—",

    examId: candidate.exam?.id ?? candidate.examId ?? "",

    status: candidate.assignmentStatus
      ? String(candidate.assignmentStatus).toLowerCase()
      : candidate.isActive === false
        ? "blocked"
        : "pending",

    registered: candidate.createdAt || "—",
  };
}

function StatusPill({ status }) {
  const map = {
    active: {
      label: "Active",
      cls: "bg-[#e2f3ec] text-[#0f7a5f]",
    },

    assigned: {
      label: "Assigned",
      cls: "bg-[#edf4ff] text-[#4667d0]",
    },

    in_progress: {
      label: "In Progress",
      cls: "bg-[#f5ecff] text-[#7b5cc9]",
    },

    submitted: {
      label: "Submitted",
      cls: "bg-[#e2f3ec] text-[#0f7a5f]",
    },

    completed: {
      label: "Completed",
      cls: "bg-[#e2f3ec] text-[#0f7a5f]",
    },

    pending: {
      label: "Pending",
      cls: "bg-[#fbeed9] text-[#b3781f]",
    },

    blocked: {
      label: "Blocked",
      cls: "bg-[#fbe9e9] text-[#c23b3b]",
    },
  };

  const s = map[status] || map.pending;

  return (
    <span
      className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-[#241f13]/50 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="w-[460px] max-w-full max-h-[calc(100vh-64px)] overflow-y-auto bg-white border border-[#e5e1d5] rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e1d5]">
          <h2 className="text-lg font-semibold text-[#241f13]">{title}</h2>
          <button className="text-[#6b6354] hover:text-[#241f13] transition-colors" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddCandidateModal({
  onClose,
  onAdd,
  onUpdate,
  exams,
  examsLoading,
  submitting,
  editingCandidate,
}) {
  const isEdit = !!editingCandidate;

  const [form, setForm] = useState({
    name: editingCandidate?.name || "",
    email: editingCandidate?.email || "",
    exam: editingCandidate?.examId || "",
  });

  function update(key, value) {
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  }

  function submit(e) {
    e.preventDefault();

    if (!form.name || !form.email) return;

    if (isEdit) {
      onUpdate(form);
    } else {
      onAdd(form);
    }
  }

  const inputCls =
    "bg-[#f9f8f4] border border-[#e5e1d5] rounded-xl px-3.5 py-2.5 text-sm text-[#241f13] outline-none focus:ring-2 ring-[#b3781f] transition-colors placeholder:text-[#6b6354] w-full";

  const labelCls = "text-sm text-[#6b6354]";

  return (
    <ModalShell
      title={isEdit ? "Edit candidate" : "Add candidate"}
      onClose={onClose}
    >
      <form
        className="p-6 flex flex-col gap-5"
        onSubmit={submit}
      >
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Full name</label>

          <input
            type="text"
            placeholder="e.g. Ananya Rao"
            value={form.name}
            onChange={(e) =>
              update("name", e.target.value)
            }
            className={inputCls}
            required
            disabled={isEdit}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Email</label>

          <input
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) =>
              update("email", e.target.value)
            }
            className={inputCls}
            required
          />
        </div>

        {/* Exam */}
        <div className="flex flex-col gap-2">
          <label className={labelCls}>
            Assign exam
          </label>

          <select
            value={form.exam}
            onChange={(e) =>
              update("exam", e.target.value)
            }
            className={inputCls}
            disabled={examsLoading}
          >
            <option value="">
              {examsLoading
                ? "Loading exams..."
                : "No exam yet"}
            </option>

            {exams.map((exam) => (
              <option
                key={exam.id}
                value={exam.id}
              >
                {exam.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6b6354] hover:text-[#241f13] transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#b3781f] hover:bg-[#96631a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white"
          >
            {submitting && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            {submitting
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
                ? "Update candidate"
                : "Add candidate"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function UploadExcelModal({ onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const f = fileList[0];
    if (!f) return;
    const okTypes = [".xlsx", ".xls", ".csv"];
    if (!okTypes.some((ext) => f.name.toLowerCase().endsWith(ext))) return;
    setFile(f);
  }

  return (
    <ModalShell title="Upload candidates" onClose={onClose}>
      <div className="p-6 flex flex-col gap-4">
        <p className="text-sm text-[#6b6354] m-0">
          Upload an .xlsx or .csv file with columns: Name, Email, Phone, Exam.
        </p>

        <a className="inline-flex items-center gap-1.5 text-sm text-[#b3781f] hover:text-[#96631a] w-fit" href="#" download>
          <Download size={14} />
          Download template
        </a>

        <div
          className={`border-2 border-dashed rounded-xl px-4 py-8 flex items-center justify-center cursor-pointer transition-colors bg-[#f9f8f4] ${dragOver ? "border-[#b3781f] bg-[#fbeed9]" : "border-[#e5e1d5] hover:border-[#b3781f] hover:bg-[#fbeed9]" 
            }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />

          {file ? (
            <div className="flex flex-row items-center gap-3 text-[#241f13]">
              <FileSpreadsheet size={26} className="text-[#b3781f]" />
              <div>
                <p className="m-0 text-sm text-[#241f13]">{file.name}</p>
                <span className="text-xs text-[#6b6354]">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#6b6354] text-center">
              <Upload size={26} />
              <p className="m-0 text-sm text-[#241f13]">Drag file here, or click to browse</p>
              <span className="text-xs text-[#6b6354]">.xlsx, .xls, .csv up to 5MB</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6b6354] hover:text-[#241f13] transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!file}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#b3781f] hover:bg-[#96631a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white"
            onClick={() => onUpload(file)}
          >
            Upload &amp; import
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [exams, setExams] = useState([]);
  const [examsLoaded, setExamsLoaded] = useState(false);
  const [examsLoading, setExamsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [updatingAssignment, setUpdatingAssignment] = useState(false);

  // Only fetch candidates on initial page render.
  useEffect(() => {
  async function loadCandidates() {
    try {
      const response = await getallCandidates();
      const candidateList = response?.assignments || [];

      setCandidates(candidateList.map(mapCandidate));
    } catch (fetchError) {
      console.error("Error while fetching candidates", fetchError);
      setError("Unable to load candidates.");
    } finally {
      setLoading(false);
    }
  }

  loadCandidates();
}, []);

  // Fetch exams lazily, only the first time the Add Candidate modal is opened.
  async function openAddModal() {
    setShowAddModal(true);

    if (examsLoaded || examsLoading) return;

    try {
      setExamsLoading(true);
      const examsResponse = await getExams();
      const examsPayload = examsResponse?.data;
      const examList = Array.isArray(examsPayload)
        ? examsPayload
        : examsPayload?.exams || examsPayload?.data || [];

      setExams(examList.map(mapExam));
      setExamsLoaded(true);
    } catch (fetchError) {
      console.error("Error while fetching exams", fetchError);
    } finally {
      setExamsLoading(false);
    }
  }

  const filtered = candidates.filter((c) =>
    [c.name, c.email, c.phone].some((v) => String(v).toLowerCase().includes(query.toLowerCase()))
  );

  async function handleAdd(form) {
    setAddingCandidate(true);

    try {
      const response = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        role: "CANDIDATE",
      });
      const candidate = response?.user;

      const candidateId = candidate?.id;

      if (!candidateId) {
        throw new Error("Candidate was created but no candidate ID was returned.");
      }

      const selectedExam = exams.find((exam) => String(exam.id) === String(form.exam));
      if (selectedExam) {
        await assignExamToCandidate(selectedExam.id, candidateId);
      }

      setCandidates((prev) => [
        mapCandidate({
          ...candidate,
          id: candidateId,
          ID: candidateId,
          name: candidate.name || form.name,
          email: candidate.email || form.email,
          // phone: candidate.phone || form.phone,
          exam: selectedExam,
          status: candidate.status || "pending",
        }, candidateId),
        ...prev,
      ]);
      setShowAddModal(false);
    } catch (addError) {
      console.error("Error while adding candidate", addError);
      alert(addError.message || "Unable to add candidate.");
    } finally {
      setAddingCandidate(false);
    }
  }

  async function handleUpdateAssignment(form) {
    if (!editingCandidate?.assignmentId) {
      alert("Assignment ID is missing.");
      return;
    }

    setUpdatingAssignment(true);

    try {
      const response = await updateAssignment(
        editingCandidate.assignmentId,
        {
          user_id: editingCandidate.id,
          email: form.email.trim(),
          exam_id: form.exam,
        }
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
          "Unable to update assignment."
        );
      }

      const selectedExam = exams.find(
        (exam) =>
          String(exam.id) === String(form.exam)
      );

      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === editingCandidate.id
            ? {
              ...candidate,
              email: form.email.trim(),
              examId: form.exam,
              exam: selectedExam?.name || "—",
            }
            : candidate
        )
      );

      setEditingCandidate(null);

    } catch (error) {
      console.error(
        "Error while updating assignment:",
        error
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to update assignment."
      );
    } finally {
      setUpdatingAssignment(false);
    }
  }

  function handleUpload(file) {
    // Wire this to your backend parse/import endpoint.
    console.log("Importing file:", file.name);
    setShowUploadModal(false);
  }

  function removeCandidate(id) {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#f9f8f4] text-[#241f13] p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-[#6b6354] mt-2">
            {candidates.length} total · manage who's registered for exams
          </p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#d8cdae] bg-white hover:bg-[#f3efe7] font-semibold text-sm transition-colors text-[#241f13]"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={16} />
            Upload Excel
          </button>
          <button
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#b3781f] hover:bg-[#96631a] font-semibold text-sm transition-colors text-white"
            onClick={openAddModal}
          >
            <Plus size={16} />
            Add candidate
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 max-w-[360px] bg-white border border-[#e5e1d5] rounded-xl px-4 py-2.5 text-[#6b6354]">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[#241f13] text-sm placeholder:text-[#6b6354]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e1d5] p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e1d5] text-[#6b6354]">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Exam</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Registered</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center text-[#6b6354] py-10">
                  Loading candidates...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={7} className="text-center text-[#c23b3b] py-10">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-[#6b6354] py-10">
                  No candidates match "{query}".
                </td>
              </tr>
            )}

            {filtered.map((c, i) => (
              <tr
                key={c.id}
                className={i !== filtered.length - 1 ? "border-b border-[#e5e1d5]" : ""}
              >
                <td className="p-3 font-semibold text-[#241f13]">{c.name}</td>
                <td className="p-3 text-[#6b6354]">{c.email}</td>
                <td className="p-3 text-[#241f13]">{c.exam}</td>
                <td className="p-3"><StatusPill status={c.status} /></td>
                <td className="p-3 text-[#6b6354]">{c.registered}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      className="p-2 rounded-lg border border-[#e5e1d5] hover:bg-[#f3efe7] text-[#241f13] transition-colors"
                      title="Edit"
                      onClick={async () => {
                        setEditingCandidate(c);

                        // Make sure exams are loaded for the dropdown
                        if (!examsLoaded && !examsLoading) {
                          try {
                            setExamsLoading(true);

                            const examsResponse = await getExams();
                            const examsPayload = examsResponse?.data;

                            const examList = Array.isArray(examsPayload)
                              ? examsPayload
                              : examsPayload?.exams ||
                              examsPayload?.data ||
                              [];

                            setExams(examList.map(mapExam));
                            setExamsLoaded(true);
                          } catch (error) {
                            console.error("Error while fetching exams", error);
                          } finally {
                            setExamsLoading(false);
                          }
                        }
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="p-2 rounded-lg border border-[#f0c4c4] hover:bg-[#fbe9e9] text-[#c23b3b] transition-colors"
                      title="Remove"
                      onClick={() => removeCandidate(c.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showAddModal || editingCandidate) && (
        <AddCandidateModal
          onClose={() => {
            setShowAddModal(false);
            setEditingCandidate(null);
          }}
          onAdd={handleAdd}
          onUpdate={handleUpdateAssignment}
          exams={exams}
          examsLoading={examsLoading}
          submitting={
            editingCandidate
              ? updatingAssignment
              : addingCandidate
          }
          editingCandidate={editingCandidate}
        />
      )}
      {showUploadModal && <UploadExcelModal onClose={() => setShowUploadModal(false)} onUpload={handleUpload} />}
    </div>
  );
}