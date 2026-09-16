"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../config/db");
const question_types_1 = require("./question.types");
class QuestionRepository {
    // =====================================================
    // Common Question
    // =====================================================
    async createQuestion(client, data) {
        const query = `
      INSERT INTO questions (
        title,
        description,
        type,
        difficulty,
        marks,
        negative_marks,
        status,
        created_by,
        category
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id;
    `;
        const values = [
            data.title,
            data.description,
            data.type,
            data.difficulty ?? question_types_1.Difficulty.MEDIUM,
            data.marks ?? 1,
            data.negativeMarks ?? 0,
            data.status ?? question_types_1.QuestionStatus.DRAFT,
            data.createdBy,
            data.category
        ];
        const result = await client.query(query, values);
        return result.rows[0].id;
    }
    // MCQ
    async createMCQOptions(client, questionId, options) {
        const query = `
      INSERT INTO mcq_options
      (
        question_id,
        option_text,
        is_correct,
        option_order
      )
      VALUES ($1,$2,$3,$4)
    `;
        for (const option of options) {
            await client.query(query, [
                questionId,
                option.optionText,
                option.isCorrect,
                option.optionOrder,
            ]);
        }
    }
    // Descriptive
    async createDescriptiveQuestion(client, questionId, sampleAnswer, maxWords = 500, minWords) {
        const query = `
      INSERT INTO descriptive_questions
      (
        question_id,
        sample_answer,
        max_words,
        min_Words
      )
      VALUES ($1,$2,$3,$4)
    `;
        await client.query(query, [
            questionId,
            sampleAnswer ?? null,
            maxWords,
            minWords
        ]);
    }
    // =====================================================
    // Coding
    // =====================================================
    async createCodingQuestion(client, questionId, timeLimit, memoryLimit) {
        const query = `
      INSERT INTO coding_questions
      (
        question_id,
        time_limit,
        memory_limit
      )
      VALUES ($1,$2,$3)
      RETURNING id;
    `;
        const result = await client.query(query, [
            questionId,
            timeLimit,
            memoryLimit,
        ]);
        return result.rows[0].id;
    }
    async createStarterCodes(client, codingQuestionId, starterCodes) {
        const query = `
      INSERT INTO starter_codes
      (
        coding_question_id,
        language,
        starter_code
      )
      VALUES ($1,$2,$3)
    `;
        for (const code of starterCodes) {
            await client.query(query, [
                codingQuestionId,
                code.language,
                code.starterCode,
            ]);
        }
    }
    async createTestCases(client, codingQuestionId, testCases) {
        const query = `
      INSERT INTO test_cases
      (
        coding_question_id,
        input,
        expected_output,
        is_hidden,
        weight
      )
      VALUES ($1,$2,$3,$4,$5)
    `;
        for (const testCase of testCases) {
            await client.query(query, [
                codingQuestionId,
                testCase.input,
                testCase.expectedOutput,
                testCase.isHidden,
                testCase.weight,
            ]);
        }
    }
    // =====================================================
    // Common Queries
    // =====================================================
    async getQuestionById(id) {
        const questionResult = await db_1.pool.query(`SELECT * FROM questions WHERE id = $1`, [id]);
        const question = questionResult.rows[0];
        if (!question)
            return null;
        if (question.type === question_types_1.QuestionType.MCQ) {
            const optionsResult = await db_1.pool.query(`SELECT id, option_text AS "optionText", is_correct AS "isCorrect", option_order AS "optionOrder"
             FROM mcq_options
             WHERE question_id = $1
             ORDER BY option_order ASC`, [id]);
            return {
                ...question,
                options: optionsResult.rows,
            };
        }
        if (question.type === question_types_1.QuestionType.DESCRIPTIVE) {
            const descResult = await db_1.pool.query(`SELECT sample_answer AS "sampleAnswer", max_words AS "maxWords", min_words AS "minWords"
             FROM descriptive_questions
             WHERE question_id = $1`, [id]);
            return {
                ...question,
                ...(descResult.rows[0] ?? {}),
            };
        }
        if (question.type === question_types_1.QuestionType.CODING) {
            const codingResult = await db_1.pool.query(`SELECT id, time_limit AS "timeLimit", memory_limit AS "memoryLimit"
             FROM coding_questions
             WHERE question_id = $1`, [id]);
            const codingQuestion = codingResult.rows[0];
            if (!codingQuestion) {
                return { ...question, starterCodes: [], testCases: [] };
            }
            const [starterCodesResult, testCasesResult] = await Promise.all([
                db_1.pool.query(`SELECT language, starter_code AS "starterCode"
                 FROM starter_codes
                 WHERE coding_question_id = $1`, [codingQuestion.id]),
                db_1.pool.query(`SELECT id, input, expected_output AS "expectedOutput", is_hidden AS "isHidden", weight
                 FROM test_cases
                 WHERE coding_question_id = $1`, [codingQuestion.id]),
            ]);
            return {
                ...question,
                timeLimit: codingQuestion.timeLimit,
                memoryLimit: codingQuestion.memoryLimit,
                starterCodes: starterCodesResult.rows,
                testCases: testCasesResult.rows,
            };
        }
        return question;
    }
    async getAllQuestions() {
        const result = await db_1.pool.query(`
      SELECT *
      FROM questions
      ORDER BY created_at DESC
    `);
        return result.rows;
    }
    async updateQuestion(client, id, data) {
        const query = `
        UPDATE questions
        SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            difficulty = COALESCE($3, difficulty),
            marks = COALESCE($4, marks),
            negative_marks = COALESCE($5, negative_marks),
            category = COALESCE($6, category),
            updated_at = NOW()
        WHERE id = $7
        RETURNING *;
    `;
        const values = [
            data.title ?? null,
            data.description ?? null,
            data.difficulty ?? null,
            data.marks ?? null,
            data.negativeMarks ?? null,
            data.category ?? null,
            id,
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    async updateMCQOptions(client, questionId, options) {
        await client.query(`DELETE FROM mcq_options WHERE question_id = $1`, [questionId]);
        const query = `
        INSERT INTO mcq_options
        (
            question_id,
            option_text,
            is_correct,
            option_order
        )
        VALUES ($1, $2, $3, $4)
    `;
        for (const option of options) {
            await client.query(query, [
                questionId,
                option.optionText,
                option.isCorrect,
                option.optionOrder,
            ]);
        }
    }
    async updateDescriptiveQuestion(client, questionId, sampleAnswer, maxWords = 500, minWords = 200) {
        const query = `
        UPDATE descriptive_questions
        SET
            sample_answer = $2,
            max_words = $3,
            min_words=$4
        WHERE question_id = $1
    `;
        const result = await client.query(query, [
            questionId,
            sampleAnswer ?? null,
            maxWords,
            minWords
        ]);
        if (result.rowCount === 0) {
            await client.query(`
            INSERT INTO descriptive_questions
            (
                question_id,
                sample_answer,
                max_words
            )
            VALUES ($1, $2, $3)
            `, [
                questionId,
                sampleAnswer ?? null,
                maxWords,
            ]);
        }
    }
    async updateCodingQuestion(client, questionId, timeLimit, memoryLimit) {
        const result = await client.query(`
        UPDATE coding_questions
        SET
            time_limit = $2,
            memory_limit = $3
        WHERE question_id = $1
        RETURNING id
        `, [questionId, timeLimit, memoryLimit]);
        if (result.rows.length > 0) {
            return result.rows[0].id;
        }
        const inserted = await client.query(`
        INSERT INTO coding_questions
        (
            question_id,
            time_limit,
            memory_limit
        )
        VALUES ($1, $2, $3)
        RETURNING id
        `, [questionId, timeLimit, memoryLimit]);
        return inserted.rows[0].id;
    }
    async updateStarterCodes(client, codingQuestionId, starterCodes) {
        await client.query(`DELETE FROM starter_codes WHERE coding_question_id = $1`, [codingQuestionId]);
        const query = `
        INSERT INTO starter_codes
        (
            coding_question_id,
            language,
            starter_code
        )
        VALUES ($1, $2, $3)
    `;
        for (const code of starterCodes) {
            await client.query(query, [
                codingQuestionId,
                code.language,
                code.starterCode,
            ]);
        }
    }
    async updateTestCases(client, codingQuestionId, testCases) {
        await client.query(`DELETE FROM test_cases WHERE coding_question_id = $1`, [codingQuestionId]);
        const query = `
        INSERT INTO test_cases
        (
            coding_question_id,
            input,
            expected_output,
            is_hidden,
            weight
        )
        VALUES ($1, $2, $3, $4, $5)
    `;
        for (const testCase of testCases) {
            await client.query(query, [
                codingQuestionId,
                testCase.input,
                testCase.expectedOutput,
                testCase.isHidden,
                testCase.weight,
            ]);
        }
    }
    async deleteQuestion(id) {
        await db_1.pool.query(`
      DELETE FROM questions
      WHERE id = $1
      `, [id]);
    }
}
exports.default = new QuestionRepository();
