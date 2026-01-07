import dotenv from "dotenv"
dotenv.config()
import axios from "axios";



export const generateInterviewQuestion = async (req, res) => {
    try {
        const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

        if (!OPENROUTER_KEY) {
            return res.status(500).json({ error: "OpenRouter API key not configured" });
        }

        const { role, experience, topicsToFocus, question, sessionId } = req.body;

        if (!role || !experience || !topicsToFocus) {
            return res.status(400).json({ message: "Role, experience, and topicsToFocus are required" });
        }

        // Validate sessionId if provided
        if (sessionId && !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid session ID format" });
        }

        // Determine number of questions
        let numberOfQuestions = 10;
        if (typeof question === 'string' && question.trim().length > 0) {
            const numberMatch = question.match(/(\d+)/);
            if (numberMatch) {
                numberOfQuestions = parseInt(numberMatch[1]);
            }
        } else if (typeof question === 'number') {
            numberOfQuestions = question;
        }
        numberOfQuestions = Math.max(1, Math.min(numberOfQuestions, 20));

        // Use structured output for better JSON reliability
        const schema = {
            type: "object",
            properties: {
                questions: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            question: {
                                type: "string",
                                description: "A technical interview question"
                            }
                        },
                        required: ["question"],
                        additionalProperties: false
                    },
                    minItems: numberOfQuestions,
                    maxItems: numberOfQuestions
                }
            },
            required: ["questions"],
            additionalProperties: false
        };

        const promptTemplate = `Generate exactly ${numberOfQuestions} unique technical interview questions for a ${role} position with ${experience} experience level.

Focus areas: ${topicsToFocus}

Requirements:
- Create diverse questions covering different aspects of ${topicsToFocus}
- Mix theoretical concepts, practical applications, and problem-solving scenarios
- Ensure questions are appropriate for ${experience} level (avoid overly complex topics for juniors)
- Make each question unique and non-repetitive
- Questions should be clear and specific

Examples of good questions for this level:
- "What is the difference between let, const, and var in JavaScript?"
- "How do you handle errors in Node.js applications?"
- "Explain the concept of props in React components"

Generate exactly ${numberOfQuestions} questions focused on ${topicsToFocus}.`;

        const payload = {
            model: 'openai/gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert technical interviewer. Generate exactly ${numberOfQuestions} unique interview questions following the specified JSON schema.`
                },
                { role: 'user', content: promptTemplate }
            ],
            max_tokens: numberOfQuestions * 150, // Optimized token allocation
            temperature: 0.7,
            top_p: 0.9,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "interview_questions",
                    strict: true,
                    schema: schema
                }
            }
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
            'X-Title': 'Interview Question Generator'
        };

        console.log(`🚀 Generating ${numberOfQuestions} questions for ${role} (${experience})`);

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, { 
            headers, 
            timeout: 45000 // Increased timeout
        });

        const content = response.data?.choices?.[0]?.message?.content;

        if (!content) {
            return res.status(500).json({ error: "No content received from AI" });
        }

        console.log("📄 Raw response length:", content.length);
        console.log("📝 Raw response preview:", content.substring(0, 300) + "...");

        // With structured outputs, parsing should be more reliable
        let parsedResponse = null;
        
        try {
            parsedResponse = JSON.parse(content);
            console.log("✅ Direct JSON parsing successful");
        } catch (error) {
            console.log("❌ Direct parsing failed, trying cleanup...");
            
            // Fallback cleanup for non-structured responses
            let cleanedContent = content
                .trim()
                .replace(/^\s*```(?:json)?\s*/i, "")
                .replace(/\s*```\s*$/i, "");

            try {
                parsedResponse = JSON.parse(cleanedContent);
                console.log("✅ Cleanup parsing successful");
            } catch (cleanupError) {
                console.error("❌ All parsing failed:", cleanupError.message);
                return res.status(500).json({ 
                    error: "Failed to parse AI response",
                    debug: content.substring(0, 500)
                });
            }
        }

        // Extract questions from structured response
        let questionsArray = [];
        
        if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
            questionsArray = parsedResponse.questions;
        } else if (Array.isArray(parsedResponse)) {
            questionsArray = parsedResponse;
        } else {
            console.error("❌ Unexpected response structure:", parsedResponse);
            return res.status(500).json({
                error: "Unexpected response structure from AI",
                debug: parsedResponse
            });
        }

        // Format questions consistently
        const questions = questionsArray
            .filter(item => item && item.question && item.question.trim().length > 10)
            .map((item, index) => ({
                id: index + 1,
                question: item.question.trim(),
                answered: false
            }))
            .slice(0, numberOfQuestions); // Ensure we don't exceed requested count

        console.log(`✅ Successfully parsed ${questions.length} questions out of ${questionsArray.length} received`);

        // NEW: Save questions to database if sessionId is provided
        if (sessionId) {
            try {
                // Import your models (adjust path as needed)
                const Session = (await import('../models/Session.js')).default;
                const Question = (await import('../models/Question.js')).default;

                // Verify session exists
                const session = await Session.findById(sessionId);
                if (!session) {
                    return res.status(404).json({ error: "Session not found" });
                }

                // Create Question documents in database
                const questionDocs = await Promise.all(
                    questions.map(async (q) => {
                        const questionDoc = await Question.create({
                            session: sessionId,
                            question: q.question,
                            answer: '', // Empty initially
                        });
                        return questionDoc._id;
                    })
                );

                // Update session with question references
                session.question = questionDocs;
                await session.save();

                console.log(`✅ Successfully saved ${questionDocs.length} questions to session ${sessionId}`);

                return res.status(200).json({
                    ok: true,
                    data: questions,
                    count: questions.length,
                    requested: numberOfQuestions,
                    type: 'questions_saved_to_session',
                    sessionId: sessionId,
                    metadata: {
                        role,
                        experience,
                        topicsToFocus
                    }
                });

            } catch (dbError) {
                console.error('❌ Error saving questions to database:', dbError);
                // Still return the questions even if DB save fails
                return res.status(200).json({
                    ok: true,
                    data: questions,
                    count: questions.length,
                    requested: numberOfQuestions,
                    type: 'questions_generated_only',
                    warning: 'Questions generated but not saved to session',
                    dbError: dbError.message,
                    metadata: {
                        role,
                        experience,
                        topicsToFocus
                    }
                });
            }
        }

        // If no sessionId, just return the questions
        return res.status(200).json({
            ok: true,
            data: questions,
            count: questions.length,
            requested: numberOfQuestions,
            type: 'questions_only',
            metadata: {
                role,
                experience,
                topicsToFocus
            }
        });

    } catch (err) {
        console.error('❌ Error generating questions:', err);
        return res.status(500).json({
            error: 'Failed to generate questions',
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};




export const generateConceptExplanation = async (questionText)=> {
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    
    console.log(`🔑 API Key exists: ${!!OPENROUTER_KEY}`);
    
    if (!OPENROUTER_KEY) {
        throw new Error("OpenRouter API key not configured");
    }

    const schema = {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "The question or topic being explained"
            },
            explanation: {
                type: "string",
                description: "Detailed technical explanation (200-400 words)"
            },
            keyPoints: {
                type: "array",
                items: { type: "string" },
                description: "Array of 3-5 key points about the topic",
                minItems: 3,
                maxItems: 5
            },
            examples: {
                type: "array",
                items: { type: "string" },
                description: "Array of 2-3 practical examples or use cases",
                minItems: 2,
                maxItems: 3
            },
            bestPractices: {
                type: "array",
                items: { type: "string" },
                description: "Array of 2-3 best practices or recommendations",
                minItems: 2,
                maxItems: 3
            }
        },
        required: ["title", "explanation", "keyPoints", "examples", "bestPractices"],
        additionalProperties: false
    };

    const promptTemplate = `Provide a comprehensive technical explanation for the following question/topic:

"${questionText}"

Requirements:
- Write a detailed explanation of 200-400 words covering the concept, how it works, and why it's important
- Include 3-5 key points that cover the most important aspects of this topic
- Provide 2-3 practical examples or use cases that illustrate the concept
- List 2-3 best practices or recommendations related to this topic
- Make the content appropriate for someone learning this topic
- Focus on accuracy, clarity, and practical understanding

Generate a comprehensive response following the specified JSON schema.`;

    const payload = {
        model: 'openai/gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are a technical expert assistant who provides comprehensive explanations of technical concepts. Generate detailed, accurate, and well-structured explanations following the specified JSON schema.'
            },
            { role: 'user', content: promptTemplate }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "concept_explanation",
                strict: true,
                schema: schema
            }
        }
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Question Answer Generator'
    };

    console.log(`🌐 Making API request to OpenRouter...`);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, { 
        headers, 
        timeout: 45000
    });

    const content = response.data?.choices?.[0]?.message?.content;
    
    if (!content) {
        throw new Error("No content received from AI");
    }

    console.log(`📄 Received response from AI: ${content.length} characters`);

    let parsedResponse = null;
    
    try {
        parsedResponse = JSON.parse(content);
        console.log(`✅ Successfully parsed AI response`);
    } catch (error) {
        console.log(`❌ Direct parsing failed, trying cleanup...`);
        
        // Fallback cleanup
        let cleanedContent = content
            .trim()
            .replace(/^\s*```(?:json)?\s*/i, "")
            .replace(/\s*```\s*$/i, "");

        try {
            parsedResponse = JSON.parse(cleanedContent);
            console.log(`✅ Cleanup parsing successful`);
        } catch (cleanupError) {
            console.error(`❌ All parsing failed:`, cleanupError.message);
            throw new Error("Failed to parse AI response");
        }
    }

    return {
        title: parsedResponse.title || questionText,
        explanation: parsedResponse.explanation || "No explanation available",
        keyPoints: Array.isArray(parsedResponse.keyPoints) && parsedResponse.keyPoints.length > 0 
            ? parsedResponse.keyPoints 
            : ["No key points available"],
        examples: Array.isArray(parsedResponse.examples) && parsedResponse.examples.length > 0 
            ? parsedResponse.examples 
            : ["No examples available"],
        bestPractices: Array.isArray(parsedResponse.bestPractices) && parsedResponse.bestPractices.length > 0 
            ? parsedResponse.bestPractices 
            : ["No best practices available"]
    };
}
