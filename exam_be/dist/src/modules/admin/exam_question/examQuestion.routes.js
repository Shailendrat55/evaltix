"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const examQuestion_controller_1 = require("./examQuestion.controller");
const router = (0, express_1.Router)();
/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
// Assign multiple questions
router.post("/admin/exams/:examId/questions", examQuestion_controller_1.assignQuestionsController);
// Assign one question
router.post("/admin/exams/:examId/questions/single", examQuestion_controller_1.assignSingleQuestionController);
// Get questions assigned to exam
router.get("/admin/exams/:examId/questions", examQuestion_controller_1.getExamQuestionsController);
// Count questions
router.get("/admin/exams/:examId/questions/count", examQuestion_controller_1.getQuestionCountController);
// Remove one question
router.delete("/admin/exams/:examId/questions/:questionId", examQuestion_controller_1.removeQuestionController);
// Remove all questions
router.delete("/admin/exams/:examId/questions", examQuestion_controller_1.removeAllQuestionsController);
// Change question order
router.patch("/admin/exams/:examId/questions/:questionId/order", examQuestion_controller_1.reorderQuestionController);
/*
|--------------------------------------------------------------------------
| Candidate Routes
|--------------------------------------------------------------------------
*/
router.get("/exams/:examId/questions", examQuestion_controller_1.getCandidateExamQuestionsController);
exports.default = router;
