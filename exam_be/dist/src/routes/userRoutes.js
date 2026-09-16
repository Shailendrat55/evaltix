"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hireRouter = express_1.default.Router();
// const { protectRoute } = require('../middleware/index');
// const { access, startExam, submitExam, getResult, getUserSummary } = require("../controllers/hiring-examController/index")
// hireRouter.post('/access', access);
// hireRouter.post('/exam/start', protectRoute, startExam);
// hireRouter.post('/exam/submit', protectRoute, submitExam);
// hireRouter.post('/exam/start/:userId', startExam);
// hireRouter.post('/exam/submit/:userId', submitExam);
// hireRouter.get('/answer/list/:userId', getResult);
// hireRouter.get('/result/summary/:userId', getUserSummary);
exports.default = hireRouter;
