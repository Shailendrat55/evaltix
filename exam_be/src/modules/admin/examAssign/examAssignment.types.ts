export type ExamAssignmentStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED";

export interface CreateExamAssignmentParams {
  candidateId: string;
  examId: number;
}

export interface ExamAssignment {
  id: string;
  candidateId: string;
  examId: number;
  status: ExamAssignmentStatus;
  assignedAt: Date;
  startedAt?: Date | null;
  submittedAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}