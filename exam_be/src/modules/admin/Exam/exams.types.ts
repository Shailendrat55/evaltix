export interface CreateExamDTO {
  title: string;
  description?: string;
  duration: number;
  questions: number;
  passing: number;
  difficulty: string;
  shuffle: boolean;
  negative: boolean;
  examDate?: string;

  questionIds?: string[];

  status?: "Draft" | "Published";
}

export interface UpdateExamDTO {
  title: string;
  description?: string;
  duration: number;
  questions: number;
  passing: number;
  difficulty: string;
  shuffle: boolean;
  negative: boolean;
  examDate?: string | null;

  questionIds: string[];
}