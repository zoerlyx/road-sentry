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

---
