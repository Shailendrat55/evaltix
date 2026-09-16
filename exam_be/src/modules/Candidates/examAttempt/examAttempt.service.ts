import * as attemptRepository from "./examAttempt.repository";

export async function getAttempt(
  attemptId: string,
  candidateId: string
) {
  if (!attemptId) {
    throw new Error("Attempt ID is required");
  }

  if (!candidateId) {
    throw new Error("Candidate ID is required");
  }

  // Find attempt
  const attempt =
    await attemptRepository.findAttemptById(
      attemptId
    );

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  // Security check
  if (attempt.candidateId !== candidateId) {
    throw new Error("Unauthorized");
  }

  // Check status
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error(
      `Attempt is ${attempt.status}`
    );
  }

  // Check expiry
  if (
    attempt.expiresAt &&
    new Date() >= new Date(attempt.expiresAt)
  ) {
    throw new Error("Exam time has expired");
  }

  // Get questions
  const questions =
    await attemptRepository.getAttemptQuestions(
      attemptId
    );

  return {
    attempt,
    questions,
  };
}

export async function saveAnswer(
  candidateId: string,
  params: {
    attemptId: string;
    attemptQuestionId: string;
    questionId: string;
    answerText?: string | null;
    selectedOptionId?: string | null;
    codeAnswer?: string | null;
    language?: string | null;
  }
) {
  const attempt =
    await attemptRepository.findAttemptById(
      params.attemptId
    );

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.candidateId !== candidateId) {
    throw new Error("Unauthorized");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt is not active");
  }

  // Server-side expiry check
  if (
    attempt.expiresAt &&
    new Date() >= new Date(attempt.expiresAt)
  ) {
    throw new Error("Exam time has expired");
  }

  return await attemptRepository.saveAnswer(params);
}

export async function submitAttempt(
  attemptId: string,
  candidateId: string
) {
  const attempt =
    await attemptRepository.findAttemptById(
      attemptId
    );

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  // Security check
  if (attempt.candidateId !== candidateId) {
    throw new Error("Unauthorized");
  }

  // Already submitted
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error(
      `Attempt is already ${attempt.status}`
    );
  }

  // Server-side expiry check
  if (
    attempt.expiresAt &&
    new Date() >= new Date(attempt.expiresAt)
  ) {
    throw new Error("Exam time has expired");
  }

  return await attemptRepository.submitAttempt(
    attemptId
  );
}