export default function handler(req, res) {
  res.json({ status: 'ok', service: 'Cognix API', timestamp: new Date().toISOString() });
}
