import React, { useState, useEffect } from 'react';
import { Navigation, Sparkles, MapPin, MessageCircle, Route, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Find Any Location',
    desc: 'Search buildings, labs, hostels & more across campus',
    color: '#6c5ce7',
  },
  {
    icon: MessageCircle,
    title: 'AI Chatbot',
    desc: 'Ask naturally — "Where is Turing Block?"',
    color: '#00cec9',
  },
  {
    icon: Route,
    title: 'Smart Navigation',
    desc: 'Dijkstra-powered shortest paths with walk time estimates',
    color: '#fd79a8',
  },
];

export default function WelcomeOverlay({ onDismiss }) {
  const [show, setShow] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('cognix-welcome-seen');
    if (!seen) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('cognix-welcome-seen', 'true');
    setShow(false);
    onDismiss?.();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overlay-backdrop animate-fade-in">
      <div
        className="w-full max-w-md mx-4 panel-container animate-scale-in flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Animated header */}
        <div
          className="relative px-8 pt-8 pb-6 text-center overflow-hidden shrink-0"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #0ea5e9, #8b5cf6)',
          }}
        >
          {/* Scanning line effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <div className="absolute top-0 left-0 w-full h-[2px] bg-white animate-slide-down shadow-[0_0_15px_white]" style={{ animationDuration: '4s', animationIterationCount: 'infinite' }} />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float"
                style={{
                  width: 3 + Math.random() * 6,
                  height: 3 + Math.random() * 6,
                  background: 'rgba(255,255,255,0.3)',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            ))}
          </div>

          {/* Logo */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[2rem] mb-5 animate-glow"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}
          >
            <Navigation className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-1" style={{ fontFamily: 'Outfit' }}>
            Cognix <span className="text-xs align-top bg-white/20 px-2 py-0.5 rounded-full ml-1">v2.0</span>
          </h1>
          <p className="text-sm font-semibold text-white/90 italic">
            Advanced Campus Digital Twin
          </p>
        </div>

        {/* Feature slides */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] cursor-default"
                  style={{
                    background: f.color + '08',
                    border: `1px solid ${f.color}15`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: f.color + '15', color: f.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleDismiss}
            className="w-full mt-6 py-3.5 rounded-2xl text-sm font-extrabold btn-primary flex items-center justify-center gap-2 group"
          >
            Explore Campus
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>

          {/* Skip */}
          <p className="text-center mt-3 text-xs font-medium cursor-pointer hover:underline" style={{ color: 'var(--text-muted)' }}
            onClick={handleDismiss}
          >
            Skip intro
          </p>
        </div>
      </div>
    </div>
  );
}
