import https from 'https';
import fs from 'fs';

const query = `
[out:json];
(
  way["name"](30.512,76.655,30.522,76.666);
  node["name"](30.512,76.655,30.522,76.666);
);
out center;
`;

const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const locations = json.elements.map(el => {
      const lat = el.center ? el.center.lat : el.lat;
      const lon = el.center ? el.center.lon : el.lon;
      return {
        id: el.tags.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: el.tags.name,
        type: 'academic', // default, we can refine later
        coordinates: { lat, lng: lon },
        description: 'Building on Chitkara campus.',
        floors: el.tags['building:levels'] ? parseInt(el.tags['building:levels']) : 3,
        departments: [],
        amenities: [],
        nearbyLandmarks: []
      };
    });
    
    // Sort and save
    fs.writeFileSync('osm_data.json', JSON.stringify(locations, null, 2));
    console.log(`Saved ${locations.length} named locations from OSM.`);
  });
}).on('error', (e) => {
  console.error(e);
});
