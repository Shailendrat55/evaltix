import multer, { FileFilterCallback } from "multer";
import { Request, Router } from "express";
import {
  createMCQ,
  createCoding,
  createDescriptive,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  bulkUploadMCQCsv, // <-- add
} from "./question.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const ok =
      ["text/csv", "application/vnd.ms-excel"].includes(file.mimetype) ||
      file.originalname.toLowerCase().endsWith(".csv");
    if (!ok) return cb(new Error("Only .csv files are allowed"));
    cb(null, true);
  },
});

const questionRouter = Router();


// =====================================
// Create Questions
// =====================================

// Create MCQ
questionRouter.post(
  "/mcq",
  createMCQ
);

questionRouter.post("/mcq/bulk-upload-csv", upload.single("file"), bulkUploadMCQCsv);

// Create Coding Question
questionRouter.post(
  "/coding",
  createCoding
);

questionRouter.get(
  "/coding",
  getQuestions
);


// Create Descriptive Question
questionRouter.post(
  "/descriptive",
  createDescriptive
);



// =====================================
// Get Questions
// =====================================

// Get all questions
questionRouter.get(
  "/",
  getQuestions
);


// Get single question
questionRouter.get(
  "/:id",
  getQuestionById
);



// =====================================
// Update Question
// =====================================

questionRouter.put(
  "/:id",
  updateQuestion
);



// =====================================
// Delete Question
// =====================================

questionRouter.delete(
  "/:id",
  deleteQuestion
);


export default questionRouter;