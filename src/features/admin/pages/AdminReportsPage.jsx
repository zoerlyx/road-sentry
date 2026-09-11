import { useState } from 'react';

import { Link } from 'react-router-dom';

import { FaRoad, FaTachometerAlt, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';

import { useAdminReports } from '../hooks/useAdminReports';

import { AdminFilterBar } from '../components/AdminFilterBar';

import { AdminReportsTable } from '../components/AdminReportsTable';

import { AdminReportDetailModal } from '../components/AdminReportDetailModal';

import '../styles/adminDashboard.css';



export const AdminReportsPage = () => {

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



  const handleViewReport = (id) => {

    const report = reports.find(r => r._id === id);

    setSelectedReport(report);

    setIsModalOpen(true);

  };



  const handleCloseModal = () => {

    setIsModalOpen(false);

    setSelectedReport(null);

  };



  const handleStatusChange = async (id, newStatus) => {

    await updateStatus(id, newStatus);

  };



  const totalPages = Math.ceil(total / limit);



  return (

    <div className="admin-body">

      {/* Navbar */}

      <nav className="admin-navbar">

        <div className="admin-brand">

          <div className="admin-brand-icon">

            <FaRoad />

          </div>

          ROAD-SENTRY

          <span className="admin-badge">ADMIN</span>

        </div>

        <div className="admin-nav-links">

          <Link to="/admin/dashboard">

            <FaTachometerAlt /> Dashboard

          </Link>

          <Link to="/admin/reports">

            <FaFileAlt /> Laporan

          </Link>

          <Link to="/login">

            <FaSignOutAlt /> Keluar

          </Link>

        </div>

      </nav>



      {/* Main Content */}

      <div className="admin-content">

        <div className="admin-header">

          <h1 className="admin-title">Manajemen Laporan</h1>

          <p className="admin-subtitle">Kelola semua laporan jalan rusak</p>

        </div>



        {/* Reports Table */}

        <div className="reports-section">

          <div className="reports-header">

            <h2 className="reports-title">Daftar Laporan</h2>

            <button className="refresh-btn" onClick={refresh}>

              <FaFileAlt /> Refresh

            </button>

          </div>



          <AdminFilterBar 

            filters={filters}

            onFilterChange={updateFilters}

            onReset={resetFilters}

          />



          <AdminReportsTable 

            reports={reports}

            loading={loading}

            onViewReport={handleViewReport}

            onStatusChange={handleStatusChange}

          />



          {/* Pagination */}

          {totalPages > 1 && (

            <div className="admin-pagination">

              <button 

                className="admin-pagination-btn"

                disabled={page === 1}

                onClick={() => changePage(page - 1)}

              >

                Sebelumnya

              </button>

              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>

                Halaman {page} dari {totalPages}

              </span>

              <button 

                className="admin-pagination-btn"

                disabled={page === totalPages}

                onClick={() => changePage(page + 1)}

              >

                Selanjutnya

              </button>

            </div>

          )}

        </div>

      </div>



      {/* Footer */}

      <footer className="admin-footer">

        <p>2026 ROAD-SENTRY | Sistem Pelaporan Jalan Rusak Berbasis AI & GIS</p>

      </footer>



      {/* Modal */}

      <AdminReportDetailModal 

        isOpen={isModalOpen}

        report={selectedReport}

        onClose={handleCloseModal}

        onStatusChange={handleStatusChange}

      />

    </div>

  );

};
