import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const campusData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/campus.json'), 'utf-8'));

// ── Utility: calculate distance between two lat/lng points (Haversine) ──
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (d) => (d * 180) / Math.PI;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

function getCompassDirection(bearing) {
  const compassSectors = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
  return compassSectors[Math.round(bearing / 22.5) % 16];
}

// ── Build adjacency graph for pathfinding ──
function buildGraph() {
  const graph = {};
  campusData.forEach((b) => {
    graph[b.id] = [];
    campusData.forEach((other) => {
      if (b.id !== other.id) {
        const dist = haversine(b.coordinates.lat, b.coordinates.lng, other.coordinates.lat, other.coordinates.lng);
        if (dist < 600) {
          graph[b.id].push({ id: other.id, distance: dist });
        }
      }
    });
    graph[b.id].sort((a, b) => a.distance - b.distance);
  });
  return graph;
}

const graph = buildGraph();

// ── Dijkstra's shortest path ──
function dijkstra(startId, endId, accessible = false) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const pq = [];

  campusData.forEach((b) => {
    dist[b.id] = Infinity;
    prev[b.id] = null;
  });
  dist[startId] = 0;
  pq.push({ id: startId, d: 0 });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { id: u } = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === endId) break;

    for (const neighbor of graph[u] || []) {
      const neighborNode = campusData.find(x => x.id === neighbor.id);
      let penalty = 0;
      
      // Accessibility: Penalize non-accessible paths (e.g. grounds might have steps, some buildings lack ramps)
      // This is simulated for demo purposes
      if (accessible && neighborNode) {
        if (neighborNode.type === 'ground' || neighborNode.type === 'hostel') {
          penalty = 500; // Large penalty to avoid
        }
      }

      const alt = dist[u] + neighbor.distance + penalty;
      if (alt < dist[neighbor.id]) {
        dist[neighbor.id] = alt;
        prev[neighbor.id] = u;
        pq.push({ id: neighbor.id, d: alt });
      }
    }
  }

  const path = [];
  let current = endId;
  while (current) {
    path.unshift(current);
    current = prev[current];
  }
  if (path[0] !== startId) return null;

  return {
    path,
    distance: Math.round(dist[endId]),
    waypoints: path.map((id) => {
      const b = campusData.find((x) => x.id === id);
      return { id, name: b.name, coordinates: b.coordinates };
    }),
  };
}

// ── Fuzzy search helper (with Levenshtein typo tolerance) ──
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
  
  // Direct ID match
  let found = campusData.find((b) => b.id === q);
  if (found) return found;

  // Exact name match
  found = campusData.find((b) => b.name.toLowerCase() === q);
  if (found) return found;

  // Partial name match
  found = campusData.find((b) => b.name.toLowerCase().includes(q));
  if (found) return found;

  // Typo Tolerance (Levenshtein Distance)
  const queryTokens = q.split(/[\s,]+/).filter(t => t.length > 3);
  let bestMatch = null;
  let bestDist = Infinity;

  for (const b of campusData) {
    const nameTokens = b.name.toLowerCase().split(/[\s,]+/);
    for (const qToken of queryTokens) {
      for (const nToken of nameTokens) {
        const dist = levenshteinDistance(qToken, nToken);
        // Allow up to 2 typos for names >= 5 chars
        if (dist <= 2 && dist < Math.max(qToken.length, nToken.length) * 0.45) {
          if (dist < bestDist) {
            bestDist = dist;
            bestMatch = b;
          }
        }
      }
    }
  }
  if (bestMatch) return bestMatch;

  // Search by type
  found = campusData.find((b) => b.type.toLowerCase().includes(q));
  if (found) return found;

  // Search in departments
  found = campusData.find((b) => b.departments?.some((d) => d.toLowerCase().includes(q)));
  if (found) return found;

  // Token matching (fallback)
  const tokens = q.split(/[\s,]+/);
  bestMatch = null;
  let bestScore = 0;
  campusData.forEach((b) => {
    const haystack = `${b.name} ${b.type} ${b.description} ${(b.departments || []).join(' ')} ${(b.amenities || []).join(' ')}`.toLowerCase();
    let score = 0;
    tokens.forEach((t) => { if (haystack.includes(t)) score++; });
    if (score > bestScore) { bestScore = score; bestMatch = b; }
  });
  return bestScore > 0 ? bestMatch : null;
}

