import fs from 'fs';
import path from 'path';

const campusData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'server/data/campus.json'), 'utf-8'));

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function levenshteinDistance(a, b) {
  if (!a || !b) return (a || b || '').length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[a.length][b.length];
}

function findBuilding(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();
  let found = campusData.find((b) => b.id === q);
  if (found) return found;
  found = campusData.find((b) => b.name.toLowerCase() === q);
  if (found) return found;
  found = campusData.find((b) => b.name.toLowerCase().includes(q));
  if (found) return found;
  const queryTokens = q.split(/[\s,]+/).filter(t => t.length > 3);
  let bestMatch = null;
  let bestDist = Infinity;
  for (const b of campusData) {
    const nameTokens = b.name.toLowerCase().split(/[\s,]+/);
    for (const qToken of queryTokens) {
      for (const nToken of nameTokens) {
        const dist = levenshteinDistance(qToken, nToken);
        if (dist <= 2 && dist < Math.max(qToken.length, nToken.length) * 0.45) {
          if (dist < bestDist) { bestDist = dist; bestMatch = b; }
        }
      }
    }
  }
  if (bestMatch) return bestMatch;
  found = campusData.find((b) => b.type.toLowerCase().includes(q));
  if (found) return found;
  found = campusData.find((b) => b.departments?.some((d) => d.toLowerCase().includes(q)));
  if (found) return found;
  return null;
}

function searchBuildings(query) {
  if (!query) return campusData;
  const q = query.toLowerCase();
  return campusData.filter((b) => {
    const haystack = `${b.name} ${b.type} ${b.description} ${(b.departments || []).join(' ')}`.toLowerCase();
    return haystack.includes(q);
  });
}

function buildGraph() {
  const graph = {};
  campusData.forEach((b) => {
    graph[b.id] = [];
    campusData.forEach((other) => {
      if (b.id !== other.id) {
        const dist = haversine(b.coordinates.lat, b.coordinates.lng, other.coordinates.lat, other.coordinates.lng);
        if (dist < 600) graph[b.id].push({ id: other.id, distance: dist });
      }
    });
    graph[b.id].sort((a, b) => a.distance - b.distance);
  });
  return graph;
}

const graph = buildGraph();

function dijkstra(startId, endId) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const pq = [];
  campusData.forEach((b) => { dist[b.id] = Infinity; prev[b.id] = null; });
  dist[startId] = 0;
  pq.push({ id: startId, d: 0 });
  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { id: u } = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === endId) break;
    for (const neighbor of graph[u] || []) {
      const alt = dist[u] + neighbor.distance;
      if (alt < dist[neighbor.id]) {
        dist[neighbor.id] = alt;
        prev[neighbor.id] = u;
        pq.push({ id: neighbor.id, d: alt });
      }
    }
  }
  const routePath = [];
  let current = endId;
  while (current) { routePath.unshift(current); current = prev[current]; }
  if (routePath[0] !== startId) return null;
  return {
    path: routePath,
    distance: Math.round(dist[endId]),
    waypoints: routePath.map((id) => {
      const b = campusData.find((x) => x.id === id);
      return { id, name: b.name, coordinates: b.coordinates };
    }),
  };
}

export default function handler(req, res) {
  const { url } = req;

  // GET /api/campus/buildings
  if (req.method === 'GET' && (url === '/api/campus/buildings' || url.includes('buildings'))) {
    return res.json(campusData);
  }

  // GET /api/campus/search?q=...
  if (req.method === 'GET' && url.includes('search')) {
    const { q } = req.query;
    return res.json(searchBuildings(q));
  }

  // GET /api/campus/building/:id
  if (req.method === 'GET' && url.includes('building/')) {
    const parts = url.split('/');
    const id = parts[parts.length - 1].split('?')[0];
    const building = campusData.find((b) => b.id === id);
    if (!building) return res.status(404).json({ error: 'Building not found' });
    return res.json(building);
  }

  // POST /api/campus/route
  if (req.method === 'POST') {
    const { from, to } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Provide from and to building IDs' });
    const route = dijkstra(from, to);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    return res.json(route);
  }

  return res.status(404).json({ error: 'Not found' });
}
