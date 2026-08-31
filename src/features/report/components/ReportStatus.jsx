import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api.js';
import {
  FiSend,
  FiCpu,
  FiCheckCircle,
  FiTarget,
  FiEye,
  FiTool,
  FiAward,
  FiXCircle,
  FiLoader,
  FiInfo,
  FiX,  
  FiAlertCircle,
  FiMaximize2
} from 'react-icons/fi';
import {
  PiTrafficConeBold,
  PiRoadHorizonBold
} from 'react-icons/pi';
import { TbAlertTriangle, TbActivity } from 'react-icons/tb';
import { BsLightbulb } from 'react-icons/bs';

const STATUS_CONFIG = {
  pending:     { icon: FiCpu,         label: 'Menunggu Verifikasi', color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.15)', border: 'rgba(10, 132, 255, 0.3)' },
  submitted:   { icon: FiSend,        label: 'Terkirim',            color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.15)', border: 'rgba(10, 132, 255, 0.3)' },
  validating:  { icon: FiCpu,         label: 'Divalidasi AI',       color: '#FF9F0A', bg: 'rgba(255, 159, 10, 0.15)', border: 'rgba(255, 159, 10, 0.3)' },
  validated:   { icon: FiCheckCircle, label: 'Terverifikasi',       color: '#30D158', bg: 'rgba(48, 209, 88, 0.15)',  border: 'rgba(48, 209, 88, 0.3)' },
  prioritized: { icon: FiTarget,      label: 'Diprioritaskan',      color: '#30D158', bg: 'rgba(48, 209, 88, 0.15)',  border: 'rgba(48, 209, 88, 0.3)' },
  reviewed:    { icon: FiEye,         label: 'Ditinjau',            color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.15)', border: 'rgba(10, 132, 255, 0.3)' },
  in_progress: { icon: FiTool,        label: 'Sedang Dikerjakan',   color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.15)', border: 'rgba(10, 132, 255, 0.3)' },
  resolved:    { icon: FiAward,       label: 'Selesai Ditangani',   color: '#30D158', bg: 'rgba(48, 209, 88, 0.15)',  border: 'rgba(48, 209, 88, 0.3)' },
  rejected:    { icon: FiXCircle,     label: 'Ditolak',             color: '#FF453A', bg: 'rgba(255, 69, 58, 0.15)',  border: 'rgba(255, 69, 58, 0.3)' }
};

