# MindPulse — Demo Credentials & Role Access Guide 🔑

MindPulse provides three pre-configured demo personas to evaluate the complete end-to-end workflow: **Victim / Protected Witness**, **Designated Counselor**, and **District Welfare Admin**.

---

## 📋 Quick Credentials Summary

> **Default Password for All Demo Accounts**: `MindPulseDemo2026!`

| Role / Persona | Email Address | Password | Landing Route | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Victim / Protected Witness** | `demo.user@mindpulse.local` | `MindPulseDemo2026!` | `/dashboard` | Case journey tracking, check-ins, encrypted journal, wellness baseline, distress insights, AI forecasting, statutory compensation calculator, DLSA forms, companion assistant. |
| **Designated Counselor** | `demo.counselor@mindpulse.local` | `MindPulseDemo2026!` | `/counselor` | Clinical decision support, prioritized case triage queue, distress alerts, longitudinal baseline comparisons, multi-disciplinary intervention pathways. |
| **District Welfare Admin** | `demo.admin@mindpulse.local` | `MindPulseDemo2026!` | `/admin` *(Hidden Route)* | District/State aggregate analytics ($k \ge 5$), regional distress heatmaps, what-if intervention simulator, tamper-evident security audit trail. |

---

## 👤 Persona 1: Victim / Protected Witness

- **Identity**: Alex Rivera (Protected Witness, Case `MP-1042`)
- **Email**: `demo.user@mindpulse.local`
- **Password**: `MindPulseDemo2026!`
- **Role**: `USER`
- **Active Case Stage**: `COURT_TRIAL` (Trial in progress)
- **District / State**: District Central, National Capital Region
- **Designated Counselor**: Dr. Sarah Jenkins

### Available Routes & Features:
- `/dashboard` — Case Journey Timeline (6 stages) & Quick Status Overview
- `/checkins` — Voluntary 10-Point Telemetry Check-in (Mood, Stress, Sleep, Perceived Safety, Case Tension)
- `/journal` — Private Reflections & Sentiment Analysis
- `/wellness` — 14-Day Rolling Statistical Baseline
- `/risk` — Non-Diagnostic Distress Risk & SHAP Explainability (XAI)
- `/forecast` — 3-Day Risk Projection & Milestone Sensitivity
- `/recommendations` — Personalized Trauma-Informed Coping & Legal Aid Pathways
- `/compensation` — Statutory Compensation Calculator & Downloadable DLSA Application Form
- `/support` — Non-Clinical AI Companion Assistant (Google Gemini Powered)

---

## 🩺 Persona 2: Designated Counselor

- **Identity**: Dr. Sarah Jenkins (Senior Clinical Psychologist)
- **Department**: District Legal Aid & Victim Support Cell (DLSA)
- **Email**: `demo.counselor@mindpulse.local`
- **Password**: `MindPulseDemo2026!`
- **Role**: `COUNSELOR`
- **Jurisdiction**: District Central

### Available Routes & Features:
- `/counselor` — Command Center & Active Triage Overview
- `/counselor/cases` — Prioritized Case Queue with Risk Stratification (`REQUIRES_REVIEW`, `ELEVATED`, `ROUTINE_MONITORING`)
- `/counselor/cases/:id` — Case Deep-Dive with Personal Baseline Deviations & XAI Factor Attributions
- `/counselor/alerts` — Real-Time Distress Spike Alerts & Critical Case Notifications
- `/counselor/interventions` — Support Actions (Counseling, Legal Aid Escalation, Witness Relocation, Compensation Expedition)

---

## 🏛️ Persona 3: District Welfare Officer (Admin)

- **Identity**: Marcus Vance (District Welfare Officer)
- **Department**: Department of Social Justice & Empowerment
- **Email**: `demo.admin@mindpulse.local`
- **Password**: `MindPulseDemo2026!`
- **Role**: `ADMIN`
- **Jurisdiction**: District Central / National Capital Region
- **Hidden Route**: `/admin` *(Accessible only to authenticated ADMIN accounts)*

### Available Routes & Features:
- `/admin` — Executive Overview & Population-Level Health Metrics
- `/admin/analytics` — Cohort Distress Trends, Baseline Tracking & Milestone Breakdown
- `/admin/cases` — Anonymized System Case Management (Privacy Preserved, No PII / No Raw Journals)
- `/admin/heatmap` — Regional Distress Geospatial Distribution
- `/admin/simulator` — What-If Policy Simulation (Impact of Counseling Capacity & Legal Expeditions)
- `/admin/audit` — Immutable Security & Privacy Audit Trail (SIH26094 Compliance)

---

## 🚀 How to Sign In

1. Start the application:
   ```bash
   make dev
   ```
2. Navigate to `http://localhost:5173/login` in your browser.
3. Use the **One-Click Quick Fill** buttons under *"Demo Accounts"* to auto-populate any persona, or enter the credentials manually.
4. Click **Sign In**.
5. To switch to a different role, click **Logout** from the top right and sign in with the other persona credentials.
