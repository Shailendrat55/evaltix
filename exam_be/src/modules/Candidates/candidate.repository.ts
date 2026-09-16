import pool from "../../config";

export async function getCandidateAssignedExams(
  candidateId: string
) {
  const { rows } = await pool.query(
    `
    SELECT
      ea.id AS assignment_id,
      ea.candidate_id,
      ea.exam_id,
      ea.status AS assignment_status,
      ea.assigned_at,
      ea.started_at,

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
      AND LOWER(e.status) = 'published'

    ORDER BY e.start_time ASC
    `,
    [candidateId]
  );

  return rows;
}