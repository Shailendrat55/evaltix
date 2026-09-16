"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodingSchema = exports.createDescriptiveSchema = exports.createMCQSchema = void 0;
const zod_1 = require("zod");
// =========================
// Common Enums
// =========================
const difficultyEnum = zod_1.z.enum(["EASY", "MEDIUM", "HARD"]);
const questionTypeEnum = zod_1.z.enum([
    "MCQ",
    "CODING",
    "DESCRIPTIVE",
]);
// =========================
// MCQ
// =========================
const mcqOptionSchema = zod_1.z.object({
    optionText: zod_1.z.string().min(1, "Option text is required"),
    isCorrect: zod_1.z.boolean(),
    optionOrder: zod_1.z.number().int().positive(),
});
exports.createMCQSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(3, "Title is required"),
    description: zod_1.z.string().min(5, "Description is required"),
    type: zod_1.z.literal(questionTypeEnum.enum.MCQ),
    difficulty: difficultyEnum.default("MEDIUM"),
    marks: zod_1.z.number().positive().default(1),
    negativeMarks: zod_1.z.number().min(0).default(0),
    createdBy: zod_1.z.string().uuid(),
    options: zod_1.z
        .array(mcqOptionSchema)
        .min(2, "Minimum 2 options")
        .max(6, "Maximum 6 options"),
})
    .refine((data) => data.options.filter((o) => o.isCorrect).length >= 1, {
    message: "At least one correct option is required",
    path: ["options"],
});
// =========================
// Descriptive
// =========================
exports.createDescriptiveSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(5),
    type: zod_1.z.literal(questionTypeEnum.enum.DESCRIPTIVE),
    difficulty: difficultyEnum.default("MEDIUM"),
    marks: zod_1.z.number().positive().default(1),
    negativeMarks: zod_1.z.number().min(0).default(0),
    createdBy: zod_1.z.string().uuid(),
    sampleAnswer: zod_1.z.string().optional(),
    maxWords: zod_1.z.number().positive().default(500),
});
// =========================
// Coding
// =========================
const starterCodeSchema = zod_1.z.object({
    language: zod_1.z.string().min(1),
    starterCode: zod_1.z.string().min(1),
});
const testCaseSchema = zod_1.z.object({
    input: zod_1.z.string(),
    expectedOutput: zod_1.z.string(),
    isHidden: zod_1.z.boolean(),
    weight: zod_1.z.number().positive().default(1),
});
exports.createCodingSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(5),
    type: zod_1.z.literal(questionTypeEnum.enum.CODING),
    difficulty: difficultyEnum.default("MEDIUM"),
    marks: zod_1.z.number().positive().default(1),
    negativeMarks: zod_1.z.number().min(0).default(0),
    createdBy: zod_1.z.string().uuid(),
    timeLimit: zod_1.z.number().positive().default(2),
    memoryLimit: zod_1.z.number().positive().default(256),
    starterCodes: zod_1.z
        .array(starterCodeSchema)
        .min(1, "At least one starter code is required"),
    testCases: zod_1.z
        .array(testCaseSchema)
        .min(1, "At least one test case is required"),
});
