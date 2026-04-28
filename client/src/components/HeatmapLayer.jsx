import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ buildings, visible }) {
  const map = useMap();

  useEffect(() => {
    if (!visible || !buildings?.length) return;

    // Generate heatmap points from building coordinates
    // Simulate crowd density based on building type
    const densityMultiplier = {
      academic: 0.9,
      cafeteria: 0.85,
      library: 0.7,
      admin: 0.5,
      hostel: 0.6,
      medical: 0.3,
      ground: 0.4,
      parking: 0.2,
      entrance: 0.35,
    };

    const points = buildings.map((b) => {
      const intensity = densityMultiplier[b.type] || 0.5;
      // Add slight randomization to make it look more organic
      return [
        b.coordinates.lat,
        b.coordinates.lng,
        intensity,
      ];
    });

    // Add some interpolated points around high-traffic areas for visual richness
    const extraPoints = [];
    buildings.forEach((b) => {
      const mult = densityMultiplier[b.type] || 0.3;
      if (mult > 0.5) {
        // Add surrounding ghost points
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI * 2 * i) / 4;
          const offset = 0.0003 + Math.random() * 0.0002;
          extraPoints.push([
            b.coordinates.lat + Math.cos(angle) * offset,
            b.coordinates.lng + Math.sin(angle) * offset,
            mult * 0.5,
          ]);
        }
      }
    });

    const allPoints = [...points, ...extraPoints];

    const heatLayer = L.heatLayer(allPoints, {
      radius: 30,
      blur: 20,
      maxZoom: 18,
      max: 1.0,
      gradient: {
        0.2: '#1a1a2e',
        0.4: '#16213e',
        0.5: '#0f3460',
        0.6: '#e94560',
        0.8: '#ff6b6b',
        1.0: '#ffa502',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, buildings, visible]);

  return null;
}
