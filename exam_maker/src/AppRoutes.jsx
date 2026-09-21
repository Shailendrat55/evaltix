import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Rules from "./pages/rules";
import Exam from "./pages/exam";
import NotFound from "./pages/notFound";
import AuthGuard from "./api/authGuard";
import Dashboard from "./pages/admin/Dashboard";
import CandidatesPage from "./pages/admin/Candidates";
import CreateExam from "./pages/admin/Exams";
import ComingSoon from "./pages/admin/ComingSoon"; // 👈 add this
import AdminLayout from "./Layouts/AdminLayout";
import Questions from "./pages/admin/Questions";
import CandidateDashboard from "./pages/candidates/Candidatedashboard";
import ExamInstructions from "./pages/candidates/startCandidateExam";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root path redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Rules page: must accept before starting exam */}
        <Route
          path="/Candidatedashboard"
          element={
            <AuthGuard requiredRole="CANDIDATE">
              <CandidateDashboard />
            </AuthGuard>
          }
        />

        <Route
          path="/exams/:assignmentId/start"
          element={
            <AuthGuard requiredRole="CANDIDATE">
              <ExamInstructions />
            </AuthGuard>
          }
        />


        {/* Exam page */}
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
              <ComingSoon title="Evaluator Queue" />
            </AuthGuard>
          }
        />

        {/* <Route
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
          <Route path="exams/create" element={<CreateExamForm />} />
          <Route path="questions" element={<Questions title="Question Bank" />} />
        </Route> */}

        <Route
          path="/candidate"
          element={
            <AuthGuard requiredRole={CANDIDATE}>
              <CandidateLayout />
            </AuthGuard>
          }>
            
          </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}