import React from 'react';
import { X, Map, GraduationCap, Heart, Navigation, Cpu, Route, MessageCircle, Layers, Zap, Globe, Code } from 'lucide-react';

const features = [
  { icon: Map, title: 'Interactive Campus Map', desc: 'Real-time, zoomable map with all 40+ campus locations', color: '#6c5ce7' },
  { icon: MessageCircle, title: 'AI Chatbot', desc: 'Natural language queries with intent detection & NLP', color: '#00cec9' },
  { icon: Route, title: 'Smart Pathfinding', desc: 'Dijkstra-powered shortest routes with walk animation', color: '#fd79a8' },
  { icon: Zap, title: 'Live Traffic', desc: 'Real-time crowd density simulation', color: '#fdcb6e' },
  { icon: Layers, title: 'Building Directory', desc: 'Distance, direction & compass for every location', color: '#00b894' },
  { icon: Cpu, title: 'Offline-Ready', desc: 'Works with cached data when server is unreachable', color: '#ff6b6b' },
];

const techStack = [
  { name: 'React 19', color: '#61dafb' },
  { name: 'Vite', color: '#646cff' },
  { name: 'Leaflet', color: '#199900' },
  { name: 'Express', color: '#000000' },
  { name: 'Node.js', color: '#339933' },
  { name: 'Tailwind CSS', color: '#0ea5e9' },
  { name: 'Dijkstra', color: '#ff6b6b' },
  { name: 'NLP', color: '#6c5ce7' },
];

export default function AboutPanel({ onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overlay-backdrop animate-fade-in">
      <div className="w-full max-w-2xl flex flex-col panel-container animate-scale-in max-h-[90vh]">

        {/* Hero Header */}
        <div className="relative p-8 text-center overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg, #6c5ce7, #0984e3, #00cec9)' }}
        >
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute rounded-full animate-float"
                style={{
                  width: 3 + Math.random() * 6,
                  height: 3 + Math.random() * 6,
                  background: 'rgba(255,255,255,0.15)',
                  left: `${5 + Math.random() * 90}%`,
                  top: `${5 + Math.random() * 90}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Close button */}
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <X size={18} className="text-white" />
          </button>

          {/* Logo */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-breathe"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.2)' }}
          >
            <Navigation className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight mb-1" style={{ fontFamily: 'Outfit' }}>Cognix</h2>
          <p className="text-sm font-medium text-white/75">Smart Campus Navigation System</p>
          <p className="text-xs text-white/50 mt-2">v2.0 • Built for Chitkara University</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scroll" style={{ background: 'var(--bg-primary)' }}>

          {/* About Cognix */}
          <section className="p-6 sm:p-8">
            <h3 className="font-black flex items-center gap-2 text-lg mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
              <Map className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              About Cognix
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <strong>Cognix</strong> is a next-generation Smart Campus Navigation System designed exclusively for Chitkara University.
              It provides a highly interactive map of the campus, integrating precise geolocation, a typo-tolerant spatial AI chatbot, and real-time Dijkstra-based route planning.
              Whether you're looking for the shortest path to your next class, the nearest cafeteria, or emergency contacts – Cognix handles it instantly.
            </p>
          </section>

          {/* Features Grid */}
          <section className="px-6 sm:px-8 pb-6">
            <h3 className="font-black flex items-center gap-2 text-lg mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
              <Zap className="w-5 h-5" style={{ color: '#fdcb6e' }} />
              Key Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      animation: `staggerChild 0.3s ease-out ${i * 0.05}s forwards`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: f.color + '12', color: f.color }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{f.title}</h4>
                        <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* About Chitkara */}
          <section className="px-6 sm:px-8 pb-6">
            <h3 className="font-black flex items-center gap-2 text-lg mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
              <GraduationCap className="w-5 h-5" style={{ color: '#a29bfe' }} />
              About Chitkara University
            </h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              Established in 2010 by the Punjab State Legislature, <strong>Chitkara University</strong> (Punjab Campus) is a leading non-profit private university.
              Spanning over 50 acres on the Chandigarh-Patiala National Highway (NH-64), the campus features world-class infrastructure.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              It includes state-of-the-art academic blocks like Edison and Turing, the interactive Exploretorium, top-tier medical facilities at Neelam Hospital, and comprehensive sports complexes. Chitkara is celebrated for its research focus, entrepreneurship (CEED), and global academic integration.
            </p>
          </section>

          {/* Tech Stack */}
          <section className="px-6 sm:px-8 pb-6">
            <h3 className="font-black flex items-center gap-2 text-lg mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
              <Code className="w-5 h-5" style={{ color: '#00cec9' }} />
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((t, i) => (
                <span
                  key={i}
                  className="badge transition-all hover:scale-105"
                  style={{
                    background: t.color + '12',
                    color: t.color === '#000000' ? 'var(--text-primary)' : t.color,
                    border: `1px solid ${t.color}20`,
                  }}
                >
                  {t.name}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-xs font-bold shrink-0" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
          <p className="flex items-center justify-center gap-1.5">
            Built with <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" /> for Chitkara University
          </p>
        </div>
      </div>
    </div>
  );
}
