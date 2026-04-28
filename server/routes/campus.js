import express from 'express';
import { getAllBuildings, searchBuildings, getBuildingById, getRoute } from '../services/chatbot.js';

const router = express.Router();

// Get all buildings
router.get('/buildings', (req, res) => {
  res.json(getAllBuildings());
});

// Search buildings
router.get('/search', (req, res) => {
  const { q } = req.query;
  res.json(searchBuildings(q));
});

// Get building by ID
router.get('/building/:id', (req, res) => {
  const building = getBuildingById(req.params.id);
  if (!building) return res.status(404).json({ error: 'Building not found' });
  res.json(building);
});

// Calculate route
router.post('/route', (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) return res.status(400).json({ error: 'Provide from and to building IDs' });
  const route = getRoute(from, to);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json(route);
});

export default router;
