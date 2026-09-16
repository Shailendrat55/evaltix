"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAssignedExamsController = void 0;
const candidate_service_1 = require("./candidate.service");
const getMyAssignedExamsController = async (req, res) => {
    try {
        const candidateId = req.user.id;
        const exams = await (0, candidate_service_1.getMyAssignedExams)(candidateId);
        return res.status(200).json({
            success: true,
            data: exams,
        });
    }
    catch (error) {
        console.error("Get candidate exams error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to get assigned exams",
        });
    }
};
exports.getMyAssignedExamsController = getMyAssignedExamsController;
