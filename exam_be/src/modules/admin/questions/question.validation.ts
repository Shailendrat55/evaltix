import { z } from "zod";

// =========================
// Common Enums
// =========================

const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

const questionTypeEnum = z.enum([
  "MCQ",
  "CODING",
  "DESCRIPTIVE",
]);

// =========================
// MCQ
// =========================

const mcqOptionSchema = z.object({
  optionText: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
  optionOrder: z.number().int().positive(),
});

export const createMCQSchema = z
  .object({
    title: z.string().min(3, "Title is required"),

    description: z.string().min(5, "Description is required"),

    type: z.literal(questionTypeEnum.enum.MCQ),

    difficulty: difficultyEnum.default("MEDIUM"),

    marks: z.number().positive().default(1),

    negativeMarks: z.number().min(0).default(0),

    createdBy: z.string().uuid(),

    options: z
      .array(mcqOptionSchema)
      .min(2, "Minimum 2 options")
      .max(6, "Maximum 6 options"),
  })
  .refine(
    (data) => data.options.filter((o) => o.isCorrect).length >= 1,
    {
      message: "At least one correct option is required",
      path: ["options"],
    }
  );

// =========================
// Descriptive
// =========================

export const createDescriptiveSchema = z.object({
  title: z.string().min(3),

  description: z.string().min(5),

  type: z.literal(questionTypeEnum.enum.DESCRIPTIVE),

  difficulty: difficultyEnum.default("MEDIUM"),

  marks: z.number().positive().default(1),

  negativeMarks: z.number().min(0).default(0),

  createdBy: z.string().uuid(),

  sampleAnswer: z.string().optional(),

  maxWords: z.number().positive().default(500),
});

// =========================
// Coding
// =========================

const starterCodeSchema = z.object({
  language: z.string().min(1),

  starterCode: z.string().min(1),
});

const testCaseSchema = z.object({
  input: z.string(),

  expectedOutput: z.string(),

  isHidden: z.boolean(),

  weight: z.number().positive().default(1),
});

export const createCodingSchema = z.object({
  title: z.string().min(3),

  description: z.string().min(5),

  type: z.literal(questionTypeEnum.enum.CODING),

  difficulty: difficultyEnum.default("MEDIUM"),

  marks: z.number().positive().default(1),

  negativeMarks: z.number().min(0).default(0),

  createdBy: z.string().uuid(),

  timeLimit: z.number().positive().default(2),

  memoryLimit: z.number().positive().default(256),

  starterCodes: z
    .array(starterCodeSchema)
    .min(1, "At least one starter code is required"),

  testCases: z
    .array(testCaseSchema)
    .min(1, "At least one test case is required"),
});