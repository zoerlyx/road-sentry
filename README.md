# 🛣️ Road Sentry



>**Integrated Platform for Public Road Infrastructure Reporting, Automated Computer Vision-Based Damage Detection (YOLOv8), and GIS-Based Management.**

Road Sentry is a cutting-edge system integrating artificial intelligence (Computer Vision) and Geographic Information Systems (GIS) to record, analyze, and prioritize road damage repairs in real time.

The public can upload photos of damaged roads along with their corresponding GPS location coordinates. The AI engine automatically validates damage authenticity, detects objects (potholes, cracks), calculates a severity score, generates annotated photos with bounding boxes, and prioritizes actionable items on the Administrator Dashboard.

> This project was developed collaboratively as part of a Coding Camp program. In the initial version, the system established a foundational concept but faced backend stability issues and an unoptimized user interface. I took ownership of the end-to-end refactoring process—overhauling the backend architecture to ensure system reliability, redesigning the UI/UX for an intuitive and standardized experience, and retraining the AI model until the application became fully stable and production-ready.

---
---

## 🏛️ System Architecture & Workflow

```text
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────────────┐
│                 │        │                  │        │                         │
│  Public /       ├───────►│  Web Frontend    ├───────►│  Express.js Backend API │
│  Citizen        │ Photo &│  (React 18/Vite) │ Form   │  (Multer & Routing)     │
│  Reporter       │ Location                  │ Data   │                         │
└─────────────────┘        └──────────────────┘        └────────────┬────────────┘
                                                                    │
                                                 Multipart / Image  │
                                                                    ▼
                                                       ┌─────────────────────────┐
                                                       │  AI Inference Engine    │
                                                       │  (Flask / YOLOv8)       │
                                                       │  - Gatekeeper & Valid.  │
                                                       │  - Bounding Box Detect  │
                                                       │  - Priority Scoring     │
                                                       └────────────┬────────────┘
                                                                    │
                                                 Result JSON & Img  │
                                                                    ▼
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────────────┐
│                 │        │                  │        │                         │
│  Relevant       │◄───────┤  Admin Dashboard │◄───────┤  Neon PostgreSQL        │
│  Department     │ Status │  - GIS Map View  │ Query  │  (Serverless DB         │
│  (Repair Action)│ Update │  - Real-time Ops │ & Sync │   Table: reports)       │
└─────────────────┘        └──────────────────┘        └─────────────────────────┘

```

### Main Workflow
1. **Reporter Input**: Users fill out a description form, provide coordinates (automated GPS or Nominatim address search), and upload a damage photo.
2. **AI Gatekeeper & Detection**: The backend forwards the photo to the AI Service (Flask :5001). The YOLOv8 model filters out non-road images, flags potholes/cracks, and computes a priority_score (0–100).
3. **Structured Storage**: Data is saved to Neon DB with the following mapping:
   - Score ≥ 80 → Priority urgent
   - Score ≥ 40 → Priority medium
   - Score < 40 → Priority low
4. **Monitoring & Dispatching**: The Admin Dashboard displays an interactive GIS map, filtered report tables, and real-time metric cards. Admins can update the maintenance status directly (pending → in_progress → resolved).

---

## 💻 Tech Stack

### Frontend
- **Framework & Runtime**: React 18, Vite 6, React Router DOM v6
- **Styling**: Tailwind CSS, Apple Dark Glassmorphism Design System (SF Pro typography, backdrop blur)
- **Mapping & GIS**: Leaflet, React-Leaflet, OpenStreetMap
- **State & Network**: Axios, React Intersection Observer, Framer Motion

### Backend API
- **Framework**: Node.js, Express.js (v5)
- **Database Driver**: pg (Node Postgres Connection Pooler)
- **File Uploads**: Multer, Form-Data

### AI & Machine Learning
- **Model**: Ultralytics YOLOv8 Custom Trained (`best.pt`)
- **Backend Service**: Python 3.10+, Flask, OpenCV Headless, Pillow, PyTorch

### Database & Cloud
- **Database**: Neon Serverless PostgreSQL
- **Hosting Target**: Vercel (Frontend), Railway / Render / VPS (Backend & AI)

---

## 📂 Project Directory Structure

```text
road-sentry/
├── backend/
│   ├── ai-service/                 # Python Flask YOLOv8 Inference Service
│   │   ├── uploads/annotated/      # Generated AI-annotated photos
│   │   ├── app.py                  # /predict endpoint & score calculation
│   │   ├── best.pt                 # YOLOv8 model weights
│   │   └── requirements.txt        # Python dependencies
│   ├── controllers/
│   │   └── reportControllers.js    # Business logic, CRUD, stats calculation
│   ├── routes/
│   │   └── report.routes.js        # REST API endpoint routes
│   ├── uploads/                    # Original uploaded photos from public form
│   ├── db.js                       # Neon PostgreSQL pool connection
│   ├── index.js                    # Express.js server entry point
│   ├── package.json
│   └── .env
├── src/
│   ├── app/                        # Routing & App Root
│   ├── components/                 # Global UI components (Navbar, Footer, Toast, UI Glass)
│   ├── features/
│   │   ├── admin/                  # Admin Dashboard Feature
│   │   │   ├── components/         # MapView, StatsCard, ReportsTable, Detail Modal, FilterBar, Urgent
│   │   │   ├── constants/          # reportStatus.js
│   │   │   ├── hooks/              # useAdminReports.js
│   │   │   ├── pages/              # AdminDashboardPage.jsx, AdminReportsPage.jsx
│   │   │   ├── services/           # admin.service.js
│   │   │   └── styles/             # adminDashboard.css
│   │   └── report/                 # Public Reporting Feature
│   │       ├── components/         # FormCard, ReportStatus, StatsSection, MapPreview
│   │       ├── constants/          # reportStatus.js
│   │       ├── hooks/              # useGeolocation.jsx, useReportSubmission.jsx
│   │       ├── pages/              # ReportPage.jsx
│   │       ├── services/           # report.service.js
│   │       └── validations/        # report.schema.js
│   ├── mocks/                      # Mock data for local testing (mockData.js, reportData.js)
│   ├── styles/                     # Global CSS & Tailwind styling (globals.css)
│   ├── App.jsx
│   └── main.jsx
├── public/                         # Public static assets & screenshots
│   └── screenshots/
├── .env.example                    # Example environment variables template
├── .gitignore
├── index.html
├── package.json
├── postcss.config
├── README.md
└── vercel.json

```

---


---
