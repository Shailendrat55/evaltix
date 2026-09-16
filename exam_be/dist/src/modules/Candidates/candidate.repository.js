"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateAssignedExams = getCandidateAssignedExams;
const config_1 = __importDefault(require("../../config"));
async function getCandidateAssignedExams(candidateId) {
    const { rows } = await config_1.default.query(`
    SELECT
      ea.id AS assignment_id,
      ea.candidate_id,
      ea.exam_id,
      ea.status AS assignment_status,
      ea.assigned_at,

      e.title,
      e.description,
      e.duration,
      e.total_questions,
      e.passing_percentage,
      e.difficulty,
      e.shuffle_questions,
      e.negative_marking,
      e.status AS exam_status,
      e.start_time

    FROM exam_assignments ea

    INNER JOIN exams e
      ON e.id = ea.exam_id

    WHERE ea.candidate_id = $1

    ORDER BY e.start_time ASC
    `, [candidateId]);
    return rows;
}
