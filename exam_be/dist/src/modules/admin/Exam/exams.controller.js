"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExamByIdController = exports.deleteExamByIdController = exports.getExamByIdController = exports.getAllExamsController = exports.createExamController = void 0;
const exams_service_1 = require("./exams.service");
const createExamController = async (req, res, next) => {
    try {
        const data = req.body;
        const createdBy = req.user?.email;
        const result = await (0, exams_service_1.createExamService)(data, createdBy);
        return res.status(201).json({
            success: true,
            message: "Exam created successfully",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createExamController = createExamController;
const getAllExamsController = async (req, res) => {
    try {
        const exams = await (0, exams_service_1.getAllExamsService)();
        res.json({
            success: true,
            data: exams
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getAllExamsController = getAllExamsController;
const getExamByIdController = async (req, res) => {
    const { id } = req.params;
    try {
        const exam = await (0, exams_service_1.getExamByIdService)(id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }
        res.json({
            success: true,
            data: exam
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getExamByIdController = getExamByIdController;
const deleteExamByIdController = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, exams_service_1.deleteExamByIdService)(id);
        res.json({
            success: true,
            message: "Exam deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.deleteExamByIdController = deleteExamByIdController;
const updateExamByIdController = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const updatedExam = await (0, exams_service_1.updateExamByIdService)(id, data);
        if (!updatedExam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }
        res.json({
            success: true,
            message: "Exam updated successfully",
            data: updatedExam
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.updateExamByIdController = updateExamByIdController;
