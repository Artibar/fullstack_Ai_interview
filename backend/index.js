import dotenv from "dotenv"
dotenv.config()
import connectToDB from "./config/db.js";
import express from "express"
import path from 'path'
import cors from "cors";
import { fileURLToPath } from 'url';


import authRouter from "./routes/authRoutes.js"
import sessionRouter from "./routes/sessionRoutes.js"
import questionRouter from "./routes/questionRoutes.js";
import protectRoute from "./middleware/authMiddleware.js";
import {generateInterviewQuestion, generateConceptExplanation } from "./controllers/aiController.js"

console.log("🔑 Environment Variables Check:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_DB:", process.env.MONGO_DB ? "✅ Present" : "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Present" : "❌ Missing");
console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "✅ Present" : "❌ Missing");


const app = express()

app.use(cors({
    origin:["http://localhost:5173","http://localhost:5174"],
    methods:['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders:["Content-Type", "Authorization"],
    credentials: true
}))

app.use(express.json())

app.use('/auth', authRouter)
app.use('/session', sessionRouter)
app.use('/question', questionRouter)

app.post('/ai/generate-questions', protectRoute, generateInterviewQuestion)
app.post('/ai/generate-explanation', protectRoute, generateConceptExplanation)
if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../frontend/dist')))


    app.get('/*', (req, res)=>{
        res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'))
    })
}
const __filename = fileURLToPath(import.meta.url);


const PORT = process.env.PORT || 3000;
const __dirname = path.resolve()

app.listen(PORT, ()=>{
    connectToDB()
    console.log(`Server is running on PORT: ${PORT}`)
})

