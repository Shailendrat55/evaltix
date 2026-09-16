import {
  assignQuestionToExam,
  assignQuestionsToExam,
  getQuestionsByExamId,
  getExamQuestionsForCandidate,
  removeQuestionFromExam,
  removeAllQuestionsFromExam,
  updateQuestionOrder,
  countExamQuestions,
} from "./examQuestion.repository";
import pool from "../../../config";

export interface AssignQuestionsParams {
  examId: number;
  questionIds: string[];
}

export async function assignQuestions(
  params: AssignQuestionsParams
) {
  const { examId, questionIds } = params;

  if (!examId) {
    throw new Error("Exam ID is required");
  }

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new Error("At least one question is required");
  }
  

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await assignQuestionsToExam(
      client,
      examId,
      questionIds
    );

    await client.query("COMMIT");

    return {
      examId,
      questions: result,
      count: result.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function assignSingleQuestion(
  examId: number,
  questionId: string,
  questionOrder: number
) {
  if (!examId) {
    throw new Error("Exam ID is required");
  }

  if (!questionId) {
    throw new Error("Question ID is required");
  }

  if (!questionOrder || questionOrder < 1) {
    throw new Error("Question order must be greater than 0");
  }

  return await assignQuestionToExam(
    examId,
    questionId,
    questionOrder
  );
}

export async function getExamQuestions(
  examId: number
) {
  if (!examId) {
    throw new Error("Exam ID is required");
  }

  return await getQuestionsByExamId(examId);
}

export async function getCandidateExamQuestions(
  examId: number
) {
  if (!examId) {
    throw new Error("Exam ID is required");
  }

  return await getExamQuestionsForCandidate(examId);
}

export async function removeQuestion(
  examId: number,
  questionId: string
) {
  if (!examId) {
    throw new Error("Exam ID is required");
  }

  if (!questionId) {
    throw new Error("Question ID is required");
  }

  const removed = await removeQuestionFromExam(
    examId,
    questionId
  );

  if (!removed) {
    throw new Error(
      "Question is not assigned to this exam"
    );
  }

  return {
    success: true,
    examId,
    questionId,
  };
}

export async function removeAllQuestions(
  examId: number
) {
  if (!examId) {
    throw new Error("Exam ID is required");
  }

  const count = await removeAllQuestionsFromExam(examId);

  return {
    success: true,
    examId,
    removedCount: count,
  };
}

export async function reorderQuestion(
  examId: number,
  questionId: string,
  questionOrder: number
) {
  if (!examId) {
    throw new Error("Exam ID is required");
  }

  if (!questionId) {
    throw new Error("Question ID is required");
  }

  if (!questionOrder || questionOrder < 1) {
    throw new Error("Invalid question order");
  }

  const result = await updateQuestionOrder(
    examId,
    questionId,
    questionOrder
  );

  if (!result) {
    throw new Error(
      "Question is not assigned to this exam"
    );
  }

  return result;
}

export async function getQuestionCount(
  examId: number
) {
  if (!examId) {
    throw new Error("Exam ID is required");
  }

  return await countExamQuestions(examId);
}