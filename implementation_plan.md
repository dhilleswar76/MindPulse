# MindPulse — SIH26094 Alignment & Feature Modification Implementation Plan

**Problem Statement ID:** SIH26094 / 26094  
**Title:** AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System for Victims of Atrocities  
**Organization:** Ministry of Social Justice and Empowerment / Department of Social Justice and Empowerment  
**Theme:** MedTech / BioTech / HealthTech  

---

## 1. Internal Assessment of Existing Repository

```text
Existing Architecture:
  - Frontend: React 18, TypeScript, Tailwind CSS, Lucide icons, Vite, React Router v6
  - Backend: Node.js, Express, TypeScript, Mongoose (MongoDB) with built-in in-memory fallback
  - ML Microservice: FastAPI, Python 3, Pydantic, Scikit-learn / rule-based anomaly & longitudinal feature extraction
  - Workers / Background: BullMQ / synthetic queue structure

Existing Features:
  - Auth with JWT & roles (USER, COUNSELOR, ADMIN)
  - Daily Check-in & baseline tracking
  - Journal with NLP sentiment/emotion extraction
  - Risk scoring with feature attribution (XAI)
  - 7-Day forecasting time series
  - Counselor triage & interventions
  - Recommendations & Support Assistant
  - Analytics & Heatmap

Existing Database Models:
  - User, Consent, CheckIn, JournalEntry, RiskScore, RiskFactor, Alert, Intervention, FollowUp, Recommendation, AuditLog

Existing ML Functionality:
  - `/predict-risk`, `/explain-risk`, `/detect-anomaly`, `/forecast-risk`, `/analyze-journal`

Features Requiring Modification & Repositioning:
  - Reposition from student/campus wellness to longitudinal wellbeing monitoring for victims, complainants, and witnesses affected by atrocities across legal/rehabilitation journeys.
  - Introduce explicit Victim Case Journey (`Case Registration` -> `Investigation` -> `Court/Trial` -> `Compensation` -> `Rehabilitation` -> `Protection/Support`).
  - Add `Case` model & `/api/cases` management.
  - Expand `User` model with victim/witness metadata (`victimType`, `caseId`, `caseStage`, `district`, `state`, `assignedCounselor`).
  - Upgrade `CheckIn` model & UI with trauma-informed signals (`senseOfSafety`, `supportAvailability`, `caseRelatedStress`).
  - Upgrade `Intervention` with SIH-aligned support pathways (`COUNSELLING`, `LEGAL_AID`, `PROTECTION_SUPPORT`, `RELOCATION_SUPPORT`, `FINANCIAL_ASSISTANCE`, `REHABILITATION_SUPPORT`).
  - Upgrade ML service with case-stage context weighting and a modular voice analysis interface prototype (`/analyze-voice`).
  - Rebrand frontend with trauma-informed UX, Case Journey timeline, Counselor Prioritized Case Queue (MP-1042 demo story), and District/State/National privacy-preserving analytics.

Features That Can Be Preserved:
  - All core auth/JWT flows, Mongoose connections and fallbacks, Vite build configs, chart/component libraries, base routing structure, FastAPI router architecture.
```

---

## 2. Safety & Non-Diagnostic Positioning

MindPulse operates strictly as an **AI-assisted decision support and early-intervention system**. It is **NOT** a clinical diagnosis platform, psychiatric diagnostic tool, or autonomous legal/medical decision maker.
All risk signals and AI-assisted summaries are framed with transparent uncertainty and require **human review** by designated counselors or authorized welfare officials.

---

## 3. Proposed Changes

### Component 1: Database Models & Types (`backend/src/models/` & `backend/src/types/`)

- [MODIFY] [backend/src/types/index.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/types/index.ts)
  - Add `VictimType`: `'VICTIM' | 'WITNESS' | 'FAMILY_MEMBER' | 'COMPLAINANT' | 'OTHER_AFFECTED_PERSON'`
  - Add `CaseStage`: `'CASE_REGISTRATION' | 'INVESTIGATION' | 'COURT_TRIAL' | 'COMPENSATION' | 'REHABILITATION' | 'PROTECTION_SUPPORT' | 'CLOSED'`
  - Add `CaseStatus`: `'ACTIVE' | 'UNDER_REVIEW' | 'SUPPORT_IN_PROGRESS' | 'CLOSED'`
  - Add `SupportType`: `'COUNSELLING' | 'PROFESSIONAL_REFERRAL' | 'LEGAL_AID' | 'PROTECTION_SUPPORT' | 'RELOCATION_SUPPORT' | 'FINANCIAL_ASSISTANCE' | 'REHABILITATION_SUPPORT' | 'OTHER'`
  - Add `ICase` interface.
- [MODIFY] [backend/src/models/User.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/models/User.ts)
  - Add `victimType`, `caseId`, `caseStage`, `district`, `state`, `supportStatus`, `consentStatus`, `assignedCounselor`.
