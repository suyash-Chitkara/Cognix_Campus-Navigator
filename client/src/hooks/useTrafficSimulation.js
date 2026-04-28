import { useState, useEffect } from 'react';

export function useTrafficSimulation(buildings) {
  const [trafficData, setTrafficData] = useState({});

  useEffect(() => {
    if (!buildings || buildings.length === 0) return;

    const generateTraffic = () => {
      const data = {};
      buildings.forEach(b => {
        // Base busyness depending on building type
        let base = 20;
        if (b.type === 'cafeteria') base = 60;
        if (b.type === 'ground') base = 40;
        if (b.type === 'academic') base = 50;

        // Random fluctuation +/- 30
        let current = base + (Math.random() * 60 - 30);
        current = Math.max(5, Math.min(95, current));

        let status = 'Quiet';
        let color = '#22c55e'; // Green
        
        if (current > 65) {
          status = 'Busy';
          color = '#ef4444'; // Red
        } else if (current > 35) {
          status = 'Moderate';
          color = '#f59e0b'; // Amber
        }

        data[b.id] = {
          busyness: Math.round(current),
          status,
          color
        };
      });
      setTrafficData(data);
    };

    generateTraffic();
    // Update every 30 seconds
    const interval = setInterval(generateTraffic, 30000);
    return () => clearInterval(interval);
  }, [buildings]);

  return trafficData;
}
