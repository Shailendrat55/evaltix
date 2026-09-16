import { pool } from "../../../../config/db";

import questionRepository from "../question.repository";

import {
  CreateDescriptiveDto,
  QuestionType,
} from "../question.types";


class DescriptiveService {


  async create(
    data: CreateDescriptiveDto
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

            type: QuestionType.DESCRIPTIVE,

            difficulty: data.difficulty,

            marks: data.marks,

            negativeMarks: data.negativeMarks,

            createdBy: data.createdBy,

            category: data.category
          }
        );



      // 2. Create descriptive details
      await questionRepository.createDescriptiveQuestion(
        client,

        questionId,

        data.sampleAnswer,

        data.maxWords ?? 500,

        data.minWords
      );



      // Commit
      await client.query("COMMIT");



      return {

        id: questionId,

        message:
          "Descriptive question created successfully"

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


export default new DescriptiveService();