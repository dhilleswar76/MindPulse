# Architecture — MindPulse Platform

MindPulse employs a modern, decoupled microservice architecture tailored for privacy-first mental health monitoring, real-time counselor decision support, and explainable machine learning.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React / Vite)                       │
│  User Dashboard  │  Counselor Case Triage  │  Admin Analytics/Heatmap  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / WebSocket
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend API (Node.js / Express)                 │
│  - JWT / RBAC Middleware           - Feature Controllers & Services    │
│  - Zod Validation Layers           - Socket.IO Realtime Dispatcher     │
└──────────────┬───────────────────────────────┬─────────────────────────┘
               │ Mongoose / ODM                │ HTTP Async RPC
               ▼                               ▼
┌──────────────────────────────┐ ┌───────────────────────────────────────┐
│     MongoDB Datastore        │ │      Python ML Microservice (FastAPI) │
│  - Users & Consent           │ │  - Feature Extraction (Rolling Deltas)│
│  - Check-ins & Journals      │ │  - Risk Prediction (XGBoost Interface)│
│  - Risk Scores & Alerts      │ │  - Explainability Engine (SHAP Local) │
│  - Interventions & Audits    │ │  - Anomaly Detector (Isolation Forest)│
└──────────────────────────────┘ └───────────────────────────────────────┘
```

---

## 1. Core Architectural Data Flows

### A. Wellness Check-in & Risk Inference Flow
1. **Student Check-in**: The user inputs daily sliders (Mood, Stress, Energy, Sleep Hours) on the frontend.
2. **Persistence**: Express backend validates payload via Zod and creates a `CheckIn` document.
3. **ML Microservice Call**: Backend queries `POST http://localhost:8000/predict-risk` passing the user's recent check-in window.
4. **Feature Engineering**: Python service calculates rolling 7-day averages, sleep deficit ratios, and variance indicators.
5. **Inference & Explainability**: Model produces a normalized Risk Score (0.00–1.00), assigns Risk Level (`STABLE`, `WATCH`, `ELEVATED`, `REQUIRES_REVIEW`), and computes local factor contributions.
6. **Persistence & Alert Check**: Risk score is saved to `RiskScore` collection. If risk is `ELEVATED` or higher across multiple check-ins, the backend creates an `Alert` document and broadcasts via WebSocket.

### B. Counselor Triage & Intervention Flow
1. **Case Triage**: Counselor opens the portal and sees a ranked list of students requiring support.
2. **AI-Assisted Synthesis**: Backend requests or generates an AI Summary of recent telemetry, clearly marked with a non-diagnostic human review flag.
3. **Intervention Creation**: Counselor schedules or logs an intervention (`ACTIVE`, `PLANNED`, `COMPLETED`, `FOLLOW_UP_REQUIRED`).
4. **Outcome Tracking**: System monitors post-intervention check-in trends and renders before/after delta charts.

### C. Institutional Aggregate Analytics & Heatmap Flow
1. **Admin Query**: Institutional leader views campus wellness trends.
2. **k-Anonymity Safeguard**: Aggregation pipeline enforces a minimum threshold of $k \ge 5$ records per cohort before exposing statistics. No individual or identifiable records are ever transmitted.
3. **What-If Simulation**: Admin runs simulated policy interventions (e.g. "Expand counseling staff by 25%") to forecast directional impact on campus stress trends.
