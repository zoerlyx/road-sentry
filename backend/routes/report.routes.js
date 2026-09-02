const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportControllers'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/
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



module.exports = router;