# MindPulse — Comprehensive User Manual & UI Placement Guide

> **Problem Statement (SIH26094)**: *AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System for Victims of Atrocities*  
> **Ministry**: Ministry of Social Justice and Empowerment / Department of Social Justice and Empowerment  
> **Classification**: Non-Diagnostic, Privacy-Preserving AI-Assisted Decision Support Platform

---

## 🧭 System Navigation Philosophy & Structural Layout

The MindPulse interface is architected around **3 Distinct Personas** and follows a 4-tier visual hierarchy to ensure that users experiencing stress, counselors triaging cases, and district officers monitoring population distress never get lost.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP GLOBAL NAVBAR: Brand, Non-Diagnostic Notice, Persona Switcher, Profile & Logout    │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ LEFT DYNAMIC SIDEBAR:   │ MAIN CONTENT VIEWPORT:                                       │
│ Scoped specifically to  │ - Hero Action Banners (Quick high-frequency actions)         │
│ the active role         │ - 6-Stage Case Journey Timeline (Current legal status)       │
│ (Victim, Counselor,     │ - Primary Interactive Cards (XAI, Trends, Logs, Pathways)   │
│ or District Admin)      │ - Dedicated Feature Modals (Voice screening, Journaling)    │
└─────────────────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 🏛️ 1. Top Global Navigation Bar (`Navbar.tsx`)

### Position & Purpose
The Navbar is fixed to the top of every screen to provide permanent context, safety notifications, and immediate role switching during demonstrations.

| UI Element | Location | Why It Is Placed Here | Function / Destination |
| :--- | :--- | :--- | :--- |
| **MindPulse Logo & Subtitle** | Far Left | Instant visual anchor confirming platform identity and SIH26094 focus. | Clicking routes directly to the persona’s home dashboard (`/dashboard`, `/counselor`, or `/admin`). |
| **Safety & Non-Diagnostic Badge** | Center (Desktop) | **Regulatory compliance & ethics**: Constantly reminds users and evaluators that MindPulse is a non-diagnostic decision-support tool. | Displays ministry alignment and non-diagnostic policy statement. |
| **Persona / Role Switcher** | Right Center | Designed for **hackathon judges and evaluators** to seamlessly toggle between the 3 views without logging in/out repeatedly. | Switches state and routes: <br>• `Victim/Witness` $\rightarrow$ `/dashboard`<br>• `Counselor` $\rightarrow$ `/counselor`<br>• `District Admin` $\rightarrow$ `/admin` |
| **User Profile & Logout** | Far Right | Standard security paradigm indicating the authenticated user identity and district cell. | Displays full name and role; clicking the exit icon securely clears JWT tokens and redirects to `/login`. |

---

## 📑 2. Left Dynamic Sidebar (`Sidebar.tsx`)

### Position & Purpose
The Sidebar is permanently accessible on the left of the viewport. It dynamically filters navigation links according to the active role to prevent clutter and cognitive overload.

---

### A. Persona: Victim & Protected Witness (`role: USER`)

| Link / Item | Route | Why It Is Placed Here | What It Does / How to Use |
| :--- | :--- | :--- | :--- |
| **1. Case Journey & Home** | `/dashboard` | Primary landing page providing an instant holistic overview of the user's legal stage, risk signals, and baseline. | Displays the 6-stage case journey timeline, distress signal card, 7-day forecast preview, and support pathways. |
| **2. Wellbeing Check-in** | `/checkins` | Core daily interaction point. Placed near the top for daily routine access. | Opens the 10-point slider interface (Mood, Stress, **Case-Related Stress**, **Perceived Sense of Safety**, Sleep Hours). |
| **3. Journal & Reflections** | `/journal` | Expressive emotional outlet with privacy-first linguistic analysis. | Allows users to write encrypted reflection entries. The system extracts sentiment and trauma-informed tags (`#hearing_anxiety`, `#safety_concern`). |
| **4. Personal Baseline** | `/wellness` | Educational and transparency screen explaining personalized calibration. | Displays 14-day rolling statistical normal averages (Mood, Stress, Sleep, Safety) rather than comparing users to population averages. |
| **5. Distress Signals & XAI** | `/risk` | Explainability and transparency screen for the user. | Renders the gauge showing current distress tier (`STABLE`, `WATCH`, `ELEVATED`, `REQUIRES_REVIEW`) and SHAP feature attributions. |
| **6. Early Risk Forecast** | `/forecast` | Predictive early warning screen. | Shows 7-day time-series projected distress curve, giving proactive warning before upcoming court testimony. |
| **7. Support Pathways** | `/recommendations` | Immediate access to statutory assistance and non-clinical grounding. | Lists NALSA Legal Aid, Victim Compensation (357A CrPC), Witness Safehouses, and KIRAN helpline (1800-599-0019). |
| **8. Support Assistant** | `/support` | Conversational guidance companion. | AI companion for grounding exercises, breathing techniques, and orientation through the 6 legal stages. |

