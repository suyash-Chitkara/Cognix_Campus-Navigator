import React from 'react';
import { MessageCircle, Map, Search, AlertTriangle, Info } from 'lucide-react';

const navItems = [
  { id: 'chat', icon: MessageCircle, label: 'Chat' },
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'emergency', icon: AlertTriangle, label: 'SOS' },
  { id: 'about', icon: Info, label: 'About' },
];

export default function MobileNav({ activeTab, onTabChange }) {
  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isEmergency = item.id === 'emergency';

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all relative"
                style={{
                  color: isEmergency
                    ? 'var(--danger)'
                    : isActive
                      ? 'var(--brand)'
                      : 'var(--text-muted)',
                }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div
                    className="absolute -top-1 w-5 h-1 rounded-full animate-scale-in"
                    style={{ background: isEmergency ? 'var(--danger)' : 'var(--brand)' }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
        {/* Safe area padding for phones with home bar */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </nav>
  );
}
