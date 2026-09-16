"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../config/db");
const question_repository_1 = __importDefault(require("../question.repository"));
const question_types_1 = require("../question.types");
class DescriptiveService {
    async create(data) {
        const client = await db_1.pool.connect();
        try {
            // Start Transaction
            await client.query("BEGIN");
            // 1. Create common question
            const questionId = await question_repository_1.default.createQuestion(client, {
                title: data.title,
                description: data.description,
                type: question_types_1.QuestionType.DESCRIPTIVE,
                difficulty: data.difficulty,
                marks: data.marks,
                negativeMarks: data.negativeMarks,
                createdBy: data.createdBy,
                category: data.category
            });
            // 2. Create descriptive details
            await question_repository_1.default.createDescriptiveQuestion(client, questionId, data.sampleAnswer, data.maxWords ?? 500, data.minWords);
            // Commit
            await client.query("COMMIT");
            return {
                id: questionId,
                message: "Descriptive question created successfully"
            };
        }
        catch (error) {
            // Rollback if failed
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            // Release connection
            client.release();
        }
    }
}
exports.default = new DescriptiveService();
