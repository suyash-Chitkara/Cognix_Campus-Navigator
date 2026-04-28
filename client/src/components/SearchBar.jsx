import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, MapPin, Command, Building2, Clock, ArrowRight, Filter, Layers, Hash, ChevronRight } from 'lucide-react';

// ─── Type metadata ───
const TYPE_COLORS = {
  academic: '#6366f1', hostel: '#f59e0b', admin: '#10b981', library: '#818cf8',
  medical: '#ef4444', ground: '#06b6d4', cafeteria: '#f97316', parking: '#64748b', entrance: '#38bdf8',
};
const TYPE_EMOJI = {
  academic: '🏫', hostel: '🏠', admin: '🏛️', library: '📚',
  medical: '🏥', ground: '⚽', cafeteria: '🍔', parking: '🅿️', entrance: '🚪',
};
const TYPE_LABELS = {
  academic: 'Academic', hostel: 'Hostel', admin: 'Admin', library: 'Library',
  medical: 'Medical', ground: 'Ground', cafeteria: 'Cafeteria', parking: 'Parking', entrance: 'Entrance',
};

// ─── Fuzzy search scoring ───
function searchScore(building, query) {
  const q = query.toLowerCase();
  const name = building.name.toLowerCase();
  const type = building.type.toLowerCase();
  const depts = (building.departments || []).join(' ').toLowerCase();
  const amenities = (building.amenities || []).join(' ').toLowerCase();
  const desc = (building.description || '').toLowerCase();

  // Exact name match → highest priority
  if (name === q) return 100;
  // Name starts with query
  if (name.startsWith(q)) return 90;
  // Name contains query
  if (name.includes(q)) return 80;
  // Type match
  if (type.includes(q)) return 60;
  // Department match
  if (depts.includes(q)) return 50;
  // Amenity match
  if (amenities.includes(q)) return 40;
  // Description match
  if (desc.includes(q)) return 20;

  // Token matching — match individual words
  const tokens = q.split(/\s+/);
  const haystack = `${name} ${type} ${depts} ${amenities}`;
  let tokenScore = 0;
  tokens.forEach(t => { if (haystack.includes(t)) tokenScore += 15; });
  return tokenScore;
}

// ─── Recent searches (persisted in localStorage) ───
function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem('cognix-recent-searches') || '[]').slice(0, 5);
  } catch { return []; }
}
function addRecentSearch(building) {
  try {
    let recent = getRecentSearches().filter(r => r.id !== building.id);
    recent.unshift({ id: building.id, name: building.name, type: building.type });
    localStorage.setItem('cognix-recent-searches', JSON.stringify(recent.slice(0, 5)));
  } catch {}
}

