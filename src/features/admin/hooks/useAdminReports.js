import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin.service'; // sesuaikan path service kamu

export const useAdminReports = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refresh = useCallback(() => setFetchTrigger((t) => t + 1), []);

  const updateStatus = useCallback(async (id, newStatus) => {
    try {
      const response = await adminService.updateReportStatus(id, newStatus);
      if (response.success) {
        setFetchTrigger((t) => t + 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  }, []);

  const changePage = useCallback((newPage) => setPage(newPage), []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ status: '', priority: '', search: '' });
    setPage(1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      adminService.getReports({ page, limit, ...filters }),
      adminService.getDashboardStats(),
    ])
      .then(([reportsResponse, statsResponse]) => {
        if (cancelled) return;

        if (reportsResponse.success) {
          setReports(reportsResponse.data);
          setTotal(reportsResponse.pagination?.total || 0);
        }

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error('Error fetching admin data:', error);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, filters, fetchTrigger]);

  return {
    reports,
    stats,
    loading,
    total,
    page,
    limit,
    filters,
    updateStatus,
    changePage,
    updateFilters,
    resetFilters,
    refresh,
  };
};