export default function ReportStatus({ reportId, originalImage, annotatedImage, aiSummary, reportData: initialReportData }) {
  const [data, setData] = useState(initialReportData || null);
  const [loading, setLoading] = useState(!initialReportData);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

  const getImageUrl = useCallback((path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }, [BACKEND_URL]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
    };

    if (lightbox) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKey);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightbox]);

  useEffect(() => {
    if (!reportId) return;

    let isMounted = true;
    let timerId = null;
    const pendingStatuses = ['pending', 'submitted', 'validating', 'validated'];

    const fetchStatus = async () => {
      try {
        const res = await api.get(`/reports/${reportId}/status`);
        if (!isMounted) return;

        const report = res.data?.data || res.data;
        setData(report);
        setLoading(false);
        setError(false);

        if (pendingStatuses.includes(report?.status)) {
          timerId = setTimeout(fetchStatus, 3000);
        }
      } catch (err) {
        console.error('Gagal memuat status laporan:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [reportId]);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          padding: '40px 24px',
          borderRadius: '20px',
          background: 'rgba(28, 28, 30, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#8e8e93',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
        }}
      >
        <FiLoader className="animate-spin" style={{ fontSize: '20px', color: '#0A84FF' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#f5f5f7' }}>Memuat status laporan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          padding: '24px',
          borderRadius: '20px',
          background: 'rgba(255, 69, 58, 0.1)',
          border: '1px solid rgba(255, 69, 58, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#FF453A',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
        }}
      >
        <FiAlertCircle style={{ fontSize: '20px', flexShrink: 0 }} />
        <span style={{ fontSize: '14px' }}>Gagal memuat status laporan. Silakan muat ulang halaman.</span>
      </div>
    );
  }

  if (!data && !initialReportData) return null;

  const currentStatus = (data?.status || 'pending').toLowerCase();
  const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const isPending = ['pending', 'submitted', 'validating', 'validated'].includes(currentStatus);

    // Parsing JSON ai_detection_result
  let aiDetection = data?.ai_detection_result;
  if (typeof aiDetection === 'string') {
    try {
      aiDetection = JSON.parse(aiDetection);
    } catch {
      aiDetection = {};
    }
  }
  aiDetection = aiDetection || {};

  const summary = aiDetection.summary || data?.ai_summary || aiSummary || {};
  const detections = Array.isArray(aiDetection.detections) ? aiDetection.detections : [];

  // Hitung jumlah lubang & retakan akurat
  let potholeCount = summary.pothole_count ?? summary.potholes;
  let crackCount = summary.crack_count ?? summary.cracks;

  if (potholeCount === undefined || crackCount === undefined) {
    if (detections.length > 0) {
      potholeCount = detections.filter(d => (d.class_name || '').toLowerCase().includes('pothole')).length;
      crackCount = detections.filter(d => (d.class_name || '').toLowerCase().includes('crack')).length;
    } else {
      potholeCount = summary.pothole_count ?? 0;
      crackCount = summary.crack_count ?? 0;
    }
  }

  const priorityScore = summary.priority_score ?? (data?.priority === 'urgent' ? 90 : data?.priority === 'high' ? 80 : data?.priority === 'medium' ? 50 : 20);
  const roadCondition = data?.road_condition || summary.status_description || 'Rusak Sedang';
  const recommendation = summary.recommendation || (priorityScore >= 80 ? 'Perbaikan Segera (Maksimal 2x24 Jam)' : 'Masuk Jadwal Pemeliharaan');
  const roadScore = summary.road_score ?? 100;

  const displayOriginalImg = data?.image_url || originalImage;
  const displayAnnotatedImg = data?.annotated_image_url || annotatedImage;

  return (
     <div
      style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
      }}
    >

      {/* Lightbox Overlay */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: '24px'
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(44, 44, 46, 0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <FiX size={20} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}
          />
        </div>
      )}

      {/* Status Card */}
      {/* Main Glass Container */}
      <div
        style={{
          width: '100%',
          background: 'rgba(28, 28, 30, 0.65)',
          backdropFilter: 'blur(25px) saturate(190%)',
          WebkitBackdropFilter: 'blur(25px) saturate(190%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          color: '#f5f5f7'
        }}
      >
        {/* macOS Window Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
            <h2 style={{ margin: '0 0 0 12px', fontSize: '15px', fontWeight: 600, color: '#f5f5f7', letterSpacing: '-0.01em' }}>
              Status & Hasil Analisis Laporan
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ID Laporan
            </span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0A84FF',
              background: 'rgba(10, 132, 255, 0.12)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(10, 132, 255, 0.25)'
            }}>
              #{data?.id || reportId}
            </span>
          </div>
        </div>
        
          {/* Content Body */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
            {/* Status Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '16px',
                background: config.bg,
                border: `1px solid ${config.border}`,
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: config.color,
                      fontSize: '20px',
                      flexShrink: 0
                    }}
                  >
                    <StatusIcon />
                  </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                      {config.label}
                    </span>
                    {isPending && <FiLoader className="animate-spin" style={{ color: config.color, fontSize: '14px' }} />}
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.4 }}>
                    {data?.message || (isPending ? 'Laporan Anda telah berhasil terverifikasi oleh AI dan sedang dalam antrean tim perbaikan.' : 'Laporan telah diproses oleh dinas terkait.')}
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                {currentStatus}
              </div>
          </div>

          {/* AI Metrics Overview Cards */}
          {currentStatus !== 'rejected' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px'
              }}
            >

              {/* Lubang Card */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'rgba(255, 69, 58, 0.08)',
                  border: '1px solid rgba(255, 69, 58, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 69, 58, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF453A',
                    fontSize: '20px'
                  }}
                >
                  <PiTrafficConeBold />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                    {potholeCount}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#FF9F0A', textTransform: 'uppercase', marginTop: '4px' }}>
                    Lubang (Pothole)
                  </div>
                </div>
              </div>
              {/* Retakan Card */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'rgba(255, 159, 10, 0.08)',
                  border: '1px solid rgba(255, 159, 10, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 159, 10, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF9F0A',
                    fontSize: '20px'
                  }}
                >
                  <PiRoadHorizonBold />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                    {crackCount}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#FF9F0A', textTransform: 'uppercase', marginTop: '4px' }}>
                    Retakan (Crack)
                  </div>
                </div>
              </div>
              <div
                
              >
              <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: priorityScore >= 80 ? 'rgba(255, 69, 58, 0.15)' : 'rgba(10, 132, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: priorityScore >= 80 ? '#FF453A' : '#0A84FF',
                    fontSize: '20px'
                  }}
                >
                  <TbActivity />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    {roadCondition}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: priorityScore >= 80 ? '#FF453A' : '#0A84FF', textTransform: 'uppercase', marginTop: '4px' }}>
                    Skor: {priorityScore}/100
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommendation Banner */}
          {currentStatus !== 'rejected' && (
            <div
             
            >
              <BsLightbulb style={{ color: '#0A84FF', fontSize: '18px', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0A84FF', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Rekomendasi Tindakan AI
                </span>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#f5f5f7', lineHeight: 1.45 }}>
                  {recommendation}
                </p>
              </div>
            </div>
          )}

            {/* Side-by-side Visual Inspection (Foto Asli vs Anotasi AI) */}
          {displayAnnotatedImg && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f5f5f7', letterSpacing: '-0.01em' }}>
                  Hasil Deteksi Visual
                </span>
                <span style={{ fontSize: '11px', color: '#8e8e93' }}>
                  Klik gambar untuk melihat resolusi penuh
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px'
                }}
              >
                {/* Foto Asli */}
                {displayOriginalImg && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#8e8e93', marginBottom: '6px' }}>
                      FOTO ASLI
                    </div>
                    <div
                      >
                      <img
                        src={getImageUrl(displayOriginalImg)}
                        alt="Foto asli"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0, 0, 0, 0.65)',
                          borderRadius: '8px',
                          padding: '6px',
                          color: '#ffffff'
                        }}
                      >
                        <FiMaximize2 style={{ fontSize: '12px' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Foto Deteksi AI */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0A84FF', marginBottom: '6px' }}>
                    DETEKSI AI (BOUNDING BOX)
                  </div>
                  <div
                    >
                    <img
                      src={getImageUrl(displayAnnotatedImg)}
                      alt="Hasil deteksi AI"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                     
                    >
                      <FiMaximize2 style={{ fontSize: '12px' }} />
                    </div>
                  </div>
                </div>
              </div>
            <div
                
              >
                <FiInfo style={{ color: '#0A84FF' }} />
                <span>Kotak pada gambar menunjukkan area kerusakan yang terdeteksi secara otomatis oleh model AI.</span>
              </div>
            </div>  
      )}
      {/* Rejection Guidance Card */}
          {currentStatus === 'rejected' && (
            <div
              
            >
              <BsLightbulb style={{ color: '#FF453A', fontSize: '24px', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
                  Panduan Pengambilan Foto yang Valid
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#a1a1aa', lineHeight: 1.6 }}>
                  <li>Pastikan kerusakan jalan terfokus dan terlihat jelas di kamera.</li>
                  <li>Ambil foto dengan pencahayaan yang cukup pada siang hari atau lampu terang.</li>
                  <li>Hindari mengambil foto dari jarak yang terlalu jauh atau dari dalam kaca mobil yang memantulkan bayangan.</li>
                  <li>Pastikan lensa kamera tidak goyang, blur, atau terhalang objek lain.</li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}