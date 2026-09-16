import { Request, Response, NextFunction } from "express";

import {
  assignQuestions,
  assignSingleQuestion,
  getExamQuestions,
  getCandidateExamQuestions,
  removeQuestion,
  removeAllQuestions,
  reorderQuestion,
  getQuestionCount,
} from "./examQuestion.service";

/**
 * POST /admin/exams/:examId/questions
 */
export async function assignQuestionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const examId = Number(req.params.examId);

    const { questionIds } = req.body;

    const result = await assignQuestions({
      examId,
      questionIds,
    });

    return res.status(201).json({
      success: true,
      message: "Questions assigned to exam successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * POST /admin/exams/:examId/questions/single
 */
export async function assignSingleQuestionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const examId = Number(req.params.examId);

    const {
      questionId,
      questionOrder,
    } = req.body;

    const result = await assignSingleQuestion(
      examId,
      questionId,
      questionOrder
    );

    return res.status(201).json({
      success: true,
      message: "Question assigned successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * GET /admin/exams/:examId/questions
 */
export async function getExamQuestionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const examId = Number(req.params.examId);

    const questions = await getExamQuestions(examId);

    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * GET /exams/:examId/questions
 *
 * Used by candidate exam page.
 */
export async function getCandidateExamQuestionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const examId = Number(req.params.examId);

    const questions =
      await getCandidateExamQuestions(examId);

    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * DELETE /admin/exams/:examId/questions/:questionId
 */
export async function removeQuestionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const examId = Number(req.params.examId);

    const { questionId } = req.params;

    const result = await removeQuestion(
      examId,
      questionId
    );

    return res.status(200).json({
      success: true,
      message: "Question removed from exam successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * DELETE /admin/exams/:examId/questions
 */
export async function removeAllQuestionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const examId = Number(req.params.examId);

    const result = await removeAllQuestions(examId);

    return res.status(200).json({
      success: true,
      message: "All questions removed from exam",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * PATCH /admin/exams/:examId/questions/:questionId/order
 */
export async function reorderQuestionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const examId = Number(req.params.examId);

    const { questionId } = req.params;
    const { questionOrder } = req.body;

    const result = await reorderQuestion(
      examId,
      questionId,
      questionOrder
    );

    return res.status(200).json({
      success: true,
      message: "Question order updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * GET /admin/exams/:examId/questions/count
 */
export async function getQuestionCountController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const examId = Number(req.params.examId);

    const count = await getQuestionCount(examId);

    return res.status(200).json({
      success: true,
      data: {
        examId,
        count,
      },
    });
  } catch (error) {
    next(error);
  }
}