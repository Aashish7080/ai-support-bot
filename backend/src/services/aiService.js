import dotenv from 'dotenv';
dotenv.config(); // 1. LOAD ENV VARS FIRST

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import Faq from '../models/Faq.js';

// 2. Initialize Gemini Model
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash", 
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.1,
});

const SYSTEM_TEMPLATE = `
You are a Customer Support Bot for "TechCorp".

SOURCES:
1. CONTEXT (FAQs):
{context}

2. CHAT HISTORY:
{chat_history}

USER QUERY:
{question}

INSTRUCTIONS:
1. **Primary Source:** Always check the CONTEXT first. If the answer is there, output it.
2. **Small Talk/Memory:** If the user says "Hi", tells you their name, or asks "What did I just say?", use the CHAT HISTORY to answer politely.
3. **Gibberish/Unclear:** If the user types random letters (e.g., "asdf", "dfdfd") or something that makes no sense, DO NOT ESCALATE. Instead, reply: "I'm sorry, I didn't catch that. Could you please rephrase?"
4. **Unknown Technical Info:** If the user asks a clear question (e.g., "How to install on Linux") that is NOT in the CONTEXT, you MUST return "escalate": true.
5. **Aggression:** If the user is angry, return "escalate": true.

RESPONSE FORMAT (Strict JSON, no markdown):
{{
  "answer": "The actual text response goes here",
  "escalate": boolean,
  "reason": "Reason for escalation (or null)"
}}
`;

const prompt = PromptTemplate.fromTemplate(SYSTEM_TEMPLATE);
const outputParser = new StringOutputParser();

export const processUserMessage = async (userMessage, history) => {
  
  const allFaqs = await Faq.find({});
  const contextText = allFaqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

  const historyText = history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join("\n");

  const chain = prompt.pipe(llm).pipe(outputParser);
  
  try {
    const rawResponse = await chain.invoke({
      question: userMessage,
      context: contextText,
      chat_history: historyText || "No previous history."
    });

    console.log("Raw AI Response:", rawResponse); // Debugging log

    // --- ROBUST JSON CLEANING START ---
    // 1. Remove markdown code blocks
    let cleanString = rawResponse.replace(/```json|```/g, '').trim();
    
    // 2. Find the first '{' and last '}' to ignore any intro/outro text
    const firstCurly = cleanString.indexOf('{');
    const lastCurly = cleanString.lastIndexOf('}');
    
    if (firstCurly !== -1 && lastCurly !== -1) {
      cleanString = cleanString.substring(firstCurly, lastCurly + 1);
    }
    // --- ROBUST JSON CLEANING END ---
    
    return JSON.parse(cleanString);

  } catch (error) {
    console.error("AI Service Error:", error);
    // Fallback if JSON parsing fails
    return { answer: "I'm having trouble connecting. Connecting you to an agent.", escalate: true };
  }
};