import api from '../../../services/api';

export const adminService = {
  // Ambil Statistik Ringkasan Laporan
  getDashboardStats: async () => {
    try {
      const response = await api.get('/reports/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  // Ambil Daftar Laporan (Pagination & Filter)
  getReports: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status = '', priority = '', search = '' } = params;

      // Clean empty params agar query string bersih (?page=1&limit=10)
      const cleanParams = { page, limit };
      if (status) cleanParams.status = status;
      if (priority) cleanParams.priority = priority;
      if (search) cleanParams.search = search;

      const response = await api.get('/reports', { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  },

  // Ambil Single Laporan Berdasarkan ID
  getReportById: async (id) => {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch report:', error);
      throw error;
    }
  },

  // Update Status Laporan
  updateReportStatus: async (id, status, notes = '') => {
    try {
      // Menambahkan payload optional notes jika admin memberikan catatan perubahan status
      const response = await api.put(`/reports/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      console.error('Failed to update report status:', error);
      throw error;
    }
  },

  // Ambil Laporan Prioritas Tinggi (urgent + high, status pending/submitted)
  getUrgentReports: async (limit = 5) => {
    try {
      const response = await api.get('/reports', {
        params: { is_urgent: 'true', limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch urgent reports:', error);
      throw error;
    }
  }
};