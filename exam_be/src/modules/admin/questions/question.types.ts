// ==========================
// Enums
// ==========================

export enum QuestionType {
  MCQ = "MCQ",
  CODING = "CODING",
  DESCRIPTIVE = "DESCRIPTIVE",
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum QuestionStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

// ==========================
// Common Question
// ==========================

export interface Question {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  negativeMarks: number;
  status: QuestionStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  category: string;
}

// ==========================
// MCQ
// ==========================

export interface MCQOption {
  optionText: string;
  isCorrect: boolean;
  optionOrder: number;
}

export interface CreateMCQDto {
  title: string;
  description: string;

  difficulty?: Difficulty;
  marks?: number;
  negativeMarks?: number;

  createdBy: string;

  category:string;

  options: MCQOption[];
}

// ==========================
// Descriptive
// ==========================

export interface CreateDescriptiveDto {
  title: string;
  description: string;

  difficulty?: Difficulty;
  marks?: number;
  negativeMarks?: number;

  createdBy: string;

  sampleAnswer?: string;
  minWords?:number;
  maxWords?: number;
  category:string;
}

// ==========================
// Coding
// ==========================

export interface StarterCode {
  language: string;
  starterCode: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;
}

export interface CreateCodingDto {
  title: string;
  description: string;

  difficulty?: Difficulty;
  marks?: number;
  negativeMarks?: number;

  createdBy: string;
  category:string;

  timeLimit?: number;
  memoryLimit?: number;

  starterCodes: StarterCode[];

  testCases: TestCase[];
}