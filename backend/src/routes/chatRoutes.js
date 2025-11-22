import express from 'express';
import Session from '../models/Session.js';
import { processUserMessage } from '../services/aiService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: "Session ID and Message are required" });
  }

  try {
    // 1. Fetch or Create Session
    let session = await Session.findOne({ sessionId });
    if (!session) {
      session = await Session.create({ sessionId, history: [] });
    }

    // 2. Call the AI Service
    const aiResult = await processUserMessage(message, session.history);

    // 3. Update History (User's turn)
    session.history.push({ role: 'user', content: message });

    // 4. Update History (AI's turn) -- FIXED HERE --
    // If AI returns null (escalation), use a default string.
    const aiContent = aiResult.answer 
      ? aiResult.answer 
      : "I am connecting you to a human agent."; // Fallback string

    session.history.push({ 
      role: 'assistant', 
      content: aiContent 
    });

    await session.save();

    // 5. Send Response
    // Ensure the client receives the fallback string too if answer was null
    res.json({
        ...aiResult,
        answer: aiContent
    });

  } catch (error) {
    console.error("Route Error:", error);
    res.status(500).send("Server Error");
  }
});

export default router;