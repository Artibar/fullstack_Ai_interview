import dotenv from "dotenv"
dotenv.config()
import connectToDB from "./config/db.js";
import express from "express"
import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from "cors";

import authRouter from "./routes/authRoutes.js"
import sessionRouter from "./routes/sessionRoutes.js"
import questionRouter from "./routes/questionRoutes.js";
import protectRoute from "./middleware/authMiddleware.js";
import {generateInterviewQuestion, generateConceptExplanation } from "./controllers/aiController.js"

// MUST define __dirname FIRST before using it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔑 Environment Variables Check:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_DB:", process.env.MONGO_DB ? "✅ Present" : "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Present" : "❌ Missing");
console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "✅ Present" : "❌ Missing");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("__dirname:", __dirname);

const app = express()

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://fullstack-ai-interview.onrender.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))

app.use(express.json())

// API routes
app.use('/auth', authRouter)
app.use('/session', sessionRouter)
app.use('/question', questionRouter)
app.post('/ai/generate-questions', protectRoute, generateInterviewQuestion)
app.post('/ai/generate-explanation', protectRoute, generateConceptExplanation)

// Serve frontend - check if dist exists
const distPath = path.join(__dirname, '../frontend/dist');
console.log("📁 Dist path:", distPath);
console.log("📁 Dist exists?", fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log("📁 Files in dist:", files);
    
    app.use(express.static(distPath));
    
    app.get('(.*)', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log("❌ DIST FOLDER NOT FOUND!");
    app.get('*', (req, res) => {
        res.status(500).send('Frontend not built. Check build logs on Render.');
    });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    connectToDB()
    console.log(`Server is running on PORT: ${PORT}`)
})

