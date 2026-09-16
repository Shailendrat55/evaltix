"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignment = createAssignment;
exports.getAssignment = getAssignment;
exports.getCandidateAssignments = getCandidateAssignments;
exports.getExamAssignments = getExamAssignments;
exports.updateAssignment = updateAssignment;
exports.updateAssignmentStatus = updateAssignmentStatus;
exports.deleteAssignment = deleteAssignment;
exports.getAllAssignments = getAllAssignments;
const assignmentService = __importStar(require("./examAssignment.service"));
/**
 * POST /exam-assignments
 */
async function createAssignment(req, res) {
    try {
        const { candidateId, examId, } = req.body;
        if (!candidateId || examId === undefined) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "candidateId and examId are required",
            });
        }
        const parsedExamId = Number(examId);
        if (!Number.isInteger(parsedExamId)) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "examId must be an integer",
            });
        }
        const assignment = await assignmentService.createAssignment({
            candidateId,
            examId: parsedExamId,
        });
        return res.status(201).json({
            message: "Exam assigned to candidate successfully",
            assignment,
        });
    }
    catch (error) {
        console.error("Create exam assignment error:", error);
        if (error.message === "Candidate not found") {
            return res.status(404).json({
                error: "CANDIDATE_NOT_FOUND",
                message: error.message,
            });
        }
        if (error.message === "User is not a candidate") {
            return res.status(400).json({
                error: "INVALID_CANDIDATE",
                message: error.message,
            });
        }
        if (error.message === "Candidate is inactive") {
            return res.status(400).json({
                error: "CANDIDATE_INACTIVE",
                message: error.message,
            });
        }
        if (error.message === "Exam not found") {
            return res.status(404).json({
                error: "EXAM_NOT_FOUND",
                message: error.message,
            });
        }
        if (error.message ===
            "Candidate is already assigned to this exam") {
            return res.status(409).json({
                error: "ALREADY_ASSIGNED",
                message: error.message,
            });
        }
        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Unable to assign exam",
        });
    }
}
/**
 * GET /exam-assignments/:id
 */
async function getAssignment(req, res) {
    try {
        const { id } = req.params;
        const assignment = await assignmentService.getAssignment(id);
        return res.status(200).json({
            assignment,
        });
    }
    catch (error) {
        if (error.message === "Assignment not found") {
            return res.status(404).json({
                error: "ASSIGNMENT_NOT_FOUND",
                message: error.message,
            });
        }
        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Unable to get assignment",
        });
    }
}
/**
 * GET /exam-assignments/candidate/:candidateId
 */
async function getCandidateAssignments(req, res) {
    try {
        const { candidateId } = req.params;
        const assignments = await assignmentService.getCandidateAssignments(candidateId);
        return res.status(200).json({
            assignments,
        });
    }
    catch (error) {
        console.error("Get candidate assignments error:", error);
        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Unable to get candidate assignments",
        });
    }
}
/**
 * GET /exam-assignments/exam/:examId
 */
async function getExamAssignments(req, res) {
    try {
        const examId = Number(req.params.examId);
        if (!Number.isInteger(examId)) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "examId must be an integer",
            });
        }
        const assignments = await assignmentService.getExamAssignments(examId);
        return res.status(200).json({
            assignments,
        });
    }
    catch (error) {
        console.error("Get exam assignments error:", error);
        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Unable to get exam assignments",
        });
    }
}
async function updateAssignment(req, res) {
    try {
        const { id } = req.params;
        const { user_id, email, exam_id, } = req.body;
        const result = await assignmentService.updateAssignment(id, {
            user_id,
            email,
            exam_id,
        });
        if (!result.success) {
            if (result.message === "Assignment ID is required" ||
                result.message === "User ID is required" ||
                result.message === "Email is required" ||
                result.message === "Exam ID is required") {
                return res.status(400).json(result);
            }
            if (result.message === "Candidate not found" ||
                result.message ===
                    "Assignment not found or does not belong to this candidate") {
                return res.status(404).json(result);
            }
            return res.status(500).json(result);
        }
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Error in updateAssignment controller:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
/**
 * PATCH /exam-assignments/:id/status
 */
async function updateAssignmentStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = [
            "ASSIGNED",
            "IN_PROGRESS",
            "COMPLETED",
            "EXPIRED",
            "CANCELLED",
        ];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Invalid assignment status",
            });
        }
        const assignment = await assignmentService.updateAssignmentStatus(id, status);
        return res.status(200).json({
            message: "Assignment status updated",
            assignment,
        });
    }
    catch (error) {
        if (error.message === "Assignment not found") {
            return res.status(404).json({
                error: "ASSIGNMENT_NOT_FOUND",
                message: error.message,
            });
        }
        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Unable to update assignment",
        });
    }
}
/**
 * DELETE /exam-assignments/:id
 */
async function deleteAssignment(req, res) {
    try {
        const { id } = req.params;
        await assignmentService.deleteAssignment(id);
        return res.status(200).json({
            message: "Exam assignment removed successfully",
        });
    }
    catch (error) {
        if (error.message === "Assignment not found") {
            return res.status(404).json({
                error: "ASSIGNMENT_NOT_FOUND",
                message: error.message,
            });
        }
        return res.status(400).json({
            error: "ASSIGNMENT_DELETE_ERROR",
            message: error.message,
        });
    }
}
async function getAllAssignments(req, res) {
    try {
        const assignments = await assignmentService.getAllAssignments();
        return res.status(200).json({
            assignments,
        });
    }
    catch (error) {
        console.error("Get all assignments error:", error);
        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Unable to get assignments",
        });
    }
}
