# Feature Map — MindPulse Ownership Matrix (SIH26094)

This document maps all features across their respective frontend folders, backend folders, ML endpoints, models, and ownership boundaries.

| Feature Name | Frontend Directory | Backend Directory | ML Microservice Endpoint | Primary Models | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Authentication & RBAC** | `frontend/src/features/auth/` | `backend/src/features/auth/` | N/A | `User`, `Consent` | Auth Team |
| **2. Case Journey Tracking** | `frontend/src/components/CaseJourneyTimeline.tsx` | `backend/src/features/cases/` | `POST /predict-risk` | `Case`, `User` | Legal Workflow Team |
| **3. Trauma-Informed Check-ins** | `frontend/src/features/checkins/` | `backend/src/features/checkins/` | Feature extraction | `CheckIn` | Checkin Team |
| **4. Voice Stress Biomarkers (Proto)**| `frontend/src/features/voice/` | `backend/src/features/cases/` | `POST /analyze-voice` | N/A | ML Audio Team |
| **5. Journal & NLP Signals** | `frontend/src/features/journal/` | `backend/src/features/journal/` | `POST /analyze-journal` | `JournalEntry` | NLP Team |
| **6. Personal Baseline & Anomaly** | `frontend/src/features/wellness-baseline/` | `backend/src/features/checkins/` | `POST /detect-anomaly` | `CheckIn` | ML Team |
| **7. Distress Risk Prediction & XAI**| `frontend/src/features/risk/` | `backend/src/features/risk/` | `POST /predict-risk`, `POST /explain-risk` | `RiskScore`, `RiskFactor` | ML Team |
| **8. Early Distress Forecasting** | `frontend/src/features/forecasting/` | `backend/src/features/forecasting/`| `POST /forecast-risk` | `RiskScore` | ML Team |
| **9. Smart Escalation Alerts** | `frontend/src/features/alerts/` | `backend/src/features/alerts/` | N/A | `Alert` | Backend Team |
| **10. Counselor Decision Support Queue**| `frontend/src/features/counselor/` | `backend/src/features/counselor/` | N/A | `User`, `Case`, `Alert` | Support Team |
| **11. AI Telemetry Summary** | `frontend/src/features/counselor/` | `backend/src/features/counselor/` | Summarization pipeline | `User`, `RiskScore` | AI Team |
| **12. Support Pathway Interventions**| `frontend/src/features/interventions/`| `backend/src/features/interventions/`| N/A | `Intervention`, `Case` | Support Team |
| **13. Intervention Outcome Tracking** | `frontend/src/features/interventions/`| `backend/src/features/interventions/`| N/A | `Intervention`, `CheckIn`| Support Team |
| **14. Recommendations (DLSA/KIRAN)**| `frontend/src/features/recommendations/`| `backend/src/features/recommendations/`| N/A | `Recommendation` | Welfare Team |
| **15. Trauma-Informed Companion** | `frontend/src/features/support/` | `backend/src/features/users/` | Conversational Proxy | `AuditLog` | AI Team |
| **16. District Aggregated Analytics**| `frontend/src/features/analytics/` | `backend/src/features/analytics/` | Aggregate pipelines ($k \ge 5$) | `RiskScore`, `CheckIn` | Admin Team |
| **17. Regional Distress Heatmap** | `frontend/src/features/heatmap/` | `backend/src/features/analytics/` | Jurisdictional Aggregation | `User`, `RiskScore` | Admin Team |
| **18. What-If Policy Simulator** | `frontend/src/features/simulator/` | `backend/src/features/analytics/` | Statistical projection | N/A | ML Team |
| **19. Privacy & Audit Guard** | `frontend/src/features/auth/` | `backend/src/features/admin/` | N/A | `Consent`, `AuditLog` | Security Team |

