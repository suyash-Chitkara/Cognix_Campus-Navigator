import { useState, useEffect, useRef, useCallback } from 'react';

// Chitkara University Punjab — approximate campus bounding box (NH-7, Rajpura)
const CAMPUS_BOUNDS = {
  minLat: 30.5100,
  maxLat: 30.5230,
  minLng: 76.6520,
  maxLng: 76.6680,
};

// Haversine distance in metres between two [lat, lng] points
function haversineDistance([lat1, lng1], [lat2, lng2]) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInsideCampus(lat, lng) {
  return (
    lat >= CAMPUS_BOUNDS.minLat &&
    lat <= CAMPUS_BOUNDS.maxLat &&
    lng >= CAMPUS_BOUNDS.minLng &&
    lng <= CAMPUS_BOUNDS.maxLng
  );
}

function findNearestBuilding(pos, buildings) {
  if (!buildings || buildings.length === 0) return null;
  let nearest = null;
  let minDist = Infinity;
  for (const b of buildings) {
    const dist = haversineDistance(pos, [b.coordinates.lat, b.coordinates.lng]);
    if (dist < minDist) {
      minDist = dist;
      nearest = { ...b, distanceMetres: Math.round(dist) };
    }
  }
  return nearest;
}

export function useLiveTracking(buildings) {
  const [tracking, setTracking] = useState(false);           // is watcher active?
  const [position, setPosition] = useState(null);            // { lat, lng }
  const [accuracy, setAccuracy] = useState(null);            // metres
  const [insideCampus, setInsideCampus] = useState(null);    // bool | null
  const [nearestBuilding, setNearestBuilding] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');              // idle | requesting | active | denied | unavailable

  const watchIdRef = useRef(null);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setStatus('idle');
    setPosition(null);
    setAccuracy(null);
    setInsideCampus(null);
    setNearestBuilding(null);
    setError(null);
  }, []);

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      setError('GPS not supported on this device.');
      return;
    }

    setStatus('requesting');
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (geoPos) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = geoPos.coords;
        setPosition({ lat, lng });
        setAccuracy(Math.round(acc));
        setInsideCampus(isInsideCampus(lat, lng));
        setNearestBuilding(findNearestBuilding([lat, lng], buildings));
        setStatus('active');
        setTracking(true);
        setError(null);
      },
      (err) => {
        if (err.code === 1) {
          setStatus('denied');
          setError('Location permission denied. Please allow GPS access.');
        } else if (err.code === 2) {
          setStatus('unavailable');
          setError('GPS signal unavailable. Move to an open area.');
        } else {
          setStatus('unavailable');
          setError('Location timed out. Try again.');
        }
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, [buildings, stopTracking]);

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    tracking,
    position,
    accuracy,
    insideCampus,
    nearestBuilding,
    error,
    status,
    startTracking,
    stopTracking,
  };
}
