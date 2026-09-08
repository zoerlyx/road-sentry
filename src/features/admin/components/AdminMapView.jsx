import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { 
  FaMapMarkerAlt, 
  FaSync, 
  FaLayerGroup,
  FaExternalLinkAlt
} from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

// Fix ikon default Leaflet agar ter-render dengan benar
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom SVG Marker Generator untuk prioritas laporan
const createCustomMarker = (priority, status) => {
  let color = '#0A84FF'; // Default Blue
  if (priority === 'HIGH' || priority === 'URGENT' || priority === 'Tinggi') {
    color = '#FF453A'; // Red
  } else if (status === 'IN_PROGRESS' || status === 'Diproses') {
    color = '#FF9F0A'; // Orange
  } else if (status === 'COMPLETED' || status === 'Selesai') {
    color = '#30D158'; // Green
  }

  const svgHtml = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2"/>
      <circle cx="16" cy="16" r="7" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -14],
  });
};

export const AdminMapView = ({ reports = [], onSelectReport, onRefresh }) => {
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Koordinat Default Pusat Peta (Bandung/Indonesia)
  const defaultCenter = [-6.9175, 107.6191];

  // Filter laporan yang memiliki koordinat valid
  const validReports = useMemo(() => {
    return (Array.isArray(reports) ? reports : []).filter((r) => {
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
  }, [reports]);

// Filter berdasarkan tingkat prioritas
const filteredReports = useMemo(() => {
  if (filterPriority === 'ALL') return validReports;

  return validReports.filter((r) => {
    const p = (r.priority || '').toUpperCase();

    // Jika filter memilih HIGH, cocokkan juga jika datanya URGENT
    if (filterPriority === 'HIGH') {
      return p === 'HIGH' || p === 'URGENT';
    }

    return p === filterPriority;
  });
}, [validReports, filterPriority]);

  return (
  
);
};