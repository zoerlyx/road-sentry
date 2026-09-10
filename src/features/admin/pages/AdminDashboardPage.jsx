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

            </button>

          </div>



          {/* Filter Bar */}

          <AdminFilterBar

            filters={filters}

            onFilterChange={updateFilters}

            onReset={resetFilters}

          />



          {/* Table Component */}

          <AdminReportsTable

            reports={reports}

            loading={loading}

            onViewReport={handleViewReport}

            onStatusChange={handleStatusChange}

          />



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
    <button
      disabled={page === 1}
      onClick={() => changePage(page - 1)}
      style={{
        padding: '8px 16px',
        borderRadius: '10px',
        backgroundColor: page === 1 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: page === 1 ? '#48484a' : '#f5f5f7',
        fontSize: '13px',
        fontWeight: 500,
        cursor: page === 1 ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease'
      }}
      className="flex-1 sm:flex-none text-center order-1 sm:order-none"
    >
      Sebelumnya
    </button>

    <>
  <style>{`
    @media (max-width: 640px) {
      .hide-on-mobile {
        display: none !important;
      }
    }
  `}</style>

  <span 
    className="hide-on-mobile"
    style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}
  >
    Halaman <strong style={{ color: '#f5f5f7' }}>{page}</strong> dari{' '}
    <strong style={{ color: '#f5f5f7' }}>{totalPages}</strong>
  </span>
</>

    <button
      disabled={page === totalPages}
      onClick={() => changePage(page + 1)}
      style={{
        padding: '8px 16px',
        borderRadius: '10px',
        backgroundColor: page === totalPages ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: page === totalPages ? '#48484a' : '#f5f5f7',
        fontSize: '13px',
        fontWeight: 500,
        cursor: page === totalPages ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease'
      }}
      className="flex-1 sm:flex-none text-center order-2 sm:order-none"
    >
      Selanjutnya
    </button>
  </div>
)}

        </section>

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
