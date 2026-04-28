import React from 'react';
import { X, Phone, Shield, Heart, AlertTriangle, Siren } from 'lucide-react';

const emergencyContacts = [
  { label: 'Campus Security', number: '0172-2750001', icon: Shield, color: '#6c5ce7', desc: '24/7 campus patrol & control room', priority: true },
  { label: 'Medical Emergency', number: '0172-2750002', icon: Heart, color: '#ff6b6b', desc: 'Health center & ambulance', priority: true },
  { label: 'Fire Emergency', number: '101', icon: AlertTriangle, color: '#fdcb6e', desc: 'Fire department dispatch' },
  { label: 'Women Helpline', number: '181', icon: Phone, color: '#fd79a8', desc: 'Women safety helpline' },
  { label: 'Police', number: '100', icon: Shield, color: '#74b9ff', desc: 'Local police station' },
  { label: 'Ambulance', number: '108', icon: Heart, color: '#00b894', desc: 'Emergency medical services' },
];

export default function EmergencyPanel({ onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overlay-backdrop animate-fade-in">
      <div className="w-full max-w-md mx-4 panel-container animate-scale-in overflow-hidden">

        {/* Pulsing red header */}
        <div className="p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' }}
        >
          {/* Pulsing rings background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 200 + i * 100,
                  height: 200 + i * 100,
                  border: '1px solid rgba(255,255,255,0.1)',
                  animation: `pulse-ring 2s ease-out ${i * 0.5}s infinite`,
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-breathe"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Siren className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-black text-xl text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Emergency Hub</h2>
                <p className="text-xs text-white/70 font-medium">Quick access to emergency services</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Contacts */}
        <div className="p-5 space-y-2.5">
          {emergencyContacts.map((c, i) => {
            const Icon = c.icon;
            return (
              <a
                key={i}
                href={`tel:${c.number}`}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] hover-lift group"
                style={{
                  background: c.priority ? (c.color + '08') : 'var(--bg-tertiary)',
                  border: `1px solid ${c.priority ? (c.color + '20') : 'var(--border)'}`,
                  animation: `staggerChild 0.3s ease-out ${i * 0.05}s forwards`,
                }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center relative"
                  style={{ background: c.color + '15', color: c.color }}
                >
                  <Icon size={20} />
                  {/* Subtle glow ring */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ boxShadow: `0 0 16px ${c.color}40` }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.label}</p>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{c.desc}</p>
                </div>
                <div className="px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all group-hover:scale-110"
                  style={{
                    background: c.color + '15',
                    color: c.color,
                    boxShadow: `0 2px 8px ${c.color}15`,
                  }}
                >
                  📞 {c.number}
                </div>
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <div className="p-3 rounded-xl text-center text-[10px] font-bold"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            💡 Tap any contact to call directly
          </div>
        </div>
      </div>
    </div>
  );
}
