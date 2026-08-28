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
    } 