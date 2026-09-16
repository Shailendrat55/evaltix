"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcq_service_1 = __importDefault(require("./services/mcq.service"));
const coding_service_1 = __importDefault(require("./services/coding.service"));
const question_repository_1 = __importDefault(require("./question.repository"));
const descriptive_service_1 = __importDefault(require("./services/descriptive.service"));
const db_1 = require("../../../config/db");
const question_types_1 = require("./question.types");
class QuestionService {
    // ==============================
    // Create MCQ
    // ==============================
    async createMCQ(data) {
        return await mcq_service_1.default.create(data);
    }
    // ==============================
    // Create Coding Question
    // ==============================
    async createCoding(data) {
        return await coding_service_1.default.create(data);
    }
    // ==============================
    // Create Descriptive Question
    // ==============================
    async createDescriptive(data) {
        return await descriptive_service_1.default.create(data);
    }
    // ==============================
    // Get All Questions
    // ==============================
    async getAllQuestions() {
        return await question_repository_1.default.getAllQuestions();
    }
    // ==============================
    // Get Question By ID
    // ==============================
    async getQuestionById(id) {
        return await question_repository_1.default.getQuestionById(id);
    }
    // ==============================
    // Update Question
    // ==============================
    async updateQuestion(id, data) {
        const client = await db_1.pool.connect();
        try {
            await client.query("BEGIN");
            const existing = await question_repository_1.default.getQuestionById(id);
            if (!existing) {
                throw new Error("Question not found");
            }
            const question = await question_repository_1.default.updateQuestion(client, id, {
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                marks: data.marks,
                negativeMarks: data.negativeMarks,
                category: data.category,
            });
            // =========================
            // MCQ
            // =========================
            if (existing.type === question_types_1.QuestionType.MCQ) {
                if (data.options) {
                    await question_repository_1.default.updateMCQOptions(client, id, data.options);
                }
            }
            // =========================
            // DESCRIPTIVE
            // =========================
            if (existing.type === question_types_1.QuestionType.DESCRIPTIVE) {
                if (data.sampleAnswer !== undefined ||
                    data.maxWords !== undefined ||
                    data.minWords !== undefined) {
                    await question_repository_1.default.updateDescriptiveQuestion(client, id, data.sampleAnswer, data.maxWords ?? 500, data.minWords);
                }
            }
            // =========================
            // CODING
            // =========================
            if (existing.type === question_types_1.QuestionType.CODING) {
                if (data.timeLimit !== undefined ||
                    data.memoryLimit !== undefined) {
                    const codingQuestionId = await question_repository_1.default.updateCodingQuestion(client, id, data.timeLimit ?? existing.timeLimit ?? 2000, data.memoryLimit ?? existing.memoryLimit ?? 256);
                    if (data.starterCodes) {
                        await question_repository_1.default.updateStarterCodes(client, codingQuestionId, data.starterCodes);
                    }
                    if (data.testCases) {
                        await question_repository_1.default.updateTestCases(client, codingQuestionId, data.testCases);
                    }
                }
            }
            await client.query("COMMIT");
            return await question_repository_1.default.getQuestionById(id);
        }
        catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }
    // ==============================
    // Delete Question
    // ==============================
    async deleteQuestion(id) {
        return await question_repository_1.default.deleteQuestion(id);
    }
}
exports.default = new QuestionService();
