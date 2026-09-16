"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../config/db");
const question_repository_1 = __importDefault(require("../question.repository"));
const question_types_1 = require("../question.types");
class CodingService {
    async create(data) {
        const client = await db_1.pool.connect();
        try {
            // Start Transaction
            await client.query("BEGIN");
            // 1. Create common question
            const questionId = await question_repository_1.default.createQuestion(client, {
                title: data.title,
                description: data.description,
                type: question_types_1.QuestionType.CODING,
                difficulty: data.difficulty,
                marks: data.marks,
                negativeMarks: data.negativeMarks,
                createdBy: data.createdBy,
                category: data.category
            });
            // 2. Create coding details
            const codingQuestionId = await question_repository_1.default.createCodingQuestion(client, questionId, data.timeLimit ?? 2, data.memoryLimit ?? 256);
            // 3. Insert starter codes
            await question_repository_1.default.createStarterCodes(client, codingQuestionId, data.starterCodes);
            // 4. Insert test cases
            await question_repository_1.default.createTestCases(client, codingQuestionId, data.testCases);
            // Commit transaction
            await client.query("COMMIT");
            return {
                id: questionId,
                message: "Coding question created successfully"
            };
        }
        catch (error) {
            // Rollback everything
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            // Release connection
            client.release();
        }
    }
}
exports.default = new CodingService();
