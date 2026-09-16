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
const db_1 = require("../../../config/db");
const assignmentRepository = __importStar(require("./examAssignment.repository"));
/**
 * Create assignment
 */
async function createAssignment(params) {
    // Check candidate
    const candidateResult = await db_1.pool.query(`
    SELECT
      id,
      role,
      is_active
    FROM users
    WHERE id = $1
    `, [params.candidateId]);
    const candidate = candidateResult.rows[0];
    if (!candidate) {
        throw new Error("Candidate not found");
    }
    if (candidate.role !== "CANDIDATE") {
        throw new Error("User is not a candidate");
    }
    if (!candidate.is_active) {
        throw new Error("Candidate is inactive");
    }
    // Check exam
    const examResult = await db_1.pool.query(`
    SELECT id
    FROM exams
    WHERE id = $1
    `, [params.examId]);
    const exam = examResult.rows[0];
    if (!exam) {
        throw new Error("Exam not found");
    }
    // Check duplicate assignment
    const existing = await assignmentRepository.findAssignment(params.candidateId, params.examId);
    if (existing) {
        throw new Error("Candidate is already assigned to this exam");
    }
    // Create assignment
    return assignmentRepository.createAssignment(params);
}
/**
 * Get assignment
 */
async function getAssignment(id) {
    const assignment = await assignmentRepository.findAssignmentById(id);
    if (!assignment) {
        throw new Error("Assignment not found");
    }
    return assignment;
}
/**
 * Get candidate assignments
 */
async function getCandidateAssignments(candidateId) {
    return assignmentRepository.listCandidateAssignments(candidateId);
}
/**
 * Get exam assignments
 */
async function getExamAssignments(examId) {
    return assignmentRepository.listExamAssignments(examId);
}
async function updateAssignment(id, data) {
    try {
        if (!id) {
            return {
                success: false,
                message: "Assignment ID is required",
            };
        }
        if (!data.user_id) {
            return {
                success: false,
                message: "User ID is required",
            };
        }
        if (!data.email) {
            return {
                success: false,
                message: "Email is required",
            };
        }
        if (!data.exam_id) {
            return {
                success: false,
                message: "Exam ID is required",
            };
        }
        return await assignmentRepository.updateAssignment(id, data);
    }
    catch (error) {
        console.error("Error in updateAssignment service:", error);
        return {
            success: false,
            message: "Internal Server Error",
        };
    }
}
/**
 * Update assignment status
 */
async function updateAssignmentStatus(id, status) {
    const assignment = await assignmentRepository.findAssignmentById(id);
    if (!assignment) {
        throw new Error("Assignment not found");
    }
    return assignmentRepository.updateAssignmentStatus(id, status);
}
/**
 * Delete assignment
 */
async function deleteAssignment(id) {
    const assignment = await assignmentRepository.findAssignmentById(id);
    if (!assignment) {
        throw new Error("Assignment not found");
    }
    // Don't allow deleting an active exam session
    if (assignment.status === "IN_PROGRESS" ||
        assignment.status === "COMPLETED") {
        throw new Error("Cannot delete an assignment that has started or completed");
    }
    return assignmentRepository.deleteAssignment(id);
}
async function getAllAssignments() {
    return assignmentRepository.getallCandidates();
}
