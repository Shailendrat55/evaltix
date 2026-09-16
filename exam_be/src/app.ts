import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import adminUsersRoutes from "./modules/admin/users.routes";
import { authenticate } from "./middleware/authenticate";
import { requireRole } from "./middleware/requireRole";
import { errorHandler } from "./middleware/errorHandler";
import { NotFoundError } from "./errors/AppError";
import examsRoutes from "./modules/admin/Exam/exams.routes";
import questionRouter from "./modules/admin/questions/question.routes";
import examAssignmentRoutes from "../src/modules/admin/examAssign/examAssignment.routes";
import examQuestionRoutes from "../src/modules/admin/exam_question/examQuestion.routes";
import candidateRoutes from "./modules/Candidates/candidate.routes";
import examAttemptRoutes from "./modules/Candidates/examAttempt/examAttempt.routes";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health Check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Public Authentication Routes
app.use("/api/v1/auth", authRoutes);

// Exam Routes
app.use(
  "/api/v1/admin/exams",
  authenticate,
  requireRole("ADMIN"),
  examsRoutes
);

app.use(
  "/api/v1/admin/exam-assignments",
  authenticate,
  requireRole("ADMIN"),
  examAssignmentRoutes
);

app.use("/api/v1", examQuestionRoutes);

// Admin User Management Routes (Guarded by authenticate & ADMIN role)
app.use("/api/v1/admin/users", authenticate, requireRole("ADMIN"), adminUsersRoutes);

// Protected API space for candidates / evaluators (Future feature routes mount here)
app.use("/api/v1/protected", authenticate, (_req, res) => {
  res.json({ message: "Authenticated endpoint access granted" });
});
app.use("/api/v1/admin/questions", authenticate, requireRole("ADMIN"), questionRouter)

app.use(
  "/api/v1/candidate",
  authenticate,
  requireRole("CANDIDATE"),
  candidateRoutes
);

app.use(
  "/api/v1/candidate/exams/attempts",
  authenticate,
  requireRole("CANDIDATE"),
  examAttemptRoutes
);

// Catch-all 404 Route
app.use((_req, _res, next) => {
  next(new NotFoundError("Endpoint not found", "ROUTE_NOT_FOUND"));
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;