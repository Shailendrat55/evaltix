"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const question_controller_1 = require("./question.controller");
const questionRouter = (0, express_1.Router)();
// =====================================
// Create Questions
// =====================================
// Create MCQ
questionRouter.post("/mcq", question_controller_1.createMCQ);
// Create Coding Question
questionRouter.post("/coding", question_controller_1.createCoding);
questionRouter.get("/coding", question_controller_1.getQuestions);
// Create Descriptive Question
questionRouter.post("/descriptive", question_controller_1.createDescriptive);
// =====================================
// Get Questions
// =====================================
// Get all questions
questionRouter.get("/", question_controller_1.getQuestions);
// Get single question
questionRouter.get("/:id", question_controller_1.getQuestionById);
// =====================================
// Update Question
// =====================================
questionRouter.put("/:id", question_controller_1.updateQuestion);
// =====================================
// Delete Question
// =====================================
questionRouter.delete("/:id", question_controller_1.deleteQuestion);
exports.default = questionRouter;
