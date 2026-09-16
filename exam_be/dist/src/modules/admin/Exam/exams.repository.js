"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExamById = exports.deleteExamById = exports.getExamById = exports.getAllExamsRepository = exports.createExamRepository = void 0;
const db_1 = require("../../../config/db");
const createExamRepository = async (client, data, createdBy) => {
    const query = `
    INSERT INTO exams
    (
      title,
      description,
      duration,
      total_questions,
      passing_percentage,
      difficulty,
      shuffle_questions,
      negative_marking,
      status,
      created_by,
      start_time
    )
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *;
  `;
    const values = [
        data.title,
        data.description || null,
        data.duration,
        data.questions,
        data.passing,
        data.difficulty,
        data.shuffle,
        data.negative,
        data.status || "Draft",
        createdBy || null,
        data.examDate || null,
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
};
exports.createExamRepository = createExamRepository;
const getAllExamsRepository = async () => {
    const result = await db_1.pool.query(`SELECT * FROM exams
    ORDER BY created_at DESC `);
    return result.rows;
};
exports.getAllExamsRepository = getAllExamsRepository;
const getExamById = async (id) => {
    const result = await db_1.pool.query(`SELECT * FROM exams
    WHERE id = $1`, [id]);
    return result.rows[0];
};
exports.getExamById = getExamById;
const deleteExamById = async (id) => {
    await db_1.pool.query(`DELETE FROM exams
    WHERE id = $1`, [id]);
};
exports.deleteExamById = deleteExamById;
const updateExamById = async (client, id, data) => {
    const query = `
    UPDATE exams
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      duration = COALESCE($3, duration),
      total_questions = COALESCE($4, total_questions),
      passing_percentage = COALESCE($5, passing_percentage),
      difficulty = COALESCE($6, difficulty),
      shuffle_questions = COALESCE($7, shuffle_questions),
      negative_marking = COALESCE($8, negative_marking),
      status = COALESCE($9, status),
      start_time = COALESCE($10, start_time),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING *;
  `;
    const values = [
        data.title,
        data.description,
        data.duration,
        data.questions,
        data.passing,
        data.difficulty,
        data.shuffle,
        data.negative,
        data.status,
        data.examDate,
        id,
    ];
    const { rows } = await client.query(query, values);
    return rows[0] || null;
};
exports.updateExamById = updateExamById;
