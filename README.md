# MindPulse 🧠⚡
### AI-Powered Mental Health Monitoring, Distress Prediction & Early Intervention Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-blue)](frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript%20%7C%20MongoDB-green)](backend)
[![ML Service](https://img.shields.io/badge/ML%20Service-FastAPI%20%7C%20Scikit--Learn%20%7C%20XGBoost%20%7C%20SHAP-orange)](ml-service)

> **IMPORTANT DISCLAIMER**: MindPulse is a **non-diagnostic decision-support and early intervention platform**. It does NOT claim to diagnose mental illness or replace qualified clinical professionals. Human-in-the-loop oversight is preserved at every step.

---

## 🌟 Overview & Problem Solved

College students and young adults often experience silent mental health deterioration due to chronic stress, sleep deprivation, and academic pressure before acute crises emerge. Traditional counseling systems are purely reactive — students only reach out when distress is severe.

**MindPulse** bridges this gap by enabling:
1. **Low-friction wellness check-ins & journaling** for individuals.
2. **Privacy-first baseline tracking & early distress signal detection** using explainable ML.
3. **Counselor triage decision-support** with AI-assisted summaries and intervention outcome tracking.
4. **Institutional aggregate analytics & policy simulation** with strict k-anonymity privacy safeguards.

---

## 🏗️ Monorepo Architecture

MindPulse is engineered as a feature-isolated **MERN + Python ML monorepo**:

```text
mindpulse/
├── frontend/             # React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide
├── backend/              # Node.js, Express, TypeScript, Mongoose, JWT, Socket.IO
├── ml-service/           # Python 3, FastAPI, Pandas, NumPy, Scikit-learn, XGBoost, SHAP
├── workers/              # Redis & BullMQ background job processing skeleton
├── scripts/              # Synthetic seed generator & setup utilities
├── docs/                 # Architecture, API specifications, DB schemas, Feature maps
├── AGENT_RULES.md        # Strict rules for multi-agent AI & human developer collaboration
├── TECH_STACK.md         # Detailed tech stack breakdown and rationale
└── docker-compose.yml    # Single-command multi-container environment
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+ or v20+)
- Python (v3.10+)
- Git
- *(Optional)* MongoDB & Redis, or run in lightweight standalone mode!

### 1. Clone & Install
```bash
# Clone the repository
git clone <repository-url>
cd MindPulse

# Install root & workspace dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../ml-service && pip install -r requirements.txt
```

### 2. Environment Setup
```bash
# Copy template environment variables
cp .env.example .env
cp .env.example backend/.env
```

### 3. Seed Demo Data
```bash
npm run seed
```

### 4. Launch Development Servers
You can run all three services concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
- **Backend API**: `cd backend && npm run dev` (starts on `http://localhost:5000`)
- **Frontend Dashboard**: `cd frontend && npm run dev` (starts on `http://localhost:5173`)
- **Python ML Service**: `cd ml-service && uvicorn app.main:app --reload --port 8000` (starts on `http://localhost:8000`)

---

## 🔑 Demo Accounts

The seed script automatically prepares preconfigured synthetic demo accounts:

| Role | Email | Password | Access / Portal |
| :--- | :--- | :--- | :--- |
| **Student / User** | `demo.user@mindpulse.local` | `MindPulseDemo2026!` | User Dashboard, Check-ins, Journal, Baseline, Recommendations, Support Assistant |
| **Counselor** | `demo.counselor@mindpulse.local` | `MindPulseDemo2026!` | Counselor Triage Queue, AI Summaries, Interventions, Outcome Tracking |
| **Institutional Admin** | `demo.admin@mindpulse.local` | `MindPulseDemo2026!` | Aggregate Analytics (k-anonymity), Campus Heatmap, What-If Policy Simulator |

*(A convenient Quick Role Switcher is also built into the authentication header during prototype mode!)*

---

## 📦 Features Breakdown & Ownership

Every feature is isolated under `frontend/src/features/<feature>/` and `backend/src/features/<feature>/`:

1. **Authentication & RBAC**: JWT stateless auth with role-based routing (`USER`, `COUNSELOR`, `ADMIN`).
2. **Wellness Check-ins**: 10-point slider check-ins (Mood, Stress, Energy, Sleep) with longitudinal history.
3. **Journal & NLP Signals**: Rich journal reflection with prototype sentiment, stress signal, and emotion tagging.
4. **Personal Baseline**: Rolling 14-day statistical averages and standard deviation offsets.
5. **Distress Risk Prediction**: 4-tier risk classification (`STABLE`, `WATCH`, `ELEVATED`, `REQUIRES_REVIEW`).
6. **Explainable AI (XAI)**: SHAP-inspired feature attribution showing top contributing signals (e.g. sleep reduction +21%).
7. **Anomaly Detection**: Statistical & Isolation Forest deviation detection from personal historical normal.
8. **Early Distress Forecasting**: 7-day trajectory projection based on rolling telemetry.
9. **Smart Alerts**: Counselor escalation engine evaluating persistent risk and safety thresholds.
10. **Counselor Dashboard**: Prioritized case queue with triage tags and risk factor breakdowns.
11. **AI Counselor Summary**: Automated bulleted synthesis of recent telemetry with human-in-the-loop review labels.
12. **Intervention Management**: Structured intervention planning, notes, and status management.
13. **Intervention Outcome Tracking**: Observed trend comparisons before vs. after intervention.
14. **Personalized Recommendations**: Non-clinical support cards (breathing, grounding, sleep hygiene, campus resources).
15. **MindPulse Support Assistant**: Non-clinical chat assistant for grounding exercises and resource navigation.
16. **Institutional Analytics**: Privacy-preserving aggregate trends with minimum group size ($k \ge 5$) filtering.
17. **Wellness Heatmap**: Aggregate campus zone visualization with zero individual exposure.
18. **What-If Intervention Simulator**: Policy impact projection for mental wellness initiatives.
19. **Privacy & Audit Logging**: Cryptographic consent records and immutable audit logs.

---

## 🤖 Multi-Agent Collaboration

If you or your AI coding agent are extending MindPulse, please read [AGENT_RULES.md](AGENT_RULES.md) before writing code.

---

## 📚 Documentation Links
- [System Architecture](docs/architecture.md)
- [API Overview](docs/api-overview.md)
- [Database Schema](docs/database-schema.md)
- [Feature Map](docs/feature-map.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Technology Stack](TECH_STACK.md)
