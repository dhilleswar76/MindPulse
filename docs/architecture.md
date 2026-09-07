# Architecture — MindPulse Platform (SIH26094)

MindPulse employs a modern, decoupled microservice architecture tailored for non-diagnostic mental health monitoring, real-time counselor decision support, and explainable machine learning across the 6-stage legal and rehabilitation journey of atrocity victims.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React / Vite)                       │
│  Victim/Witness Portal  │  Counselor Decision Support  │  District Admin │
│  - Case Journey Timeline│  - Pseudonymous Triage Queue │  - Aggregate    │
│  - Trauma Telemetry     │  - Support Pathway Logging   │    Telemetry    │
│  - Voice Stress Screener│  - Outcome Tracking Deltas   │  - Heatmap/Sim  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / WebSocket
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend API (Node.js / Express)                 │
│  - JWT / RBAC Middleware           - Case & Counselor Services         │
│  - Zod Validation Layers           - Privacy Guard (k-anonymity >= 5)  │
└──────────────┬───────────────────────────────┬─────────────────────────┘
               │ Mongoose / ODM                │ HTTP Async RPC
               ▼                               ▼
┌──────────────────────────────┐ ┌───────────────────────────────────────┐
│     MongoDB Datastore        │ │      Python ML Microservice (FastAPI) │
│  - Users & Consent           │ │  - Feature Extraction (Safety/Deltas) │
│  - Cases (6-Stage Journey)   │ │  - Multi-Stage Calibration (XGBoost)  │
│  - Check-ins (Safety/Stress) │ │  - Explainability Engine (SHAP Local) │
│  - Risk Scores & Alerts      │ │  - Acoustic Biomarker Screener (Voice)│
│  - Interventions & Outcomes  │ │  - Anomaly Detector (Isolation Forest)│
└──────────────────────────────┘ └───────────────────────────────────────┘
```

---

## 1. Core Architectural Data Flows

### A. Trauma-Informed Check-in & Risk Inference Flow
1. **Victim / Witness Check-in**: The user inputs subjective sliders (Mood, Stress, Energy, Sleep Hours, Perceived Sense of Safety, Case-Related Tension) or records a 5-second acoustic voice sample.
2. **Persistence**: Express backend validates payload via Zod and records a `CheckIn` document associated with the user's active `CaseStage`.
3. **ML Microservice Call**: Backend queries `POST http://localhost:8000/predict-risk` passing the longitudinal check-in window and case stage weight.
4. **Feature Engineering**: Python service calculates longitudinal safety-deltas, sleep deficits, and stage-specific volatility indices.
5. **Inference & Explainability**: Model produces a normalized Risk Score (0.00–1.00), assigns Risk Level (`STABLE`, `WATCH`, `ELEVATED`, `REQUIRES_REVIEW`), and computes local SHAP factor contributions (e.g. Hearing Proximity +28%, Sleep Deficit +22%, Safety Volatility +18%).
6. **Persistence & Alert Check**: Risk score is saved to `RiskScore` collection. If risk is `ELEVATED` or higher, the backend creates an `Alert` document for the assigned support counselor.

### B. Counselor Triage & Support Pathway Flow
1. **Case Triage**: Counselor opens the portal and sees a prioritized case queue indexed by pseudonymous Case IDs (`MP-1042`), victim types, and active stages.
2. **AI-Assisted Telemetry Synthesis**: Backend requests or generates an AI Summary of recent telemetry, clearly marked with non-diagnostic human-review notices.
3. **Intervention Logging**: Counselor logs statutory support pathways (`LEGAL_AID`, `VICTIM_COMPENSATION`, `WITNESS_PROTECTION`, `COUNSELLING`).
4. **Outcome Tracking**: System monitors post-intervention check-in trends and renders before/after delta charts.

### C. District / State Aggregate Analytics & Heatmap Flow
1. **Welfare Officer Query**: Institutional official views district-wide distress trends.
2. **k-Anonymity Safeguard**: Aggregation pipeline enforces a strict minimum threshold of $k \ge 5$ records per cohort before exposing statistics. No individual or identifiable records are ever transmitted.
3. **What-If Simulation**: Official runs simulated policy interventions (e.g. "Expand DLSA legal aid capacity by 25%" or "Deploy dedicated witness safe transit") to forecast directional distress reduction.

