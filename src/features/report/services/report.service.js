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