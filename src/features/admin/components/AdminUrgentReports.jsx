import React from 'react';
import { FaExclamationTriangle, FaMapMarkerAlt, FaClock, FaChevronRight } from 'react-icons/fa';

export const AdminUrgentReports = ({ reports = [], onViewReport }) => {
  const hasReports = Array.isArray(reports) && reports.length > 0;

  // Helper formatting koordinat agar aman dari data null/string
  const formatCoord = (coord) => {
    const num = Number(coord);
    return !isNaN(num) ? num.toFixed(4) : '-';
  };

  // Helper formatting tanggal yang kompatibel dengan created_at (PostgreSQL) atau submittedAt
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? '-'
      : date.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
  };

return (
  <div
    className="urgent-section"
    style={{
      width: '100%',
      background: 'rgba(28, 28, 30, 0.65)',
      backdropFilter: 'blur(30px) saturate(190%)',
      WebkitBackdropFilter: 'blur(30px) saturate(190%)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      padding: '16px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
    }}
  >
    {/* Header Bar Ringkas */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        marginBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(255, 69, 58, 0.15)',
            border: '1px solid rgba(255, 69, 58, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FF453A',
            fontSize: '13px',
            flexShrink: 0
          }}
        >
          <FaExclamationTriangle />
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: '#f5f5f7',
            letterSpacing: '-0.015em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          Laporan Mendesak Hari Ini
        </h3>
      </div>

      <span
        className="urgent-count"
        style={{
          padding: '2px 8px',
          borderRadius: '99px',
          background: hasReports ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 255, 255, 0.06)',
          border: hasReports ? '1px solid rgba(255, 69, 58, 0.3)' : '1px solid rgba(255, 255, 255, 0.12)',
          color: hasReports ? '#FF453A' : '#8e8e93',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          flexShrink: 0
        }}
      >
        {reports.length} laporan
      </span>
    </div>

    {/* List Container / Empty State */}
    {!hasReports ? (
      <div
        style={{
          padding: '24px 16px',
          textAlign: 'center',
          color: '#8e8e93',
          fontSize: '13px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          border: '1px dashed rgba(255, 255, 255, 0.08)'
        }}
      >
        Tidak ada laporan mendesak saat ini.
      </div>
    ) : (
      <div
        className="urgent-list"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {reports.map((report) => {
          const reportId = report.id || report._id || report.reportId;

          return (
            <div
              key={reportId}
              className="urgent-item"
              onClick={() => onViewReport && onViewReport(reportId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                e.currentTarget.style.borderColor = 'rgba(255, 69, 58, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              {/* Priority Indicator Badge */}
              <div
                className="urgent-priority"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#FF453A',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(255, 69, 58, 0.5)',
                  flexShrink: 0
                }}
              >
                !
              </div>

              {/* Main Content */}
              <div className="urgent-content" style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="urgent-title"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#f5f5f7',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {report.title || report.description || 'Laporan Kerusakan Jalan'}
                </div>

                <div
                  className="urgent-meta"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    color: '#8e8e93'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <FaMapMarkerAlt style={{ color: '#0A84FF', fontSize: '10px' }} />
                    {formatCoord(report.latitude)}, {formatCoord(report.longitude)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <FaClock style={{ fontSize: '10px' }} />
                    {formatDate(report.created_at || report.submittedAt)}
                  </span>
                </div>
              </div>

              {/* Status Badge & Action Indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
              >
                <div
                  className="urgent-status"
                  style={{
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'rgba(255, 69, 58, 0.12)',
                    color: '#FF453A',
                    fontSize: '10px',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 69, 58, 0.25)',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Tinggi
                </div>
                <FaChevronRight style={{ color: '#8e8e93', fontSize: '11px' }} />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
};