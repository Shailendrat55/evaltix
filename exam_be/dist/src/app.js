"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/admin/users.routes"));
const authenticate_1 = require("./middleware/authenticate");
const requireRole_1 = require("./middleware/requireRole");
const errorHandler_1 = require("./middleware/errorHandler");
const AppError_1 = require("./errors/AppError");
const exams_routes_1 = __importDefault(require("./modules/admin/Exam/exams.routes"));
const question_routes_1 = __importDefault(require("./modules/admin/questions/question.routes"));
const examAssignment_routes_1 = __importDefault(require("../src/modules/admin/examAssign/examAssignment.routes"));
const examQuestion_routes_1 = __importDefault(require("../src/modules/admin/exam_question/examQuestion.routes"));
const candidate_routes_1 = __importDefault(require("./modules/Candidates/candidate.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Health Check
app.get("/health", (_req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// Public Authentication Routes
app.use("/api/v1/auth", auth_routes_1.default);
// Exam Routes
app.use("/api/v1/admin/exams", authenticate_1.authenticate, (0, requireRole_1.requireRole)("ADMIN"), exams_routes_1.default);
app.use("/api/v1/admin/exam-assignments", authenticate_1.authenticate, (0, requireRole_1.requireRole)("ADMIN"), examAssignment_routes_1.default);
app.use("/api/v1", examQuestion_routes_1.default);
// Admin User Management Routes (Guarded by authenticate & ADMIN role)
app.use("/api/v1/admin/users", authenticate_1.authenticate, (0, requireRole_1.requireRole)("ADMIN"), users_routes_1.default);
// Protected API space for candidates / evaluators (Future feature routes mount here)
app.use("/api/v1/protected", authenticate_1.authenticate, (_req, res) => {
    res.json({ message: "Authenticated endpoint access granted" });
});
app.use("/api/v1/admin/questions", authenticate_1.authenticate, (0, requireRole_1.requireRole)("ADMIN"), question_routes_1.default);
app.use("/api/v1/candidate", candidate_routes_1.default);
// Catch-all 404 Route
app.use((_req, _res, next) => {
    next(new AppError_1.NotFoundError("Endpoint not found", "ROUTE_NOT_FOUND"));
});
// Centralized Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
