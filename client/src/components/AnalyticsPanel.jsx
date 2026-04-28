import React, { useMemo } from 'react';
import { BarChart, Activity, Users, Clock, MapPin, X, Navigation } from 'lucide-react';

export default function AnalyticsPanel({ onClose, buildings }) {
  // Simulate analytics data based on building types and randomization
  const stats = useMemo(() => {
    let totalCapacity = 0;
    let currentOccupancy = 0;
    let mostVisited = [];
    
    buildings.forEach(b => {
      // Fake capacity logic
      const capacity = b.floors > 0 ? b.floors * 200 : 500;
      totalCapacity += capacity;
      
      // Fake occupancy logic
      let occupancyRate = 0.2 + Math.random() * 0.7; // 20% to 90%
      if (b.type === 'cafeteria' || b.type === 'academic') occupancyRate = 0.6 + Math.random() * 0.3;
      
      currentOccupancy += capacity * occupancyRate;
      
      mostVisited.push({
        name: b.name,
        type: b.type,
        visitors: Math.floor(capacity * occupancyRate * (1 + Math.random())),
      });
    });

    mostVisited.sort((a, b) => b.visitors - a.visitors);

    return {
      totalCapacity,
      currentOccupancy: Math.floor(currentOccupancy),
      occupancyPercent: Math.round((currentOccupancy / totalCapacity) * 100) || 0,
      mostVisited: mostVisited.slice(0, 5),
      activeRoutes: Math.floor(50 + Math.random() * 150),
    };
  }, [buildings]);

  return (
    <div className="absolute inset-y-4 right-4 w-80 lg:w-96 rounded-3xl z-[2000] flex flex-col overflow-hidden animate-slide-left shadow-2xl"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <BarChart size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Campus Analytics</h2>
            <p className="text-[10px] text-gray-400 font-medium">Real-time Digital Twin Data</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-white/10 text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scroll space-y-6">
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-1.5 text-gray-400 mb-2">
              <Users size={12} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Est. Occupancy</span>
            </div>
            <div className="text-2xl font-black text-white">{stats.currentOccupancy.toLocaleString()}</div>
            <div className="text-xs mt-1" style={{ color: stats.occupancyPercent > 80 ? '#ef4444' : '#10b981' }}>
              {stats.occupancyPercent}% of capacity
            </div>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-1.5 text-gray-400 mb-2">
              <Navigation size={12} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Active Routes</span>
            </div>
            <div className="text-2xl font-black text-white">{stats.activeRoutes}</div>
            <div className="text-xs text-brand mt-1 flex items-center gap-1">
              <Activity size={10} className="animate-pulse" /> Live Now
            </div>
          </div>
        </div>

        {/* Heatmap/Occupancy Bar */}
        <div>
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <Activity size={12} className="text-brand" /> Overall Campus Load
          </h3>
          <div className="h-4 rounded-full overflow-hidden flex bg-gray-800">
             <div className="h-full bg-emerald-500" style={{ width: '45%' }}></div>
             <div className="h-full bg-amber-500" style={{ width: '35%' }}></div>
             <div className="h-full bg-rose-500" style={{ width: '20%' }}></div>
          </div>
          <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-1">
            <span>Low 🟢</span>
            <span>Medium 🟡</span>
            <span>High 🔴</span>
          </div>
        </div>

        {/* Most Visited List */}
        <div>
           <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <MapPin size={12} className="text-amber-500" /> Currently Trending Zones
          </h3>
          <div className="space-y-2">
            {stats.mostVisited.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-black text-gray-500">#{i + 1}</div>
                  <div>
                    <div className="text-sm font-bold text-white leading-tight">{b.name}</div>
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">{b.type}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-300">
                  {b.visitors} <span className="text-gray-500">/hr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
