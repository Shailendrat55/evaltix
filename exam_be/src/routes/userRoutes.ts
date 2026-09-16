import express from 'express';

const hireRouter = express.Router();

// const { protectRoute } = require('../middleware/index');
// const { access, startExam, submitExam, getResult, getUserSummary } = require("../controllers/hiring-examController/index")

// hireRouter.post('/access', access);
// hireRouter.post('/exam/start', protectRoute, startExam);
// hireRouter.post('/exam/submit', protectRoute, submitExam);
// hireRouter.post('/exam/start/:userId', startExam);
// hireRouter.post('/exam/submit/:userId', submitExam);
// hireRouter.get('/answer/list/:userId', getResult);
// hireRouter.get('/result/summary/:userId', getUserSummary);

export default hireRouter;