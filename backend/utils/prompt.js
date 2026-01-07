

export const conceptExplainPrompt = (question) => {
  `
    You are an Ai trained expert to generate explanation for a given interview question.

    TASK:
    - Explain the following interview question and its concept in depth as if you're teaching a beginner to advance developer.
    - Question: "${question}"
    - After the explanation, provide a short and clear title that summarizes the concept for the article or page header
    - If the the explanation includes a code example. provide a basic code block example with clear explanation.
    - Keep the formatting very clean and clear.
    - Return the result as a valid JSON object in the following format:
    {
      "title": "Short title here",
      "explanation":"Explanation here."
    }
      Important : Do NOT add any extra text outside the JSON format. only return valid JSON.  
    `}  