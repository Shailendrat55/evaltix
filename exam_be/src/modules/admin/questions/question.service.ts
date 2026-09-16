import mcqService from "./services/mcq.service";
import CodingService from "./services/coding.service";
import questionRepository from "./question.repository";
import codingService from "./services/coding.service";
import descriptiveService from "./services/descriptive.service";
import { PoolClient } from "pg";
import { pool } from "../../../config/db";
import { QuestionType } from "./question.types";


class QuestionService {


    // ==============================
    // Create MCQ
    // ==============================

    async createMCQ(data: any) {

        return await mcqService.create(data);

    }



    // ==============================
    // Create Coding Question
    // ==============================

    async createCoding(data: any) {

        return await CodingService.create(data);

    }



    // ==============================
    // Create Descriptive Question
    // ==============================

    async createDescriptive(data: any) {

        return await descriptiveService.create(data);

    }



    // ==============================
    // Get All Questions
    // ==============================

    async getAllQuestions() {

        return await questionRepository.getAllQuestions();

    }



    // ==============================
    // Get Question By ID
    // ==============================

    async getQuestionById(id: string) {

        return await questionRepository.getQuestionById(id);

    }



    // ==============================
    // Update Question
    // ==============================

async updateQuestion(id: string, data: any) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existing = await questionRepository.getQuestionById(id);

        if (!existing) {
            throw new Error("Question not found");
        }

        const question = await questionRepository.updateQuestion(
            client,
            id,
            {
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                marks: data.marks,
                negativeMarks: data.negativeMarks,
                category: data.category,
            }
        );

        // =========================
        // MCQ
        // =========================

        if (existing.type === QuestionType.MCQ) {
            if (data.options) {
                await questionRepository.updateMCQOptions(
                    client,
                    id,
                    data.options
                );
            }
        }

        // =========================
        // DESCRIPTIVE
        // =========================

        if (existing.type === QuestionType.DESCRIPTIVE) {
            if (
                data.sampleAnswer !== undefined ||
                data.maxWords !== undefined ||
                data.minWords !== undefined
            ) {
                await questionRepository.updateDescriptiveQuestion(
                    client,
                    id,
                    data.sampleAnswer,
                    data.maxWords ?? 500,
                    data.minWords
                );
            }
        }

        // =========================
        // CODING
        // =========================

        if (existing.type === QuestionType.CODING) {
            if (
                data.timeLimit !== undefined ||
                data.memoryLimit !== undefined
            ) {
                const codingQuestionId =
                    await questionRepository.updateCodingQuestion(
                        client,
                        id,
                        data.timeLimit ?? existing.timeLimit ?? 2000,
                        data.memoryLimit ?? existing.memoryLimit ?? 256
                    );

                if (data.starterCodes) {
                    await questionRepository.updateStarterCodes(
                        client,
                        codingQuestionId,
                        data.starterCodes
                    );
                }

                if (data.testCases) {
                    await questionRepository.updateTestCases(
                        client,
                        codingQuestionId,
                        data.testCases
                    );
                }
            }
        }

        await client.query("COMMIT");

        return await questionRepository.getQuestionById(id);

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}



    // ==============================
    // Delete Question
    // ==============================

    async deleteQuestion(id: string) {

        return await questionRepository.deleteQuestion(id);

    }

}


export default new QuestionService();