- [NEW] [backend/src/models/Case.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/models/Case.ts)
  - Define `Case` schema for victim case journey tracking, district/state alignment, priority score, and assigned counselor.
- [MODIFY] [backend/src/models/CheckIn.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/models/CheckIn.ts)
  - Add `senseOfSafety` (1-10), `supportAvailability` (1-10), `caseRelatedStress` (1-10), `caseStage`.
- [MODIFY] [backend/src/models/Intervention.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/models/Intervention.ts)
  - Update `InterventionType` enum to SIH support pathways (`COUNSELLING`, `LEGAL_AID`, `PROTECTION_SUPPORT`, `RELOCATION_SUPPORT`, `FINANCIAL_ASSISTANCE`, `REHABILITATION_SUPPORT`, `PROFESSIONAL_REFERRAL`, `OTHER`).
- [MODIFY] [backend/src/models/Recommendation.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/models/Recommendation.ts)
  - Update categories for legal aid, victim compensation scheme, witness protection, counseling, trauma grounding.
- [MODIFY] [backend/src/models/index.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/models/index.ts)
  - Export `Case` and new models.

---

### Component 2: Backend Features, Services & Seed (`backend/src/features/` & `backend/src/`)

- [NEW] [backend/src/features/cases/](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/features/cases/)
  - `cases.routes.ts`, `cases.controller.ts`, `cases.service.ts` for managing victim case journey, stages, and counselor assignment.
- [MODIFY] [backend/src/features/counselor/counselor.service.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/features/counselor/counselor.service.ts)
  - Update mock & persistent case data to reflect realistic synthetic cases (e.g., MP-1042 Witness in Court/Trial, MP-1001 Victim in Investigation, MP-1003 Family Member in Rehabilitation).
  - Update AI-assisted case summary generation with case-stage context and non-diagnostic wording.
- [MODIFY] [backend/src/features/interventions/interventions.service.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/features/interventions/interventions.service.ts)
  - Support SIH support pathways and before/after outcome tracking.
- [MODIFY] [backend/src/features/analytics/analytics.service.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/features/analytics/analytics.service.ts)
  - Privacy-preserving aggregation across District -> State -> National levels.
- [MODIFY] [backend/src/features/recommendations/recommendations.service.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/features/recommendations/recommendations.service.ts)
  - Seed SIH atrocity victim support resources (e.g., NALSA Legal Aid, Victim Compensation Scheme, Witness Protection Protocol, Trauma Grounding).
- [MODIFY] [backend/src/routes/index.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/routes/index.ts)
  - Mount `/api/cases`.
- [MODIFY] [backend/src/seed.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/backend/src/seed.ts)
  - Update seed data with realistic synthetic victim/witness/counselor profiles and demo credentials.

---

### Component 3: ML Microservice (`ml-service/app/`)