// ─── Highlight matched text ───
function HighlightText({ text, query }) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: 'var(--brand-light)', fontWeight: 800, background: 'rgba(99,102,241,0.1)', borderRadius: 3, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Search result item ───
function ResultItem({ building, query, isSelected, onSelect }) {
  const color = TYPE_COLORS[building.type] || '#6366f1';
  return (
    <button
      onClick={() => onSelect(building)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all group ${isSelected ? '' : 'hover:bg-white/[0.02]'}`}
      style={{
        background: isSelected ? `${color}08` : 'transparent',
        borderLeft: isSelected ? `3px solid ${color}` : '3px solid transparent',
      }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm transition-transform group-hover:scale-110"
        style={{ background: `${color}12`, border: `1px solid ${color}15` }}
      >
        {TYPE_EMOJI[building.type] || '📍'}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
          <HighlightText text={building.name} query={query} />
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>{TYPE_LABELS[building.type] || building.type}</span>
          {building.floors > 0 && (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: 8 }}>•</span>
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{building.floors}F</span>
            </>
          )}
          {building.departments?.length > 0 && (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: 8 }}>•</span>
              <span className="text-[9px] truncate" style={{ color: 'var(--text-muted)', maxWidth: 100 }}>{building.departments[0]}</span>
            </>
          )}
        </div>
      </div>

      {/* Action hint */}
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {isSelected ? (
          <kbd className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>↵</kbd>
        ) : (
          <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN SEARCH BAR (Command Palette Style)
// ═══════════════════════════════════════════════════
export default function SearchBar({ buildings, onSelect }) {
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null); // null = all types
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // ── Keyboard shortcut: Ctrl/Cmd + K ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShow(true);
      }
      if (e.key === 'Escape') {
        setShow(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Click outside to close ──
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Fuzzy search + filter ──
  const results = useMemo(() => {
    if (!query.trim() && !activeFilter) return [];
    let filtered = buildings;

    // Apply type filter
    if (activeFilter) {
      filtered = filtered.filter(b => b.type === activeFilter);
    }

    // Apply search query scoring
    if (query.trim()) {
      const scored = filtered
        .map(b => ({ ...b, score: searchScore(b, query) }))
        .filter(b => b.score > 0)
        .sort((a, b) => b.score - a.score);
      return scored.slice(0, 8);
    }

    // If only filter active, show all of that type (sorted by name)
    return filtered.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 10);
  }, [query, buildings, activeFilter]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Show dropdown when query or filter is active
  useEffect(() => {
    if (query.trim() || activeFilter) setShow(true);
  }, [query, activeFilter]);

  const handleSelect = (building) => {
    onSelect(building);
    addRecentSearch(building);
    setRecentSearches(getRecentSearches());
    setQuery('');
    setShow(false);
    setActiveFilter(null);
  };

  const handleKeyDown = (e) => {
    const totalItems = results.length;
    if (!show || totalItems === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) handleSelect(results[selectedIndex]);
    }
  };

  // Available types for filter chips
  const availableTypes = useMemo(() => {
    const types = new Set(buildings.map(b => b.type));
    return [...types].sort();
  }, [buildings]);

  const showRecents = show && !query.trim() && !activeFilter && recentSearches.length > 0;
  const showResults = show && results.length > 0;
  const showEmpty = show && query.trim() && results.length === 0;
  const showDropdown = showRecents || showResults || showEmpty || (show && activeFilter);

  return (
    <div className="relative p-3" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* ── Search Input ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: show ? 'var(--brand-light)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShow(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search buildings, labs, hostels..."
          className="w-full pl-10 pr-20 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: show ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
            '--tw-ring-color': 'rgba(99,102,241,0.3)',
          }}
        />
        {/* Right side: clear or shortcut */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
            <button onClick={() => { setQuery(''); setActiveFilter(null); }} className="p-1 rounded-md hover:bg-white/10 transition-all">
              <X size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          ) : (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              <Command size={9} /> K
            </div>
          )}
        </div>
      </div>

      {/* ── Dropdown Panel ── */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-3 right-3 top-[calc(100%+2px)] rounded-2xl overflow-hidden z-50 animate-slide-down"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.05)',
            maxHeight: 420,
            overflowY: 'auto',
          }}
        >
          {/* ── Filter Chips ── */}
          <div className="px-3 py-2.5 flex items-center gap-1.5 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}>
            <Filter size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <button
              onClick={() => setActiveFilter(null)}
              className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shrink-0"
              style={{
                background: !activeFilter ? 'var(--brand)' : 'transparent',
                color: !activeFilter ? '#fff' : 'var(--text-muted)',
                border: !activeFilter ? 'none' : '1px solid var(--border)',
              }}
            >
              All
            </button>
            {availableTypes.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(activeFilter === type ? null : type)}
                className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1"
                style={{
                  background: activeFilter === type ? (TYPE_COLORS[type] || '#6366f1') : 'transparent',
                  color: activeFilter === type ? '#fff' : 'var(--text-muted)',
                  border: activeFilter === type ? 'none' : '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 10 }}>{TYPE_EMOJI[type]}</span>
                {TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>

          {/* ── Recent Searches (when idle) ── */}
          {showRecents && (
            <div>
              <div className="px-4 py-2 flex items-center gap-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <Clock size={10} style={{ color: 'var(--text-muted)' }} />
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Recent</span>
              </div>
              {recentSearches.map((r) => {
                const building = buildings.find(b => b.id === r.id);
                if (!building) return null;
                return <ResultItem key={r.id} building={building} query="" isSelected={false} onSelect={handleSelect} />;
              })}
            </div>
          )}

          {/* ── Search Results ── */}
          {showResults && (
            <div>
              <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-1.5">
                  <Hash size={10} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {results.length} result{results.length !== 1 ? 's' : ''}
                    {activeFilter && ` in ${TYPE_LABELS[activeFilter]}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded text-[7px] font-bold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>↑↓</kbd>
                  <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>navigate</span>
                </div>
              </div>
              {results.map((b, i) => (
                <ResultItem
                  key={b.id}
                  building={b}
                  query={query}
                  isSelected={i === selectedIndex}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}

          {/* ── Empty State ── */}
          {showEmpty && (
            <div className="px-6 py-8 text-center">
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>No results for "{query}"</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Try searching by building name, type, or department
              </p>
            </div>
          )}

          {/* ── Footer Hint ── */}
          <div className="px-4 py-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[7px] font-bold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>↵</kbd>
                <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[7px] font-bold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>esc</kbd>
                <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>close</span>
              </div>
            </div>
            <span className="text-[8px] font-semibold" style={{ color: 'var(--text-muted)' }}>
              Cognix Search
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
