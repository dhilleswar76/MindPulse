# Implementation Plan — MindPulse Monorepo Setup

MindPulse is an AI-powered mental health monitoring, distress prediction, and early intervention decision-support platform designed for privacy, modularity, and multi-agent developer workflows. This plan outlines the scaffolding and complete initial implementation of the MERN + Python ML monorepo.

## User Review Required

> [!IMPORTANT]
> **Non-Diagnostic Policy**: MindPulse strictly adheres to decision-support and early intervention guidelines. All outputs are labeled as "risk signals", "possible contributing factors", and "decision-support estimates".
> **Multi-Agent Architecture**: The codebase strictly isolates feature ownership under `frontend/src/features/<feature>/` and `backend/src/features/<feature>/` with documented rules in `AGENT_RULES.md` so multiple developers and AI agents can build in parallel without conflict.

## Proposed System Architecture & Directory Structure

```text
mindpulse/
├── README.md                          # Main project documentation & quickstart
├── AGENT_RULES.md                     # Strict multi-agent & developer collaboration rules
├── TECH_STACK.md                      # Detailed technology stack and rationale
├── CONTRIBUTING.md                    # Contribution & feature branch guidelines
├── .gitignore                         # Comprehensive monorepo gitignore
├── .env.example                       # Root environment variables template
├── docker-compose.yml                 # Multi-container orchestration (Frontend, Backend, ML, Mongo, Redis)
├── package.json                       # Monorepo root scripts & workspaces
├── tsconfig.base.json                 # Shared TypeScript base configuration
│
├── docs/
│   ├── architecture.md                # System design & data flow diagrams
│   ├── api-overview.md                # API endpoints, request/response specifications
│   ├── database-schema.md             # Mongoose schemas, relationships & indices
│   └── feature-map.md                 # Mapping features to frontend, backend, ML & models
│
├── frontend/                          # React + TypeScript + Vite + Tailwind + Lucide + Recharts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── src/
│   │   ├── app/                       # App root, Router provider, Query/Auth providers
│   │   ├── components/                # Shared UI primitives (Buttons, Cards, Modals, Navbar, Sidebar)
│   │   ├── layouts/                   # DashboardLayout, AuthLayout, CounselorLayout, AdminLayout
│   │   ├── routes/                    # Route definitions & Role-based protected guards
│   │   ├── services/                  # Shared Axios API client, token helpers, socket service
│   │   ├── hooks/                     # Shared hooks (useAuth, useToast, useDebounce)
│   │   ├── utils/                     # Formatters, date helpers, cn class utility
│   │   ├── types/                     # Shared TypeScript interfaces
│   │   └── features/                  # Isolated feature modules
│   │       ├── auth/                  # Login, Register, Profile, Role Switcher
│   │       ├── checkins/              # Checkin Slider Form, History List, Wellness Trend Chart
│   │       ├── journal/               # Journal Entry CRUD, Prototype NLP Emotion/Sentiment tags
│   │       ├── wellness-baseline/     # Statistical Baseline calculator & deviation view
│   │       ├── risk/                  # Risk Gauge, Level Badge, Risk factor list
│   │       ├── forecasting/           # 7-day Trend & Forecast trajectory chart
│   │       ├── recommendations/       # Non-clinical personalized support resource cards
│   │       ├── support/               # MindPulse Support Assistant Chat UI (Grounding/Prompts)
│   │       ├── alerts/                # Smart Alert engine view & triage indicators
│   │       ├── counselor/             # Triage Case Queue, AI Summary view, Case details
│   │       ├── interventions/         # Intervention Management, Notes, Before/After Outcome Tracker
│   │       ├── analytics/             # Institutional Aggregate Analytics (k-anonymity, risk distribution)
│   │       ├── heatmap/               # Aggregate Wellness Heatmap
│   │       └── simulator/             # What-If Intervention Policy Simulator
│   └── public/
│
├── backend/                           # Node.js + Express + TypeScript + Mongoose + JWT + Socket.IO
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── config/                    # Environment, Database, Redis, ML service config
│       ├── middleware/                # Auth verification, Role guard, Error handler, Rate limiter
│       ├── utils/                     # Logger, API response helper, Validation wrapper
│       ├── types/                     # Core backend types & express augmentation
│       ├── models/                    # 11 Mongoose Schemas (User, CheckIn, JournalEntry, RiskScore, etc.)
│       ├── services/                  # Shared ML client, email placeholder, socket manager
│       ├── routes/                    # Top-level API router mounting feature routes
│       └── features/                  # Feature controllers, services, routes, validations
│           ├── auth/
│           ├── users/
│           ├── checkins/
│           ├── journal/
│           ├── risk/
│           ├── forecasting/
│           ├── recommendations/
│           ├── alerts/
│           ├── counselor/
│           ├── interventions/
│           ├── analytics/
│           └── admin/
│
├── ml-service/                        # Python FastAPI ML Microservice
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── main.py                    # FastAPI application root & CORS
│       ├── config.py                  # Service configuration
│       ├── api/                       # API endpoints (/predict-risk, /detect-anomaly, etc.)
│       ├── schemas/                   # Pydantic schemas for inputs & outputs
│       ├── services/                  # Risk scorer, anomaly detector, forecaster, NLP analyzer
│       ├── feature_engineering/       # Feature extraction logic from longitudinal checkins
│       ├── explainability/            # Feature contribution & SHAP prototype
│       └── utils/
│
├── workers/                           # Background BullMQ processing skeleton
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── queues/                    # Queue definitions (risk-computation, digest)
│       ├── jobs/                      # Job processors
│       └── workers/                   # BullMQ worker instances
│
└── scripts/
    ├── seed.ts                        # Realistic synthetic seed data generator
    └── setup.ts                       # Environment verification and automated bootstrap
```

