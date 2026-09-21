import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Rules from "./pages/rules";
import Exam from "./pages/exam";
import NotFound from "./pages/notFound"; // 👈 Import NotFound
import AuthGuard from "./api/authGuard";
import Dashboard from "./pages/admin/Dashboard";
import CandidatesPage from "./pages/admin/Candidates";
import CreateExam from "./pages/admin/Exams";
import CreateExamForm from "./pages/admin/Createexam";
import AdminLayout from "./Layouts/AdminLayout";
import ComingSoon from "./pages/admin/ComingSoon";
import Questions from "./pages/admin/Questions";
import CandidateDashboard from "./pages/candidates/Candidatedashboard";
import ExamInstructions from "./pages/candidates/startCandidateExam";
import ExamSystemCheck from "./pages/candidates/ExamSystemCheck";
import CandidateExam from "./pages/candidates/CandidateExam";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root path redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Rules page: must accept before starting exam */}


        {/* Exam page */}
        <Route
          path="/CandidateDashboard"
          element={
            <AuthGuard requiredRole="CANDIDATE">
              <CandidateDashboard />
            </AuthGuard>
          }
        />

        <Route
          path="/exams/:assignmentId"
          element={
            <AuthGuard requiredRole="CANDIDATE">
              <ExamInstructions />
            </AuthGuard>
          }
        />

        <Route
          path="/exam/assignmentID/:attemptId/start"
          element={
            <AuthGuard requiredRole="CANDIDATE">
              <CandidateExam />
            </AuthGuard>
          }
        />

        <Route
          path="/exam/check/:assignmentId"
          element={
            <AuthGuard requiredRole="CANDIDATE">
              <ExamSystemCheck />
            </AuthGuard>
          }
        />

        <Route
          path="/exam"
          element={
            <AuthGuard requiredRole="CANDIDATE">
              <Exam />
            </AuthGuard>
          }
        />





        <Route
          path="/evaluator/queue"
          element={
            <AuthGuard requiredRole="EVALUATOR">
              {/* <EvaluatorQueue /> */}
            </AuthGuard>
          }
        />

        <Route
          path="/admin"
          element={
            <AuthGuard requiredRole="ADMIN">
              <AdminLayout />
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="exams" element={<CreateExam />} />
          <Route path="createexam" element={<CreateExamForm />} />
          <Route path="questions" element={<Questions title="Question Bank" />} />
          <Route path="createexam" element={<CreateExam />} />
        </Route>
        <Route
          path="/candidate"

        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="exams" element={<CreateExam />} />
          <Route path="createexam" element={<CreateExamForm />} />
          <Route path="questions" element={<Questions title="Question Bank" />} />
          <Route path="createexam" element={<CreateExam />} />
        </Route>


        {/* 404 Page (for any unknown route or when token is missing) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
