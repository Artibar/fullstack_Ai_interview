import express from "express";
import protectRoute  from '../middleware/authMiddleware.js'
import { login, signup, getProfile} from "../controllers/authController.js"


const authRouter = express.Router()

authRouter.post('/login', login)
authRouter.post('/signup', signup)
authRouter.get('/profile', protectRoute, getProfile)



export default authRouter;