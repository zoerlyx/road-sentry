import { useState, useRef, useCallback } from 'react';
import { AnimatedCounter } from './AnimatedCounter';

export const StatsSection = ({ stats, animated = true, isLoading = false }) => {
  const [tiltStyles, setTiltStyles] = useState({});
  const cardRefs = useRef({});

  const statsData = [
    { key: 'total', label: 'Total Laporan Integrasi', color: '#0A84FF', glow: 'rgba(10, 132, 255, 0.3)' },
    { key: 'pending', label: 'Dalam Penanganan Real-Time', color: '#FF9F0A', glow: 'rgba(255, 159, 10, 0.3)' },
    { key: 'resolved', label: 'Telah Selesai Ditangani', color: '#30D158', glow: 'rgba(48, 209, 88, 0.3)' }
  ];

  const handleMouseMove = useCallback((key, e) => {
    const card = cardRefs.current[key];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;

    setTiltStyles((prev) => ({
      ...prev,
      [key]: {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`,
        transition: 'transform 0.1s ease-out'
      }
    }));
  }, []);

  const handleMouseLeave = useCallback((key) => {
    setTiltStyles((prev) => ({
      ...prev,
      [key]: {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }));
  }, []);

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        padding: '20px 24px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          width: '100%'
        }}
      >
        {statsData.map((stat) => {
          const rawValue = stats?.[stat.key];
          const hasValue = typeof rawValue === 'number';
          const currentTilt = tiltStyles[stat.key] || {
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          };

          return (
            <div
              key={stat.key}
              ref={(el) => (cardRefs.current[stat.key] = el)}
              className="stat-card"
              onMouseMove={(e) => handleMouseMove(stat.key, e)}
              onMouseLeave={() => handleMouseLeave(stat.key)}
              
            >
              {/* Glow Accent */}
              <div
                
              />

              {/* Card Header Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  zIndex: 1
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: stat.color,
                    boxShadow: `0 0 10px ${stat.color}`,
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#8e8e93',
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase'
                  }}
                >
                  {stat.label}
                </span>
              </div>

              {/* Stat Number / Skeleton Loader */}
              <div
                
              >
                {isLoading ? (
                  <span
                    
                  />
                ) : hasValue ? (
                  animated ? (
                    <AnimatedCounter target={rawValue} />
                  ) : (
                    rawValue.toLocaleString()
                  )
                ) : (
                  '-'
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};