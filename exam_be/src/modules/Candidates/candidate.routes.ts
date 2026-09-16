import { Router } from "express";
import {
  getMyAssignedExamsController,
  startExamController,
} from "./candidate.controller";

import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/requireRole";

const router = Router();

router.get(
  "/exams",
  authenticate,
  requireRole("CANDIDATE"),
  getMyAssignedExamsController
);

router.post(
  "/exams/:assignmentId/start",
  authenticate,
  requireRole("CANDIDATE"),
  startExamController
);

export default router;