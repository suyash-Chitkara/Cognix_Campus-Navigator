import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Sparkles, MapPin } from 'lucide-react';

const CATEGORY_COLORS = {
  workshop: '#6c5ce7',
  placement: '#00b894',
  cultural: '#fdcb6e',
  seminar: '#a29bfe',
  sports: '#ff6b6b',
};

const CATEGORY_EMOJI = {
  workshop: '🛠️',
  placement: '💼',
  cultural: '🎭',
  seminar: '🎤',
  sports: '🏆',
};

export default function EventsPanel({ onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overlay-backdrop animate-fade-in">
      <div className="w-full max-w-lg mx-4 panel-container animate-scale-in max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="p-6 shrink-0 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6c5ce7, #0984e3)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Floating decorative dots */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="absolute rounded-full animate-float"
                style={{
                  width: 6, height: 6,
                  background: 'rgba(255,255,255,0.15)',
                  left: `${20 + i * 20}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.7}s`,
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-black text-xl text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Campus Events</h2>
                <p className="text-xs text-white/70 font-medium">
                  {events.length} upcoming event{events.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scroll" style={{ background: 'var(--bg-primary)' }}>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-5 rounded-2xl animate-shimmer" style={{ background: 'var(--bg-secondary)', height: 120 }} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-16 h-16 mb-4 opacity-15" />
              <p className="font-bold text-lg" style={{ fontFamily: 'Outfit' }}>No upcoming events</p>
              <p className="text-xs mt-1">Check back later for new activities</p>
            </div>
          ) : (
            events.map((evt, i) => {
              const catColor = CATEGORY_COLORS[evt.category] || '#6c5ce7';
              const catEmoji = CATEGORY_EMOJI[evt.category] || '📌';

              return (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg group"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${catColor}`,
                    animation: `staggerChild 0.3s ease-out ${i * 0.05}s forwards`,
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{catEmoji}</span>
                      <h3 className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{evt.title}</h3>
                    </div>
                    <span className="badge shrink-0" style={{ background: catColor + '12', color: catColor }}>
                      {evt.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs font-medium mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{evt.description}</p>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                    >
                      <Calendar size={11} style={{ color: catColor }} /> {evt.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                    >
                      <Clock size={11} style={{ color: catColor }} /> {evt.time}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                    >
                      <Tag size={11} style={{ color: catColor }} /> {evt.host}
                    </span>
                    {evt.location && (
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                      >
                        <MapPin size={11} style={{ color: catColor }} /> {evt.location}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
