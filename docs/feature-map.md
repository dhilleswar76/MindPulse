# Feature Map — MindPulse Ownership Matrix

This document maps all features across their respective frontend folders, backend folders, ML endpoints, models, and ownership boundaries.

| Feature Name | Frontend Directory | Backend Directory | ML Microservice Endpoint | Primary Models | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Authentication & RBAC** | `frontend/src/features/auth/` | `backend/src/features/auth/` | N/A | `User`, `Consent` | Auth Team |
| **2. Wellness Check-ins** | `frontend/src/features/checkins/` | `backend/src/features/checkins/` | Feature extraction | `CheckIn` | Checkin Team |
| **3. Journal & NLP** | `frontend/src/features/journal/` | `backend/src/features/journal/` | `POST /analyze-journal` | `JournalEntry` | Journal Team |
| **4. Personal Baseline** | `frontend/src/features/wellness-baseline/` | `backend/src/features/checkins/` | `POST /detect-anomaly` | `CheckIn` | ML Team |
| **5. Distress Risk Prediction** | `frontend/src/features/risk/` | `backend/src/features/risk/` | `POST /predict-risk` | `RiskScore` | ML Team |
| **6. Explainable AI (XAI)** | `frontend/src/features/risk/` | `backend/src/features/risk/` | `POST /explain-risk` | `RiskScore`, `RiskFactor` | ML Team |
| **7. Anomaly Detection** | `frontend/src/features/wellness-baseline/` | `backend/src/features/checkins/` | `POST /detect-anomaly` | `RiskScore` | ML Team |
| **8. Early Distress Forecasting** | `frontend/src/features/forecasting/` | `backend/src/features/forecasting/`| `POST /forecast-risk` | `RiskScore` | ML Team |
| **9. Smart Alerts Engine** | `frontend/src/features/alerts/` | `backend/src/features/alerts/` | N/A | `Alert` | Backend Team |
| **10. Counselor Dashboard** | `frontend/src/features/counselor/` | `backend/src/features/counselor/` | N/A | `User`, `Alert`, `RiskScore` | Clinical UX Team |
| **11. AI Counselor Summary** | `frontend/src/features/counselor/` | `backend/src/features/counselor/` | Summarization prompt | `User`, `RiskScore` | AI Team |
| **12. Intervention Management**| `frontend/src/features/interventions/`| `backend/src/features/interventions/`| N/A | `Intervention`, `FollowUp` | Clinical UX Team |
| **13. Outcome Tracking** | `frontend/src/features/interventions/`| `backend/src/features/interventions/`| N/A | `Intervention`, `CheckIn` | Clinical UX Team |
| **14. Recommendations** | `frontend/src/features/recommendations/`| `backend/src/features/recommendations/`| N/A | `Recommendation` | UX Team |
| **15. Support Assistant** | `frontend/src/features/support/` | `backend/src/features/users/` | LLM Proxy | `AuditLog` | AI Team |
| **16. Institutional Analytics** | `frontend/src/features/analytics/` | `backend/src/features/analytics/` | Aggregate pipelines | `RiskScore`, `CheckIn` | Admin Team |
| **17. Wellness Heatmap** | `frontend/src/features/heatmap/` | `backend/src/features/analytics/` | Aggregation | `User`, `RiskScore` | Admin Team |
| **18. What-If Simulator** | `frontend/src/features/simulator/` | `backend/src/features/analytics/` | Statistical projection | N/A | ML Team |
| **19. Privacy & Audit** | `frontend/src/features/auth/` | `backend/src/features/admin/` | N/A | `Consent`, `AuditLog` | Security Team |