- [MODIFY] [ml-service/app/schemas/risk.py](file:///c:/Users/dille/Desktop/web-projects/MindPulse/ml-service/app/schemas/risk.py)
  - Extend check-in schemas with `senseOfSafety`, `caseRelatedStress`, `caseStage`.
  - Add voice signal input schemas.
- [MODIFY] [ml-service/app/feature_engineering/extractors.py](file:///c:/Users/dille/Desktop/web-projects/MindPulse/ml-service/app/feature_engineering/extractors.py)
  - Extract longitudinal features including safety-delta, case-stage sensitivity, sleep disruption, and stress elevation.
- [MODIFY] [ml-service/app/services/risk_service.py](file:///c:/Users/dille/Desktop/web-projects/MindPulse/ml-service/app/services/risk_service.py)
  - Incorporate multimodal signals (check-in deltas, journal NLP, safety indicators, case-stage context).
- [NEW] [ml-service/app/services/voice_service.py](file:///c:/Users/dille/Desktop/web-projects/MindPulse/ml-service/app/services/voice_service.py)
  - Prototype voice stress analysis pipeline architecture (clearly labeled as non-diagnostic prototype interface).
- [MODIFY] [ml-service/app/api/endpoints.py](file:///c:/Users/dille/Desktop/web-projects/MindPulse/ml-service/app/api/endpoints.py)
  - Add `POST /analyze-voice` endpoint.

---

### Component 4: Frontend UI & Trauma-Informed Experience (`frontend/src/`)

- [MODIFY] [frontend/src/types/index.ts](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/types/index.ts)
  - Update types to include `VictimType`, `CaseStage`, `CaseStatus`, `CaseItem`, `VictimCaseJourney`.
- [MODIFY] [frontend/src/components/Sidebar.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/components/Sidebar.tsx) & [frontend/src/components/Navbar.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/components/Navbar.tsx)
  - Rebrand navigation from student portal to **Victim Wellbeing Monitoring**, **Counselor Decision Support**, and **District / State Analytics**.
- [NEW] [frontend/src/components/CaseJourneyTimeline.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/components/CaseJourneyTimeline.tsx)
  - Interactive, visual case journey tracker showcasing stage progression (`Registration` -> `Investigation` -> `Trial` -> `Compensation` -> `Rehabilitation` -> `Support`).
- [MODIFY] [frontend/src/features/dashboard/UserDashboardPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/dashboard/UserDashboardPage.tsx)
  - Display Victim Case Journey status, baseline comparison, quick check-in, and grounding pathways.
- [MODIFY] [frontend/src/features/checkins/CheckinPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/checkins/CheckinPage.tsx)
  - MindPulse Wellbeing Check-in including sense of safety, support availability, and case-related stress.
- [MODIFY] [frontend/src/features/journal/JournalPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/journal/JournalPage.tsx)
  - Journal intelligence with linguistic distress and safety indicators.
- [MODIFY] [frontend/src/features/risk/RiskAssessmentPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/risk/RiskAssessmentPage.tsx)
  - Explainable AI with SHAP-style contributing factors (sleep deficit, case-related stress, baseline deviation).
- [MODIFY] [frontend/src/features/forecasting/ForecastingPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/forecasting/ForecastingPage.tsx)
  - Early distress escalation trajectory with 7-day projection.
- [MODIFY] [frontend/src/features/counselor/CounselorDashboardPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/counselor/CounselorDashboardPage.tsx) & [CaseDetailsPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/counselor/CaseDetailsPage.tsx)
  - Prioritized case queue (MP-1042, MP-1001, MP-1003), case stage badges, AI-assisted case summary, intervention recording, follow-up outcome tracking.
- [MODIFY] [frontend/src/features/interventions/InterventionsPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/interventions/InterventionsPage.tsx)
  - Multi-pathway support coordination and before/after outcome tracking.
- [MODIFY] [frontend/src/features/analytics/InstitutionalAnalyticsPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/analytics/InstitutionalAnalyticsPage.tsx) & [CampusHeatmapPage.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/heatmap/CampusHeatmapPage.tsx)
  - Privacy-preserving District / State / National analytics and district monitoring map.
- [NEW] [frontend/src/features/voice/VoiceAnalysisModal.tsx](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/voice/VoiceAnalysisModal.tsx)
  - Prototype voice stress analysis demonstration module.

---

### Component 5: Documentation Updates (`README.md`, `docs/`)

- [MODIFY] [README.md](file:///c:/Users/dille/Desktop/web-projects/MindPulse/README.md)
  - Comprehensive positioning for SIH26094, victim case journey, architecture, ML pipeline, privacy safeguards, and end-to-end demo flow.
- [MODIFY] [docs/architecture.md](file:///c:/Users/dille/Desktop/web-projects/MindPulse/docs/architecture.md)
  - End-to-end data flow from victim check-in to ML feature pipeline, counselor review, and intervention follow-up.
- [MODIFY] [docs/database-schema.md](file:///c:/Users/dille/Desktop/web-projects/MindPulse/docs/database-schema.md)
  - Updated schema definitions including `Case`, `User`, `CheckIn`, `Intervention`.
- [MODIFY] [docs/feature-map.md](file:///c:/Users/dille/Desktop/web-projects/MindPulse/docs/feature-map.md)
  - Feature ownership map and SIH26094 requirement matrix (Implemented, Prototype, Planned).
- [MODIFY] [docs/api-overview.md](file:///c:/Users/dille/Desktop/web-projects/MindPulse/docs/api-overview.md)
  - Updated REST API contracts.

---

## 4. Verification Plan

### Automated Typecheck & Compilation
- Frontend & Backend: `npm run typecheck`
- Frontend Build: `npm --prefix frontend run build`
- Python ML microservice: `python -m compileall ml-service`

### Manual End-to-End Demo Validation
1. **Victim Experience**:
   - Log in as synthetic victim/witness (`demo.user@mindpulse.local`).
   - Observe **Victim Support Journey** timeline (Investigation/Court stage).
   - Complete a MindPulse Wellbeing Check-in with mood, stress, sleep, safety, and case-related stress.
   - View Personal Wellbeing Baseline, Explainable AI distress signals, and 7-day early forecast.
2. **Counselor Decision Support**:
   - Log in as counselor (`demo.counselor@mindpulse.local`).
   - View prioritized case queue with Case IDs (MP-1042, etc.), stage, and trend.
   - Inspect Case Details with AI-assisted non-diagnostic summary.
   - Record an intervention (e.g. Legal Aid Referral, Witness Protection support, Counseling) and verify follow-up outcome tracking.
3. **Institutional Analytics**:
   - Log in as admin (`demo.admin@mindpulse.local`).
   - View privacy-preserving District / State / National aggregate analytics and district monitoring map.
