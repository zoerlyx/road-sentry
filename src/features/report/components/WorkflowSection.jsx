import { forwardRef, useState, useRef, useCallback } from 'react';
import { FaUpload, FaBrain, FaChartLine, FaMapMarkedAlt } from 'react-icons/fa';

const steps = [
  { number: 'TAHAP 01', icon: FaUpload, title: 'Kirim Laporan', desc: 'Upload foto dan lokasi jalan rusak melalui form', color: '#0071e3' },
  { number: 'TAHAP 02', icon: FaBrain, title: 'Validasi AI', desc: 'AI memverifikasi apakah gambar benar jalan rusak', color: '#BF5AF2' },
  { number: 'TAHAP 03', icon: FaChartLine, title: 'Skoring Prioritas', desc: 'Sistem menghitung skala prioritas perbaikan', color: '#FF9500' },
  { number: 'TAHAP 04', icon: FaMapMarkedAlt, title: 'Tindak Lanjut', desc: 'Laporan ke dashboard GIS admin untuk penanganan', color: '#34C759' }
];

export const WorkflowSection = forwardRef((props, ref) => {
  const [tiltStyles, setTiltStyles] = useState({});
  const cardRefs = useRef({});

  const handleMouseMove = useCallback((idx, e) => {
    const card = cardRefs.current[idx];
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
      [idx]: {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`,
        transition: 'transform 0.1s ease-out'
      }
    }));
  }, []);

  const handleMouseLeave = useCallback((idx) => {
    setTiltStyles((prev) => ({
      ...prev,
      [idx]: {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
        transition: 'transform 0.3s ease-out'
      }
    }));
  }, []);

  return (
    <section
      className="workflow"
      id="workflow"
      ref={ref}
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Inline Animation for Card Entry Only */}
      <style>{`
        @keyframes appleFadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animated-step-card {
          animation: appleFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>

      {/* Section Header (Rata Kiri) */}
      <div style={{ textAlign: 'left', marginBottom: '48px' }}>
        <h2
          className="section-title"
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#f5f5f7',
            letterSpacing: '-0.02em',
            margin: '0 0 10px 0',
            textAlign: 'left'
          }}
        >
          Bagaimana ROAD-SENTRY Bekerja?
        </h2>
        <p
          className="section-sub"
          style={{
            fontSize: '17px',
            color: '#a1a1aa',
            margin: 0,
            fontWeight: 400,
            textAlign: 'left'
          }}
        >
          Dari laporan masyarakat hingga tindakan nyata.
        </p>
      </div>

      {/* Grid Steps Container */}
      <div
        className="steps-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '24px'
        }}
      >
        {steps.map((step, idx) => {
          const IconComponent = step.icon;
          const currentTilt = tiltStyles[idx] || {
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
            transition: 'transform 0.3s ease-out'
          };

          return (
            <div
              key={idx}
              ref={(el) => (cardRefs.current[idx] = el)}
              className="step-card animated-step-card"
              onMouseMove={(e) => handleMouseMove(idx, e)}
              onMouseLeave={() => handleMouseLeave(idx)}
              style={{
                animationDelay: `${idx * 0.15}s`,
                background: 'rgba(22, 24, 29, 0.65)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                willChange: 'transform',
                ...currentTilt
              }}
            >
              {/* Step Tag Number */}
              <div
                className="step-number"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: step.color,
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: `${step.color}20`,
                  border: `1px solid ${step.color}30`,
                  marginBottom: '20px',
                  textAlign: 'center'
                }}
              >
                {step.number}
              </div>

              {/* Static Icon Box */}
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: `${step.color}20`,
                  border: `1px solid ${step.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  pointerEvents: 'none'
                }}
              >
                <IconComponent style={{ fontSize: '22px', color: step.color }} />
              </div>

              {/* Step Content */}
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#f5f5f7',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.01em',
                  textAlign: 'center'
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#a1a1aa',
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 400,
                  textAlign: 'center'
                }}
              >
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
});

WorkflowSection.displayName = 'WorkflowSection';