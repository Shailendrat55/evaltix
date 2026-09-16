"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignQuestionsController = assignQuestionsController;
exports.assignSingleQuestionController = assignSingleQuestionController;
exports.getExamQuestionsController = getExamQuestionsController;
exports.getCandidateExamQuestionsController = getCandidateExamQuestionsController;
exports.removeQuestionController = removeQuestionController;
exports.removeAllQuestionsController = removeAllQuestionsController;
exports.reorderQuestionController = reorderQuestionController;
exports.getQuestionCountController = getQuestionCountController;
const examQuestion_service_1 = require("./examQuestion.service");
/**
 * POST /admin/exams/:examId/questions
 */
async function assignQuestionsController(req, res, next) {
    try {
        const examId = Number(req.params.examId);
        const { questionIds } = req.body;
        const result = await (0, examQuestion_service_1.assignQuestions)({
            examId,
            questionIds,
        });
        return res.status(201).json({
            success: true,
            message: "Questions assigned to exam successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /admin/exams/:examId/questions/single
 */
async function assignSingleQuestionController(req, res, next) {
    try {
        const examId = Number(req.params.examId);
        const { questionId, questionOrder, } = req.body;
        const result = await (0, examQuestion_service_1.assignSingleQuestion)(examId, questionId, questionOrder);
        return res.status(201).json({
            success: true,
            message: "Question assigned successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /admin/exams/:examId/questions
 */
async function getExamQuestionsController(req, res, next) {
    try {
        const examId = Number(req.params.examId);
        const questions = await (0, examQuestion_service_1.getExamQuestions)(examId);
        return res.status(200).json({
            success: true,
            data: questions,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /exams/:examId/questions
 *
 * Used by candidate exam page.
 */
async function getCandidateExamQuestionsController(req, res, next) {
    try {
        const examId = Number(req.params.examId);
        const questions = await (0, examQuestion_service_1.getCandidateExamQuestions)(examId);
        return res.status(200).json({
            success: true,
            data: questions,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /admin/exams/:examId/questions/:questionId
 */
async function removeQuestionController(req, res, next) {
    try {
        const examId = Number(req.params.examId);
        const { questionId } = req.params;
        const result = await (0, examQuestion_service_1.removeQuestion)(examId, questionId);
        return res.status(200).json({
            success: true,
            message: "Question removed from exam successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /admin/exams/:examId/questions
 */
async function removeAllQuestionsController(req, res, next) {
    try {
        const examId = Number(req.params.examId);
        const result = await (0, examQuestion_service_1.removeAllQuestions)(examId);
        return res.status(200).json({
            success: true,
            message: "All questions removed from exam",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * PATCH /admin/exams/:examId/questions/:questionId/order
 */
async function reorderQuestionController(req, res, next) {
    try {
        const examId = Number(req.params.examId);
        const { questionId } = req.params;
        const { questionOrder } = req.body;
        const result = await (0, examQuestion_service_1.reorderQuestion)(examId, questionId, questionOrder);
        return res.status(200).json({
            success: true,
            message: "Question order updated successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /admin/exams/:examId/questions/count
 */
async function getQuestionCountController(req, res, next) {
    try {
        const examId = Number(req.params.examId);
        const count = await (0, examQuestion_service_1.getQuestionCount)(examId);
        return res.status(200).json({
            success: true,
            data: {
                examId,
                count,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
