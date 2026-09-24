import { pool } from "../../../config/db";
import * as assignmentRepository from "./examAssignment.repository";
import {
  CreateExamAssignmentParams,
  ExamAssignmentStatus,
} from "./examAssignment.types";


/**
 * Create assignment
 */
export async function createAssignment(
  params: CreateExamAssignmentParams
) {
  // Check candidate
  const candidateResult = await pool.query(
    `
    SELECT
      id,
      role,
      is_active
    FROM users
    WHERE id = $1
    `,
    [params.candidateId]
  );

  const candidate = candidateResult.rows[0];

  if (!candidate) {
    throw new Error("Candidate not found");
  }

  if (candidate.role !== "CANDIDATE") {
    throw new Error("User is not a candidate");
  }

  if (!candidate.is_active) {
    throw new Error("Candidate is inactive");
  }


  // Check exam
  const examResult = await pool.query(
    `
    SELECT id
    FROM exams
    WHERE id = $1
    `,
    [params.examId]
  );

  const exam = examResult.rows[0];

  if (!exam) {
    throw new Error("Exam not found");
  }


  // Check duplicate assignment
  const existing =
    await assignmentRepository.findAssignment(
      params.candidateId,
      params.examId
    );

  if (existing) {
    throw new Error(
      "Candidate is already assigned to this exam"
    );
  }


  // Create assignment
  return assignmentRepository.createAssignment(params);
}


/**
 * Get assignment
 */
export async function getAssignment(id: string) {
  const assignment =
    await assignmentRepository.findAssignmentById(id);

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return assignment;
}


/**
 * Get candidate assignments
 */
export async function getCandidateAssignments(
  candidateId: string
) {
  return assignmentRepository.listCandidateAssignments(
    candidateId
  );
}


/**
 * Get exam assignments
 */
export async function getExamAssignments(
  examId: number
) {
  return assignmentRepository.listExamAssignments(
    examId
  );
}

export async function updateAssignment(
  id: string,
  data: {
    user_id: string;
    email: string;
    exam_id: string;
  }
) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Assignment ID is required",
      };
    }

    if (!data.user_id) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    if (!data.email) {
      return {
        success: false,
        message: "Email is required",
      };
    }

    if (!data.exam_id) {
      return {
        success: false,
        message: "Exam ID is required",
      };
    }

    return await assignmentRepository.updateAssignment(id, data);
  } catch (error) {
    console.error("Error in updateAssignment service:", error);

    return {
      success: false,
      message: "Internal Server Error",
    };
  }
}


/**
 * Update assignment status
 */
export async function updateAssignmentStatus(
  id: string,
  status: ExamAssignmentStatus
) {
  const assignment =
    await assignmentRepository.findAssignmentById(id);

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return assignmentRepository.updateAssignmentStatus(
    id,
    status
  );
}


/**
 * Delete assignment
 */
export async function deleteAssignment(id: string) {
  const assignment =
    await assignmentRepository.findAssignmentById(id);

  if (!assignment) {
    throw new Error("Assignment not found");
  }


  // Don't allow deleting an active exam session
  if (
    assignment.status === "IN_PROGRESS" ||
    assignment.status === "COMPLETED"
  ) {
    throw new Error(
      "Cannot delete an assignment that has started or completed"
    );
  }

  return assignmentRepository.deleteAssignment(id);
}

export async function getAllAssignments(
  page = 1,
  limit = 10
) {
  return assignmentRepository.getallCandidates(
    page,
    limit
  );
}

// export async function startExam(
//   candidateId: string,
//   examId: number
// ) {
//   const assignment =
//     await assignmentRepository.findAssignment(
//       candidateId,
//       examId
//     );

//   if (!assignment) {
//     throw new Error("Exam is not assigned to this candidate");
//   }

//   if (assignment.status !== "ASSIGNED") {
//     throw new Error(
//       `Cannot start exam. Current status: ${assignment.status}`
//     );
//   }

//   const examResult = await pool.query(
//     `
//     SELECT
//       id,
//       title,
//       duration,
//       status,
//       start_time
//     FROM exams
//     WHERE id = $1
//     `,
//     [examId]
//   );

//   const exam = examResult.rows[0];

//   if (!exam) {
//     throw new Error("Exam not found");
//   }

//   if (exam.status !== "PUBLISHED") {
//     throw new Error("Exam is not published");
//   }

//   const now = new Date();

//   if (
//     exam.start_time &&
//     now < new Date(exam.start_time)
//   ) {
//     throw new Error("Exam has not started yet");
//   }

//   const expiresAt = new Date(
//     now.getTime() + exam.duration * 60 * 1000
//   );

//   const started =
//   await assignmentRepository.startAssignment(
//     assignment.id,
//     candidateId,
//     expiresAt
//   );

//   return {
//     assignment: started,
//     exam,
//     expiresAt,
//   };
// }

export async function submitExam(
  candidateId: string,
  examId: number
) {
  const assignment =
    await assignmentRepository.findAssignment(
      candidateId,
      examId
    );

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  if (assignment.status !== "IN_PROGRESS") {
    throw new Error(
      "Exam is not currently in progress"
    );
  }

  // Get exam timing information
  const examResult = await pool.query(
    `
    SELECT
      id,
      start_time,
      duration
    FROM exams
    WHERE id = $1
    `,
    [examId]
  );

  const exam = examResult.rows[0];

  if (!exam) {
    throw new Error("Exam not found");
  }

  if (!exam.start_time) {
    throw new Error("Exam start time is not configured");
  }

  // Calculate exam expiry
  const expiresAt = new Date(
    new Date(exam.start_time).getTime() +
    exam.duration * 60 * 1000
  );

  // Check whether time has expired
  if (new Date() >= expiresAt) {
    await assignmentRepository.expireAssignment(
      assignment.id
    );

    throw new Error("Exam time has expired");
  }

  // Submit exam
  const completed =
    await assignmentRepository.submitAssignment(
      assignment.id
    );

  return {
    assignment: completed,
    expiresAt,
  };
}