// ── Intent Detection ──
function detectIntent(message) {
  const msg = message.toLowerCase();

  // Navigation intent
  const navPatterns = [
    /(?:how\s+(?:to|do\s+i)\s+(?:go|get|reach|walk|navigate)\s+(?:from|to))\s+(.+?)\s+to\s+(.+)/i,
    /(?:(?:accessible|wheelchair)\s+)?(?:route|path|direction|way)\s+(?:from|between)\s+(.+?)\s+(?:to|and)\s+(.+)/i,
    /(?:shortest|fastest|best|accessible|wheelchair)\s+(?:route|path|way)\s+(?:from|between)\s+(.+?)\s+(?:to|and)\s+(.+)/i,
    /(?:from)\s+(.+?)\s+to\s+(.+)/i,
  ];

  for (const pattern of navPatterns) {
    const match = msg.match(pattern);
    if (match) {
      const isAccessible = msg.includes('wheelchair') || msg.includes('accessible');
      return { type: 'navigation', from: match[1].trim(), to: match[2].trim(), accessible: isAccessible };
    }
  }

  // Nearest intent
  const nearestPatterns = [
    /(?:nearest|closest|nearby)\s+(.+)/i,
    /(?:where\s+is\s+the\s+(?:nearest|closest))\s+(.+)/i,
  ];
  for (const pattern of nearestPatterns) {
    const match = msg.match(pattern);
    if (match) return { type: 'nearest', query: match[1].trim() };
  }

  // Spatial intent
  const spatialPatterns = [
    /(?:how\s+far\s+is|distance\s+(?:between|from))\s+(.+?)\s+(?:to|and|from)\s+(.+)/i,
    /(?:which|what|tell\s+me)\s+direction\s+is\s+(.+?)\s+from\s+(.+)/i,
    /(?:where\s+is)\s+(.+?)\s+relative\s+to\s+(.+)/i
  ];
  for (const pattern of spatialPatterns) {
    const match = msg.match(pattern);
    if (match) {
      if (pattern.source.includes('direction') || pattern.source.includes('relative')) {
        return { type: 'spatial', subtype: 'direction', target: match[1].trim(), reference: match[2].trim() };
      }
      return { type: 'spatial', subtype: 'distance', target: match[1].trim(), reference: match[2].trim() };
    }
  }

  // Location intent
  const locationPatterns = [
    /(?:where\s+is|locate|find|show\s+me|take\s+me\s+to)\s+(.+)/i,
    /(?:location\s+of)\s+(.+)/i,
  ];
  for (const pattern of locationPatterns) {
    const match = msg.match(pattern);
    if (match) return { type: 'location', query: match[1].trim() };
  }

  // Info intent
  const infoPatterns = [
    /(?:what\s+is|tell\s+me\s+about|info\s+about|details\s+(?:of|about))\s+(.+)/i,
    /(?:what\s+departments|what\s+labs|what\s+amenities)\s+(?:are\s+in|does)\s+(.+)/i,
  ];
  for (const pattern of infoPatterns) {
    const match = msg.match(pattern);
    if (match) return { type: 'info', query: match[1].trim() };
  }

  // Default: try to find a building reference
  const building = findBuilding(msg);
  if (building) return { type: 'location', query: msg };

  return { type: 'general', query: msg };
}

