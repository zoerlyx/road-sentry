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
  );
};