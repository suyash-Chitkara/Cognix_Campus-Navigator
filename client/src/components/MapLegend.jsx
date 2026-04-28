import React from 'react';

const TYPE_COLORS = {
  academic: '#6c5ce7',
  hostel: '#fdcb6e',
  admin: '#00b894',
  library: '#a29bfe',
  medical: '#ff6b6b',
  ground: '#00cec9',
  cafeteria: '#e17055',
  parking: '#636e72',
  entrance: '#74b9ff',
};

const TYPE_EMOJI = {
  academic: '🏫', hostel: '🏠', admin: '🏛️', library: '📚',
  medical: '🏥', ground: '⚽', cafeteria: '🍔', parking: '🅿️', entrance: '🚪',
};

export default function MapLegend({ visible, onToggle }) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-6 left-4 z-[1000] animate-slide-up" style={{ maxWidth: 220 }}>
      <div className="glass-strong rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Map Legend
          </h3>
          <button
            onClick={onToggle}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all hover:scale-110"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Legend Items */}
        <div className="p-3 grid grid-cols-2 gap-1.5">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div
              key={type}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:scale-105 cursor-default"
              style={{ background: color + '10' }}
            >
              <span className="text-xs">{TYPE_EMOJI[type] || '📍'}</span>
              <span className="text-[10px] font-bold capitalize" style={{ color }}>
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
