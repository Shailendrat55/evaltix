import { pool } from "../../../config/db";
import {
  CreateExamAssignmentParams,
  ExamAssignment,
  ExamAssignmentStatus,
} from "./examAssignment.types";

/**
 * Create exam assignment
 */
export async function createAssignment(
  params: CreateExamAssignmentParams
): Promise<ExamAssignment> {
  const { rows } = await pool.query<ExamAssignment>(
    `
    INSERT INTO exam_assignments (
      candidate_id,
      exam_id,
      status
    )
    VALUES ($1, $2, 'ASSIGNED')
    RETURNING
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [params.candidateId, params.examId]
  );

  return rows[0];
}


/**
 * Find assignment by ID
 */
export async function findAssignmentById(
  id: string
): Promise<ExamAssignment | null> {
  const { rows } = await pool.query<ExamAssignment>(
    `
    SELECT
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      started_at AS "startedAt",
      submitted_at AS "submittedAt",
      expires_at AS "expiresAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM exam_assignments
    WHERE id = $1
    `,
    [id]
  );

  return rows[0] ?? null;
}


/**
 * Find assignment for a specific candidate + exam
 */
export async function findAssignment(
  candidateId: string,
  examId: number
): Promise<ExamAssignment | null> {
  const { rows } = await pool.query<ExamAssignment>(
    `
    SELECT
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      started_at AS "startedAt",
      submitted_at AS "submittedAt",
      expires_at AS "expiresAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM exam_assignments
    WHERE candidate_id = $1
      AND exam_id = $2
    `,
    [candidateId, examId]
  );

  return rows[0] ?? null;
}


/**
 * Get all exams assigned to a candidate
 */
export async function listCandidateAssignments(
  candidateId: string
) {
  const { rows } = await pool.query(
    `
    SELECT
      ea.id AS "assignmentId",
      ea.candidate_id AS "candidateId",
      ea.exam_id AS "examId",
      ea.status AS "assignmentStatus",
      ea.assigned_at AS "assignedAt",
      ea.started_at AS "startedAt",
      ea.submitted_at AS "submittedAt",
      ea.expires_at AS "expiresAt",

      e.title AS "examTitle",
      e.description,
      e.duration,
      e.total_questions AS "totalQuestions",
      e.passing_percentage AS "passingPercentage",
      e.difficulty,
      e.shuffle_questions AS "shuffleQuestions",
      e.negative_marking AS "negativeMarking",
      e.status AS "examStatus",
      e.start_time AS "startTime"

    FROM exam_assignments ea

    INNER JOIN exams e
      ON e.id = ea.exam_id

    WHERE ea.candidate_id = $1
      AND e.status = 'PUBLISHED'

    ORDER BY e.start_time ASC
    `,
    [candidateId]
  );

  return rows;
}


/**
 * Get all candidates assigned to an exam
 */
export async function listExamAssignments(
  examId: number
): Promise<ExamAssignment[]> {
  const { rows } = await pool.query<ExamAssignment>(
    `
    SELECT
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM exam_assignments
    WHERE exam_id = $1
    ORDER BY assigned_at DESC
    `,
    [examId]
  );

  return rows;
}

export async function updateAssignment(
  id: string,
  data: { user_id: string; email: string; exam_id: string }
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify this assignment actually belongs to the given candidate
    const ownerCheck = await client.query(
      `SELECT candidate_id, status FROM exam_assignments WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (ownerCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return { success: false, message: "Assignment not found" };
    }

    if (ownerCheck.rows[0].candidate_id !== data.user_id) {
      await client.query("ROLLBACK");
      return { success: false, message: "Assignment does not belong to this candidate" };
    }

    if (["IN_PROGRESS", "COMPLETED"].includes(ownerCheck.rows[0].status)) {
      await client.query("ROLLBACK");
      return { success: false, message: "Cannot change exam on a started or completed assignment" };
    }

    const userResult = await client.query(
      `UPDATE users SET email = $1 WHERE id = $2`,
      [data.email, data.user_id]
    );

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { success: false, message: "Candidate not found" };
    }

    const assignmentResult = await client.query(
      `
      UPDATE exam_assignments
      SET exam_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, candidate_id, exam_id
      `,
      [data.exam_id, id]
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Assignment updated successfully!",
      assignment: assignmentResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error while updating assignment:", error);
    return { success: false, message: "Internal Server Error!" };
  } finally {
    client.release();
  }
}

