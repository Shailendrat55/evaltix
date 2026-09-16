import { parse } from "csv-parse/sync";
import { pool } from "../../../../config/db";
import questionRepository from "../question.repository";
import { QuestionType, Difficulty, QuestionStatus } from "../question.types";

export interface CsvMCQRow {
    Category: string;
    Title: string;
    Description: string;
    Difficulty?: string;
    Marks?: string;
    NegativeMarks?: string;
    OptionA: string;
    OptionB: string;
    OptionC: string;
    OptionD?: string;
    CorrectOption: string; // "A" | "B" | "C" | "D"
}

interface BulkUploadError {
    row: number;
    message: string;
}

export interface BulkUploadResult {
    createdCount: number;
    createdIds: string[];
    totalRows: number;
    errors: BulkUploadError[];
}

function parseCsv(buffer: Buffer): CsvMCQRow[] {
    return parse(buffer, {
        columns: true,          // use header row as keys
        skip_empty_lines: true,
        trim: true,
        bom: true,               // handle UTF-8 BOM from Excel-exported CSVs
    });
}

export async function bulkCreateMCQFromCsv(
    buffer: Buffer,
    createdBy: string
): Promise<BulkUploadResult> {
    let rows: CsvMCQRow[];

    try {
        rows = parseCsv(buffer);
    } catch (err) {
        throw new Error(`Failed to parse CSV: ${(err as Error).message}`);
    }

    const errors: BulkUploadError[] = [];
    const createdIds: string[] = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // account for header row

        if (!row.Title?.trim() || !row.Description?.trim()) {
            errors.push({ row: rowNum, message: "Title and Description are required" });
            continue;
        }

        const options = [
            { text: row.OptionA, key: "A" },
            { text: row.OptionB, key: "B" },
            { text: row.OptionC, key: "C" },
            { text: row.OptionD, key: "D" },
        ].filter((o) => o.text && String(o.text).trim() !== "");

        if (options.length < 2) {
            errors.push({ row: rowNum, message: "At least 2 non-empty options are required" });
            continue;
        }

        const correctKey = String(row.CorrectOption ?? "").trim().toUpperCase();
        if (!options.some((o) => o.key === correctKey)) {
            errors.push({
                row: rowNum,
                message: `CorrectOption "${row.CorrectOption}" does not match any filled option`,
            });
            continue;
        }

        const marks = row.Marks ? Number(row.Marks) : 1;
        const negativeMarks = row.NegativeMarks ? Number(row.NegativeMarks) : 0;

        if (Number.isNaN(marks) || Number.isNaN(negativeMarks)) {
            errors.push({ row: rowNum, message: "Marks/NegativeMarks must be numeric" });
            continue;
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const questionId = await questionRepository.createQuestion(client, {
                title: row.Title.trim(),
                description: row.Description.trim(),
                type: QuestionType.MCQ,
                difficulty: (row.Difficulty?.trim().toUpperCase() as Difficulty) || Difficulty.MEDIUM,
                marks,
                negativeMarks,
                createdBy,
                status: QuestionStatus.DRAFT,
                category: row.Category?.trim() || "Uncategorized",
            });

            await questionRepository.createMCQOptions(
                client,
                questionId,
                options.map((o, idx) => ({
                    optionText: String(o.text).trim(),
                    isCorrect: o.key === correctKey,
                    optionOrder: idx + 1,
                }))
            );

            await client.query("COMMIT");
            createdIds.push(questionId);
        } catch (err) {
            await client.query("ROLLBACK");
            errors.push({ row: rowNum, message: (err as Error).message });
        } finally {
            client.release();
        }
    }

    return { createdCount: createdIds.length, createdIds, totalRows: rows.length, errors };
}