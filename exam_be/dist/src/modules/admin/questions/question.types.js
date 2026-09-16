"use strict";
// ==========================
// Enums
// ==========================
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionStatus = exports.Difficulty = exports.QuestionType = void 0;
var QuestionType;
(function (QuestionType) {
    QuestionType["MCQ"] = "MCQ";
    QuestionType["CODING"] = "CODING";
    QuestionType["DESCRIPTIVE"] = "DESCRIPTIVE";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var Difficulty;
(function (Difficulty) {
    Difficulty["EASY"] = "EASY";
    Difficulty["MEDIUM"] = "MEDIUM";
    Difficulty["HARD"] = "HARD";
})(Difficulty || (exports.Difficulty = Difficulty = {}));
var QuestionStatus;
(function (QuestionStatus) {
    QuestionStatus["DRAFT"] = "DRAFT";
    QuestionStatus["ACTIVE"] = "ACTIVE";
    QuestionStatus["ARCHIVED"] = "ARCHIVED";
})(QuestionStatus || (exports.QuestionStatus = QuestionStatus = {}));
