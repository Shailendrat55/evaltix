"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = exports.getQuestionById = exports.getQuestions = exports.createDescriptive = exports.createCoding = exports.createMCQ = void 0;
const question_service_1 = __importDefault(require("./question.service"));
// =====================================
// Create MCQ
// =====================================
const createMCQ = async (req, res) => {
    try {
        const question = await question_service_1.default.createMCQ(req.body);
        return res.status(201).json({
            success: true,
            message: "MCQ created successfully",
            data: question,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createMCQ = createMCQ;
// =====================================
// Create Coding Question
// =====================================
const createCoding = async (req, res) => {
    try {
        const question = await question_service_1.default.createCoding(req.body);
        return res.status(201).json({
            success: true,
            message: "Coding question created successfully",
            data: question,
        });
    }
    catch (error) {
        console.log("Error creating coding question:", error);
        return res.status(500).json({
            success: false,
            message: error,
        });
    }
};
exports.createCoding = createCoding;
// =====================================
// Create Descriptive Question
// =====================================
const createDescriptive = async (req, res) => {
    try {
        const question = await question_service_1.default.createDescriptive(req.body);
        return res.status(201).json({
            success: true,
            message: "Descriptive question created successfully",
            data: question,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createDescriptive = createDescriptive;
// =====================================
// Get All Questions
// =====================================
const getQuestions = async (req, res) => {
    try {
        const questions = await question_service_1.default.getAllQuestions();
        return res.status(200).json({
            success: true,
            data: questions
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getQuestions = getQuestions;
// =====================================
// Get Question By ID
// =====================================
const getQuestionById = async (req, res) => {
    try {
        const question = await question_service_1.default.getQuestionById(req.params.id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: question
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getQuestionById = getQuestionById;
// =====================================
// Update Question
// =====================================
const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedQuestion = await question_service_1.default.updateQuestion(id, req.body);
        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            data: updatedQuestion,
        });
    }
    catch (error) {
        console.error("Update question error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update question",
        });
    }
};
exports.updateQuestion = updateQuestion;
// =====================================
// Delete Question
// =====================================
const deleteQuestion = async (req, res) => {
    try {
        await question_service_1.default.deleteQuestion(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.deleteQuestion = deleteQuestion;
