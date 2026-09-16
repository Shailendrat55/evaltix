import { pool } from "../../../../config/db";

import questionRepository from "../question.repository";

import {
  CreateCodingDto,
  QuestionType,
} from "../question.types";


class CodingService {


  async create(
    data: CreateCodingDto
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

            type: QuestionType.CODING,

            difficulty: data.difficulty,

            marks: data.marks,

            negativeMarks: data.negativeMarks,

            createdBy: data.createdBy,

            category: data.category
          }
        );



      // 2. Create coding details
      const codingQuestionId =
        await questionRepository.createCodingQuestion(
          client,
          questionId,

          data.timeLimit ?? 2,

          data.memoryLimit ?? 256
        );



      // 3. Insert starter codes
      await questionRepository.createStarterCodes(
        client,
        codingQuestionId,
        data.starterCodes
      );



      // 4. Insert test cases
      await questionRepository.createTestCases(
        client,
        codingQuestionId,
        data.testCases
      );



      // Commit transaction
      await client.query("COMMIT");



      return {

        id: questionId,

        message:
          "Coding question created successfully"

      };


    } catch(error) {


      // Rollback everything
      await client.query("ROLLBACK");


      throw error;


    } finally {


      // Release connection
      client.release();

    }

  }


}


export default new CodingService();