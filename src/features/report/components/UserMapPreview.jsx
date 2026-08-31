import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

// Icon Pin SVG Custom
const userLocationIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 2C9.373 2 4 7.373 4 14c0 9 12 26 12 26s12-17 12-26C28 7.373 22.627 2 16 2z"
        fill="#2563EB" stroke="#1D4ED8" stroke-width="1.5"/>
      <circle cx="16" cy="14" r="7" fill="white" opacity="0.9"/>
      <circle cx="16" cy="14" r="4" fill="#2563EB"/>
    </svg>`,
  className: '',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -44],
});

// Marker terpisah dengan cleanup & sync lokasi
const MapMarker = ({ position }) => {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (position && position[0] && position[1]) {
      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      } else {
        markerRef.current = L.marker(position, { icon: userLocationIcon }).addTo(map);
      }
    } else if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [position, map]);

  return null;
};

// Pengendali pergerakan peta, zoom, dan auto-resize tile
const MapController = ({ lat, lng, defaultCenter }) => {
  const map = useMap();
  const isFirstRun = useRef(true);

  // Mencegah grey/blank tile saat modal/card dirender ulang
  useEffect(() => {
    if (map) {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    if (lat && lng) {
      if (isFirstRun.current) {
        map.setView([lat, lng], 16, { animate: false });
        isFirstRun.current = false;
      } else {
        map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
      }
    } else {
      // Kembali ke tampilan default jika lokasi di-reset/dihapus
      map.flyTo(defaultCenter, 12, { animate: true, duration: 1.0 });
      isFirstRun.current = true;
    }
  }, [lat, lng, map, defaultCenter]);

  return null;
};

export const UserMapPreview = ({ lat, lng, submitted = false }) => {
  const defaultCenter = [-0.5070, 101.4478];
  const hasLocation = Boolean(lat && lng);
  const center = hasLocation ? [lat, lng] : defaultCenter;

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      {submitted && hasLocation && (
        <div className="map-preview-badge" style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
          Lokasi laporan Anda
        </div>
      )}

      <MapContainer
        >
      </MapContainer>
    </div>
  );
};