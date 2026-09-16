"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const examAssignment_controller_1 = require("./examAssignment.controller");
const router = (0, express_1.Router)();
/**
 * Create assignment
 */
router.post("/", examAssignment_controller_1.createAssignment);
router.get("/", examAssignment_controller_1.getAllAssignments);
router.get("/candidate/:candidateId", examAssignment_controller_1.getCandidateAssignments);
router.get("/exam/:examId", examAssignment_controller_1.getExamAssignments);
router.get("/:id", examAssignment_controller_1.getAssignment);
router.put("/:id", examAssignment_controller_1.updateAssignment);
router.patch("/:id/status", examAssignment_controller_1.updateAssignmentStatus);
router.delete("/:id", examAssignment_controller_1.deleteAssignment);
exports.default = router;