---

## Proposed Changes by Component

### Component 1: Documentation & Governance Rules
- [NEW] `README.md`: Comprehensive overview, quickstart, demo accounts, feature breakdown, setup steps.
- [NEW] `AGENT_RULES.md`: 14 mandatory agent rules ensuring strict feature boundaries, no accidental refactors, safety standards.
- [NEW] `TECH_STACK.md`: In-depth breakdown of chosen technologies and architectural justifications.
- [NEW] `CONTRIBUTING.md`: Contribution guide, PR workflow, feature branch conventions.
- [NEW] `docs/architecture.md`: Visual architecture and sequence flows.
- [NEW] `docs/api-overview.md`: REST API specifications with endpoints, methods, and payloads.
- [NEW] `docs/database-schema.md`: Complete database models documentation.
- [NEW] `docs/feature-map.md`: Feature ownership mapping table.

### Component 2: Python ML Microservice (`ml-service`)
- [NEW] `ml-service/requirements.txt`: FastAPI, Uvicorn, Pydantic, Scikit-learn, XGBoost, SHAP, Pandas, NumPy.
- [NEW] `ml-service/Dockerfile`: Containerization for Python service.
- [NEW] `ml-service/app/main.py`: FastAPI server exposing `/health`, `/predict-risk`, `/detect-anomaly`, `/forecast-risk`, `/analyze-journal`, `/explain-risk`.
- [NEW] `ml-service/app/schemas/`: Pydantic models for all ML inputs/outputs with validation.
- [NEW] `ml-service/app/services/`: Modular engines for baseline, statistical risk scoring, anomaly detection, NLP keyword sentiment, and forecasting.

### Component 3: Node.js / Express Backend (`backend`)
- [NEW] `backend/package.json` & `tsconfig.json`: TypeScript backend with express, mongoose, bcryptjs, jsonwebtoken, zod, cors, dotenv, socket.io, axios.
- [NEW] `backend/src/models/`: All 11 Mongoose models (`User`, `Consent`, `CheckIn`, `JournalEntry`, `RiskScore`, `RiskFactor`, `Alert`, `Intervention`, `FollowUp`, `Recommendation`, `AuditLog`).
- [NEW] `backend/src/config/`: Environment config, database connection with graceful fallback / in-memory compatibility for instant demo run.
- [NEW] `backend/src/middleware/`: JWT authentication, role authorization (`USER`, `COUNSELOR`, `ADMIN`), rate limiting, centralized error handling.
- [NEW] `backend/src/features/`: 12 isolated feature directories each with `routes.ts`, `controller.ts`, `service.ts`, `validation.ts`.

