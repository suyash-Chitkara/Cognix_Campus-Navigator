import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import campusRoutes from './routes/campus.js';
import chatRoutes from './routes/chat.js';
import eventsRoutes from './routes/events.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/campus', campusRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Cognix API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Cognix API server running on http://localhost:${PORT}`);
});
