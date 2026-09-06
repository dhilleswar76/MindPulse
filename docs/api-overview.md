# API Overview — MindPulse REST Specifications

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Users
- `POST /auth/register` — Register a new student/counselor/admin.
- `POST /auth/login` — Authenticate and receive a JWT token.
- `GET /auth/me` — Get current authenticated user profile.
- `GET /users` *(ADMIN)* — List users with role filter.

## 2. Wellness Check-ins
- `POST /checkins` *(USER)* — Submit a new wellness check-in.
- `GET /checkins` *(USER)* — Get historical check-ins for the authenticated user.
- `GET /checkins/trend` *(USER)* — Get aggregated 14-day mood/stress/energy trends.

## 3. Journal & NLP Reflection
- `POST /journal` *(USER)* — Create a new journal entry with NLP analysis.
- `GET /journal` *(USER)* — Get all journal entries for the current user.
- `GET /journal/:id` *(USER)* — Retrieve single journal entry with emotion tags.
- `DELETE /journal/:id` *(USER)* — Delete personal journal entry.

## 4. Personal Baseline & Anomaly
- `GET /wellness/baseline` *(USER)* — Get user's calculated statistical baseline.
- `GET /wellness/anomalies` *(USER)* — Get recent deviation anomalies from personal normal.

## 5. Distress Risk & Explainable AI
- `GET /risk/current` *(USER)* — Get latest computed risk score, level, and factors.
- `GET /risk/history` *(USER)* — Get historical risk progression.
- `GET /forecast` *(USER)* — Get 7-day distress trajectory forecast.

## 6. Recommendations & Support Assistant
- `GET /recommendations` *(USER)* — Get personalized non-clinical recommendations.
- `POST /support/chat` *(USER)* — Chat with MindPulse Support Assistant (grounding & resources).

## 7. Counselor Portal
- `GET /counselor/cases` *(COUNSELOR, ADMIN)* — Get list of students flagged for review.
- `GET /counselor/cases/:id` *(COUNSELOR, ADMIN)* — Get case details, AI summary, telemetry.
- `GET /counselor/summary/:userId` *(COUNSELOR)* — Generate on-demand AI counselor summary.

## 8. Interventions & Outcomes
- `POST /interventions` *(COUNSELOR)* — Create an intervention record.
- `GET /interventions` *(COUNSELOR)* — Get interventions list.
- `PUT /interventions/:id` *(COUNSELOR)* — Update intervention status / notes.
- `GET /interventions/outcomes/:userId` *(COUNSELOR)* — Before vs after risk comparison.

## 9. Institutional Analytics & Simulator
- `GET /analytics/overview` *(ADMIN)* — Aggregate metrics with k-anonymity guarantee.
- `GET /analytics/heatmap` *(ADMIN)* — Campus zone aggregate stress heatmap.
- `POST /analytics/simulate` *(ADMIN)* — Run what-if policy intervention simulation.
