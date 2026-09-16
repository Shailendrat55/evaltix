import {pool} from "../../../../config/db";

import questionRepository from "../question.repository";

import { CreateMCQDto, QuestionType } from "../question.types";


class MCQService {


    async create(
        data: CreateMCQDto
    ) {

        const client = await pool.connect();


        try {

            // Start Transaction
            await client.query("BEGIN");


            // 1. Create common question
            const questionId =
                await questionRepository.createQuestion(
                    client,
                    {
                        title: data.title,

                        description: data.description,

                        type: QuestionType.MCQ,

                        difficulty: data.difficulty,

                        marks: data.marks,

                        negativeMarks: data.negativeMarks,

                        createdBy: data.createdBy,

                        category: data.category
                    }
                );



            // 2. Insert MCQ options
            await questionRepository.createMCQOptions(
                client,
                questionId,
                data.options
            );



            // Commit transaction
            await client.query("COMMIT");



            return {
                id: questionId,
                message: "MCQ created successfully"
            };


        } catch(error) {


            // Rollback if failed
            await client.query("ROLLBACK");


            throw error;


        } finally {


            // Release connection
            client.release();

        }

    }

}


export default new MCQService();