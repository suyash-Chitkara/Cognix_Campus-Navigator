import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const events = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/events.json'), 'utf-8'));

router.get('/', (req, res) => {
  res.json(events);
});

export default router;
