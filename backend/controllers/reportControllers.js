const axios = require('axios');

const fs = require('fs');
const db = require('../db');

const mapPriorityScoreToEnum = (score) => {
  const numScore = parseFloat(score);
  if (isNaN(numScore)) return 'medium';
  if (numScore >= 80) return 'urgent';
  if (numScore >= 40) return 'medium';
  return 'low';
};

// 1. POST /api/reports - Buat laporan baru
exports.createReport = async (req, res) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File gambar wajib diunggah' });
    }

    uploadedFilePath = req.file.path;
    const { title, description, latitude, longitude, address_location, reportType } = req.body;
    const originalImageUrl = `/uploads/${req.file.filename}`;

    

    const { summary, detectionResult, annotatedImageUrl } = aiResponse.data;
    const parsedLat = (latitude && !isNaN(parseFloat(latitude))) ? parseFloat(latitude) : null;
    const parsedLng = (longitude && !isNaN(parseFloat(longitude))) ? parseFloat(longitude) : null;

    // Aturan Pemetaan Data:
    // 1. Ekstrak ai_detection_result.summary.status_description ke kolom road_condition
    const roadCondition = summary?.status_description || 'Rusak Sedang';

    

    const query = `
      INSERT INTO reports (
        title, description, report_type, status, image_url, annotated_image_url, 
        latitude, longitude, address_location, ai_detection_result, road_condition, priority, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *;
    `;

    const values = [
      title || 'Laporan Kerusakan Jalan',
      description || '',
      reportType || 'PENGADUAN',
      reportStatus,
      originalImageUrl,
      annotatedImageUrl,
      parsedLat,
      parsedLng,
      address_location || null,
      JSON.stringify(fullAiDetectionResult),
      roadCondition,
      priority
    ];

    const result = await db.query(query, values);

    return res.status(201).json({
      success: true,
      message: 'Laporan berhasil terverifikasi oleh AI dan tersimpan.',
      data: {
        report: result.rows[0],
        ai_summary: summary
      }
    });

  } 
};

// 2. GET /api/reports - Ambil Semua Laporan (dengan Filtering, Searching, & Pagination)
exports.getAllReports = async (req, res) => {
  try {
    const { status, priority, search, page, limit, is_urgent } = req.query;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Filter status
    if (status) {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus === 'resolved' || lowerStatus === 'completed') {
        conditions.push(`LOWER(status) IN ('resolved', 'completed')`);
      } else if (lowerStatus === 'pending' || lowerStatus === 'submitted') {
        conditions.push(`LOWER(status) IN ('pending', 'submitted')`);
      } else {
        conditions.push(`LOWER(status) = $${paramIndex++}`);
        values.push(lowerStatus);
      }
    }

    // Filter priority (atau filter khusus urgent: priority in ('urgent', 'high') AND status = 'pending')
    if (is_urgent === 'true' || priority === 'urgent') {
      conditions.push(`LOWER(COALESCE(priority, '')) IN ('urgent', 'high')`);
      if (!status) {
        conditions.push(`LOWER(status) IN ('pending', 'submitted')`);
      }
    } else if (priority) {
      const lowerPriority = priority.toLowerCase();
      if (lowerPriority === 'high' || lowerPriority === 'urgent') {
        conditions.push(`LOWER(COALESCE(priority, '')) IN ('urgent', 'high')`);
      } else {
        conditions.push(`LOWER(priority) = $${paramIndex++}`);
        values.push(lowerPriority);
      }
    }

    // Filter search keyword (pencarian judul, deskripsi, alamat, atau ID)
    if (search && search.trim().length > 0) {
      const keyword = `%${search.trim().toLowerCase()}%`;
      conditions.push(`(
        LOWER(COALESCE(title, '')) LIKE $${paramIndex} OR
        LOWER(COALESCE(description, '')) LIKE $${paramIndex} OR
        LOWER(COALESCE(address_location, '')) LIKE $${paramIndex} OR
        CAST(id AS TEXT) LIKE $${paramIndex}
      )`);
      values.push(keyword);
      paramIndex++;
    }

    
exports.getMapReports = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, description, status, road_condition, priority, address_location,
              ai_detection_result, latitude, longitude, image_url, annotated_image_url, created_at 
       FROM reports 
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL
       ORDER BY created_at DESC`
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching map reports:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data peta GIS.' });
  }
};

// 5. GET /api/reports/:id - Detail Laporan berdasarkan ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM reports WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail laporan' });
  }
};

// 6. PUT /api/reports/:id/status - Update Status Laporan (Admin)
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (status) {
      status = status.toLowerCase();
    }

    // Validasi nilai status sesuai check constraint Neon DB:
    // ['pending', 'in_progress', 'completed', 'resolved', 'rejected', 'submitted']
    const allowedStatuses = ['pending', 'in_progress', 'completed', 'resolved', 'rejected', 'submitted'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Gunakan salah satu dari: ${allowedStatuses.join(', ')}`
      });
    }

    const result = await db.query(
      'UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }

    return res.status(200).json({
      success: true,
      message: 'Status laporan berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status laporan' });
  }
};