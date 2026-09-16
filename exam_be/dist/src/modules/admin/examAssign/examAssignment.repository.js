"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignment = createAssignment;
exports.findAssignmentById = findAssignmentById;
exports.findAssignment = findAssignment;
exports.listCandidateAssignments = listCandidateAssignments;
exports.listExamAssignments = listExamAssignments;
exports.updateAssignment = updateAssignment;
exports.updateAssignmentStatus = updateAssignmentStatus;
exports.deleteAssignment = deleteAssignment;
exports.getallCandidates = getallCandidates;
const db_1 = require("../../../config/db");
/**
 * Create exam assignment
 */
async function createAssignment(params) {
    const { rows } = await db_1.pool.query(`
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
    `, [params.candidateId, params.examId]);
    return rows[0];
}
/**
 * Find assignment by ID
 */
async function findAssignmentById(id) {
    const { rows } = await db_1.pool.query(`
    SELECT
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM exam_assignments
    WHERE id = $1
    `, [id]);
    return rows[0] ?? null;
}
/**
 * Find assignment for a specific candidate + exam
 */
async function findAssignment(candidateId, examId) {
    const { rows } = await db_1.pool.query(`
    SELECT
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM exam_assignments
    WHERE candidate_id = $1
      AND exam_id = $2
    `, [candidateId, examId]);
    return rows[0] ?? null;
}
/**
 * Get all exams assigned to a candidate
 */
async function listCandidateAssignments(candidateId) {
    const { rows } = await db_1.pool.query(`
    SELECT
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM exam_assignments
    WHERE candidate_id = $1
    ORDER BY assigned_at DESC
    `, [candidateId]);
    return rows;
}
/**
 * Get all candidates assigned to an exam
 */
async function listExamAssignments(examId) {
    const { rows } = await db_1.pool.query(`
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
    `, [examId]);
    return rows;
}
async function updateAssignment(id, data) {
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        // Verify this assignment actually belongs to the given candidate
        const ownerCheck = await client.query(`SELECT candidate_id FROM exam_assignments WHERE id = $1 FOR UPDATE`, [id]);
        if (ownerCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return { success: false, message: "Assignment not found" };
        }
        if (ownerCheck.rows[0].candidate_id !== data.user_id) {
            await client.query("ROLLBACK");
            return { success: false, message: "Assignment does not belong to this candidate" };
        }
        const userResult = await client.query(`UPDATE users SET email = $1 WHERE id = $2`, [data.email, data.user_id]);
        if (userResult.rowCount === 0) {
            await client.query("ROLLBACK");
            return { success: false, message: "Candidate not found" };
        }
        const assignmentResult = await client.query(`
      UPDATE exam_assignments
      SET exam_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, candidate_id, exam_id
      `, [data.exam_id, id]);
        await client.query("COMMIT");
        return {
            success: true,
            message: "Assignment updated successfully!",
            assignment: assignmentResult.rows[0],
        };
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("Error while updating assignment:", error);
        return { success: false, message: "Internal Server Error!" };
    }
    finally {
        client.release();
    }
}
/**
 * Update assignment status
 */
async function updateAssignmentStatus(id, status) {
    const { rows } = await db_1.pool.query(`
    UPDATE exam_assignments
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP,

    WHERE id = $2

    RETURNING
      id,
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      assigned_at AS "assignedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `, [status, id]);
    return rows[0] ?? null;
}
/**
 * Delete assignment
 */
async function deleteAssignment(id) {
    const result = await db_1.pool.query(`
    DELETE FROM exam_assignments
    WHERE id = $1
    `, [id]);
    return result.rowCount === 1;
}
async function getallCandidates() {
    const { rows } = await db_1.pool.query(`
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

      e.title AS "examTitle"

    FROM users u

    LEFT JOIN exam_assignments ea
      ON ea.candidate_id = u.id

    LEFT JOIN exams e
      ON e.id = ea.exam_id

    WHERE u.role = 'CANDIDATE'

    ORDER BY u.created_at DESC
    `);
    // shape each row so the frontend gets a nested `exam` object and a real assignmentId
    return rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        isActive: r.isActive,
        createdAt: r.createdAt,
        assignmentId: r.assignmentId,
        exam: r.examId
            ? { id: r.examId, name: r.examName }
            : null,
        examTitle: r.examTitle,
        assignmentStatus: r.assignmentStatus,
        assignedAt: r.assignedAt,
    }));
}
