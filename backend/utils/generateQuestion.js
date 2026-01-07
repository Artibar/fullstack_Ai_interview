
// utils/generateQuestions.js
import axios from 'axios';

export default async function generateQuestions({ role, experience, topicsToFocus, questionCount = 10 }) {
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_KEY) throw new Error("OpenRouter API key not configured");

  const numberOfQuestions = Math.max(1, Math.min(questionCount, 20));

  const schema = {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" }
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
- Mix theory, practical, and problem-solving
- Avoid repetition
- Match difficulty to ${experience}
`;

  const payload = {
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: `You are an expert technical interviewer. Generate exactly ${numberOfQuestions} questions.` },
      { role: 'user', content: promptTemplate }
    ],
    max_tokens: numberOfQuestions * 150,
    temperature: 0.7,
    top_p: 0.9,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "interview_questions",
        strict: true,
        schema
      }
    }
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENROUTER_KEY}`,
    'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Interview Question Generator'
  };

  const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, { headers, timeout: 45000 });
  const content = response.data?.choices?.[0]?.message?.content;

  if (!content) throw new Error("No content received from AI");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const cleaned = content.trim().replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
    parsed = JSON.parse(cleaned);
  }

  const questionsArray = parsed.questions || (Array.isArray(parsed) ? parsed : []);
  return questionsArray
    .filter(q => q?.question?.trim().length > 10)
    .map((q, i) => ({ id: i + 1, question: q.question.trim(), answered: false }));
}
