# TECH_STACK.md — MindPulse Technology Stack & Architecture Rationale

This document details the technologies chosen for MindPulse, where they are utilized in the monorepo, and the engineering rationale behind each decision.

---

## 1. Frontend Technologies

### React (v18+)
- **Purpose**: Declarative UI component tree and state-driven rendering.
- **Location**: `frontend/src/`
- **Rationale**: Industry standard for building responsive web dashboards with a rich ecosystem of accessible UI and chart libraries.

### TypeScript (v5+)
- **Purpose**: Static type safety across component props, API payloads, and state models.
- **Location**: `frontend/`, `backend/`, `workers/`
- **Rationale**: Eliminates runtime type errors, improves developer experience across multi-agent workflows, and provides self-documenting code contracts.

### Vite
- **Purpose**: Next-generation frontend build tooling and lightning-fast HMR (Hot Module Replacement).
- **Location**: `frontend/vite.config.ts`
- **Rationale**: Sub-second dev server start times and optimized production bundling compared to legacy bundlers.

### Tailwind CSS
- **Purpose**: Utility-first CSS framework with tailored health-tech design tokens.
- **Location**: `frontend/tailwind.config.js`, `frontend/src/index.css`
- **Rationale**: Enables a consistent, modern, calming UI design system with zero CSS bloat and dark/light support.

### React Router (v6+)
- **Purpose**: Client-side routing, nested layouts, and role-based route guards.
- **Location**: `frontend/src/routes/`
- **Rationale**: Supports seamless navigation between User, Counselor, and Admin portals with RBAC (Role-Based Access Control).

### Recharts
- **Purpose**: Composable SVG-based charting library.
- **Location**: `frontend/src/features/checkins/`, `frontend/src/features/forecasting/`, `frontend/src/features/analytics/`
- **Rationale**: Highly customizable and lightweight visualization for longitudinal wellness trends, 7-day distress forecasts, and aggregate institutional distributions.

### React Hook Form & Zod
- **Purpose**: Performant form handling and schema-first client validation.
- **Location**: `frontend/src/features/auth/`, `frontend/src/features/checkins/`, `frontend/src/features/interventions/`
- **Rationale**: Guarantees typed input validation without excessive re-renders.

### Lucide React
- **Purpose**: Consistent, lightweight SVG iconography.
- **Location**: `frontend/src/components/`, `frontend/src/features/`
- **Rationale**: Clean, modern aesthetic with zero overhead.

---

## 2. Backend Technologies

### Node.js & Express.js
- **Purpose**: High-throughput asynchronous REST API gateway and business logic server.
- **Location**: `backend/src/`
- **Rationale**: Non-blocking event loop, rapid prototyping, rich npm ecosystem, and seamless JSON/REST support.

### MongoDB & Mongoose
- **Purpose**: Document-oriented database for flexible mental wellness logs, nested check-in telemetry, and schema validation.
- **Location**: `backend/src/models/`
- **Rationale**: Flexible data modeling for semi-structured longitudinal check-ins, journal NLP payloads, and audit logs. Includes graceful in-memory handling for instant zero-dependency testing.

### JSON Web Tokens (JWT) & bcryptjs
- **Purpose**: Stateless authentication and secure password hashing.
- **Location**: `backend/src/middleware/auth.middleware.ts`, `backend/src/features/auth/`
- **Rationale**: Secure role claims (`USER`, `COUNSELOR`, `ADMIN`) passed seamlessly between clients and API gateways.

### Socket.IO
- **Purpose**: Real-time bidirectional event streaming for counselor alerts and active interventions.
- **Location**: `backend/src/services/socket.service.ts`
- **Rationale**: Instant notification delivery when user distress triggers a counselor triage review flag.

### Google Gemini API (LLM Integration)
- **Purpose**: Context-aware, generative supportive assistance for victims and protected witnesses (somatic exercises, statutory legal rights, and DLSA compensation navigation).
- **Location**: `backend/src/features/users/geminiChatbot.service.ts`
- **Rationale**: Provides dynamic, compassionate, conversational assistance with multi-turn context tracking and zero hardcoded replies, backed by seamless fallback to the local trauma-informed engine.

---

## 3. Machine Learning & Python Microservice

### Python (3.11+) & FastAPI
- **Purpose**: High-performance asynchronous ML microservice exposing risk, anomaly, and forecasting inference endpoints.
- **Location**: `ml-service/app/`
- **Rationale**: Python is the native ecosystem for data science and ML; FastAPI provides high performance, automatic OpenAPI docs, and strict Pydantic type validation.

### Pandas & NumPy
- **Purpose**: Vectorized data manipulation, baseline rolling calculations, and time-series feature engineering.
- **Location**: `ml-service/app/feature_engineering/`
- **Rationale**: Efficient 7-day delta computation, moving averages, and variance extraction from raw user check-ins.

### Scikit-learn & XGBoost
- **Purpose**: Gradient boosting risk scoring models and Isolation Forest anomaly detection.
- **Location**: `ml-service/app/models/`, `ml-service/app/services/`
- **Rationale**: Lightweight, interpretable tree-based models well-suited for tabular wellness and behavioral metrics.

### SHAP (SHapley Additive exPlanations)
- **Purpose**: Explainable AI (XAI) feature attribution for distress prediction signals.
- **Location**: `ml-service/app/explainability/`
- **Rationale**: Quantifies local feature contributions (e.g. sleep deficit +21%, stress surge +18%) for clear, non-diagnostic counselor insights.

---

## 4. Background Processing & Infrastructure

### Redis & BullMQ
- **Purpose**: In-memory job queue and worker infrastructure for background risk recomputation and aggregate digest jobs.
- **Location**: `workers/src/`
- **Rationale**: Decouples heavy ML and batch processing from user-facing API request lifecycles.

### Docker & Docker Compose
- **Purpose**: Containerized multi-service orchestration (Backend, Frontend, ML, Mongo, Redis).
- **Location**: `docker-compose.yml`, `*/Dockerfile`
- **Rationale**: Single command environment spin-up reproducible on any operating system.
