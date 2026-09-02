const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportControllers'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Memastikan folder backend/uploads tersedia
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Disk Storage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `report-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Batas 10MB
});

// =========================================================================
// 1. ENDPOINT STATIS / KHUSUS (Harus selalu ditaruh di paling atas)
// =========================================================================
router.get('/stats', reportController.getReportStats);
router.get('/map', reportController.getMapReports);
router.get('/', reportController.getAllReports);

// =========================================================================
// 2. ENDPOINT MUTASI / POST
// =========================================================================
router.post('/', upload.single('image'), reportController.createReport);

// =========================================================================
// 3. ENDPOINT DINAMIS (Menggunakan parameter :id)
// =========================================================================
router.get('/:id', reportController.getReportById);

// TAMBAHKAN LINE INI (Ambil status laporan berdasarkan ID):
router.get('/:id/status', reportController.getReportById); 

router.put('/:id/status', reportController.updateReportStatus);

module.exports = router;