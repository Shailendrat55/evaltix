import { Request, Response } from "express";
import { getMyAssignedExams, startExam } from "./candidate.service";

export const getMyAssignedExamsController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const candidateId = req.user.sub;

    const exams = await getMyAssignedExams(candidateId);

    return res.status(200).json({
      success: true,
      data: exams,
    });
  } catch (error: any) {
    console.error("Get candidate exams error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get assigned exams",
    });
  }
};

export const startExamController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const candidateId = req.user.sub;
    const { assignmentId } = req.params;

    const result = await startExam(assignmentId, candidateId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Start exam error:", error);

    // Distinguish client errors (bad state/ownership) from real server errors
    const clientErrors = [
      "Assignment not found",
      "Unauthorized",
      "Exam not found",
      "Exam is not published",
      "Exam has not started yet",
      "Unable to start exam. It may already be started.",
    ];
    

    const isClientError =
      clientErrors.includes(error.message) ||
      error.message?.startsWith("Exam cannot be started");

    return res.status(isClientError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to start exam",
    });
  }
};