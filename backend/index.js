const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Routes
const reportRoutes = require('./routes/report.routes');

const app = express();

// 1. Pastikan Folder Uploads (Asli & Anotasi) Tersedia
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const UPLOAD_ANNOTATED_DIR = path.join(UPLOAD_DIR, 'annotated');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_ANNOTATED_DIR)) {
  fs.mkdirSync(UPLOAD_ANNOTATED_DIR, { recursive: true });
}

// 2. Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 3. Static File Serving (Akses via http://localhost:5000/uploads/...)
app.use('/uploads', express.static(UPLOAD_DIR));

// 4. API Routes Mapping
app.use('/api/reports', reportRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online', message: 'RoadSentry Backend API Running' });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server backend.'
  });
});

// 6. Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[*] Express Backend running on port ${PORT}`);
});