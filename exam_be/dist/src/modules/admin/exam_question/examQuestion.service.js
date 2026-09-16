"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignQuestions = assignQuestions;
exports.assignSingleQuestion = assignSingleQuestion;
exports.getExamQuestions = getExamQuestions;
exports.getCandidateExamQuestions = getCandidateExamQuestions;
exports.removeQuestion = removeQuestion;
exports.removeAllQuestions = removeAllQuestions;
exports.reorderQuestion = reorderQuestion;
exports.getQuestionCount = getQuestionCount;
const examQuestion_repository_1 = require("./examQuestion.repository");
const config_1 = __importDefault(require("../../../config"));
async function assignQuestions(params) {
    const { examId, questionIds } = params;
    if (!examId) {
        throw new Error("Exam ID is required");
    }
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
        throw new Error("At least one question is required");
    }
    const client = await config_1.default.connect();
    try {
        await client.query("BEGIN");
        const result = await (0, examQuestion_repository_1.assignQuestionsToExam)(client, examId, questionIds);
        await client.query("COMMIT");
        return {
            examId,
            questions: result,
            count: result.length,
        };
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function assignSingleQuestion(examId, questionId, questionOrder) {
    if (!examId) {
        throw new Error("Exam ID is required");
    }
    if (!questionId) {
        throw new Error("Question ID is required");
    }
    if (!questionOrder || questionOrder < 1) {
        throw new Error("Question order must be greater than 0");
    }
    return await (0, examQuestion_repository_1.assignQuestionToExam)(examId, questionId, questionOrder);
}
async function getExamQuestions(examId) {
    if (!examId) {
        throw new Error("Exam ID is required");
    }
    return await (0, examQuestion_repository_1.getQuestionsByExamId)(examId);
}
async function getCandidateExamQuestions(examId) {
    if (!examId) {
        throw new Error("Exam ID is required");
    }
    return await (0, examQuestion_repository_1.getExamQuestionsForCandidate)(examId);
}
async function removeQuestion(examId, questionId) {
    if (!examId) {
        throw new Error("Exam ID is required");
    }
    if (!questionId) {
        throw new Error("Question ID is required");
    }
    const removed = await (0, examQuestion_repository_1.removeQuestionFromExam)(examId, questionId);
    if (!removed) {
        throw new Error("Question is not assigned to this exam");
    }
    return {
        success: true,
        examId,
        questionId,
    };
}
async function removeAllQuestions(examId) {
    if (!examId) {
        throw new Error("Exam ID is required");
    }
    const count = await (0, examQuestion_repository_1.removeAllQuestionsFromExam)(examId);
    return {
        success: true,
        examId,
        removedCount: count,
    };
}
async function reorderQuestion(examId, questionId, questionOrder) {
    if (!examId) {
        throw new Error("Exam ID is required");
    }
    if (!questionId) {
        throw new Error("Question ID is required");
    }
    if (!questionOrder || questionOrder < 1) {
        throw new Error("Invalid question order");
    }
    const result = await (0, examQuestion_repository_1.updateQuestionOrder)(examId, questionId, questionOrder);
    if (!result) {
        throw new Error("Question is not assigned to this exam");
    }
    return result;
}
async function getQuestionCount(examId) {
    if (!examId) {
        throw new Error("Exam ID is required");
    }
    return await (0, examQuestion_repository_1.countExamQuestions)(examId);
}
