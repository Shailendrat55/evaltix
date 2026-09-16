import { Router } from "express";

import {
  createExamController,
  getAllExamsController,
  getExamByIdController,
  deleteExamByIdController,
  updateExamByIdController,
} from "./exams.controller";


const router = Router();


router.post(
  "/",
  createExamController
);


router.get(
  "/",
  getAllExamsController
);

router.get(
  "/:id",
  getExamByIdController
);

router.delete(
  "/:id",
  deleteExamByIdController
);

router.put(
  "/:id",
  updateExamByIdController
);


export default router;