/**
 * Update assignment status
 */
export async function updateAssignmentStatus(
  id: string,
  status: ExamAssignmentStatus
): Promise<ExamAssignment | null> {
  const { rows } = await pool.query<ExamAssignment>(
    `
    UPDATE exam_assignments
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      started_at AS "startedAt",
      submitted_at AS "submittedAt",
      expires_at AS "expiresAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [status, id]
  );

  return rows[0] ?? null;
}


/**
 * Delete assignment
 */
export async function deleteAssignment(
  id: string
): Promise<boolean> {
  const result = await pool.query(
    `
    DELETE FROM exam_assignments
    WHERE id = $1
    `,
    [id]
  );

  return result.rowCount === 1;
}

export async function getallCandidates(
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  // Get paginated candidates
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      u.is_active AS "isActive",
      u.created_at AS "createdAt",

      ea.id AS "assignmentId",
      ea.exam_id AS "examId",
      ea.status AS "assignmentStatus",
      ea.assigned_at AS "assignedAt",
      ea.status AS "Status",

      e.title AS "examTitle"

    FROM users u

    LEFT JOIN exam_assignments ea
      ON ea.candidate_id = u.id

    LEFT JOIN exams e
      ON e.id = ea.exam_id

    WHERE u.role = 'CANDIDATE'

    ORDER BY u.created_at DESC

    LIMIT $1
    OFFSET $2
    `,
    [limit, offset]
  );

  // Get total number of candidates
  const { rows: countRows } = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM users
    WHERE role = 'CANDIDATE'
    `
  );

  const total = Number(countRows[0].total);

  const totalPages = Math.ceil(total / limit);

  const assignments = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    isActive: r.isActive,
    createdAt: r.createdAt,
    assignmentId: r.assignmentId,
    exam: r.examId
      ? {
          id: r.examId,
          name: r.examTitle,
        }
      : null,
    examTitle: r.examTitle,
    assignmentStatus: r.assignmentStatus,
    assignedAt: r.assignedAt,
  }));

  return {
    assignments,
    page,
    limit,
    total,
    totalPages,
  };
}

export async function startAssignment(
  assignmentId: string,
  candidateId: string,
  expiresAt: Date
): Promise<ExamAssignment | null> {
  const { rows } = await pool.query<ExamAssignment>(
    `
    UPDATE exam_assignments
    SET
      status = 'IN_PROGRESS',
      started_at = CURRENT_TIMESTAMP,
      expires_at = $3,
      updated_at = CURRENT_TIMESTAMP

    WHERE id = $1
      AND candidate_id = $2
      AND status = 'ASSIGNED'

    RETURNING
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      started_at AS "startedAt",
      expires_at AS "expiresAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [assignmentId, candidateId, expiresAt]
  );

  return rows[0] ?? null;
}

export async function submitAssignment(
  assignmentId: string
): Promise<ExamAssignment | null> {
  const { rows } = await pool.query<ExamAssignment>(
    `
    UPDATE exam_assignments
    SET
      status = 'COMPLETED',
      submitted_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND status = 'IN_PROGRESS'
    RETURNING
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      started_at AS "startedAt",
      submitted_at AS "submittedAt",
      expires_at AS "expiresAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [assignmentId]
  );

  return rows[0] ?? null;
}

export async function expireAssignment(
  assignmentId: string
): Promise<ExamAssignment | null> {
  const { rows } = await pool.query<ExamAssignment>(
    `
    UPDATE exam_assignments
    SET
      status = 'EXPIRED',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND status = 'IN_PROGRESS'
      AND expires_at <= CURRENT_TIMESTAMP
    RETURNING
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      started_at AS "startedAt",
      submitted_at AS "submittedAt",
      expires_at AS "expiresAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [assignmentId]
  );

  return rows[0] ?? null;
}