// ── Response Generator ──
export function processChat(message) {
  const intent = detectIntent(message);
  let response = { text: '', actions: [], buildings: [] };

  switch (intent.type) {
    case 'spatial': {
      const target = findBuilding(intent.target);
      const reference = findBuilding(intent.reference);
      if (!target) {
        response.text = `❌ I couldn't find "${intent.target}" on campus.`;
      } else if (!reference) {
        response.text = `❌ I couldn't find "${intent.reference}" on campus.`;
      } else if (target.id === reference.id) {
        response.text = `You asked for the distance between ${target.name} and itself. The distance is 0 meters!`;
      } else {
        const dist = Math.round(haversine(reference.coordinates.lat, reference.coordinates.lng, target.coordinates.lat, target.coordinates.lng));
        const bear = calculateBearing(reference.coordinates.lat, reference.coordinates.lng, target.coordinates.lat, target.coordinates.lng);
        const dir = getCompassDirection(bear);
        const distStr = dist > 1000 ? (dist / 1000).toFixed(1) + ' km' : dist + ' m';
        
        if (intent.subtype === 'direction') {
          response.text = `🧭 **${target.name}** is located to the **${dir}** of **${reference.name}** (approx. ${distStr} away).`;
        } else {
          response.text = `📏 The distance between **${target.name}** and **${reference.name}** is approximately **${distStr}** (in the **${dir}** direction).`;
        }
        response.actions = [{ type: 'highlight', buildings: [reference, target] }];
        response.buildings = [reference, target];
      }
      break;
    }

    case 'navigation': {
      const from = findBuilding(intent.from);
      const to = findBuilding(intent.to);
      if (!from) {
        response.text = `❌ I couldn't find "${intent.from}" on campus. Try using names like "Block A", "Library", "Hostel 1", etc.`;
      } else if (!to) {
        response.text = `❌ I couldn't find "${intent.to}" on campus. Try using names like "Block B", "Cafeteria", "Medical Room", etc.`;
      } else {
        const route = dijkstra(from.id, to.id, intent.accessible);
        if (route) {
          const names = route.waypoints.map((w) => w.name).join(' → ');
          // True distance comes from simple calc minus penalties, but for demo UI we will leave as is, since the penalty inflates route.distance
          // Let's recalculate true distance
          let actualDistance = 0;
          for(let i=0; i<route.waypoints.length-1; i++) {
             actualDistance += haversine(
               route.waypoints[i].coordinates.lat, route.waypoints[i].coordinates.lng,
               route.waypoints[i+1].coordinates.lat, route.waypoints[i+1].coordinates.lng
             );
          }
          actualDistance = Math.round(actualDistance);

          response.text = `🗺️ **${intent.accessible ? '♿ Accessible ' : ''}Route from ${from.name} to ${to.name}:**\n\n📍 ${names}\n\n📏 Total distance: ~${actualDistance} meters\n⏱️ Estimated walk time: ~${Math.ceil(actualDistance / 80)} minutes`;
          response.actions = [{ type: 'route', waypoints: route.waypoints, from: from, to: to }];
          response.buildings = [from, to];
        } else {
          response.text = `I couldn't find a walking route between ${from.name} and ${to.name}.`;
        }
      }
      break;
    }

    case 'nearest': {
      const query = intent.query;
      // Find buildings matching the type
      const typeMap = {
        medical: 'medical', hospital: 'medical', doctor: 'medical', health: 'medical',
        cafeteria: 'cafeteria', food: 'cafeteria', canteen: 'cafeteria', eat: 'cafeteria',
        library: 'library', books: 'library', study: 'library',
        hostel: 'hostel', dorm: 'hostel',
        admin: 'admin', office: 'admin',
        ground: 'ground', sports: 'ground', play: 'ground',
        parking: 'parking', park: 'parking',
        security: 'admin',
      };
      
      let targetType = null;
      for (const [key, val] of Object.entries(typeMap)) {
        if (query.includes(key)) { targetType = val; break; }
      }
      
      if (targetType) {
        const matches = campusData.filter((b) => b.type === targetType);
        if (matches.length > 0) {
          response.text = `📍 Here are the nearest ${query} locations:\n\n${matches.map((b) => `• **${b.name}** – ${b.description.slice(0, 80)}...`).join('\n')}`;
          response.actions = [{ type: 'highlight', buildings: matches }];
          response.buildings = matches;
        }
      } else {
        const found = findBuilding(query);
        if (found) {
          response.text = `📍 **${found.name}** is located at the campus.\n\n${found.description}`;
          response.actions = [{ type: 'zoom', building: found }];
          response.buildings = [found];
        } else {
          response.text = `I couldn't find anything matching "${query}" on campus.`;
        }
      }
      break;
    }

    case 'location': {
      const building = findBuilding(intent.query);
      if (building) {
        const nearby = building.nearbyLandmarks?.join(', ') || 'N/A';
        response.text = `📍 **${building.name}**\n\n${building.description}\n\n🏢 Type: ${building.type}\n🏗️ Floors: ${building.floors}\n📌 Nearby: ${nearby}`;
        if (building.amenities?.length) {
          response.text += `\n🛠️ Amenities: ${building.amenities.join(', ')}`;
        }
        response.actions = [{ type: 'zoom', building }];
        response.buildings = [building];
      } else {
        response.text = `❌ I couldn't find "${intent.query}" on campus. Try searching for Block A, Library, Hostel, Cafeteria, etc.`;
      }
      break;
    }

    case 'info': {
      const building = findBuilding(intent.query);
      if (building) {
        let info = `📋 **${building.name}**\n\n${building.description}\n\n`;
        info += `🏢 Type: ${building.type.charAt(0).toUpperCase() + building.type.slice(1)}\n`;
        info += `🏗️ Floors: ${building.floors}\n`;
        if (building.departments?.length) info += `🎓 Departments: ${building.departments.join(', ')}\n`;
        if (building.amenities?.length) info += `🛠️ Amenities: ${building.amenities.join(', ')}\n`;
        if (building.nearbyLandmarks?.length) info += `📌 Nearby: ${building.nearbyLandmarks.join(', ')}`;
        response.text = info;
        response.actions = [{ type: 'zoom', building }];
        response.buildings = [building];
      } else {
        response.text = `I don't have detailed info about "${intent.query}". Try asking about Block A, Library, Admin Block, etc.`;
      }
      break;
    }

    default: {
      // General / greeting
      const greetings = ['hi', 'hello', 'hey', 'namaste', 'howdy'];
      if (message.toLowerCase().includes('chitkara') && !message.toLowerCase().includes('where')) {
        response.text = `🏫 **Chitkara University (Punjab Campus)**\n\nEstablished in 2010, Chitkara University is a leading private university located on the Chandigarh-Patiala National Highway. Spanning over 50 acres, it is renowned for its engineering, management, and pharmacy programs.\n\nThe campus features world-class infrastructure including the Exploretorium, CEED incubation center, modern hostels, and the Neelam Hospital.`;
      } else if (greetings.some((g) => message.toLowerCase().includes(g))) {
        response.text = `👋 Hello! I'm **Cognix**, your smart campus assistant for Chitkara University.\n\nI can help you with:\n• 📍 **Finding locations** – "Where is Block A?"\n• 🗺️ **Navigation & Distance** – "Route from Library to Block C" or "How far is Hostel from Gate 4?"\n• 🏥 **Nearest facilities** – "Nearest cafeteria"\n• 📋 **Building info** – "Tell me about the Auditorium"\n\nWhat would you like to know?`;
      } else if (message.toLowerCase().includes('help')) {
        response.text = `🤖 **Cognix Help**\n\nTry these queries:\n• "Where is Block A?"\n• "How to go from Block A to Library?"\n• "How far is Turing Block from Edison Block?"\n• "Which direction is Medical Room from Gym?"\n• "Nearest cafeteria"\n• "Tell me about the Sports Ground"`;
      } else {
        const building = findBuilding(message);
        if (building) {
          response.text = `📍 I found **${building.name}**!\n\n${building.description}\n\n📌 Nearby: ${(building.nearbyLandmarks || []).join(', ')}`;
          response.actions = [{ type: 'zoom', building }];
          response.buildings = [building];
        } else {
          response.text = `🤔 I'm not sure about that. Try asking me:\n• "Where is [building name]?"\n• "Route from [A] to [B]"\n• "How far is [A] from [B]?"\n• "Nearest [facility type]"`;
        }
      }
    }
  }

  return response;
}

// ── Exports ──
export function searchBuildings(query) {
  if (!query) return campusData;
  const q = query.toLowerCase();
  return campusData.filter((b) => {
    const haystack = `${b.name} ${b.type} ${b.description} ${(b.departments || []).join(' ')}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function getBuildingById(id) {
  return campusData.find((b) => b.id === id);
}

export function getRoute(fromId, toId, accessible = false) {
  return dijkstra(fromId, toId, accessible);
}

export function getAllBuildings() {
  return campusData;
}
