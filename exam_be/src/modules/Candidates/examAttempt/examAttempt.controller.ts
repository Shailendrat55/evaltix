import { Request, Response } from "express";
import * as attemptService from "./examAttempt.service";

export async function getAttempt(
  req: Request,
  res: Response
) {
  try {
    const { attemptId } = req.params;

    // Change this according to your auth middleware
    const candidateId = req.user?.sub;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await attemptService.getAttempt(
      attemptId,
      candidateId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Get attempt error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Unable to get attempt",
    });
  }
}

export async function saveAnswerController(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const candidateId = req.user.sub;
    const attemptId = req.params.attemptId;

    const {
      attemptQuestionId,
      questionId,
      answerText,
      selectedOptionId,
      codeAnswer,
      language,
    } = req.body;

    if (!attemptQuestionId || !questionId) {
      return res.status(400).json({
        success: false,
        message:
          "attemptQuestionId and questionId are required",
      });
    }

    const answer =
      await attemptService.saveAnswer(candidateId, {
        attemptId,
        attemptQuestionId,
        questionId,
        answerText,
        selectedOptionId,
        codeAnswer,
        language,
      });

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      data: answer,
    });
  } catch (error: any) {
    console.error("Save answer error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function submitAttemptController(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const candidateId = req.user.sub;
    const attemptId = req.params.attemptId;

    const result =
      await attemptService.submitAttempt(
        attemptId,
        candidateId
      );

    return res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Submit attempt error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}