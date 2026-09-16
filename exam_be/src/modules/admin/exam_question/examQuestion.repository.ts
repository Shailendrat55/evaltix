import { PoolClient } from "pg";
import { pool } from "../../../config/db";

export interface ExamQuestion {
  id: string;
  exam_id: number;
  question_id: string;
  question_order: number;
  created_at: Date;
}

export interface ExamQuestionWithDetails extends ExamQuestion {
  title: string;
  description: string;
  type: string;
  difficulty: string;
  marks: number;
  negative_marks: string;
  status: string;
  category: string;
}

/**
 * Assign one question to an exam
 */
export async function assignQuestionToExam(
  examId: number,
  questionId: string,
  questionOrder: number
): Promise<ExamQuestion> {
  const { rows } = await pool.query<ExamQuestion>(
    `
    INSERT INTO exam_questions (
      exam_id,
      question_id,
      question_order
    )
    VALUES ($1, $2, $3)

    ON CONFLICT (exam_id, question_id)
    DO UPDATE SET
      question_order = EXCLUDED.question_order

    RETURNING
      id,
      exam_id,
      question_id,
      question_order,
      created_at
    `,
    [examId, questionId, questionOrder]
  );

  return rows[0];
}


/**
 * Assign multiple questions to an exam
 */
export async function assignQuestionsToExam(
  client: PoolClient,
  examId: number,
  questionIds: string[]
): Promise<ExamQuestion[]> {
  const assignedQuestions: ExamQuestion[] = [];

  for (let i = 0; i < questionIds.length; i++) {
    const { rows } = await client.query<ExamQuestion>(
      `
      INSERT INTO exam_questions (
        exam_id,
        question_id,
        question_order
      )
      VALUES ($1, $2, $3)

      ON CONFLICT (exam_id, question_id)
      DO UPDATE SET
        question_order = EXCLUDED.question_order

      RETURNING
        id,
        exam_id,
        question_id,
        question_order,
        created_at
      `,
      [
        examId,
        questionIds[i],
        i + 1
      ]
    );

    assignedQuestions.push(rows[0]);
  }

  return assignedQuestions;
}


/**
 * Get questions assigned to an exam
 *
 * This returns the questions in admin/default order.
 */
export async function getQuestionsByExamId(
  examId: number
): Promise<ExamQuestionWithDetails[]> {
  const { rows } = await pool.query<ExamQuestionWithDetails>(
    `
    SELECT
      eq.id,
      eq.exam_id,
      eq.question_id,
      eq.question_order,
      eq.created_at,

      q.title,
      q.description,
      q.type,
      q.difficulty,
      q.marks,
      q.negative_marks,
      q.status,
      q.category

    FROM exam_questions eq

    INNER JOIN questions q
      ON q.id = eq.question_id

    WHERE eq.exam_id = $1

    ORDER BY eq.question_order ASC
    `,
    [examId]
  );

  return rows;
}


/**
 * Get questions for candidate
 *
 * If shuffle = true, questions are returned randomly.
 * If shuffle = false, questions are returned in question_order.
 */
export async function getExamQuestionsForCandidate(
  examId: number
): Promise<ExamQuestionWithDetails[]> {
  const { rows } = await pool.query<ExamQuestionWithDetails>(
    `
    SELECT
      eq.id,
      eq.exam_id,
      eq.question_id,
      eq.question_order,
      eq.created_at,

      q.title,
      q.description,
      q.type,
      q.difficulty,
      q.marks,
      q.negative_marks,
      q.status,
      q.category,

      e.shuffle_questions,
      e.negative_marking

    FROM exam_questions eq

    INNER JOIN questions q
      ON q.id = eq.question_id

    INNER JOIN exams e
      ON e.id = eq.exam_id

    WHERE eq.exam_id = $1

    ORDER BY
      CASE
        WHEN e.shuffle_questions = false
        THEN eq.question_order
      END ASC,
      CASE
        WHEN e.shuffle_questions = true
        THEN RANDOM()
      END
    `,
    [examId]
  );

  return rows;
}


/**
 * Remove one question from an exam
 */
export async function removeQuestionFromExam(
  examId: number,
  questionId: string
): Promise<boolean> {
  const { rowCount } = await pool.query(
    `
    DELETE FROM exam_questions
    WHERE exam_id = $1
      AND question_id = $2
    `,
    [examId, questionId]
  );

  return (rowCount ?? 0) > 0;
}


/**
 * Remove all questions from an exam
 */
export async function removeAllQuestionsFromExam(
  examId: number
): Promise<number> {
  const { rowCount } = await pool.query(
    `
    DELETE FROM exam_questions
    WHERE exam_id = $1
    `,
    [examId]
  );

  return rowCount ?? 0;
}


/**
 * Update the question order
 */
export async function updateQuestionOrder(
  examId: number,
  questionId: string,
  questionOrder: number
): Promise<ExamQuestion | null> {
  const { rows } = await pool.query<ExamQuestion>(
    `
    UPDATE exam_questions
    SET question_order = $3
    WHERE exam_id = $1
      AND question_id = $2

    RETURNING
      id,
      exam_id,
      question_id,
      question_order,
      created_at
    `,
    [examId, questionId, questionOrder]
  );

  return rows[0] ?? null;
}


/**
 * Check whether a question is already assigned
 */
export async function isQuestionAssignedToExam(
  examId: number,
  questionId: string
): Promise<boolean> {
  const { rows } = await pool.query(
    `
    SELECT 1
    FROM exam_questions
    WHERE exam_id = $1
      AND question_id = $2
    LIMIT 1
    `,
    [examId, questionId]
  );

  return rows.length > 0;
}

export async function deleteExamQuestions(
  client: PoolClient,
  examId: number
): Promise<void> {
  await client.query(
    `
    DELETE FROM exam_questions
    WHERE exam_id = $1
    `,
    [examId]
  );
}

/**
 * Count questions assigned to an exam
 */
export async function countExamQuestions(
  examId: number
): Promise<number> {
  const { rows } = await pool.query<{ count: number }>(
    `
    SELECT COUNT(*)::int AS count
    FROM exam_questions
    WHERE exam_id = $1
    `,
    [examId]
  );

  return  rows[0].count;
}