import express from 'express';
import { processChat } from '../services/chatbot.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const result = processChat(message);
    res.json(result);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
