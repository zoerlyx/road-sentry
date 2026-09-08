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
  <div
    className="admin-map-container"
    style={{
      width: '100%',
      height: window.innerWidth <= 768 ? '300px' : '600px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      background: 'rgba(28, 28, 30, 0.65)',
      backdropFilter: 'blur(30px) saturate(190%)',
      WebkitBackdropFilter: 'blur(30px) saturate(190%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
    }}
  >
    {/* Header Overlay Toolbar */}
<>
  <style>{`
    .overlay-toolbar {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 16px;
      background: rgba(28, 28, 30, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f5f5f7;
      transition: all 0.3s ease;
    }

    /* Penyesuaian Elegan untuk Layar Desktop (Desktop Responsive) */
    @media (min-width: 640px) {
      .overlay-toolbar {
        top: 16px;
        left: 16px;
        right: 16px;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 12px 20px !important;
        border-radius: 20px !important;
      }
      .toolbar-left-group {
        gap: 12px !important;
      }
      .toolbar-icon {
        width: 38px !important;
        height: 38px !important;
        font-size: 17px !important;
        border-radius: 12px !important;
      }
      .toolbar-title {
        font-size: 15px !important;
      }
      .toolbar-subtitle {
        font-size: 12px !important;
      }
      .toolbar-right-group {
        width: auto !important;
        gap: 10px !important;
      }
      .toolbar-select-container {
        padding: 6px 12px !important;
        border-radius: 12px !important;
        min-width: 170px !important;
      }
      .toolbar-select {
        font-size: 12px !important;
      }
      .toolbar-refresh-btn {
        width: 34px !important;
        height: 34px !important;
        border-radius: 12px !important;
      }
      .toolbar-refresh-btn svg {
        font-size: 13px !important;
      }
    }
  `}</style>

  <div className="overlay-toolbar">
    {/* Info Lokasi (Sisi Kiri di Desktop) */}
    <div className="toolbar-left-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
      <div
        className="toolbar-icon"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          background: 'rgba(10, 132, 255, 0.15)',
          border: '1px solid rgba(10, 132, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0A84FF',
          fontSize: '15px',
          flexShrink: 0
        }}
      >
        <FaMapMarkerAlt />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <h4 className="toolbar-title" style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#f5f5f7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Peta Persebaran Lokasi GIS
        </h4>
        <span className="toolbar-subtitle" style={{ fontSize: '11px', color: '#8e8e93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {filteredReports.length} dari {validReports.length} titik terpetakan
        </span>
      </div>
    </div>

    {/* Kontrol Filter & Refresh (Sisi Kanan di Desktop) */}
    <div className="toolbar-right-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
      <div className="toolbar-select-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', flex: 1, minWidth: 0 }}>
        <FaLayerGroup style={{ color: '#8e8e93', fontSize: '12px', flexShrink: 0 }} />
        <select
          className="toolbar-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#f5f5f7',
            fontSize: '11px',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ALL" style={{ background: '#1c1c1e', color: '#fff' }}>Semua Prioritas</option>
          <option value="HIGH" style={{ background: '#1c1c1e', color: '#FF453A' }}>Tinggi / Urgent</option>
          <option value="MEDIUM" style={{ background: '#1c1c1e', color: '#FF9F0A' }}>Sedang</option>
          <option value="LOW" style={{ background: '#1c1c1e', color: '#30D158' }}>Rendah</option>
        </select>
      </div>

      {onRefresh && (
        <button
          className="toolbar-refresh-btn"
          onClick={onRefresh}
          title="Refresh Data Peta"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f5f5f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
        >
          <FaSync style={{ fontSize: '11px' }} />
        </button>
      )}
    </div>
  </div>
</>

    {/* Leaflet Map dengan OpenStreetMap Standar */}
    <MapContainer
      center={validReports.length > 0 ? [Number(validReports[0].latitude), Number(validReports[0].longitude)] : defaultCenter}
      zoom={12}
      zoomControl={false}
      style={{ width: '100%', height: '100%', zIndex: 1 }}
    >
      {/* OpenStreetMap Standard Light Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <ZoomControl position="bottomright" />

      {/* Rendering Markers */}
      {filteredReports.map((report) => {
        const reportId = report.id || report._id || report.reportId;
        const lat = Number(report.latitude);
        const lng = Number(report.longitude);

        return (
          <Marker
            key={reportId}
            position={[lat, lng]}
            icon={createCustomMarker(report.priority, report.status)}
          >
            <Popup>
              <div style={{ padding: '4px', maxWidth: '220px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                {/* Image Preview jika ada */}
                {(report.image_url || report.annotated_image_url) && (
                  <img
                    src={report.annotated_image_url || report.image_url}
                    alt="Gambar Kerusakan"
                    style={{
                      width: '100%',
                      height: '110px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}

                <h5 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600, color: '#1c1c1e' }}>
                  {report.title || report.description || 'Laporan Kerusakan'}
                </h5>

                <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#636366', lineHeight: 1.3 }}>
                  {report.road_condition || report.description || 'Tidak ada detail tambahan.'}
                </p>

                <button
                  onClick={() => onSelectReport && onSelectReport(reportId)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#0A84FF',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Lihat Detail</span>
                  <FaExternalLinkAlt style={{ fontSize: '9px' }} />
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>

    <style>{`
      .custom-map-marker {
        transition: transform 0.2s ease;
      }
      .custom-map-marker:hover {
        transform: scale(1.25);
      }
    `}</style>
  </div>
);
};