
import express from "express"
import protectRoute from "../middleware/authMiddleware.js";
import {createSession, getMySession, getSessionById, updateSession, deleteSession} from "../controllers/sessionController.js"
const sessionRouter = express.Router()

sessionRouter.post('/create', protectRoute, createSession);
sessionRouter.get("/my-session", protectRoute, getMySession)
sessionRouter.get("/:id", protectRoute, getSessionById)
sessionRouter.put("/:id", protectRoute, updateSession)
sessionRouter.delete("/:id", protectRoute, deleteSession)

export default sessionRouter;
