import React, { useState, useMemo } from 'react';
import { X, MapPin, Compass, Navigation, Search, Filter } from 'lucide-react';
import { calculateDistance, calculateBearing, getCompassDirection } from '../utils/geo';

const TYPE_COLORS = {
  academic: '#6c5ce7', hostel: '#fdcb6e', admin: '#00b894', library: '#a29bfe',
  medical: '#ff6b6b', ground: '#00cec9', cafeteria: '#e17055', parking: '#636e72', entrance: '#74b9ff',
};

const TYPE_EMOJI = {
  academic: '🏫', hostel: '🏠', admin: '🏛️', library: '📚',
  medical: '🏥', ground: '⚽', cafeteria: '🍔', parking: '🅿️', entrance: '🚪',
};

const CATEGORIES = ['all', 'academic', 'hostel', 'admin', 'medical', 'ground', 'cafeteria', 'parking'];

export default function DirectoryPanel({ buildings, onClose, trafficData }) {
  const [refId, setRefId] = useState(buildings[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const referenceBuilding = useMemo(() =>
    buildings.find(b => b.id === refId) || buildings[0],
  [buildings, refId]);

  const directoryList = useMemo(() => {
    if (!referenceBuilding) return [];

    return buildings
      .filter(b => b.id !== referenceBuilding.id)
      .map(b => {
        const dist = calculateDistance(
          referenceBuilding.coordinates.lat, referenceBuilding.coordinates.lng,
          b.coordinates.lat, b.coordinates.lng
        );
        const bear = calculateBearing(
          referenceBuilding.coordinates.lat, referenceBuilding.coordinates.lng,
          b.coordinates.lat, b.coordinates.lng
        );
        const dir = getCompassDirection(bear);

        return { ...b, distance: dist, direction: dir, bearing: bear };
      })
      .filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || b.type === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [buildings, referenceBuilding, searchQuery, activeCategory]);

  // Get max distance for progress bars
  const maxDistance = useMemo(() =>
    Math.max(...directoryList.map(b => b.distance), 1),
  [directoryList]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overlay-backdrop animate-fade-in">
      <div className="w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col panel-container animate-scale-in">

        {/* Header */}
        <div className="p-6 shrink-0 z-10" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6c5ce7, #0984e3)', boxShadow: '0 4px 16px rgba(108,92,231,0.25)' }}
              >
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-black text-2xl tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>Campus Directory</h2>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {directoryList.length} locations • sorted by distance
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:rotate-90" style={{ background: 'var(--bg-tertiary)' }}>
              <X size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>From</label>
              <select
                value={refId}
                onChange={e => setRefId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold appearance-none outline-none transition-all cursor-pointer"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none transition-all"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize whitespace-nowrap transition-all hover:scale-105"
                style={{
                  background: activeCategory === cat
                    ? (TYPE_COLORS[cat] || 'var(--brand)')
                    : 'var(--bg-tertiary)',
                  color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${activeCategory === cat ? 'transparent' : 'var(--border)'}`,
                }}
              >
                {cat === 'all' ? '🌐 All' : `${TYPE_EMOJI[cat] || ''} ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scroll" style={{ background: 'var(--bg-primary)' }}>
          {directoryList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10" style={{ color: 'var(--text-muted)' }}>
              <Compass className="w-16 h-16 mb-4 opacity-15" />
              <p className="font-bold text-lg" style={{ fontFamily: 'Outfit' }}>No locations found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {directoryList.map((b, index) => {
                const color = TYPE_COLORS[b.type] || '#6c5ce7';
                const distPercent = Math.max(5, (b.distance / maxDistance) * 100);

                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-xl group cursor-pointer gradient-border"
                    style={{
                      background: 'var(--bg-secondary)',
                      animationDelay: `${index * 30}ms`,
                    }}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ background: color + '12' }}
                        >
                          {TYPE_EMOJI[b.type] || '📍'}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm leading-tight tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{b.name}</h3>
                          <span className="badge mt-1" style={{ background: color + '12', color }}>
                            {b.type}
                          </span>
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                      >
                        <Navigation size={14} style={{
                          color: 'var(--text-secondary)',
                          transform: `rotate(${b.bearing}deg)`,
                          transition: 'transform 0.5s ease-out',
                        }} />
                      </div>
                    </div>

                    {/* Distance bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg font-black gradient-text">
                          {b.distance > 1000 ? (b.distance / 1000).toFixed(1) + ' km' : b.distance + ' m'}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                        >
                          <Compass size={11} />
                          {b.direction}
                        </div>
                      </div>
                      {/* Animated progress bar */}
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${distPercent}%`,
                            background: `linear-gradient(90deg, var(--brand), var(--accent-cyan))`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Traffic badge */}
                    {trafficData && trafficData[b.id] && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: trafficData[b.id].color }} />
                        <span className="text-[10px] font-bold" style={{ color: trafficData[b.id].color }}>
                          {trafficData[b.id].status} · {trafficData[b.id].busyness}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
