import express from "express"
import Session from "../models/Session.js"
import Question from "../models/Question.js"
import generateQuestions from "../utils/generateQuestion.js";
const guessQuestionText = (item) => {
  if (!item || typeof item !== 'object') return null;
  // Try common keys in order of preference
  return (
    (item.question && String(item.question).trim()) ||
    (item.questions && String(item.questions).trim()) ||
    (item.q && String(item.q).trim()) ||
    (item.prompt && String(item.prompt).trim()) ||
    (item.title && String(item.title).trim()) ||
    null
  );
};

const guessAnswerText = (item) => {
  if (!item || typeof item !== 'object') return '';
  return (
    (item.answer && String(item.answer).trim()) ||
    (item.modelAnswer && String(item.modelAnswer).trim()) ||
    (item.answers && String(item.answers).trim()) ||
    (item.a && String(item.a).trim()) ||
    ''
  );
};



export const createSession = async (req, res) => {
  try {
    console.log("Received req.body:", req.body);
    const { role, experience, topicsToFocus, description } = req.body;
    let { question } = req.body;

    // Parse question if it's a JSON string
    if (typeof question === 'string') {
      try {
        question = JSON.parse(question);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid JSON in "question" field.' });
      }
    }

    // If no questions provided, generate them dynamically
    if (!question || question.length === 0) {
      question = await generateQuestions({ role, experience, topicsToFocus, description });
    }

    // Normalize question format
    const normalized = [];
    const invalidItems = [];

    question.forEach((item, idx) => {
      const qText = guessQuestionText(item);
      const aText = guessAnswerText(item);
      if (!qText) {
        invalidItems.push({ index: idx, item });
      } else {
        normalized.push({ question: qText, answer: aText });
      }
    });

    if (invalidItems.length > 0) {
      console.warn('Invalid question items detected:', JSON.stringify(invalidItems, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Each question item must contain a question text.',
        invalidItems
      });
    }

    // Auth check
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized: user missing.' });

    // Create session
    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description
    });

    // Create and link questions
    const questionDocs = await Promise.all(
      normalized.map(async (q) => {
        const questionDoc = await Question.create({
          session: session._id,
          question: q.question,
          answer: q.answer
        });
        return questionDoc._id;
      })
    );

    session.question = questionDocs;
    await session.save();

    // Populate questions before sending response
    const populatedSession = await Session.findById(session._id).populate('question');

    res.status(201).json({ success: true, session: populatedSession });
  } catch (error) {
    console.error("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getMySession = async(req, res)=>{
    try {
       const mySession = await Session.find({user: req.user.id})
       .sort({createdAt: -1})
       .populate("question")
       res.status(200).json(mySession) 
    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message})
       console.log("Error in getMySession controller", error.message)
    }
}
export const getSessionById = async(req, res)=>{
    try {
        const sessionId = await Session.findById(req.params.id)
        .populate({
            path:"question",
            options:{ sort: {isPinned:-1, createdAt: 1 }}
        })
        .exec();
        if(!sessionId){
           return res.status(404).json({message: "Session not found"})
        }
        res.status(200).json({success: true, sessionId})
    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message})
       console.log("Error in sessionById controller", error.message)
    }
}

export const updateSession = async(req, res)=>{
  const sessionId = req.params.id;
  const updatedData = req.body;
  try {
     const updatedSession = await Session.findByIdAndUpdate(sessionId, updatedData, { new: true });

    if (!updatedSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(updatedSession);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
export const deleteSession = async (req, res) => {
  try {
    const sessionDelete = await Session.findById(req.params.id);
    if (!sessionDelete) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (sessionDelete.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete the session" });
    }

    await Question.deleteMany({ session: sessionDelete._id });
    await Session.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.log("Error in delete Session controller", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
