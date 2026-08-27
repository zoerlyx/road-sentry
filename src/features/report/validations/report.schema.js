// src/features/report/validations/report.schema.js

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validateReport = (data = {}) => {
  const errors = {};

  // Validasi Foto
  if (!data.image) {
    errors.image = 'Foto jalan rusak wajib diupload';
  } else if (data.image instanceof File) {
    if (!ALLOWED_TYPES.includes(data.image.type)) {
      errors.image = 'Format foto harus JPG, PNG, atau WebP';
    } else if (data.image.size > MAX_SIZE_BYTES) {
      errors.image = 'Ukuran foto maksimal 5MB';
    }
  }

  // Validasi Lokasi (memastikan latitude & longitude ada dan valid secara numerik)
  const lat = parseFloat(data.latitude);
  const lng = parseFloat(data.longitude);
  if (isNaN(lat) || isNaN(lng) || data.latitude === null || data.longitude === null) {
    errors.location = 'Lokasi GPS tidak terdeteksi atau tidak valid';
  }


  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};