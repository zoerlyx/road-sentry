import { useEffect, useState } from 'react';
import { 
  FaTimes, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaExpand,
  FaCamera,
  FaRobot,
  FaChartLine,
  FaInfoCircle,
  FaLightbulb,
  FaListUl
} from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const AdminReportDetailModal = ({ isOpen, report, onClose, onStatusChange }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('foto');
  const [lightbox, setLightbox] = useState(null);
  
  const activeReportId = report?.id || report?.reportId || report?.report_id;

  useEffect(() => {
    if (!isOpen || !activeReportId) return;
    setDetail(null);
    setActiveTab('foto');
    setLoading(true);

    fetch(`${API_BASE_URL}/reports/${activeReportId}`)
      .then(r => r.json())
      .then(res => {
        setDetail(res.data || res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, activeReportId]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = e => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  if (!isOpen || !report) return null;

  const data = detail ?? report;

  // Formatting Helper Gambar
  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${BACKEND_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const originalImageUrl = formatImageUrl(data.image_url || data.imageUrl);
  const annotatedImageUrl = formatImageUrl(data.annotated_image_url || data.annotatedImageUrl);

  // Parsing JSON ai_detection_result
  let aiData = data.ai_detection_result;
  if (typeof aiData === 'string') {
    try {
      aiData = JSON.parse(aiData);
    } catch {
      aiData = {};
    }
  }
  aiData = aiData || {};

  const summary = aiData.summary || data.ai_summary || {};
  const detections = Array.isArray(aiData.detections) ? aiData.detections : [];
  
  const totalObjects = summary.total_objects ?? detections.length ?? 0;
  const roadScore = summary.road_score ?? 100;
  const priorityScore = summary.priority_score ?? (data.priority === 'urgent' ? 90 : data.priority === 'high' ? 80 : data.priority === 'medium' ? 50 : 20);
  const recommendation = summary.recommendation || (priorityScore >= 80 ? 'Perbaikan Segera (Maksimal 2x24 Jam)' : 'Masuk Jadwal Pemeliharaan');
  const roadCondition = data.road_condition || summary.status_description || 'Rusak Sedang';

  const potholeDetections = detections.filter(d => (d.class_name || '').toLowerCase().includes('pothole'));
  const crackDetections = detections.filter(d => (d.class_name || '').toLowerCase().includes('crack'));

  const lat = data.latitude ? Number(data.latitude).toFixed(6) : '-';
  const lng = data.longitude ? Number(data.longitude).toFixed(6) : '-';
  const address = data.address_location || 'Tidak ada catatan alamat khusus';

  return (
  <>
    <style>{`
      @media (max-width: 640px) {
        .modal-overlay {
          padding: 10px !important;
        }
        .modal-container {
          max-height: 95vh !important;
          border-radius: 16px !important;
        }
        .modal-header {
          padding: 14px 16px !important;
        }
        .modal-tabs {
          padding: 8px 12px !important;
          overflow-x: auto !important;
          white-space: nowrap !important;
        }
        .modal-tab-btn {
          flex: 0 0 auto !important;
          padding: 6px 10px !important;
        }
        .modal-body {
          padding: 16px !important;
          gap: 14px !important;
        }
        .grid-2-col {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>

    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="modal-container"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(28, 28, 30, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          color: '#f5f5f7',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.03)'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Detail Laporan Kerusakan
            </h3>
            <span style={{ fontSize: '12px', color: '#8e8e93' }}>
              ID #{data.id} · {data.title || 'Laporan Jalan'}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8e8e93',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#8e8e93'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="modal-tabs"
          style={{
            display: 'flex',
            padding: '10px 20px',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {[
            { id: 'foto', label: 'Foto & AI', icon: FaCamera },
            { id: 'detections', label: 'Daftar Objek', icon: FaListUl },
            { id: 'prioritas', label: 'Prioritas & Analisis', icon: FaChartLine },
            { id: 'info', label: 'Info & Status', icon: FaInfoCircle },
          ].map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="modal-tab-btn"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: isActive ? '#ffffff' : '#8e8e93',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <TabIcon style={{ fontSize: '12px' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Tab 1: Foto Asli vs Foto Anotasi AI */}
          {activeTab === 'foto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Foto Asli */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#8e8e93', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaCamera /> FOTO ASLI PELAPOR
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      aspectRatio: '4/3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {originalImageUrl ? (
                      <>
                        <img
                          src={originalImageUrl}
                          alt="Foto Asli"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setLightbox('original')}
                        />
                        <div
                          onClick={() => setLightbox('original')}
                          style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                        >
                          <FaExpand style={{ fontSize: '12px' }} />
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#8e8e93', fontSize: '12px' }}>Tidak ada foto asli</div>
                    )}
                  </div>
                </div>

                {/* Foto deteksi AI */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0A84FF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaRobot /> HASIL ANOTASI AI (BOUNDING BOX)
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(10, 132, 255, 0.3)',
                      aspectRatio: '4/3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {annotatedImageUrl ? (
                      <>
                        <img
                          src={annotatedImageUrl}
                          alt="Anotasi AI"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setLightbox('annotated')}
                        />
                        <div
                          onClick={() => setLightbox('annotated')}
                          style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                        >
                          <FaExpand style={{ fontSize: '12px' }} />
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#8e8e93', fontSize: '12px' }}>Belum ada foto anotasi</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ringkasan Objek Cepat */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#8e8e93' }}>Total Objek</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f5f5f7' }}>{totalObjects}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#FF453A' }}>Lubang (Pothole)</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#FF453A' }}>
                    {potholeDetections.length}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#FF9F0A' }}>Retakan (Crack)</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#FF9F0A' }}>{crackDetections.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Daftar Deteksi Objek */}
          {activeTab === 'detections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
                Detail seluruh bounding box dan nilai confidence dari AI Engine:
              </div>
              {detections.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#8e8e93', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  Tidak ada deteksi objek spesifik yang dicatat.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {detections.map((det, idx) => {
                    const isPothole = (det.class_name || '').toLowerCase().includes('pothole');
                    const confPct = Math.round((det.confidence || 0) * 100);
                    const bboxStr = det.bbox ? `[${det.bbox.join(', ')}]` : '-';

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              background: isPothole ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 159, 10, 0.15)',
                              color: isPothole ? '#FF453A' : '#FF9F0A',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f5f5f7' }}>
                              {det.class_name || 'Kerusakan'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#8e8e93', fontFamily: 'monospace' }}>
                              BBox: {bboxStr} · Area: {det.area_px || 0} px
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: isPothole ? '#FF453A' : '#FF9F0A' }}>
                            {confPct}%
                          </div>
                          <div style={{ fontSize: '10px', color: '#8e8e93' }}>Confidence</div>
                        </div>
                      </div>
                    );
                  })}   
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Skor Prioritas */}
          {activeTab === 'prioritas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#8e8e93', marginBottom: '4px' }}>Skor Prioritas</div>
                  <div
                    style={{
                      fontSize: '36px',
                      fontWeight: 700,
                      color: priorityScore >= 80 ? '#FF453A' : priorityScore >= 40 ? '#FF9F0A' : '#30D158'
                    }}
                  >
                    {priorityScore}
                    <span style={{ fontSize: '16px', color: '#8e8e93' }}>/100</span>
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      marginTop: '4px',
                      background: priorityScore >= 80 ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 159, 10, 0.15)',
                      color: priorityScore >= 80 ? '#FF453A' : '#FF9F0A'
                    }}
                  >
                    {data.priority?.toUpperCase() || 'MEDIUM'}
                  </div>
                </div>

                <div style={{ width: '1px', height: '60px', background: 'rgba(255, 255, 255, 0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#8e8e93', marginBottom: '4px' }}>Kondisi Jalan</div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#f5f5f7' }}>
                    {roadCondition}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8e8e93', marginTop: '6px' }}>
                    Road Health: <strong style={{ color: '#0A84FF' }}>{roadScore}%</strong>
                  </div>
                </div>
              </div>

              {/* Rekomendasi AI */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(10, 132, 255, 0.08)',
                  border: '1px solid rgba(10, 132, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <FaLightbulb style={{ color: '#0A84FF', fontSize: '18px', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0A84FF', marginBottom: '2px' }}>
                    Rekomendasi AI Engine
                  </div>
                  <div style={{ fontSize: '13px', color: '#f5f5f7', lineHeight: 1.4 }}>
                    {recommendation}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Info Laporan */}
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                className="grid-2-col"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#8e8e93' }}>Koordinat Lokasi</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f5f5f7', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaMapMarkerAlt style={{ color: '#0A84FF' }} /> {lat}, {lng}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#8e8e93' }}>Waktu Pelaporan</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f5f5f7', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCalendarAlt /> {new Date(data.created_at || Date.now()).toLocaleString('id-ID')}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 1', marginTop: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#8e8e93' }}>Alamat Terdeteksi</div>
                  <div style={{ fontSize: '13px', color: '#f5f5f7', marginTop: '2px' }}>
                    {address}
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ fontSize: '11px', color: '#8e8e93', marginBottom: '4px' }}>Deskripsi Pelapor</div>
                <div style={{ fontSize: '13px', color: '#f5f5f7', lineHeight: 1.5 }}>
                  {data.description || 'Tidak ada deskripsi tambahan.'}
                </div>
              </div>

              {/* Ubah Status */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#8e8e93', display: 'block', marginBottom: '8px' }}>
                  Ubah Status Penanganan Laporan:
                </label>
                <select
                  value={data.status || 'pending'}
                  onChange={e => onStatusChange(activeReportId, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(20, 20, 22, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 500,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="pending">Pending (Menunggu Verifikasi/Tindakan)</option>
                  <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
                  <option value="resolved">Resolved / Completed (Selesai)</option>
                  <option value="rejected">Rejected (Ditolak)</option>
                </select>
              </div>          
            </div>
          )}
        </div>
      </div>
    </div>

    {lightbox && (
      <div
        onClick={() => setLightbox(null)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          cursor: 'zoom-out'
        }}
      >
        
      </div>
    )}
  </>
);
};