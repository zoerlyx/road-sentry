import api from '../../../services/axios';

export const reportService = {
  // 1. Submit Laporan Baru (POST /api/reports)
  submitReport: async (data) => {
    if (!data.image) {
      throw new Error('Foto jalan rusak wajib diunggah!');
    }

    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('latitude', data.latitude ?? '');
    formData.append('longitude', data.longitude ?? '');
    formData.append('description', data.description || '');

    const addressVal = data.address_location || data.addressLocation || data.address || '';
    formData.append('address_location', addressVal);

    if (data.title) {
      formData.append('title', data.title);
    }

    try {
      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error Submit Report:', error.response?.data || error.message);

      // Teruskan response data lengkap agar error_type dari AI Service tetap dapat dibaca di UI
      if (error.response && error.response.data) {
        const customError = new Error(
          error.response.data.message || 'Gagal mengirim laporan ke server backend.'
        );
        customError.error_type = error.response.data.error_type;
        customError.status = error.response.status;
        throw customError;
      }

      throw new Error('Tidak dapat terhubung ke server backend.');
    }
  },

  // 2. Ambil Semua Laporan (GET /api/reports)
  getAllReports: async () => {
    try {
      const response = await api.get('/reports');
      return response.data;
    } catch (error) {
      console.error('Error Get All Reports:', error.response?.data || error.message);
      throw error;
    }
  },

  // 3. Ambil Statistik Dashboard Admin (GET /api/reports/stats)
  getStats: async () => {
    try {
      const response = await api.get('/reports/stats');
      return response.data;
    } catch (error) {
      console.error('Error Get Stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // 4. Ambil Data Peta GIS (GET /api/reports/map)
  getMapReports: async () => {
    try {
      const response = await api.get('/reports/map');
      return response.data;
    } catch (error) {
      console.error('Error Get Map Reports:', error.response?.data || error.message);
      throw error;
    }
  },

  // 5. Ambil Detail Laporan Berdasarkan ID (GET /api/reports/:id)
  getReportById: async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error Get Report By ID:', error.response?.data || error.message);
      throw error;
    }
  },

  // 6. Update Status Laporan (PUT /api/reports/:id/status)
  updateReportStatus: async (reportId, newStatus) => {
    try {
      const response = await api.put(`/reports/${reportId}/status`, {
        status: newStatus,
      });

      return response.data;
    } 
  }
};