### Component 4: Background Workers (`workers`)
- [NEW] `workers/package.json` & `src/`: BullMQ and Redis connection skeleton for async risk calculations and scheduled digests.

### Component 5: React + Vite + Tailwind Frontend (`frontend`)
- [NEW] `frontend/package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`.
- [NEW] `frontend/src/components/`: Modern, calm health-tech UI design system (Cards, Buttons, Badges, Modals, Navbar, Sidebar, Alert banners, Tooltips).
- [NEW] `frontend/src/layouts/`: DashboardLayout (User), CounselorLayout, AdminLayout, AuthLayout.
- [NEW] `frontend/src/routes/`: Router with ProtectedRoute, RoleGuard, and comprehensive page views.
- [NEW] `frontend/src/features/`:
  - `auth`: Login, Register, Profile, Role Switcher for instant testing.
  - `checkins`: Interactive check-in slider form (Mood, Stress, Energy, Sleep), Check-in History, Trend Chart.
  - `journal`: Rich text entry, emotion & stress signal analysis display.
  - `wellness-baseline`: Rolling averages vs current status.
  - `risk`: Distress score breakdown, risk level pill (`STABLE`, `WATCH`, `ELEVATED`, `REQUIRES_REVIEW`), SHAP signal contribution factors.
  - `forecasting`: 7-day trajectory projection.
  - `recommendations`: Actionable non-clinical support resource cards.
  - `support`: MindPulse Support Assistant Chatbot interface (grounding prompts, campus resources).
  - `counselor`: Triage queue, case summary, clinical notes, intervention builder.
  - `interventions`: Intervention lifecycle, follow-up scheduler, outcome before/after trend.
  - `analytics`: Institutional aggregate analytics dashboard with k-anonymity compliance.
  - `heatmap`: Campus / Institutional aggregate wellness heatmap.
  - `simulator`: What-If Intervention Policy Simulator.

### Component 6: Monorepo Infrastructure & Seed Scripts
- [NEW] `docker-compose.yml`: Compose file for running all services with one command.
- [NEW] `.env.example`: Master environment variable definitions.
- [NEW] `scripts/seed.ts`: Realistic synthetic database seed script with demo users:
  - `demo.user@mindpulse.local`
  - `demo.counselor@mindpulse.local`
  - `demo.admin@mindpulse.local`
- [NEW] Root `package.json` with unified workspace scripts (`npm run dev`, `npm run build`, `npm run seed`).

---

## Verification Plan

### Automated Verification
1. **TypeScript Typecheck**:
   - Run `tsc --noEmit` in `backend` and `frontend`.
2. **Frontend Build**:
   - Run `npm run build` in `frontend` to verify bundling and asset integrity.
3. **Backend Compilation & Test**:
   - Run build/start test for backend.
4. **Python ML Service Syntax & Import Test**:
   - Run `python -m py_compile` across all Python files in `ml-service/app/`.

### Manual & Interactive Verification
1. **API Health & Endpoints**:
   - Verify `GET /api/health` returns status OK.
2. **Demo User Flow**:
   - Test login with `demo.user@mindpulse.local`.
   - Submit a wellness check-in, verify persistence and risk scoring calculation.
   - Verify journal submission and NLP tag extraction.
3. **Counselor Flow**:
   - Switch to `demo.counselor@mindpulse.local`.
   - Inspect prioritized case list, review AI-assisted summary, create an intervention, and verify follow-up record.
4. **Admin Flow**:
   - Switch to `demo.admin@mindpulse.local`.
   - Inspect aggregate institutional analytics, k-anonymity safeguards, heatmap, and simulator.
