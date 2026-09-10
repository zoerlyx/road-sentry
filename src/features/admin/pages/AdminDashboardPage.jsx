import { useState, useEffect, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { FaRedoAlt } from 'react-icons/fa';

import { adminService } from '../services/admin.service';

import { useAdminReports } from '../hooks/useAdminReports';

import { AdminStatsCard } from '../components/AdminStatsCard';

import { AdminUrgentReports } from '../components/AdminUrgentReports';

import { AdminMapView } from '../components/AdminMapView';

import { Footer } from '../../../components/common/Footer';

import { AdminFilterBar } from '../components/AdminFilterBar';

import { AdminReportsTable } from '../components/AdminReportsTable';

import { AdminReportDetailModal } from '../components/AdminReportDetailModal';

import { AdminNavbar } from '../../../components/common/AdminNavbar';



export const AdminDashboardPage = () => {

  const navigate = useNavigate();

  const [dashboardStats, setDashboardStats] = useState({

    total: 0,

    pending: 0,

    resolved: 0,

    highPriority: 0

  });

  const [urgentReports, setUrgentReports] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);



  const {

    reports,

    loading,

    total,

    page,

    limit,

    filters,

    updateStatus,

    changePage,

    updateFilters,

    resetFilters,

    refresh

  } = useAdminReports();



  // Fetch Statistik Ringkasan

  const fetchDashboardStats = useCallback(async () => {

    try {

      const response = await adminService.getDashboardStats();

      if (response && response.success) {

        const data = response.data || {};

        setDashboardStats({

          total: data.total || 0,

          pending:

            (data.submitted || 0) +

            (data.validated || 0) +

            (data.prioritized || 0) +

            (data.reviewed || 0) +

            (data.in_progress || 0),

          resolved: data.resolved || 0,

          highPriority: data.priority?.high || 0

        });

      }

    } catch (error) {

      console.error('Error fetching dashboard stats:', error);

    }

  }, []);



  // Fetch Laporan Mendesak / Urgen

  const fetchUrgentReports = useCallback(async () => {

    try {

      const response = await adminService.getUrgentReports();

      if (response && response.success) {

        const dataList = Array.isArray(response.data) ? response.data : [];

        setUrgentReports(dataList.slice(0, 3));

      }

    } catch (error) {

      console.error('Error fetching urgent reports:', error);

      setUrgentReports([]);

    }

  }, []);



  useEffect(() => {

    fetchDashboardStats();

    fetchUrgentReports();

  }, [fetchDashboardStats, fetchUrgentReports]);



  // Handler untuk Buka Modal Detail Laporan (Pencarian Bertingkat)

  const handleViewReport = async (id) => {

    // 1. Cari di list reports utama

    let report = reports.find((r) => r.reportId === id || r._id === id || r.id === id);



    // 2. Jika tidak ada, cari di list urgentReports

    if (!report) {

      report = urgentReports.find((r) => r.reportId === id || r._id === id || r.id === id);

    }



    // 3. Jika masih tidak ada, ambil langsung dari API Backend

    if (!report) {

      try {

        const res = await adminService.getReportById(id);

        if (res && res.success) {

          report = res.data;

        }

      } catch (err) {

        console.error('Gagal mengambil detail laporan:', err);

      }

    }



    if (report) {

      setSelectedReport(report);

      setIsModalOpen(true);

    }

  };



  const handleCloseModal = () => {

    setIsModalOpen(false);

    setSelectedReport(null);

  };



  // Update Status Laporan & Pemicu Refresh Semua Komponen

  const handleStatusChange = async (id, newStatus, notes) => {

    const success = await updateStatus(id, newStatus, notes);

    if (success) {

      refresh(); // Reload list laporan utama

      fetchDashboardStats(); // Reload statistik

      fetchUrgentReports(); // Reload list urgen

    }

  };



  const handleLogout = () => {

    localStorage.removeItem('adminToken');

    navigate('/admin/login');

  };



  const totalPages = Math.ceil(total / limit) || 1;



  // Style Container Glassmorphism

  const sectionContainerStyle = {

    width: '100%',

    background: 'rgba(22, 24, 29, 0.65)',

    backdropFilter: 'blur(24px) saturate(180%)',

    WebkitBackdropFilter: 'blur(24px) saturate(180%)',

    borderRadius: '24px',

    border: '1px solid rgba(255, 255, 255, 0.12)',

    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',

    padding: '20px',
    
    paddingBottom :'0px',

    marginBottom: '32px',

    boxSizing: 'border-box'

  };



  return (

    <div

      style={{

        minHeight: '100vh',

        backgroundColor: '#0a0a0c',

        color: '#f5f5f7',

        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',

        display: 'flex',

        flexDirection: 'column'

      }}

    >

      <AdminNavbar onLogout={handleLogout} />



      {/* Area Konten Utama */}

      <main

        style={{

          flex: 1,

          width: '100%',

          maxWidth: '1200px',

          margin: '0 auto',

          padding: '100px 24px 40px 24px',

          boxSizing: 'border-box'

        }}

      >

        {/* Header Halaman */}

        <div style={{ marginBottom: '36px', textAlign: 'left' }}>

          <h1

            style={{

              fontSize: '32px',

              fontWeight: 700,

              letterSpacing: '-0.025em',

              color: '#ffffff',

              margin: '0 0 8px 0'

            }}

          >

            Dashboard Admin

          </h1>

          <p

            style={{

              fontSize: '16px',

              color: '#a1a1aa',

              margin: 0,

              fontWeight: 400

            }}

          >

            Kelola dan pantau seluruh laporan infrastruktur jalan rusak secara real-time.

          </p>

        </div>



        {/* Section 1: Kartu Statistik */}

        <section style={{ marginBottom: '32px' }}>

          <AdminStatsCard stats={dashboardStats} />

        </section>



        {/* Section 2: Laporan Urgent */}

        <section style={sectionContainerStyle}>

          <AdminUrgentReports

            reports={urgentReports}

            onViewReport={handleViewReport}

          />

        </section>



        {/* Section 3: Peta Lokasi (Map View) */}

        <section style={sectionContainerStyle}>

          <AdminMapView reports={reports} />

        </section>



       

          {/* Pagination */}
{totalPages > 1 && (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '24px',
      marginBottom: '24px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    }}
    className="flex-wrap sm:flex-nowrap gap-3"
  >
   

    <>
  
      </main>



      <Footer />



      {/* Modal Detail Laporan */}

      <AdminReportDetailModal

        isOpen={isModalOpen}

        report={selectedReport}

        onClose={handleCloseModal}

        onStatusChange={handleStatusChange}

      />

    </div>

  );

};
