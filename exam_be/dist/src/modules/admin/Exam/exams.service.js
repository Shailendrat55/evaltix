"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExamByIdService = exports.deleteExamByIdService = exports.getExamByIdService = exports.getAllExamsService = exports.createExamService = void 0;
const config_1 = __importDefault(require("../../../config"));
const examQuestion_repository_1 = require("../exam_question/examQuestion.repository");
const exams_repository_1 = require("./exams.repository");
const createExamService = async (data, createdBy) => {
    const client = await config_1.default.connect();
    try {
        await client.query("BEGIN");
        // 1. Create exam
        const exam = await (0, exams_repository_1.createExamRepository)(client, data, createdBy);
        // 2. Assign questions
        let examQuestions = [];
        if (Array.isArray(data.questionIds) &&
            data.questionIds.length > 0) {
            examQuestions = await (0, examQuestion_repository_1.assignQuestionsToExam)(client, exam.id, data.questionIds);
        }
        // 3. Commit
        await client.query("COMMIT");
        return {
            exam,
            questions: examQuestions,
            questionCount: examQuestions.length
        };
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.createExamService = createExamService;
const getAllExamsService = async () => {
    return await (0, exams_repository_1.getAllExamsRepository)();
};
exports.getAllExamsService = getAllExamsService;
const getExamByIdService = async (id) => {
    const exam = await (0, exams_repository_1.getExamById)(id);
    if (!exam) {
        throw new Error("Exam not found");
    }
    const questions = await (0, examQuestion_repository_1.getQuestionsByExamId)(Number(id));
    return {
        ...exam,
        questions,
    };
};
exports.getExamByIdService = getExamByIdService;
const deleteExamByIdService = async (id) => {
    await (0, exams_repository_1.deleteExamById)(id);
};
exports.deleteExamByIdService = deleteExamByIdService;
const updateExamByIdService = async (id, data) => {
    const client = await config_1.default.connect();
    try {
        await client.query("BEGIN");
        // 1. Update exam
        const updatedExam = await (0, exams_repository_1.updateExamById)(client, id, data);
        if (!updatedExam) {
            throw new Error("Exam not found");
        }
        // 2. Replace questions
        if (Array.isArray(data.questionIds)) {
            await client.query(`
        DELETE FROM exam_questions
        WHERE exam_id = $1
        `, [id]);
            for (let i = 0; i < data.questionIds.length; i++) {
                await client.query(`
          INSERT INTO exam_questions
          (
            exam_id,
            question_id,
            question_order
          )
          VALUES ($1, $2, $3)
          `, [
                    id,
                    data.questionIds[i],
                    i + 1,
                ]);
            }
        }
        await client.query("COMMIT");
        return {
            exam: updatedExam,
            questionIds: data.questionIds || [],
        };
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.updateExamByIdService = updateExamByIdService;
