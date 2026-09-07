import React from 'react';
import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

export const AdminStatsCard = ({ stats = {} }) => {
  // Safe extraction untuk menangani format camelCase maupun snake_case dari API
  const total = Number(stats.total) || 0;
  
  const pendingCount = 
    (Number(stats.pending) || 0) + 
    (Number(stats.reviewed) || 0) + 
    (Number(stats.inProgress) || Number(stats.in_progress) || 0) +
    (Number(stats.processing) || 0);

  const resolvedCount = Number(stats.resolved) || Number(stats.completed) || 0;

  const highPriorityCount = 
    Number(stats.priority?.high) || 
    Number(stats.priority?.HIGH) || 
    Number(stats.highPriority) || 
    Number(stats.high_priority) || 0;

  const cards = [
    {
      key: 'total',
      label: 'Total Laporan',
      icon: FaFileAlt,
      color: '#0A84FF',
      glow: 'rgba(10, 132, 255, 0.25)',
      value: total
    },
    {
      key: 'pending',
      label: 'Sedang Diproses',
      icon: FaClock,
      color: '#FF9F0A',
      glow: 'rgba(255, 159, 10, 0.25)',
      value: pendingCount
    },
    {
      key: 'resolved',
      label: 'Selesai',
      icon: FaCheckCircle,
      color: '#30D158',
      glow: 'rgba(48, 209, 88, 0.25)',
      value: resolvedCount
    },
    {
      key: 'highPriority',
      label: 'Prioritas Tinggi',
      icon: FaExclamationTriangle,
      color: '#FF453A',
      glow: 'rgba(255, 69, 58, 0.25)',
      value: highPriorityCount
    }
  ];

  return (
    <div
      className="stats-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="stat-card"
            style={{
              background: 'rgba(28, 28, 30, 0.65)',
              backdropFilter: 'blur(30px) saturate(190%)',
              WebkitBackdropFilter: 'blur(30px) saturate(190%)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            {/* Status Glow Accent - Sisi Kiri */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '-20px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: card.glow,
                filter: 'blur(30px)',
                pointerEvents: 'none'
              }}
            />

            {/* Icon Container */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: `${card.color}1A`,
                border: `1px solid ${card.color}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                fontSize: '20px',
                flexShrink: 0,
                zIndex: 1
              }}
            >
              <Icon />
            </div>

            {/* Content Text & Metrics */}
            <div style={{ zIndex: 1, overflow: 'hidden' }}>
              <div
                className="stat-number"
                style={{
                  fontSize: 'clamp(28px, 2.5vw, 36px)',
                  fontWeight: 700,
                  color: '#f5f5f7',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  marginBottom: '6px'
                }}
              >
                {typeof card.value === 'number' ? card.value.toLocaleString('id-ID') : 0}
              </div>
              <div
                className="stat-label"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#8e8e93',
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {card.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};