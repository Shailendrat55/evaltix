import { Router } from "express";
import {
  getAttempt,
  saveAnswerController,
} from "./examAttempt.controller";

const router = Router();

router.get(
  "/:attemptId",
  getAttempt
);

router.post(
  "/attempts/:attemptId/answers",
  saveAnswerController
);

router.post(
  "/attempts/:attemptId/submit",
  saveAnswerController
);

export default router;