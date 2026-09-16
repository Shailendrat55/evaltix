import pool from "../../../config";

export async function createAttemptWithQuestions(params: {
  assignmentId: string;
  candidateId: string;
  examId: number;
  startedAt: Date;
  expiresAt: Date;
  shuffle: boolean;
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Create attempt
    const attemptResult = await client.query(
      `
      INSERT INTO exam_attempts (
        assignment_id,
        candidate_id,
        exam_id,
        status,
        started_at,
        expires_at
      )
      VALUES (
        $1,
        $2,
        $3,
        'IN_PROGRESS',
        $4,
        $5
      )
      RETURNING
        id,
        assignment_id AS "assignmentId",
        candidate_id AS "candidateId",
        exam_id AS "examId",
        status,
        started_at AS "startedAt",
        expires_at AS "expiresAt"
      `,
      [
        params.assignmentId,
        params.candidateId,
        params.examId,
        params.startedAt,
        params.expiresAt,
      ]
    );

    const attempt = attemptResult.rows[0];

    // 2. Get questions assigned to this exam
    const questionResult = await client.query(
      `
      SELECT question_id
      FROM exam_questions
      WHERE exam_id = $1
      ORDER BY question_order ASC NULLS LAST
      `,
      [params.examId]
    );

    let questions = questionResult.rows;

    // 3. Shuffle questions if enabled
    if (params.shuffle) {
      questions = [...questions].sort(
        () => Math.random() - 0.5
      );
    }

    // 4. Snapshot questions for this attempt
    for (let i = 0; i < questions.length; i++) {
      await client.query(
        `
        INSERT INTO exam_attempt_questions (
          attempt_id,
          question_id,
          question_order
        )
        VALUES ($1, $2, $3)
        `,
        [
          attempt.id,
          questions[i].question_id,
          i + 1,
        ]
      );
    }

    await client.query("COMMIT");

    return {
      attempt,
      totalQuestions: questions.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findAttemptById(
  attemptId: string
) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      assignment_id AS "assignmentId",
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      started_at AS "startedAt",
      submitted_at AS "submittedAt",
      expires_at AS "expiresAt",
      total_questions AS "totalQuestions",
      attempted_questions AS "attemptedQuestions",
      total_marks AS "totalMarks",
      obtained_marks AS "obtainedMarks",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM exam_attempts
    WHERE id = $1
    `,
    [attemptId]
  );

  return rows[0] ?? null;
}

export async function getAttemptQuestions(
  attemptId: string
) {
  const { rows } = await pool.query(
    `
    SELECT
      eaq.id AS "attemptQuestionId",
      eaq.question_id AS "questionId",
      eaq.question_order AS "questionOrder",

      q.type,
      q.title,
      q.description,
      q.category,
      q.difficulty,
      q.marks,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', qo.id,
              'text', qo.option_text
            )
            ORDER BY qo.option_order ASC
          )
          FROM mcq_options qo
          WHERE qo.question_id = q.id
        ),
        '[]'::json
      ) AS options

    FROM exam_attempt_questions eaq

    INNER JOIN questions q
      ON q.id = eaq.question_id

    WHERE eaq.attempt_id = $1

    ORDER BY eaq.question_order ASC
    `,
    [attemptId]
  );

  return rows;
}

export async function findActiveAttemptByAssignmentId(
  assignmentId: string
) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      assignment_id AS "assignmentId",
      candidate_id AS "candidateId",
      exam_id AS "examId",
      status,
      started_at AS "startedAt",
      submitted_at AS "submittedAt",
      expires_at AS "expiresAt",
      total_questions AS "totalQuestions",
      attempted_questions AS "attemptedQuestions",
      total_marks AS "totalMarks",
      obtained_marks AS "obtainedMarks",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM exam_attempts
    WHERE assignment_id = $1
      AND status = 'IN_PROGRESS'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [assignmentId]
  );

  return rows[0] ?? null;
}

export async function saveAnswer(params: {
  attemptId: string;
  attemptQuestionId: string;
  questionId: string;
  answerText?: string | null;
  selectedOptionId?: string | null;
  codeAnswer?: string | null;
  language?: string | null;
}) {
  const { rows } = await pool.query(
    `
    INSERT INTO exam_attempt_answers (
      attempt_id,
      attempt_question_id,
      question_id,
      answer_text,
      selected_option_id,
      code_answer,
      language,
      answered_at,
      updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
    )
    ON CONFLICT (attempt_id, attempt_question_id)
    DO UPDATE SET
      answer_text = EXCLUDED.answer_text,
      selected_option_id = EXCLUDED.selected_option_id,
      code_answer = EXCLUDED.code_answer,
      language = EXCLUDED.language,
      updated_at = NOW()
    RETURNING
      id,
      attempt_id AS "attemptId",
      attempt_question_id AS "attemptQuestionId",
      question_id AS "questionId",
      answer_text AS "answerText",
      selected_option_id AS "selectedOptionId",
      code_answer AS "codeAnswer",
      language,
      is_correct AS "isCorrect",
      marks_obtained AS "marksObtained",
      answered_at AS "answeredAt",
      updated_at AS "updatedAt"
    `,
    [
      params.attemptId,
      params.attemptQuestionId,
      params.questionId,
      params.answerText ?? null,
      params.selectedOptionId ?? null,
      params.codeAnswer ?? null,
      params.language ?? null,
    ]
  );

  return rows[0];
}

export async function submitAttempt(attemptId: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Get attempt and lock it
    const attemptResult = await client.query(
      `
      SELECT
        id,
        assignment_id AS "assignmentId",
        candidate_id AS "candidateId",
        exam_id AS "examId",
        status,
        started_at AS "startedAt",
        expires_at AS "expiresAt"
      FROM exam_attempts
      WHERE id = $1
      FOR UPDATE
      `,
      [attemptId]
    );

    const attempt = attemptResult.rows[0];

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    // 2. Check status
    if (attempt.status !== "IN_PROGRESS") {
      throw new Error(
        `Attempt is already ${attempt.status}`
      );
    }

    // 3. Get all questions + answers
    const answerResult = await client.query(
      `
      SELECT
        a.id AS "answerId",
        a.attempt_question_id AS "attemptQuestionId",
        a.question_id AS "questionId",
        a.selected_option_id AS "selectedOptionId",

        q.type,
        q.marks,

        mo.is_correct AS "isCorrectOption"

      FROM exam_attempt_answers a

      INNER JOIN questions q
        ON q.id = a.question_id

      LEFT JOIN mcq_options mo
        ON mo.id = a.selected_option_id

      WHERE a.attempt_id = $1
      `,
      [attemptId]
    );

    let obtainedMarks = 0;
    let attemptedQuestions = 0;

    for (const answer of answerResult.rows) {
      const marks = Number(answer.marks || 0);

      // Candidate attempted this question
      if (
        answer.selectedOptionId ||
        answer.answerText ||
        answer.codeAnswer
      ) {
        attemptedQuestions++;
      }

      // Currently automatically evaluate MCQ
      if (answer.type === "MCQ") {
        if (answer.isCorrectOption === true) {
          obtainedMarks += marks;

          await client.query(
            `
            UPDATE exam_attempt_answers
            SET
              is_correct = true,
              marks_obtained = $1,
              updated_at = NOW()
            WHERE id = $2
            `,
            [marks, answer.answerId]
          );
        } else {
          await client.query(
            `
            UPDATE exam_attempt_answers
            SET
              is_correct = false,
              marks_obtained = 0,
              updated_at = NOW()
            WHERE id = $1
            `,
            [answer.answerId]
          );
        }
      }
    }

    // 4. Get total questions
    const questionCountResult = await client.query(
      `
      SELECT COUNT(*)::int AS count
      FROM exam_attempt_questions
      WHERE attempt_id = $1
      `,
      [attemptId]
    );

    const totalQuestions =
      questionCountResult.rows[0].count;

    // 5. Calculate total marks
    const totalMarksResult = await client.query(
      `
      SELECT COALESCE(SUM(q.marks), 0) AS total
      FROM exam_attempt_questions eaq
      INNER JOIN questions q
        ON q.id = eaq.question_id
      WHERE eaq.attempt_id = $1
      `,
      [attemptId]
    );

    const totalMarks = Number(
      totalMarksResult.rows[0].total
    );

    // 6. Update attempt
    const updatedAttemptResult = await client.query(
      `
      UPDATE exam_attempts
      SET
        status = 'SUBMITTED',
        submitted_at = NOW(),
        total_questions = $2,
        attempted_questions = $3,
        total_marks = $4,
        obtained_marks = $5,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        assignment_id AS "assignmentId",
        candidate_id AS "candidateId",
        exam_id AS "examId",
        status,
        started_at AS "startedAt",
        submitted_at AS "submittedAt",
        expires_at AS "expiresAt",
        total_questions AS "totalQuestions",
        attempted_questions AS "attemptedQuestions",
        total_marks AS "totalMarks",
        obtained_marks AS "obtainedMarks"
      `,
      [
        attemptId,
        totalQuestions,
        attemptedQuestions,
        totalMarks,
        obtainedMarks,
      ]
    );

    const updatedAttempt =
      updatedAttemptResult.rows[0];

    // 7. Mark assignment completed
    await client.query(
      `
      UPDATE exam_assignments
      SET
        status = 'COMPLETED'
      WHERE id = $1
      `,
      [attempt.assignmentId]
    );

    await client.query("COMMIT");

    return updatedAttempt;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}