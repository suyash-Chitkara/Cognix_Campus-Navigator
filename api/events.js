import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const events = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'server/data/events.json'), 'utf-8'));
  res.json(events);
}
