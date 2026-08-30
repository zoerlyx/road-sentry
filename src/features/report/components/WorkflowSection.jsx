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
    >
    </section>
  );
});

WorkflowSection.displayName = 'WorkflowSection';