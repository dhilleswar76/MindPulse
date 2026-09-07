# API Overview — MindPulse REST Specifications (SIH26094)

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Users
- `POST /auth/register` — Register a new victim/witness/counselor/admin.
- `POST /auth/login` — Authenticate and receive a JWT token.
- `GET /auth/me` — Get current authenticated user profile.
- `GET /users` *(ADMIN)* — List users with role and district filter.

## 2. 6-Stage Case Journey Tracking
- `GET /cases` *(COUNSELOR, ADMIN)* — List cases indexed by stage and priority score.
- `GET /cases/:id` — Retrieve case details and journey metadata.
- `PUT /cases/:id/stage` *(COUNSELOR, ADMIN)* — Update case stage (`CASE_REGISTRATION` -> `INVESTIGATION` -> `COURT_TRIAL` -> `COMPENSATION` -> `REHABILITATION` -> `PROTECTION_SUPPORT`).
- `GET /cases/:id/timeline` — Retrieve stage history timeline.

## 3. Trauma-Informed Check-ins & Voice Screening
- `POST /checkins` *(USER)* — Submit wellbeing check-in (Mood, Stress, Sleep, Sense of Safety, Case Tension).
- `GET /checkins` *(USER)* — Get historical check-ins for the authenticated user.
- `GET /checkins/trend` *(USER)* — Get aggregated 14-day mood/stress/safety trends and baseline.
- `POST /ml/analyze-voice` — (Prototype) Voice acoustic feature screening (pitch jitter, shimmer, speech rate).

## 4. Journal & NLP Reflection
- `POST /journal` *(USER)* — Create a new reflection entry with trauma-informed NLP analysis.
- `GET /journal` *(USER)* — Get all journal entries for the current user.
- `GET /journal/:id` *(USER)* — Retrieve single journal entry with emotion tags.
- `DELETE /journal/:id` *(USER)* — Delete personal journal entry.

## 5. Distress Risk & Explainable AI (XAI)
- `GET /risk/current` *(USER)* — Get latest computed distress score, risk level, and SHAP factors.
- `GET /risk/history` *(USER)* — Get longitudinal risk progression.
- `GET /forecast` *(USER)* — Get 7-day early distress trajectory projection.

## 6. Recommendations & Support Companion
- `GET /recommendations` *(USER)* — Get personalized non-clinical recommendations (NALSA Legal Aid, Victim Compensation, Witness Protection).
- `POST /users/support-chat` *(USER)* — Chat with Trauma-Informed Support Companion (grounding, legal stages).

## 7. Counselor Decision Support Portal
- `GET /counselor/cases` *(COUNSELOR, ADMIN)* — Get prioritized triage queue of cases.
- `GET /counselor/cases/:id` *(COUNSELOR, ADMIN)* — Get case details, AI telemetry synthesis, safety metrics.
- `GET /counselor/summary/:userId` *(COUNSELOR)* — Generate on-demand non-diagnostic AI counselor summary.

## 8. Support Pathways & Outcome Tracking
- `POST /interventions` *(COUNSELOR)* — Log support pathway (`LEGAL_AID`, `VICTIM_COMPENSATION`, `WITNESS_PROTECTION`, `COUNSELLING`).
- `GET /interventions` *(COUNSELOR)* — Get list of logged interventions.
- `PUT /interventions/:id` *(COUNSELOR)* — Update intervention status / notes.
- `GET /interventions/outcomes/:userId` *(COUNSELOR)* — Before vs. after distress trajectory delta comparison.

## 9. District / State Analytics & Policy Simulator
- `GET /analytics/overview` *(ADMIN)* — Aggregate metrics with strict k-anonymity guarantee ($k \ge 5$).
- `GET /analytics/heatmap` *(ADMIN)* — Regional jurisdictional distress heatmap.
- `POST /analytics/simulate` *(ADMIN)* — Run what-if policy intervention simulation (legal aid expansion, witness transit).

