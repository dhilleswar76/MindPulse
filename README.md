# MindPulse 🧠⚡
### AI-Powered Dynamic Mental Health Monitoring & Distress Prediction System for Victims of Atrocities

[![Smart India Hackathon 2024 / 2025](https://img.shields.io/badge/SIH-Problem%20Statement%2026094-blue.svg)](https://www.sih.gov.in/)
[![Ministry](https://img.shields.io/badge/Ministry-Social%20Justice%20%26%20Empowerment-orange.svg)](https://socialjustice.gov.in/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-blue)](frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript%20%7C%20MongoDB-green)](backend)
[![ML Service](https://img.shields.io/badge/ML%20Service-FastAPI%20%7C%20Scikit--Learn%20%7C%20XGBoost%20%7C%20SHAP-orange)](ml-service)

> **IMPORTANT NON-DIAGNOSTIC NOTICE**: MindPulse is strictly an **AI-assisted decision-support and early intervention platform**. It does NOT diagnose psychiatric illness or replace qualified clinical psychologists, legal aid advocates, or law enforcement. Human counselors and district officials make all intervention decisions with explicit human-in-the-loop oversight.

---

## 🏛️ Smart India Hackathon Alignment (SIH26094)

| Parameter | Specification |
| :--- | :--- |
| **Problem Statement ID** | **SIH26094 / 26094** |
| **Title** | **AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System for Victims of Atrocities** |
| **Organization** | Ministry of Social Justice and Empowerment |
| **Department** | Department of Social Justice and Empowerment |
| **Category** | Software |
| **Theme** | MedTech / BioTech / Social Welfare |

---

## 🌟 Overview & Problem Addressed

Victims, complainants, and protected witnesses affected by atrocities often navigate protracted, re-traumatizing legal and rehabilitation journeys. Acute mental health deterioration, sleep disruption, and fear of retaliation frequently spike around critical case milestones (e.g., pre-trial hearings, testimony, investigation cross-examinations, and compensation delays). 

Traditional support systems are purely reactive. **MindPulse** solves this challenge through:
1. **Low-Friction Trauma-Informed Check-Ins & Voice Screening**: Voluntary mood, sleep, perceived sense of safety, and case-related tension tracking.
2. **Dynamic Longitudinal Baseline & Anomaly Detection**: Tracks individuals against their personal historical normal rather than arbitrary thresholds.
3. **Multi-Stage Legal Journey Contextualization**: Calibrates distress sensitivity across 6 journey milestones (`Case Registration` $\rightarrow$ `Investigation` $\rightarrow$ `Court/Trial` $\rightarrow$ `Compensation` $\rightarrow$ `Rehabilitation` $\rightarrow$ `Protection/Support`).
4. **Explainable AI (XAI) Risk Prediction**: Gradient-boosted scoring with SHAP feature attributions explaining contributing factors (e.g., Hearing Proximity +28%, Sleep Deficit +22%, Safety Volatility +18%).
5. **Counselor Triage Decision Support**: Prioritized case queues, automated non-diagnostic telemetry summaries, and DLSA legal aid / victim compensation intervention tracking.
6. **Privacy-Preserving Institutional Analytics**: District $\rightarrow$ State aggregated telemetry ($k \ge 5$) with regional distress heatmaps and policy simulation tools.

---

## 🗺️ 6-Stage Case Journey Architecture

```text
[1. Case Registration] ──► [2. Investigation] ──► [3. Court / Trial]
          │                        │                     │
          ▼                        ▼                     ▼
[6. Protection / Support] ◄── [5. Rehabilitation] ◄── [4. Compensation]
```

---

## 🏗️ Monorepo Architecture

```text
MindPulse/
├── frontend/             # React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide
│   ├── src/features/
│   │   ├── dashboard/    # Victim/Witness Portal with Case Journey Timeline
│   │   ├── checkins/     # 10-point telemetry check-ins (Safety, Case Stress, Sleep)
│   │   ├── voice/        # Prototype Voice Stress & Acoustic Biomarker Modal
│   │   ├── journal/      # Trauma-informed expressive writing & NLP indicators
│   │   ├── counselor/    # Case queue, triage details, AI telemetry synthesis
│   │   ├── interventions/# Multi-pathway logging & pre/post outcome tracking
│   │   ├── analytics/    # District/State aggregated telemetry (k >= 5)
│   │   ├── heatmap/      # Regional jurisdictional distress heatmap
│   │   ├── simulator/    # What-If district welfare policy simulator
│   │   └── support/      # Trauma-informed conversational companion
├── backend/              # Node.js, Express, TypeScript, Mongoose, JWT
│   ├── src/models/       # User, Case, CheckIn, Intervention, Recommendation, Alert
│   ├── src/features/     # Cases, Counselor, Checkins, Analytics, Interventions
│   └── src/seed.ts       # Synthetic demo database seeder
├── ml-service/           # Python FastAPI, Scikit-learn, XGBoost, SHAP
│   ├── app/feature_engineering/ # Longitudinal safety & stage delta extractors
│   ├── app/explainability/      # SHAP feature factor explainer
│   ├── app/services/            # Risk scoring & prototype voice analysis service
│   └── app/api/endpoints.py     # /predict-risk, /forecast, /analyze-voice
└── docs/                 # System architecture, schemas, and API documentation
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+ or v20+)
- Python (v3.10+)
- Git

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/dhilleswar76/MindPulse.git
cd MindPulse

# Install workspace dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../ml-service && pip install -r requirements.txt
```

### 2. Environment Setup
```bash
cp .env.example .env
cp .env.example backend/.env
```

### 3. Seed Demo Data
```bash
cd backend && npm run seed
```

### 4. Launch Services
- **Backend API**: `cd backend && npm run dev` (`http://localhost:5000`)
- **Frontend App**: `cd frontend && npm run dev` (`http://localhost:5173`)
- **Python ML Service**: `cd ml-service && uvicorn app.main:app --reload --port 8000` (`http://localhost:8000`)

---

## 🔑 Pre-Configured Synthetic Demo Personas

> For a complete guide with route breakdowns and access scopes, see [DEMO_CREDS.md](DEMO_CREDS.md).

| Role | Email | Password | Landing Route | Case ID & Context |
| :--- | :--- | :--- | :--- | :--- |
| **Protected Witness (Victim)** | `user@gmail.com` | `MindPulse` | `/dashboard` | **Case MP-1042** (Alex Rivera) • *Court/Trial Stage* • Experiencing acute testimony anxiety & sleep disruption |
| **Support Counselor** | `counsellor@gmail.com` | `MindPulse` | `/counselor` | **Dr. Sarah Jenkins** • *District Legal Aid & Victim Support Cell* • Triages case queue & logs legal aid pathways |
| **District Welfare Official** | `admin@gmail.com` | `MindPulse` | `/admin` *(Hidden Route)* | **Marcus Vance** • *District Social Justice Division* • Monitors anonymized regional distress trends ($k \ge 5$) |

---

## 📊 Feature Implementation Status

| Feature Module | SIH26094 Scope | Status |
| :--- | :--- | :---: |
| **Case Journey Tracking (6 Stages)** | Milestone-based stress calibration across legal journey | **Implemented** |
| **Trauma-Informed Telemetry** | Mood, sleep deficit, perceived safety, and case tension | **Implemented** |
| **Explainable AI (XAI) Engine** | Tree-based classification with SHAP factor attributions | **Implemented** |
| **Voice Acoustic Biomarker Screener** | Jitter, shimmer, and speech rate screening interface | **Prototype** |
| **Counselor Decision Support Queue** | Pseudonymous triage queue, AI summaries, human oversight | **Implemented** |
| **Support Pathway Interventions** | Legal Aid (NALSA/DLSA), Victim Compensation, Protection | **Implemented** |
| **Intervention Outcome Tracking** | Longitudinal delta comparison (pre vs. post intervention) | **Implemented** |
| **District Aggregated Analytics** | Minimum cohort size ($k \ge 5$) privacy-preserving reporting | **Implemented** |
| **Regional Distress Heatmap** | Jurisdictional cluster distress tracking without PII exposure | **Implemented** |
| **What-If Policy Simulator** | Legal aid capacity and transit protection impact modeling | **Implemented** |

---

## 🔒 Ethical & Privacy Safeguards
1. **Non-Diagnostic Framing**: Emphasizes supportive decision support and early distress cues over clinical diagnostic claims.
2. **Human-in-the-Loop**: Automated summaries highlight signals; human counselors approve all interventions.
3. **Pseudonymity & Encryption**: Identifiers are decoupled into Case IDs (`MP-1042`).
4. **k-Anonymity ($k \ge 5$)**: Spatial and institutional reports enforce minimum cohort thresholds to prevent reverse identification.

---

## 📚 Documentation
- [System Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [API Overview](docs/api-overview.md)
- [Feature Map](docs/feature-map.md)