---

### B. Persona: Support Counselor / Case Worker (`role: COUNSELOR`)

| Link / Item | Route | Why It Is Placed Here | What It Does / How to Use |
| :--- | :--- | :--- | :--- |
| **1. Prioritized Case Queue** | `/counselor` | Counselor's primary workbench. Cases are automatically ranked by urgency score. | Lists pseudonymous cases (`MP-1042`, `MP-1001`, `MP-1003`) with stage indicators, risk levels, and direct action buttons. |
| **2. Case Summaries & AI** | `/counselor/cases/:id` | Deep-dive individual case investigation screen. | Shows full 6-stage journey, AI-synthesized telemetry bullets, safety trend charts, and intervention logging forms. |
| **3. Support & Follow-ups** | `/counselor/interventions` | Accountability and longitudinal efficacy tracking. | Logs statutory support pathways (`LEGAL_AID`, `VICTIM_COMPENSATION`, `PROTECTION_SUPPORT`) and tracks before/after stress deltas. |
| **4. Distress Alerts Queue** | `/counselor/alerts` | Urgent escalation queue. | Displays automated triggers caused by sudden safety score drops (e.g. drop $\ge 3.0$ pts) or acute pre-trial tension spikes. |

---

### C. Persona: District Welfare Official / Admin (`role: ADMIN`)

| Link / Item | Route | Why It Is Placed Here | What It Does / How to Use |
| :--- | :--- | :--- | :--- |
| **1. District / State Analytics** | `/admin` | High-level jurisdictional oversight dashboard. | Renders aggregate distress trends, stage distributions, and district tables under strict $k$-anonymity ($k \ge 5$). |
| **2. Regional Distress Map** | `/admin/heatmap` | Spatial resource allocation tool. | Shows distress indices across jurisdictional clusters (Special Courts, District Central Hub, Rural Blocks) without GPS tracking. |
| **3. Intervention Impact Sim** | `/admin/simulator` | Strategic budget and policy decision tool. | What-If simulator allowing officials to model the effect of expanding DLSA advocates (+25%) or deploying witness transit. |

---

## 🌟 3. Main Dashboard Elements & In-Page Action Triggers

### A. The 6-Stage Case Journey Timeline (`CaseJourneyTimeline.tsx`)
- **Location**: Displayed prominently at the top of the Victim Dashboard and Counselor Case Details.
- **Why it is placed here**: Victims of atrocities undergo a multi-phase legal process. Stress peaks at predictable transition points (e.g., testimony during Trial vs. waiting during Compensation). Visualizing this provides mutual context for both the victim and counselor.
- **The 6 Stages**:
  1. `Case Registration` (FIR / Special Cell Registration)
  2. `Investigation` (Witness statements & evidence collection)
  3. `Court / Trial` (Deposition, hearing anxiety, cross-examinations)
  4. `Compensation` (Section 357A CrPC interim & final relief)
  5. `Rehabilitation` (Psycho-social care, housing, economic support)
  6. `Protection / Support` (Witness protection & threat monitoring)

---

### B. Action Buttons on User Dashboard (`UserDashboardPage.tsx`)

| Action Button | Location | Visual Styling | Why It Is Here & What It Does |
| :--- | :--- | :--- | :--- |
| **"Quick Check-In"** | Top Hero Banner | Teal $\rightarrow$ Indigo Gradient Button | Immediate 1-click access to the daily wellbeing check-in slider modal. |
| **"Voice Stress Test"** | Top Hero Banner | Slate with Teal Border & Mic Icon | Launches the prototype **Voice Acoustic Biomarker Screener** to measure vocal tremor, jitter, and shimmer. |
| **"Support Assistant"** | Top Hero Banner | Dark Slate Button with Bot Icon | Opens the conversational companion for immediate 4-7-8 breathing exercises and grounding. |
| **"Distress Signal Status" Card** | Grid Column 1 | Amber Alert Icon with Tier Badge | Clicking routes to `/risk` for explainable factor contributions (SHAP breakdown). |
| **"Early Risk Trajectory" Card** | Grid Column 2 | Indigo Trend Icon with Forecast Tag | Clicking routes to `/forecast` for the 7-day projected distress escalation curve. |
| **"Journal & Reflections" Card** | Grid Column 3 | Teal Book Icon with NLP Tag | Clicking routes to `/journal` to review past reflections or record new encrypted thoughts. |

