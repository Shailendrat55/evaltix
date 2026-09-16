import pool from "../../config";
import {
  getCandidateAssignedExams,
} from "./candidate.repository";

import * as assignmentRepository
  from "../../modules/admin/examAssign/examAssignment.repository";

import * as attemptRepository
  from "./examAttempt/examAttempt.repository";

export async function getMyAssignedExams(
  candidateId: string
) {
  if (!candidateId) {
    throw new Error("Candidate ID is required");
  }

  return getCandidateAssignedExams(candidateId);
}

export async function startExam(
  assignmentId: string,
  candidateId: string
) {
  // 1. Find assignment
  const assignment =
    await assignmentRepository.findAssignmentById(
      assignmentId
    );

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // 2. Security check
  if (assignment.candidateId !== candidateId) {
    throw new Error("Unauthorized");
  }

  // 3. Get exam
  const examResult = await pool.query(
    `
    SELECT
      id,
      title,
      description,
      duration,
      total_questions,
      passing_percentage,
      difficulty,
      shuffle_questions,
      negative_marking,
      status,
      start_time
    FROM exams
    WHERE id = $1
    `,
    [assignment.examId]
  );

  const exam = examResult.rows[0];

  if (!exam) {
    throw new Error("Exam not found");
  }

  // 4. Exam must be published
  if (
    exam.status.toLowerCase() !== "published"
  ) {
    throw new Error("Exam is not published");
  }

  // 5. Check scheduled start
  if (
    exam.start_time &&
    new Date() < new Date(exam.start_time)
  ) {
    throw new Error("Exam has not started yet");
  }

  // ==========================================
  // RESUME EXISTING ATTEMPT
  // ==========================================

  if (assignment.status === "IN_PROGRESS") {
    const existingAttempt =
      await attemptRepository
        .findActiveAttemptByAssignmentId(
          assignmentId
        );

    if (!existingAttempt) {
      throw new Error(
        "Exam is in progress but active attempt was not found"
      );
    }

    // Check expiry
    if (
      existingAttempt.expiresAt &&
      new Date() >=
        new Date(existingAttempt.expiresAt)
    ) {
      throw new Error(
        "Exam time has expired"
      );
    }

    return {
      attempt: existingAttempt,

      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalQuestions:
          exam.total_questions,
        passingPercentage:
          exam.passing_percentage,
        difficulty: exam.difficulty,
        shuffleQuestions:
          exam.shuffle_questions,
        negativeMarking:
          exam.negative_marking,
      },

      totalQuestions:
        existingAttempt.totalQuestions,

      startedAt:
        existingAttempt.startedAt,

      expiresAt:
        existingAttempt.expiresAt,
    };
  }

  // ==========================================
  // FIRST START
  // ==========================================

  if (assignment.status !== "ASSIGNED") {
    throw new Error(
      `Exam cannot be started. Current status: ${assignment.status}`
    );
  }

  const startedAt = new Date();

  const expiresAt = new Date(
    startedAt.getTime() +
      Number(exam.duration) * 60 * 1000
  );

  // 6. Create attempt + attempt questions
  const result =
    await attemptRepository.createAttemptWithQuestions({
      assignmentId,
      candidateId,
      examId: assignment.examId,
      startedAt,
      expiresAt,
      shuffle:
        exam.shuffle_questions,
    });

  // 7. Change assignment status
  const started =
    await assignmentRepository.startAssignment(
      assignmentId,
      candidateId,
      expiresAt
    );

  if (!started) {
    throw new Error(
      "Unable to start exam. It may already be started."
    );
  }

  // 8. Return attempt
  return {
    attempt: result.attempt,

    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      totalQuestions:
        exam.total_questions,
      passingPercentage:
        exam.passing_percentage,
      difficulty: exam.difficulty,
      shuffleQuestions:
        exam.shuffle_questions,
      negativeMarking:
        exam.negative_marking,
    },

    totalQuestions:
      result.totalQuestions,

    startedAt,
    expiresAt,
  };
}