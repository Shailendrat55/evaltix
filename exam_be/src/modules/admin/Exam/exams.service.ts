import pool from "../../../config";
import {
  assignQuestionsToExam,
  ExamQuestion,
  deleteExamQuestions,
  getQuestionsByExamId,
} from "../exam_question/examQuestion.repository";
import {
  createExamRepository,
  getAllExamsRepository,
  getExamById,
  deleteExamById,
  updateExamById,

} from "./exams.repository";

import { CreateExamDTO } from "./exams.types";


export const createExamService = async (
  data: CreateExamDTO,
  createdBy?: string
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Create exam
    const exam = await createExamRepository(
      client,
      data,
      createdBy
    );

    // 2. Assign questions
    let examQuestions: ExamQuestion[] = [];

    if (
      Array.isArray(data.questionIds) &&
      data.questionIds.length > 0
    ) {
      examQuestions = await assignQuestionsToExam(
        client,
        exam.id,
        data.questionIds
      );
    }

    // 3. Commit
    await client.query("COMMIT");

    return {
      exam,
      questions: examQuestions,
      questionCount: examQuestions.length
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
};



export const getAllExamsService = async () => {

  return await getAllExamsRepository();

};

export const getExamByIdService = async (id: string) => {
  const exam = await getExamById(id);

  if (!exam) {
    throw new Error("Exam not found");
  }

  const questions = await getQuestionsByExamId(Number(id));

  return {
    ...exam,
    questions,
  };
};

export const deleteExamByIdService = async (id: string) => {
  await deleteExamById(id);

};

export const updateExamByIdService = async (
  id: string,
  data: Partial<CreateExamDTO>
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Update exam
    const updatedExam = await updateExamById(
      client,
      id,
      data
    );

    if (!updatedExam) {
      throw new Error("Exam not found");
    }

    // 2. Replace questions
    if (Array.isArray(data.questionIds)) {
      await client.query(
        `
        DELETE FROM exam_questions
        WHERE exam_id = $1
        `,
        [id]
      );

      for (let i = 0; i < data.questionIds.length; i++) {
        await client.query(
          `
          INSERT INTO exam_questions
          (
            exam_id,
            question_id,
            question_order
          )
          VALUES ($1, $2, $3)
          `,
          [
            id,
            data.questionIds[i],
            i + 1,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return {
      exam: updatedExam,
      questionIds: data.questionIds || [],
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};