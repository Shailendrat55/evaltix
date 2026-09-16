import { Router } from "express";

import {
  assignQuestionsController,
  assignSingleQuestionController,
  getExamQuestionsController,
  getCandidateExamQuestionsController,
  removeQuestionController,
  removeAllQuestionsController,
  reorderQuestionController,
  getQuestionCountController,
} from "./examQuestion.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Assign multiple questions
router.post(
  "/admin/exams/:examId/questions",
  assignQuestionsController
);

// Assign one question
router.post(
  "/admin/exams/:examId/questions/single",
  assignSingleQuestionController
);

// Get questions assigned to exam
router.get(
  "/admin/exams/:examId/questions",
  getExamQuestionsController
);

// Count questions
router.get(
  "/admin/exams/:examId/questions/count",
  getQuestionCountController
);

// Remove one question
router.delete(
  "/admin/exams/:examId/questions/:questionId",
  removeQuestionController
);

// Remove all questions
router.delete(
  "/admin/exams/:examId/questions",
  removeAllQuestionsController
);

// Change question order
router.patch(
  "/admin/exams/:examId/questions/:questionId/order",
  reorderQuestionController
);


/*
|--------------------------------------------------------------------------
| Candidate Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/exams/:examId/questions",
  getCandidateExamQuestionsController
);

export default router;