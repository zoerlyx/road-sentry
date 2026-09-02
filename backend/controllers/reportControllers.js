const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Gagal menghapus file temp:', err);
    }
  }
};

/**
 * Pemetaan Skor Prioritas AI (0-100) ke kolom priority database:
 * >= 80: 'urgent'
 * >= 40: 'medium'
 * < 40: 'low'
 */
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

    const formData = new FormData();
    formData.append('image', fs.createReadStream(uploadedFilePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    let aiResponse;
    try {
      aiResponse = await axios.post('http://127.0.0.1:5001/predict', formData, {
        headers: { ...formData.getHeaders() },
        timeout: 60000
      });
    } catch (aiError) {
      console.error('Error dari AI Service:', aiError.response?.data || aiError.message);
      cleanupFile(uploadedFilePath);

      if (aiError.response && aiError.response.data) {
        return res.status(aiError.response.status || 422).json({
          success: false,
          error_type: aiError.response.data.error_type || 'INVALID_IMAGE',
          message: aiError.response.data.message || 'Gagal memproses gambar oleh AI Service.'
        });
      }

      return res.status(503).json({
        success: false,
        error_type: 'AI_SERVICE_UNREACHABLE',
        message: 'Layanan AI Service sedang tidak dapat dijangkau.'
      });
    }

    const { summary, detectionResult, annotatedImageUrl } = aiResponse.data;
    const parsedLat = (latitude && !isNaN(parseFloat(latitude))) ? parseFloat(latitude) : null;
    const parsedLng = (longitude && !isNaN(parseFloat(longitude))) ? parseFloat(longitude) : null;

    // Aturan Pemetaan Data:
    // 1. Ekstrak ai_detection_result.summary.status_description ke kolom road_condition
    const roadCondition = summary?.status_description || 'Rusak Sedang';

    // 2. Petakan priority_score (0-100) ke kolom priority: >=80 'urgent', >=40 'medium', <40 'low'
    const priority = mapPriorityScoreToEnum(summary?.priority_score);

    // 3. Status default
    const reportStatus = 'pending';

    // 4. Susun ai_detection_result lengkap sesuai spesifikasi payload
    const fullAiDetectionResult = {
      summary: summary || {},
      detections: detectionResult?.detections || []
    };

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

  } catch (error) {
    cleanupFile(uploadedFilePath);
    console.error('Error in createReport:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server backend.'
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Hitung total data yang cocok
    const countQuery = `SELECT COUNT(*)::int AS total FROM reports ${whereClause}`;
    const countRes = await db.query(countQuery, values);
    const totalCount = countRes.rows[0]?.total || 0;

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || (page ? 10 : 100);
    const offset = (pageNum - 1) * limitNum;

    let dataQuery = `SELECT * FROM reports ${whereClause} ORDER BY created_at DESC`;
    if (page || limit) {
      dataQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(limitNum, offset);
    }

    const result = await db.query(dataQuery, values);

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching all reports:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar laporan.' });
  }
};

// 3. GET /api/reports/stats - Ringkasan Statistik Laporan untuk User & Admin
exports.getReportStats = async (req, res) => {
  try {
    // 1. Total Seluruh Laporan
    const totalQuery = 'SELECT COUNT(*)::int AS count FROM reports';

    // 2. Total Laporan Menunggu / Pending
    const pendingQuery = "SELECT COUNT(*)::int AS count FROM reports WHERE LOWER(status) IN ('pending', 'submitted')";

    // 3. Total Laporan Sedang Dikerjakan (In Progress)
    const inProgressQuery = "SELECT COUNT(*)::int AS count FROM reports WHERE LOWER(status) = 'in_progress'";

    // 4. Total Laporan Selesai (Resolved / Completed)
    const resolvedQuery = "SELECT COUNT(*)::int AS count FROM reports WHERE LOWER(status) IN ('resolved', 'completed')";

    // 5. Total Laporan Ditolak (Rejected)
    const rejectedQuery = "SELECT COUNT(*)::int AS count FROM reports WHERE LOWER(status) = 'rejected'";

    // 6. Total Laporan Urgent (Perlu Tindakan): Priority Urgent/High dan Status Pending
    const urgentQuery = `
      SELECT COUNT(*)::int AS count 
      FROM reports 
      WHERE LOWER(COALESCE(priority, '')) IN ('urgent', 'high')
        AND LOWER(status) IN ('pending', 'submitted')
    `;

    // 7. Laporan dengan Prioritas High/Urgent (keseluruhan)
    const highPriorityQuery = `
      SELECT COUNT(*)::int AS count 
      FROM reports 
      WHERE LOWER(COALESCE(priority, '')) IN ('urgent', 'high')
    `;

    const [
      totalRes,
      pendingRes,
      inProgressRes,
      resolvedRes,
      rejectedRes,
      urgentRes,
      highPriorityRes
    ] = await Promise.all([
      db.query(totalQuery),
      db.query(pendingQuery),
      db.query(inProgressQuery),
      db.query(resolvedQuery),
      db.query(rejectedQuery),
      db.query(urgentQuery),
      db.query(highPriorityQuery)
    ]);

    const total = totalRes.rows[0]?.count || 0;
    const pending = pendingRes.rows[0]?.count || 0;
    const in_progress = inProgressRes.rows[0]?.count || 0;
    const resolved = resolvedRes.rows[0]?.count || 0;
    const rejected = rejectedRes.rows[0]?.count || 0;
    const urgent = urgentRes.rows[0]?.count || 0;
    const highPriority = highPriorityRes.rows[0]?.count || 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        total_reports: total,
        pending,
        pending_reports: pending,
        in_progress,
        resolved,
        resolved_reports: resolved,
        completed: resolved,
        rejected,
        urgent,
        urgent_reports: urgent,
        highPriority,
        priority: {
          urgent,
          high: highPriority
        }
      }
    });
  } catch (error) {
    console.error('Error in getReportStats:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil statistik laporan.',
      error: error.message 
    });
  }
};

// 4. GET /api/reports/map - Titik Persebaran Lokasi GIS
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