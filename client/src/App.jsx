import React, { useState, useEffect, useCallback } from 'react';
import CampusMap from './components/CampusMap';
import ChatPanel from './components/ChatPanel';
import SearchBar from './components/SearchBar';
import EmergencyPanel from './components/EmergencyPanel';
import EventsPanel from './components/EventsPanel';
import DirectoryPanel from './components/DirectoryPanel';
import AboutPanel from './components/AboutPanel';
import MapLegend from './components/MapLegend';
import AnalyticsPanel from './components/AnalyticsPanel';
import MobileNav from './components/MobileNav';
import WelcomeOverlay from './components/WelcomeOverlay';
import { useTrafficSimulation } from './hooks/useTrafficSimulation';
import { useLiveTracking } from './hooks/useLiveTracking';
import { Sun, Moon, Navigation, Navigation2, MapPin, Info, Activity, Calendar, Layers, ChevronLeft, ChevronRight, Wifi, WifiOff, LocateFixed, LocateOff, Flame, BarChart } from 'lucide-react';

export default function App() {
  const [dark, setDark] = useState(true);
  const [mapActions, setMapActions] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState('map');
  const [apiStatus, setApiStatus] = useState('checking');
  const [is3D, setIs3D] = useState(false);
  const [weather, setWeather] = useState('morning');
  const [showHeatmap, setShowHeatmap] = useState(false);

  const trafficData = useTrafficSimulation(showTraffic ? buildings : null);

  // Live GPS tracking
  const gps = useLiveTracking(buildings);

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Fetch buildings
  useEffect(() => {
    fetch('/api/campus/buildings')
      .then(r => r.json())
      .then((data) => {
        setBuildings(data);
        setApiStatus('online');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  // Health check
  useEffect(() => {
    const check = () => {
      fetch('/api/health')
        .then(r => r.ok ? setApiStatus('online') : setApiStatus('offline'))
        .catch(() => setApiStatus('offline'));
    };
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Atmospheric Engine — Sync with IST (Rajpura)
  useEffect(() => {
    const updateWeather = () => {
      const istTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const hour = istTime.getHours();
      
      if (hour >= 5 && hour < 10) setWeather('morning');
      else if (hour >= 10 && hour < 17) setWeather('day');
      else if (hour >= 17 && hour < 20) setWeather('sunset');
      else setWeather('night');
    };
    
    updateWeather();
    const interval = setInterval(updateWeather, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleMapAction = useCallback((actions) => {
    setMapActions(actions);
  }, []);

  const handleBuildingSelect = useCallback((building) => {
    setSelectedBuilding(building);
    setMapActions([{ type: 'zoom', building }]);
  }, []);

  // Mobile tab handler
  const handleMobileTab = (tab) => {
    if (tab === 'chat') { setChatOpen(true); setMobileTab('chat'); }
    else if (tab === 'map') { setChatOpen(false); setMobileTab('map'); }
    else if (tab === 'search') { setChatOpen(true); setMobileTab('search'); }
    else if (tab === 'emergency') { setShowEmergency(true); }
    else if (tab === 'about') { setShowAbout(true); }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Welcome Overlay */}
      <WelcomeOverlay />

      {/* ─── HEADER ─── */}
      <header className="glass-strong h-14 flex items-center justify-between px-4 z-50 shrink-0 relative" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center relative animate-breathe"
            style={{
              background: 'linear-gradient(135deg, #6c5ce7, #0984e3, #00cec9)',
              boxShadow: '0 4px 16px rgba(108,92,231,0.3)',
            }}
          >
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg leading-none font-black tracking-tight gradient-text" style={{ fontFamily: 'Outfit' }}>
              Cognix
            </h1>
            <p className="text-[9px] mt-0.5 font-bold uppercase tracking-widest hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              Smart Campus • Chitkara
            </p>
          </div>

          {/* API Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
            style={{
              background: apiStatus === 'online' ? 'rgba(0,184,148,0.1)' : 'rgba(255,107,107,0.1)',
              color: apiStatus === 'online' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${apiStatus === 'online' ? 'rgba(0,184,148,0.15)' : 'rgba(255,107,107,0.15)'}`,
            }}
          >
            {apiStatus === 'online' ? <Wifi size={10} /> : <WifiOff size={10} />}
            {apiStatus === 'online' ? 'Live' : 'Offline'}
          </div>
        </div>

        {/* Center: Nav Tabs (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
          {[
            { label: 'Analytics', icon: BarChart, active: showAnalytics, onClick: () => setShowAnalytics(!showAnalytics) },
            { label: 'Heatmap', icon: Flame, active: showHeatmap, onClick: () => setShowHeatmap(!showHeatmap), danger: showHeatmap },
            { label: 'Traffic', icon: Activity, active: showTraffic, onClick: () => setShowTraffic(!showTraffic), danger: showTraffic },
            { label: 'Directory', icon: MapPin, active: showDirectory, onClick: () => setShowDirectory(!showDirectory) },
            { label: 'Events', icon: Calendar, active: showEvents, onClick: () => setShowEvents(!showEvents) },
            { label: 'Legend', icon: Layers, active: showLegend, onClick: () => setShowLegend(!showLegend) },
            { label: 'About', icon: Info, active: showAbout, onClick: () => setShowAbout(!showAbout) },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative"
                style={{
                  background: item.active
                    ? (item.danger ? 'var(--danger)' : 'var(--brand)')
                    : 'transparent',
                  color: item.active ? '#fff' : 'var(--text-secondary)',
                }}
              >
                <Icon size={13} className={item.active && item.danger ? 'animate-pulse' : ''} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* SOS Button */}
          <button
            onClick={() => setShowEmergency(!showEmergency)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-white transition-all hover:scale-105 animate-glow hidden sm:flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              boxShadow: '0 4px 16px rgba(255,107,107,0.3)',
            }}
          >
            🚨 SOS
          </button>

          {/* Sidebar toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            title={chatOpen ? 'Hide Chat' : 'Show Chat'}
          >
            {chatOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:rotate-12"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            chatOpen ? 'w-full md:w-[420px] opacity-100' : 'w-0 opacity-0 overflow-hidden'
          } shrink-0 flex flex-col z-10`}
          style={{ borderRight: chatOpen ? '1px solid var(--border)' : 'none', background: 'var(--bg-secondary)' }}
        >
          <SearchBar buildings={buildings} onSelect={handleBuildingSelect} />
          <ChatPanel
            onMapAction={handleMapAction}
            selectedBuilding={selectedBuilding}
          />
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <CampusMap
            buildings={buildings}
            actions={mapActions}
            onBuildingClick={handleBuildingSelect}
            trafficData={showTraffic ? trafficData : null}
            userLocation={gps.tracking ? { position: gps.position, accuracy: gps.accuracy } : null}
            is3D={is3D}
            weather={weather}
            showHeatmap={showHeatmap}
          />

          {/* Map Legend */}
          <MapLegend visible={showLegend} onToggle={() => setShowLegend(false)} />

          {/* Map floating controls */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            {/* Mobile-only buttons */}
            <div className="flex flex-col gap-2 lg:hidden">
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 shadow-md"
                style={{
                  background: showHeatmap ? 'var(--danger)' : 'var(--bg-elevated)',
                  color: showHeatmap ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <Flame size={16} className={showHeatmap ? 'animate-pulse' : ''} />
              </button>
              <button
                onClick={() => setShowTraffic(!showTraffic)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 shadow-md"
                style={{
                  background: showTraffic ? 'var(--danger)' : 'var(--bg-elevated)',
                  color: showTraffic ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <Activity size={16} className={showTraffic ? 'animate-pulse' : ''} />
              </button>
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 shadow-md"
                style={{
                  background: showLegend ? 'var(--brand)' : 'var(--bg-elevated)',
                  color: showLegend ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <Layers size={16} />
              </button>

              {/* 3D Perspective Toggle */}
              <button
                onClick={() => setIs3D(!is3D)}
                title="Toggle 3D Drone View"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md group ${is3D ? 'animate-glow' : ''}`}
                style={{
                  background: is3D ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                  color: is3D ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className={`transition-transform duration-500 ${is3D ? 'rotate-[-30deg] scale-125' : ''}`}>
                  <Navigation size={16} className={is3D ? 'animate-float' : ''} />
                </div>
              </button>
            </div>

            {/* Track Me button */}
            <button
              id="track-me-btn"
              onClick={() => gps.tracking ? gps.stopTracking() : gps.startTracking()}
              title={gps.tracking ? 'Stop tracking' : 'Track my location'}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 shadow-md ${
                gps.tracking ? 'tracking-active-btn' : ''
              }`}
              style={{
                background: gps.tracking
                  ? 'linear-gradient(135deg,#4a90e2,#357abd)'
                  : gps.status === 'requesting'
                  ? 'linear-gradient(135deg,#fdcb6e,#e17055)'
                  : 'var(--bg-elevated)',
                color: gps.tracking || gps.status === 'requesting' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {gps.status === 'requesting'
                ? <span style={{ fontSize: 14 }}>⏳</span>
                : gps.tracking
                ? <LocateFixed size={16} />
                : <LocateOff size={16} />}
            </button>
          </div>{/* end float-controls */}

          {/* GPS Status Toast — inside map div so absolute positioning works */}
          {(gps.tracking || gps.status === 'requesting' || gps.error) && (
            <div
              className="tracker-toast absolute bottom-6 left-1/2 z-[2000] pointer-events-none"
              style={{ transform: 'translateX(-50%)' }}
            >
              <div
                className="glass-strong px-4 py-2.5 rounded-2xl flex items-center gap-3"
                style={{
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  maxWidth: 340,
                  minWidth: 240,
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: gps.error ? '#ff6b6b'
                    : gps.status === 'requesting' ? '#fdcb6e'
                    : gps.insideCampus ? '#00b894' : '#74b9ff',
                  boxShadow: gps.tracking && !gps.error
                    ? `0 0 8px ${gps.insideCampus ? '#00b894' : '#74b9ff'}`
                    : 'none',
                  animation: gps.tracking && !gps.error ? 'gps-pulse 2s infinite' : 'none',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {gps.error ? `⚠️ ${gps.error}`
                      : gps.status === 'requesting' ? '⏳ Getting your location…'
                      : gps.insideCampus ? '🟢 Inside Campus'
                      : '🔵 Outside Campus'}
                  </div>
                  {gps.tracking && !gps.error && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {gps.nearestBuilding
                        ? `📍 Nearest: ${gps.nearestBuilding.name} · ${gps.nearestBuilding.distanceMetres}m`
                        : '📍 Locating…'}
                      {gps.accuracy ? ` · ±${gps.accuracy}m` : ''}
                    </div>
                  )}
                </div>
                {gps.tracking && gps.position && (
                  <button
                    className="pointer-events-auto w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', flexShrink: 0 }}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('gps-recenter', {
                        detail: { lat: gps.position.lat, lng: gps.position.lng }
                      }));
                    }}
                    title="Re-center map on me"
                  >
                    <Navigation2 size={12} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>{/* end map div */}

        {/* Overlay Panels */}
        {showEmergency && <EmergencyPanel onClose={() => setShowEmergency(false)} />}
        {showEvents && <EventsPanel onClose={() => setShowEvents(false)} />}
        {showDirectory && <DirectoryPanel buildings={buildings} onClose={() => setShowDirectory(false)} trafficData={showTraffic ? trafficData : null} />}
        {showAbout && <AboutPanel onClose={() => setShowAbout(false)} />}
        {showAnalytics && <AnalyticsPanel buildings={buildings} onClose={() => setShowAnalytics(false)} />}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav activeTab={mobileTab} onTabChange={handleMobileTab} />
    </div>
  );
}
