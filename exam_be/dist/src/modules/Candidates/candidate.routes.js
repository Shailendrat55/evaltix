"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const candidate_controller_1 = require("./candidate.controller");
const authenticate_1 = require("../../middleware/authenticate");
const requireRole_1 = require("../../middleware/requireRole");
const router = (0, express_1.Router)();
router.get("/exams", authenticate_1.authenticate, (0, requireRole_1.requireRole)("CANDIDATE"), candidate_controller_1.getMyAssignedExamsController);
exports.default = router;
