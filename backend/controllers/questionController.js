
import express from "express"
import Question from '../models/Question.js'
import Session from "../models/Session.js"
import {generateConceptExplanation} from "./aiController.js"


export const addQuestion = async (req, res) => {
    try {
        const { sessionId, question } = req.body;
        
        // Fix validation - based on your data structure, question should be array
        if (!sessionId || !question || !Array.isArray(question)) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Fix the mapping - your data structure uses 'question' not 'questions'
        const createQuestion = await Question.insertMany(
            question.map((q) => ({
                session: sessionId,
                question: q.question, // Fixed: was 'questions', should be 'question'
                answer: q.answer || "", // Provide default empty string
                isPinned: q.isPinned || false,
                note: q.note || ""
            }))
        );

        // Add question IDs to session
        session.question.push(...createQuestion.map((q) => q._id));
        await session.save();

        return res.status(201).json({
            success: true,
            message: "Questions added successfully",
            data: createQuestion
        });

    } catch (error) {
        console.log("Error in addQuestion controller", error.message);
        return res.status(500).json({
            message: "Internal server error", 
            error: error.message
        });
    }
};

export const pinQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Toggle the pinned status
        question.isPinned = !question.isPinned;
        await question.save();

        res.status(200).json({ 
            success: true, 
            message: `Question ${question.isPinned ? 'pinned' : 'unpinned'} successfully`,
            data: question 
        });

    } catch (error) {
        console.log("Error in pinQuestion controller", error.message);
        res.status(500).json({
            message: "Internal server error", 
            error: error.message
        });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { note } = req.body;
        
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        question.note = note || "";
        await question.save();

        res.status(200).json({ 
            success: true, 
            message: "Question updated successfully",
            data: question 
        });

    } catch (error) {
        console.log("Error in updateQuestion controller", error.message);
        res.status(500).json({
            message: "Internal server error", 
            error: error.message
        });
    }
};

// ADD THESE NEW CONTROLLERS FOR ANSWER HANDLING

export const generateQuestionAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        
        console.log(`🚀 Generating answer for question ID: ${questionId}`);

        // Find the question
        const question = await Question.findById(questionId);
        if (!question) {
            console.log(`❌ Question not found: ${questionId}`);
            return res.status(404).json({ message: "Question not found" });
        }

        console.log(`📝 Question text: ${question.question}`);

        // Generate explanation using the AI
        const explanation = await generateConceptExplanation (question.question);
        
        console.log(`✅ Generated explanation for: ${question.question.substring(0, 50)}...`);

        // Update the question document with the generated answer
        question.answer = JSON.stringify(explanation);
        question.updatedAt = new Date();
        await question.save();

        console.log(`💾 Saved answer to database for question ID: ${questionId}`);

        return res.status(200).json({
            success: true,
            message: "Answer generated successfully",
            data: {
                questionId: question._id,
                question: question.question,
                answer: explanation,
                updatedAt: question.updatedAt
            }
        });

    } catch (error) {
        console.error('❌ Error generating answer:', error);
        return res.status(500).json({
            message: 'Failed to generate answer',
            error: error.message
        });
    }
};


export const getQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        
        const question = await Question.findById(questionId).populate('session', 'role experience topicsToFocus');
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        return res.status(200).json({
            success: true,
            data: question
        });

    } catch (error) {
        console.error('Error fetching question:', error);
        return res.status(500).json({
            message: 'Failed to fetch question',
            error: error.message
        });
    }
};

export const updateQuestionAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { answer } = req.body;

        if (!answer) {
            return res.status(400).json({ message: "Answer is required" });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        question.answer = typeof answer === 'string' ? answer : JSON.stringify(answer);
        question.updatedAt = new Date();
        await question.save();

        return res.status(200).json({
            success: true,
            message: "Answer updated successfully",
            data: question
        });

    } catch (error) {
        console.error('Error updating answer:', error);
        return res.status(500).json({
            message: 'Failed to update answer',
            error: error.message
        });
    }
};

export const getSessionQuestions = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Verify session exists
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Get all questions for this session
        const questions = await Question.find({ session: sessionId })
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            data: questions,
            count: questions.length
        });

    } catch (error) {
        console.error('Error fetching session questions:', error);
        return res.status(500).json({
            message: 'Failed to fetch session questions',
            error: error.message
        });
    }
};