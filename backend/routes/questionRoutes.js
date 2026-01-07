
import express from "express";
import { addQuestion, pinQuestion, updateQuestion,  generateQuestionAnswer, getQuestion, updateQuestionAnswer,
    getSessionQuestions } from "../controllers/questionController.js";
import protectRoute from '../middleware/authMiddleware.js'

const questionRouter = express.Router()

questionRouter.post('/add', protectRoute, addQuestion)
questionRouter.post('/:id/pin', protectRoute, pinQuestion)
questionRouter.post('/:id/note', protectRoute, updateQuestion)


questionRouter.post('/:questionId/generate-answer', protectRoute, generateQuestionAnswer);
questionRouter.get('/:questionId', protectRoute, getQuestion);
questionRouter.put('/:questionId/answer', protectRoute, updateQuestionAnswer);
questionRouter.get('/session/:sessionId/questions', protectRoute, getSessionQuestions);


export default questionRouter;