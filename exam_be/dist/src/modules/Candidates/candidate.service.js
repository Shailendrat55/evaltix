"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAssignedExams = getMyAssignedExams;
const candidate_repository_1 = require("./candidate.repository");
async function getMyAssignedExams(candidateId) {
    if (!candidateId) {
        throw new Error("Candidate ID is required");
    }
    return await (0, candidate_repository_1.getCandidateAssignedExams)(candidateId);
}
