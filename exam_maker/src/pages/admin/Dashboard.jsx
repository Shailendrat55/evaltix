import React from "react";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getallCandidates, getExams, getQuestions } from "../../api/api";

function asList(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function examDate(exam) {
  return exam.examDate || exam.date || exam.scheduledAt || exam.createdAt;
}

function isCompletedExam(exam) {
  const status = String(exam.status || "").toLowerCase();
  if (["completed", "finished", "closed"].includes(status)) return true;
  const date = examDate(exam);
  return date && new Date(date).getTime() < Date.now();
}

function isPassed(assignment) {
  const status = String(
    assignment.result || assignment.resultStatus || assignment.assignmentStatus || ""
  ).toLowerCase();
  return ["passed", "pass", "qualified"].includes(status);
}

function isFailed(assignment) {
  const status = String(
    assignment.result || assignment.resultStatus || assignment.assignmentStatus || ""
  ).toLowerCase();
  return ["failed", "fail", "disqualified"].includes(status);
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ exams: [], assignments: [], questions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [examsResponse, candidatesResponse, questionsResponse] = await Promise.all([
          getExams(),
          getallCandidates(),
          getQuestions(),
        ]);

        setData({
          exams: asList(examsResponse?.data, ["exams", "data"]),
          assignments: asList(candidatesResponse, ["assignments", "data"]),
          questions: asList(questionsResponse, ["questions", "data"]),
        });
      } catch (loadError) {
        console.error("Failed to load dashboard data", loadError);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const { exams, assignments, questions } = data;
  const candidateIds = new Set(
    assignments.map((assignment) => assignment.userId || assignment.candidateId || assignment.email).filter(Boolean)
  );
  const passed = assignments.filter(isPassed).length;
  const failed = assignments.filter(isFailed).length;
  const evaluated = passed + failed;
  const passedPercent = evaluated ? Math.round((passed / evaluated) * 100) : 0;
  const failedPercent = evaluated ? 100 - passedPercent : 0;
  const recentExams = [...exams]
    .sort((first, second) => new Date(examDate(second) || 0) - new Date(examDate(first) || 0))
    .slice(0, 5);

  const stats = [
    { title: "Total Candidates", value: candidateIds.size, icon: <Users size={24} />, accent: "text-[#0f7a5f]", ring: "bg-[#e2f3ec]" },
    { title: "Total Exams", value: exams.length, icon: <FileText size={24} />, accent: "text-[#6b6354]", ring: "bg-[#f3f1e9]" },
    { title: "Completed Exams", value: exams.filter(isCompletedExam).length, icon: <CheckCircle size={24} />, accent: "text-[#0f7a5f]", ring: "bg-[#e2f3ec]" },
    { title: "Upcoming Exams", value: exams.filter((exam) => !isCompletedExam(exam)).length, icon: <Clock size={24} />, accent: "text-[#b3781f]", ring: "bg-[#fbeed9]" },
  ];

  const formatDate = (value) => {
    if (!value) return "Not set";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#f9f8f4] text-[#241f13] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Exam Dashboard</h1>
          <p className="text-[#6b6354] mt-2">
            Manage exams, candidates and results from one place.
          </p>
        </div>

        <button onClick={() => navigate("/admin/createexam")} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#b3781f] hover:bg-[#96631a] text-white font-semibold">
          <FileText size={18} />
          New Exam
        </button>
      </div>

      {/* Statistics Cards */}
      {error && <p className="mb-6 rounded-xl border border-[#c23b3b]/30 bg-[#fbe9e9] px-4 py-3 text-sm text-[#c23b3b]">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-[#e5e1d5] p-6 flex justify-between items-start"
          >
            <div>
              <p className="text-sm text-[#6b6354]">{item.title}</p>
              <h2 className="text-3xl font-bold mt-2">{loading ? "—" : item.value.toLocaleString()}</h2>
            </div>

            <div className={`${item.ring} ${item.accent} p-3 rounded-xl`}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Exam Performance */}
        <div className="bg-white rounded-2xl border border-[#e5e1d5] p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-[#b3781f]" />
            <h2 className="text-xl font-semibold">Exam Performance</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-[#241f13]">Passed</span>
                <span className="text-[#6b6354]">{loading ? "—" : `${passedPercent}%`}</span>
              </div>

              <div className="h-2.5 bg-[#f3f1e9] rounded-full mt-2">
                <div className="h-2.5 bg-[#0f7a5f] rounded-full" style={{ width: `${passedPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-[#241f13]">Failed</span>
                <span className="text-[#6b6354]">{loading ? "—" : `${failedPercent}%`}</span>
              </div>

              <div className="h-2.5 bg-[#f3f1e9] rounded-full mt-2">
                <div className="h-2.5 bg-[#c23b3b] rounded-full" style={{ width: `${failedPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Question Bank */}
        <div className="bg-white rounded-2xl border border-[#e5e1d5] p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="text-[#0f7a5f]" />
            <h2 className="text-xl font-semibold">Question Bank</h2>
          </div>

          <h3 className="text-4xl font-bold">{loading ? "—" : questions.length.toLocaleString()}</h3>
          <p className="text-[#6b6354] mt-2">Total Questions Available</p>

          <button onClick={() => navigate("/admin/questions")} className="mt-5 w-full bg-[#0f7a5f] hover:bg-[#0c634c] text-white px-4 py-3 rounded-xl font-semibold">
            Manage Questions
          </button>
        </div>
      </div>

      {/* Recent Exams Table */}
      <div className="bg-white rounded-2xl border border-[#e5e1d5] p-6 mt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Recent Exams</h2>
          <button className="flex items-center gap-1 text-sm text-[#b3781f] hover:text-[#96631a]">
            View all
            <ArrowUpRight size={16} />
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e1d5] text-[#6b6354]">
              <th className="text-left p-3 font-medium">Exam Name</th>
              <th className="text-left p-3 font-medium">Candidates</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Date</th>
            </tr>
          </thead>

          <tbody>
            {recentExams.map((exam) => {
              const completed = isCompletedExam(exam);
              const examId = exam.id ?? exam._id;
              const candidateCount = assignments.filter((assignment) =>
                String(assignment.examId || assignment.exam?.id || "") === String(examId)
              ).length;
              return (
                <tr key={examId} className="border-b border-[#e5e1d5] last:border-0">
                  <td className="p-3">{exam.title || exam.name || "Untitled Exam"}</td>
                  <td className="p-3 font-mono tabular-nums">{candidateCount}</td>
                  <td className="p-3"><span className={`px-3 py-1 rounded-full text-xs font-medium ${completed ? "bg-[#e2f3ec] text-[#0f7a5f]" : "bg-[#fbeed9] text-[#b3781f]"}`}>{completed ? "Completed" : "Upcoming"}</span></td>
                  <td className="p-3 text-[#6b6354] font-mono tabular-nums">{formatDate(examDate(exam))}</td>
                </tr>
              );
            })}
            {!loading && recentExams.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-[#a39c8a]">No exams found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;