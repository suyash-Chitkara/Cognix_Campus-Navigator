import fs from 'fs';

const osmData = JSON.parse(fs.readFileSync('osm_data.json', 'utf-8'));
const existingData = JSON.parse(fs.readFileSync('data/campus.json', 'utf-8'));

// Helper to find existing building by name or ID (fuzzy matching)
function findExisting(osmBuilding) {
  const q = osmBuilding.name.toLowerCase().trim();
  // exact name
  let found = existingData.find(b => b.name.toLowerCase() === q);
  if (found) return found;
  
  // exact id
  found = existingData.find(b => b.id === osmBuilding.id);
  if (found) return found;

  // includes
  found = existingData.find(b => b.name.toLowerCase().includes(q) || q.includes(b.name.toLowerCase()));
  if (found) return found;

  return null;
}

const finalData = [];

// Track what we've added to avoid duplicates if OSM has multiple nodes
const addedNames = new Set();

for (const osm of osmData) {
  if (addedNames.has(osm.name)) continue;
  addedNames.add(osm.name);

  // Fix some types based on name
  let type = osm.type;
  const nameLow = osm.name.toLowerCase();
  if (nameLow.includes('hostel')) type = 'hostel';
  if (nameLow.includes('ground') || nameLow.includes('court') || nameLow.includes('woods')) type = 'ground';
  if (nameLow.includes('hospital')) type = 'medical';
  if (nameLow.includes('bank') || nameLow.includes('admin') || nameLow.includes('hub')) type = 'admin';
  if (nameLow.includes('square one') || nameLow.includes('tuc shop')) type = 'cafeteria';
  if (nameLow.includes('parking')) type = 'parking';

  const existing = findExisting(osm);

  if (existing) {
    // Merge: Keep existing rich metadata, but use OSM coordinates
    finalData.push({
      ...existing,
      id: osm.id, // prefer OSM ID for clean URLs
      name: osm.name, // prefer OSM exact name
      type: existing.type !== 'academic' ? existing.type : type,
      coordinates: osm.coordinates,
      // If our old floors was > 0 keep it, else use OSM
      floors: existing.floors || osm.floors
    });
  } else {
    // It's a brand new building
    let desc = `The ${osm.name} at Chitkara University.`;
    if (nameLow.includes('square one')) desc = 'Main food court and cafeteria offering multi-cuisine options and seating areas for students.';
    if (nameLow.includes('rockfeller')) desc = 'Rockfeller Building, providing academic and administrative facilities.';
    if (nameLow.includes('martin luther')) desc = 'Martin Luther Building, part of the campus academic infrastructure.';
    if (nameLow.includes('pythagoras')) desc = 'Pythagoras Block, dedicated to mathematics and core sciences.';

    finalData.push({
      id: osm.id,
      name: osm.name,
      type: type,
      coordinates: osm.coordinates,
      description: desc,
      floors: osm.floors,
      departments: [],
      amenities: [],
      nearbyLandmarks: []
    });
  }
}

// Ensure things like Gate No 4 that might not be in OSM polygons are kept
for (const ex of existingData) {
  if (!finalData.find(f => f.name.toLowerCase() === ex.name.toLowerCase() || f.id === ex.id)) {
    // Add it back
    finalData.push(ex);
  }
}

fs.writeFileSync('data/campus.json', JSON.stringify(finalData, null, 2));
console.log(`Successfully merged ${finalData.length} total buildings into data/campus.json`);
