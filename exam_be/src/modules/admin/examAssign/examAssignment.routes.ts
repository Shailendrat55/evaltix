import { Router } from "express";

import {
  createAssignment,
  getAssignment,
  getCandidateAssignments,
  getExamAssignments,
  updateAssignmentStatus,
  deleteAssignment,
  getAllAssignments,
  updateAssignment,
} from "./examAssignment.controller";

const router = Router();

/**
 * Create assignment
 */
router.post(
  "/",
  createAssignment
);

router.get(
  "/",
  getAllAssignments
);

router.get(
  "/candidate/:candidateId",
  getCandidateAssignments
);

router.get(
  "/exam/:examId",
  getExamAssignments
);

router.get(
  "/:id",
  getAssignment
);

router.put(
  "/:id",
  updateAssignment
);

router.patch(
  "/:id/status",
  updateAssignmentStatus
);

router.delete(
  "/:id",
  deleteAssignment
);

export default router;