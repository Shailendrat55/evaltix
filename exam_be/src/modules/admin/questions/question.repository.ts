import { PoolClient } from "pg";
import { pool } from "../../../config/db";
import {
    QuestionType,
    Difficulty,
    QuestionStatus,
    MCQOption,
    StarterCode,
    TestCase,
} from "./question.types";

class QuestionRepository {
    // =====================================================
    // Common Question
    // =====================================================

    async createQuestion(
        client: PoolClient,
        data: {
            title: string;
            description: string;
            type: QuestionType;
            difficulty?: Difficulty;
            marks?: number;
            negativeMarks?: number;
            createdBy: string;
            status?: QuestionStatus;
            category: string
        }
    ): Promise<string> {
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
            data.difficulty ?? Difficulty.MEDIUM,
            data.marks ?? 1,
            data.negativeMarks ?? 0,
            data.status ?? QuestionStatus.DRAFT,
            data.createdBy,
            data.category
        ];

        const result = await client.query(query, values);

        return result.rows[0].id;
    }

    // MCQ

    async createMCQOptions(
        client: PoolClient,
        questionId: string,
        options: MCQOption[]
    ) {
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

    async createDescriptiveQuestion(
        client: PoolClient,
        questionId: string,
        sampleAnswer?: string,
        maxWords: number = 500,
        minWords?: number
    ) {
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

    async createCodingQuestion(
        client: PoolClient,
        questionId: string,
        timeLimit: number,
        memoryLimit: number
    ): Promise<string> {
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

    async createStarterCodes(
        client: PoolClient,
        codingQuestionId: string,
        starterCodes: StarterCode[]
    ) {
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

    async createTestCases(
        client: PoolClient,
        codingQuestionId: string,
        testCases: TestCase[]
    ) {
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

    async getQuestionById(id: string) {
        const questionResult = await pool.query(
            `SELECT * FROM questions WHERE id = $1`,
            [id]
        );

        const question = questionResult.rows[0];
        if (!question) return null;

        if (question.type === QuestionType.MCQ) {
            const optionsResult = await pool.query(
                `SELECT id, option_text AS "optionText", is_correct AS "isCorrect", option_order AS "optionOrder"
             FROM mcq_options
             WHERE question_id = $1
             ORDER BY option_order ASC`,
                [id]
            );

            return {
                ...question,
                options: optionsResult.rows,
            };
        }

        if (question.type === QuestionType.DESCRIPTIVE) {
            const descResult = await pool.query(
                `SELECT sample_answer AS "sampleAnswer", max_words AS "maxWords", min_words AS "minWords"
             FROM descriptive_questions
             WHERE question_id = $1`,
                [id]
            );

            return {
                ...question,
                ...(descResult.rows[0] ?? {}),
            };
        }

        if (question.type === QuestionType.CODING) {
            const codingResult = await pool.query(
                `SELECT id, time_limit AS "timeLimit", memory_limit AS "memoryLimit"
             FROM coding_questions
             WHERE question_id = $1`,
                [id]
            );

            const codingQuestion = codingResult.rows[0];
            if (!codingQuestion) {
                return { ...question, starterCodes: [], testCases: [] };
            }

            const [starterCodesResult, testCasesResult] = await Promise.all([
                pool.query(
                    `SELECT language, starter_code AS "starterCode"
                 FROM starter_codes
                 WHERE coding_question_id = $1`,
                    [codingQuestion.id]
                ),
                pool.query(
                    `SELECT id, input, expected_output AS "expectedOutput", is_hidden AS "isHidden", weight
                 FROM test_cases
                 WHERE coding_question_id = $1`,
                    [codingQuestion.id]
                ),
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

    async getAllQuestions(page: number = 1, pageSize: number = 9) {
        const safePage = Math.max(1, page);
        const safePageSize = Math.max(1, pageSize);
        const offset = (safePage - 1) * safePageSize;

        const result = await pool.query(
            `
      SELECT *, COUNT(*) OVER() AS total_count
      FROM questions
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `,
            [safePageSize, offset]
        );

        const totalCount = result.rows.length > 0 ? Number(result.rows[0].total_count) : 0;
        const totalPages = Math.ceil(totalCount / safePageSize);

        const data = result.rows.map(({ total_count, ...row }) => row);

        return {
            data,
            pagination: {
                page: safePage,
                pageSize: safePageSize,
                totalCount,
                totalPages,
            },
        };
    }

    async updateQuestion(
        client: PoolClient,
        id: string,
        data: {
            title?: string;
            description?: string;
            difficulty?: Difficulty;
            marks?: number;
            negativeMarks?: number;
            category?: string;
        }
    ) {
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

    async updateMCQOptions(
        client: PoolClient,
        questionId: string,
        options: MCQOption[]
    ) {
        await client.query(
            `DELETE FROM mcq_options WHERE question_id = $1`,
            [questionId]
        );

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

    async updateDescriptiveQuestion(
        client: PoolClient,
        questionId: string,
        sampleAnswer?: string,
        maxWords: number = 500,
        minWords: number = 200
    ) {
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
            await client.query(
                `
            INSERT INTO descriptive_questions
            (
                question_id,
                sample_answer,
                max_words
            )
            VALUES ($1, $2, $3)
            `,
                [
                    questionId,
                    sampleAnswer ?? null,
                    maxWords,
                ]
            );
        }
    }

    async updateCodingQuestion(
        client: PoolClient,
        questionId: string,
        timeLimit: number,
        memoryLimit: number
    ) {
        const result = await client.query(
            `
        UPDATE coding_questions
        SET
            time_limit = $2,
            memory_limit = $3
        WHERE question_id = $1
        RETURNING id
        `,
            [questionId, timeLimit, memoryLimit]
        );

        if (result.rows.length > 0) {
            return result.rows[0].id;
        }

        const inserted = await client.query(
            `
        INSERT INTO coding_questions
        (
            question_id,
            time_limit,
            memory_limit
        )
        VALUES ($1, $2, $3)
        RETURNING id
        `,
            [questionId, timeLimit, memoryLimit]
        );

        return inserted.rows[0].id;
    }

    async updateStarterCodes(
        client: PoolClient,
        codingQuestionId: string,
        starterCodes: StarterCode[]
    ) {
        await client.query(
            `DELETE FROM starter_codes WHERE coding_question_id = $1`,
            [codingQuestionId]
        );

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

    async updateTestCases(
        client: PoolClient,
        codingQuestionId: string,
        testCases: TestCase[]
    ) {
        await client.query(
            `DELETE FROM test_cases WHERE coding_question_id = $1`,
            [codingQuestionId]
        );

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



    async deleteQuestion(id: string) {
        await pool.query(
            `
      DELETE FROM questions
      WHERE id = $1
      `,
            [id]
        );
    }

}

export default new QuestionRepository();