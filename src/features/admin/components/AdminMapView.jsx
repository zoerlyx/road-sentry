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



  return (
  
);
};