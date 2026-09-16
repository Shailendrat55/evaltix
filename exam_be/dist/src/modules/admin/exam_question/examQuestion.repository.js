"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignQuestionToExam = assignQuestionToExam;
exports.assignQuestionsToExam = assignQuestionsToExam;
exports.getQuestionsByExamId = getQuestionsByExamId;
exports.getExamQuestionsForCandidate = getExamQuestionsForCandidate;
exports.removeQuestionFromExam = removeQuestionFromExam;
exports.removeAllQuestionsFromExam = removeAllQuestionsFromExam;
exports.updateQuestionOrder = updateQuestionOrder;
exports.isQuestionAssignedToExam = isQuestionAssignedToExam;
exports.deleteExamQuestions = deleteExamQuestions;
exports.countExamQuestions = countExamQuestions;
const db_1 = require("../../../config/db");
/**
 * Assign one question to an exam
 */
async function assignQuestionToExam(examId, questionId, questionOrder) {
    const { rows } = await db_1.pool.query(`
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
    `, [examId, questionId, questionOrder]);
    return rows[0];
}
/**
 * Assign multiple questions to an exam
 */
async function assignQuestionsToExam(client, examId, questionIds) {
    const assignedQuestions = [];
    for (let i = 0; i < questionIds.length; i++) {
        const { rows } = await client.query(`
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
      `, [
            examId,
            questionIds[i],
            i + 1
        ]);
        assignedQuestions.push(rows[0]);
    }
    return assignedQuestions;
}
/**
 * Get questions assigned to an exam
 *
 * This returns the questions in admin/default order.
 */
async function getQuestionsByExamId(examId) {
    const { rows } = await db_1.pool.query(`
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
    `, [examId]);
    return rows;
}
/**
 * Get questions for candidate
 *
 * If shuffle = true, questions are returned randomly.
 * If shuffle = false, questions are returned in question_order.
 */
async function getExamQuestionsForCandidate(examId) {
    const { rows } = await db_1.pool.query(`
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
    `, [examId]);
    return rows;
}
/**
 * Remove one question from an exam
 */
async function removeQuestionFromExam(examId, questionId) {
    const { rowCount } = await db_1.pool.query(`
    DELETE FROM exam_questions
    WHERE exam_id = $1
      AND question_id = $2
    `, [examId, questionId]);
    return (rowCount ?? 0) > 0;
}
/**
 * Remove all questions from an exam
 */
async function removeAllQuestionsFromExam(examId) {
    const { rowCount } = await db_1.pool.query(`
    DELETE FROM exam_questions
    WHERE exam_id = $1
    `, [examId]);
    return rowCount ?? 0;
}
/**
 * Update the question order
 */
async function updateQuestionOrder(examId, questionId, questionOrder) {
    const { rows } = await db_1.pool.query(`
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
    `, [examId, questionId, questionOrder]);
    return rows[0] ?? null;
}
/**
 * Check whether a question is already assigned
 */
async function isQuestionAssignedToExam(examId, questionId) {
    const { rows } = await db_1.pool.query(`
    SELECT 1
    FROM exam_questions
    WHERE exam_id = $1
      AND question_id = $2
    LIMIT 1
    `, [examId, questionId]);
    return rows.length > 0;
}
async function deleteExamQuestions(client, examId) {
    await client.query(`
    DELETE FROM exam_questions
    WHERE exam_id = $1
    `, [examId]);
}
/**
 * Count questions assigned to an exam
 */
async function countExamQuestions(examId) {
    const { rows } = await db_1.pool.query(`
    SELECT COUNT(*)::int AS count
    FROM exam_questions
    WHERE exam_id = $1
    `, [examId]);
    return rows[0].count;
}