---

### C. Voice Stress Screener Modal (`VoiceStressModal.tsx`)
- **Location**: Triggered from the Dashboard Hero Banner.
- **Why it is placed here**: Demonstrates the multimodal capability required by SIH26094. Speech prosody and micro-tremor provide non-invasive distress screening.
- **How to Use**:
  1. Click **"Voice Stress Test"**.
  2. Click **"Start 5s Sample Recording"**.
  3. Speak naturally for 5 seconds (wave animation visualizer activates).
  4. Review extracted biomarkers: **Pitch Jitter**, **Amplitude Shimmer**, **Speech Rate**, and **Pause Frequency Ratio**.

---

## 🔄 4. Step-by-Step Demonstration Walkthrough for Evaluators

### Step 1: Protected Witness Experience
1. Click **"Victim / Witness"** in the top navbar.
2. Note the active Case ID (`MP-1042`) and active stage (`Court / Trial`).
3. Click **"Quick Check-In"** $\rightarrow$ adjust **Sense of Safety** and **Case-Related Stress** $\rightarrow$ click Submit.
4. Click **"Voice Stress Test"** $\rightarrow$ record a 5-second sample $\rightarrow$ observe acoustic biomarker outputs.
5. Click **"Distress Signals & XAI"** in the sidebar $\rightarrow$ review SHAP factor breakdown (*Hearing Proximity +28%*).

### Step 2: Counselor Decision Support
1. Click **"Counselor"** in the top navbar.
2. Inspect Case `MP-1042` at the top of the **Prioritized Case Queue**.
3. Click **"Review Case & AI Synthesis"** $\rightarrow$ review the automated non-diagnostic telemetry summary.
4. Click **"Log Support Pathway"** $\rightarrow$ select `LEGAL_AID` (DLSA Advocate + Safe Transit Escort).
5. Click **"Support & Follow-ups"** in the sidebar to review the **Pre- vs. Post-Intervention Outcome Delta**.

### Step 3: District Welfare Administration
1. Click **"District Admin"** in the top navbar.
2. Inspect the privacy-preserving ($k \ge 5$) aggregate metrics and stage distribution chart.
3. Click **"Regional Distress Map"** in the sidebar $\rightarrow$ click **Special Courts & Witness Cell Cluster** to inspect cohort telemetry.
4. Click **"Intervention Impact Sim"** in the sidebar $\rightarrow$ adjust policy sliders (expand DLSA capacity +25%) $\rightarrow$ click **"Run Scenario Simulation"** to forecast directional distress reduction.
5. Click **"Stage Transition Inbox"** (`/admin/inbox`) $\rightarrow$ review counselor milestone evidence references $\rightarrow$ click **"Review"** $\rightarrow$ authorize or request clarification for official stage transitions.

---

## 🏛️ 5. Official Case-Stage Confirmation Workflow

> **Core Governance Principle**: Case-stage changes are official administrative/legal milestones. Counselors can recommend or request a transition with documented milestone evidence, but only an authorized District Welfare Officer can confirm it. AI-generated wellbeing signals support prioritization and intervention and never automatically change the official case stage.

### Counselor Request Flow:
1. Counselor opens `/counselor/cases/:id`.
2. Clicks **"Request Case Stage Update"**.
3. Selects requested target stage, enters **Official Evidence Reference Identifier** (e.g. `INV-2026-1042 / Chargesheet 44/2026`), and provides the documented milestone justification.
4. Clicks **"Submit for Official Confirmation"**.
5. The request enters `PENDING` review status without immediately altering `Case.caseStage`.

### Admin Confirmation Inbox Flow:
1. District Welfare Officer opens `/admin/inbox`.
2. Filter requests by `Pending Review`, `Clarification Required`, `Approved`, or `Rejected`.
3. Reviews legal evidence reference and counselor justification.
4. Actions available:
   - **Approve Transition**: Officially updates `Case.caseStage`, records stage history timestamps, creates an `AuditLog`, and updates the victim dashboard.
   - **Request Clarification**: Prompts counselor for updated records or specific court references.
   - **Reject Transition**: Records formal administrative rationale.
