import React, { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import HeatmapLayer from './HeatmapLayer';

// Center of Chitkara University Punjab (Rajpura, NH-64)
const CENTER = [30.5165, 76.6592];
const ZOOM = 17;

// Color map for building types
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

// Type emoji map
const TYPE_EMOJI = {
  academic: '🏫', hostel: '🏠', admin: '🏛️', library: '📚',
  medical: '🏥', ground: '⚽', cafeteria: '🍔', parking: '🅿️', entrance: '🚪',
};

// ──────────────────────────────────────────────────────────
//  Per-building image map — real Chitkara University photos
//  Sources: Wikimedia Commons (CC-BY-SA)
// ──────────────────────────────────────────────────────────
const BUILDING_IMAGES = {
  // ── Real photos from Wikimedia Commons ──
  'turing-block':                           '/images/chitkara/turing-block-close.jpg',
  'newton-block':                           '/images/chitkara/turing-block-far.jpg',   // same academic wing view
  'edison-block':                           '/images/chitkara/turing-block-far.jpg',
  'de-morgan-block':                        '/images/chitkara/turing-block-far.jpg',
  'galileo-block':                          '/images/chitkara/turing-block-far.jpg',
  'flemming-block':                         '/images/chitkara/turing-block-far.jpg',
  'le-corbusier-block':                     '/images/chitkara/turing-block-far.jpg',
  'babbage-block':                          '/images/chitkara/turing-block-far.jpg',
  'vasco-da-gama':                          '/images/chitkara/campus-pic2.jpg',
  'rockfeller-building':                    '/images/chitkara/campus-pic2.jpg',
  'martin-luther':                          '/images/chitkara/campus-pic2.jpg',
  'omega-zone':                             '/images/chitkara/campus-pic2.jpg',
  'alpha-zone':                             '/images/chitkara/campus-pic2.jpg',
  'beta-zone':                              '/images/chitkara/campus-pic2.jpg',
  'mass-communication-block':               '/images/chitkara/campus-pic2.jpg',
  'socrates-hall':                          '/images/chitkara/campus-pic2.jpg',
  'pythagoras':                             '/images/chitkara/campus-pic2.jpg',

  // ── Admission / Admin area ──
  'admission-block':                        '/images/chitkara/chitkara-business-school.jpg',
  'hospitality-block':                      '/images/chitkara/chitkara-business-school.jpg',
  'explore-hub':                            '/images/chitkara/chitkara-business-school.jpg',
  'exploretorium':                          '/images/chitkara/chitkara-business-school.jpg',

  // ── Entrance gates ──
  'gate-no-4':                              '/images/chitkara/entrance-gate.jpg',
  'towards-gate-no-4':                      '/images/chitkara/entrance-gate.jpg',

  // ── Campus roads / open areas ──
  'chitkara-woods':                         '/images/chitkara/main-road.jpg',
  'football-ground':                        '/images/chitkara/main-road.jpg',
  'football-ground-2':                      '/images/chitkara/main-road.jpg',
  'volleyball-court':                       '/images/chitkara/main-road.jpg',
  'sportorium':                             '/images/chitkara/main-road.jpg',
  'chitkara-parking':                       '/images/chitkara/main-road.jpg',
  'new-faculty-parking':                    '/images/chitkara/main-road.jpg',
  'saraswati-mata':                         '/images/chitkara/main-road.jpg',
};

// Type-level fallback images (for buildings without a specific mapping)
const TYPE_FALLBACK_IMAGES = {
  academic:   '/images/chitkara/turing-block-far.jpg',
  hostel:     '/images/chitkara/campus-pic2.jpg',
  admin:      '/images/chitkara/chitkara-business-school.jpg',
  medical:    '/images/chitkara/campus-pic2.jpg',
  ground:     '/images/chitkara/main-road.jpg',
  cafeteria:  '/images/chitkara/main-road.jpg',
  parking:    '/images/chitkara/main-road.jpg',
  entrance:   '/images/chitkara/entrance-gate.jpg',
  library:    '/images/chitkara/campus-pic2.jpg',
};

// Resolve the best image for a building
function getBuildingImage(id, type) {
  return BUILDING_IMAGES[id]
    || TYPE_FALLBACK_IMAGES[type]
    || '/images/chitkara/turing-block-far.jpg';
}

function getShortName(name) {
  return name.replace(/\s*\(.*\)/, '').trim();
}

function createIcon(type, name, isHighlighted = false, trafficInfo = null) {
  const color = TYPE_COLORS[type] || '#6c5ce7';
  const emoji = TYPE_EMOJI[type] || '📍';
  const shortName = getShortName(name);

  const fontSize = isHighlighted ? 11 : 9;
  const maxWidth = 140;
  const containerHeight = 44;
  const pointerSize = isHighlighted ? 7 : 5;

  const trafficHtml = trafficInfo ? `
    <div class="traffic-ring traffic-${trafficInfo.status.toLowerCase()}" style="position: absolute; bottom: -5px; left: 50%;"></div>
  ` : '';

  const glowStyle = isHighlighted
    ? `box-shadow: 0 4px 20px ${color}60, 0 0 0 3px ${color}30; transform: scale(1.12); z-index: 1000;`
    : `box-shadow: 0 2px 10px rgba(0,0,0,0.25);`;

  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${maxWidth}px;
      height: ${containerHeight}px;
      display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
      pointer-events: auto; cursor: pointer;
      position: relative;
      ${isHighlighted ? 'z-index: 1000;' : ''}
      transition: transform 0.2s ease;
    ">
      <!-- 3D Hologram Pillar (Ground anchored) -->
      <div class="hologram-pillar" style="--brand: ${color};"></div>

      ${trafficHtml}
      <!-- Badge -->
      <div style="
        background: ${color};
        color: white;
        padding: 3px 8px;
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        font-size: ${fontSize}px;
        font-weight: 700;
        white-space: nowrap;
        max-width: ${maxWidth - 10}px;
        overflow: hidden;
        text-overflow: ellipsis;
        ${glowStyle}
        border: 1.5px solid rgba(255,255,255,0.6);
        line-height: 1.3;
        letter-spacing: 0.2px;
        backdrop-filter: blur(4px);
        transition: all 0.2s ease;
      ">${emoji} ${shortName}</div>
      
      <!-- Pointer -->
      <div style="
        width: 0; height: 0;
        border-left: ${pointerSize}px solid transparent;
        border-right: ${pointerSize}px solid transparent;
        border-top: ${pointerSize + 2}px solid ${color};
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        flex-shrink: 0;
      "></div>
    </div>`,
    iconSize: [maxWidth, containerHeight],
    iconAnchor: [maxWidth / 2, containerHeight],
  });
}

// Component to handle map actions (zoom, highlight, route)
function MapController({ actions, buildings }) {
  const map = useMap();

  useEffect(() => {
    if (!actions || actions.length === 0) return;

    actions.forEach((action) => {
      if (action.type === 'zoom' && action.building) {
        const { lat, lng } = action.building.coordinates;
        map.flyTo([lat, lng], 18, { duration: 1.2, easeLinearity: 0.5 });
      }
      if (action.type === 'route' && action.waypoints) {
        const bounds = action.waypoints.map(w => [w.coordinates.lat, w.coordinates.lng]);
        map.flyToBounds(bounds, { padding: [80, 80], duration: 1.2 });
      }
      if (action.type === 'highlight' && action.buildings) {
        const bounds = action.buildings.map(b => [b.coordinates.lat, b.coordinates.lng]);
        if (bounds.length > 0) map.flyToBounds(bounds, { padding: [80, 80], duration: 1.2 });
      }
    });
  }, [actions, map]);

  return null;
}

// ── Live GPS dot rendered inside Leaflet map ──
function LiveTracker({ position, accuracy }) {
  const map = useMap();

  // Create / update the pulsing divIcon marker
  const dotIcon = L.divIcon({
    className: '',
    html: `<div class="gps-dot-wrapper">
      <div class="gps-dot-ring"></div>
      <div class="gps-dot-ring2"></div>
      <div class="gps-dot-core"></div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  // Auto-center once on first fix
  const centeredRef = React.useRef(false);
  useEffect(() => {
    if (!centeredRef.current && position) {
      map.flyTo([position.lat, position.lng], 18, { duration: 1.5 });
      centeredRef.current = true;
    }
  }, [position, map]);

  // Listen for manual re-center events from the toast button
  useEffect(() => {
    const handler = (e) => {
      map.flyTo([e.detail.lat, e.detail.lng], 18, { duration: 1.0 });
    };
    window.addEventListener('gps-recenter', handler);
    return () => window.removeEventListener('gps-recenter', handler);
  }, [map]);

  if (!position) return null;

  return (
    <>
      {/* Accuracy radius circle */}
      {accuracy && accuracy < 500 && (
        <Circle
          center={[position.lat, position.lng]}
          radius={accuracy}
          pathOptions={{
            color: '#4a90e2',
            fillColor: '#4a90e2',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4 4',
          }}
        />
      )}
      {/* GPS dot marker */}
      <Marker
        position={[position.lat, position.lng]}
        icon={dotIcon}
        zIndexOffset={9999}
      />
    </>
  );
}

export default function CampusMap({ buildings, actions, onBuildingClick, trafficData, userLocation, is3D, weather, showHeatmap }) {
  const [walkerPos, setWalkerPos] = useState(null);
  const [isWalking, setIsWalking] = useState(false);
  const animationRef = useRef(null);

  // Extract route waypoints from actions
  const routePositions = useMemo(() => {
    if (!actions) return [];
    for (const a of actions) {
      if (a.type === 'route' && a.waypoints) {
        return a.waypoints.map(w => [w.coordinates.lat, w.coordinates.lng]);
      }
    }
    return [];
  }, [actions]);

  // Determine highlighted building IDs
  const highlightedIds = useMemo(() => {
    if (!actions) return new Set();
    const ids = new Set();
    for (const a of actions) {
      if (a.type === 'zoom' && a.building) ids.add(a.building.id);
      if (a.type === 'route' && a.from && a.to) { ids.add(a.from.id); ids.add(a.to.id); }
      if (a.type === 'highlight' && a.buildings) a.buildings.forEach(b => ids.add(b.id));
    }
    return ids;
  }, [actions]);

  // Handle path animation
  const startWalking = () => {
    if (routePositions.length < 2) return;
    setIsWalking(true);
    let step = 0;
    const totalSteps = routePositions.length * 25;

    const animate = () => {
      if (step > totalSteps) {
        setIsWalking(false);
        setWalkerPos(null);
        return;
      }

      const segmentIndex = Math.floor(step / 25);
      const segmentProgress = (step % 25) / 25;

      if (segmentIndex < routePositions.length - 1) {
        const start = routePositions[segmentIndex];
        const end = routePositions[segmentIndex + 1];
        const lat = start[0] + (end[0] - start[0]) * segmentProgress;
        const lng = start[1] + (end[1] - start[1]) * segmentProgress;
        setWalkerPos([lat, lng]);
      } else {
        setWalkerPos(routePositions[routePositions.length - 1]);
      }

      step++;
      animationRef.current = setTimeout(animate, 40);
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (animationRef.current) clearTimeout(animationRef.current);
    setIsWalking(false);
    setWalkerPos(null);
  }, [actions]);

  return (
    <div className={`w-full h-full map-3d-container ${is3D ? 'map-3d-active' : ''}`}>
      {/* Weather & Grid Overlays */}
      <div className={`weather-overlay weather-${weather || 'morning'}`} />
      <div className="digital-twin-grid" />

      <MapContainer center={CENTER} zoom={ZOOM} className="w-full h-full" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController actions={actions} buildings={buildings} />

      {/* Live GPS tracker */}
      {userLocation?.position && (
        <LiveTracker position={userLocation.position} accuracy={userLocation.accuracy} />
      )}

      {/* Crowd Heatmap Layer */}
      <HeatmapLayer buildings={buildings} visible={showHeatmap} />

      {/* Building Markers */}
      {buildings.map((b) => (
        <Marker
          key={b.id}
          position={[b.coordinates.lat, b.coordinates.lng]}
          icon={createIcon(b.type, b.name, highlightedIds.has(b.id), trafficData ? trafficData[b.id] : null)}
          eventHandlers={{
            click: () => onBuildingClick?.(b),
          }}
        >
          <Popup>
            <div style={{ minWidth: 260, maxWidth: 300, fontFamily: 'Inter, sans-serif', padding: 0 }}>
              {/* Building Image */}
              <div style={{
                width: '100%', height: 140, borderRadius: '12px 12px 0 0',
                overflow: 'hidden', position: 'relative', marginBottom: 12,
              }}>
                <img
                  src={getBuildingImage(b.id, b.type)}
                  alt={b.name}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {/* Gradient overlay with name */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  padding: '20px 12px 8px',
                }}>
                  <h3 style={{
                    fontWeight: 800, fontSize: 15, lineHeight: 1.2,
                    fontFamily: 'Outfit, Inter, sans-serif',
                    color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}>
                    {b.name}
                  </h3>
                </div>
              </div>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '0 4px' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: (TYPE_COLORS[b.type] || '#6c5ce7') + '15',
                  fontSize: 18,
                }}>
                  {TYPE_EMOJI[b.type] || '📍'}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2, fontFamily: 'Outfit, Inter, sans-serif' }}>{b.name}</h3>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700,
                      background: (TYPE_COLORS[b.type] || '#6c5ce7') + '15',
                      color: TYPE_COLORS[b.type] || '#6c5ce7',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>{b.type}</span>
                    {b.floors > 0 && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 600,
                        background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                      }}>
                        {b.floors}F
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content area below image */}
              <div style={{ padding: '0 8px 8px' }}>

              {/* Traffic Status */}
              {trafficData && trafficData[b.id] && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
                  padding: '6px 10px', borderRadius: 10,
                  background: trafficData[b.id].color + '10',
                  border: `1px solid ${trafficData[b.id].color}20`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: trafficData[b.id].color,
                    boxShadow: `0 0 8px ${trafficData[b.id].color}`,
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: trafficData[b.id].color }}>
                    {trafficData[b.id].status} · {trafficData[b.id].busyness}% Busy
                  </span>
                </div>
              )}

              {/* Description */}
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                {b.description?.slice(0, 120)}{b.description?.length > 120 ? '...' : ''}
              </p>

              {/* Advanced Analytics HUD */}
              <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12,
                padding: '8px', borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border)'
              }}>
                {[
                  { label: 'Occupancy', val: `${Math.floor(Math.random() * 40 + 60)}%`, icon: '👥', color: '#10b981' },
                  { label: 'WiFi', val: 'Strong', icon: '📶', color: '#06b6d4' },
                  { label: 'Noise', val: 'Low', icon: '🔇', color: '#f59e0b' }
                ].map((stat, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 10 }}>{stat.icon}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: stat.color, marginTop: 1 }}>{stat.val}</div>
                    <div style={{ fontSize: 7, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Departments */}
              {b.departments?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {b.departments.map((d, i) => (
                    <span key={i} style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 600,
                      background: 'rgba(99, 102, 241, 0.08)', color: 'var(--brand-light)',
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
              )}

              {/* Walk button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startWalking();
                }}
                disabled={isWalking || routePositions.length === 0}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 12,
                  fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer',
                  background: routePositions.length === 0
                    ? 'var(--bg-tertiary)'
                    : 'linear-gradient(135deg, #6c5ce7, #0984e3)',
                  color: routePositions.length === 0 ? 'var(--text-muted)' : 'white',
                  opacity: isWalking ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: routePositions.length > 0 ? '0 4px 16px rgba(108,92,231,0.3)' : 'none',
                }}
              >
                {isWalking ? '🚶 Walking...' : routePositions.length > 0 ? '🚶 Start Walk' : 'Ask for a route first'}
              </button>

              </div>{/* End content padding wrapper */}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Walker Marker */}
      {walkerPos && (
        <Marker
          position={walkerPos}
          icon={L.divIcon({
            className: '',
            html: `
              <div style="
                font-size: 28px;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
                transform: translate(-50%, -50%);
                transition: all 0.04s linear;
              ">
                🚶‍♂️
              </div>
            `
          })}
          zIndexOffset={2000}
        />
      )}

      {/* Route Polyline — Gradient dashed */}
      {routePositions.length > 1 && (
        <>
          {/* Glow underlay */}
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#6c5ce7',
              weight: 10,
              opacity: 0.15,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
          {/* Main route */}
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#6c5ce7',
              weight: 4,
              opacity: 0.9,
              dashArray: '10, 8',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </>
      )}
    </MapContainer>
    </div>
  );
}
