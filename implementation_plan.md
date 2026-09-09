# Implementation Plan: Comprehensive Counselor & Admin Portal Redesign

Completely redesign the navigation, information architecture, screen hierarchy, button semantics, workflows, and interaction model for both the **Counselor Portal** and **Admin Portal** in MindPulse.

## User Review Required

> [!IMPORTANT]
> - **Mental Models & Workflows**:
>   - **Counselor**: *Review → Understand (What Changed) → Decide → Support → Follow Up → Observe Outcome*
>   - **Admin**: *Monitor → Compare → Understand → Plan (What-If) → Govern (k ≥ 5 Privacy)*
> - **Button Semantics Standard**: Every button explicitly conveys intent (e.g. `[Review Case]`, `[Record Support Action]`, `[Schedule Follow-up]`, `[Acknowledge Alert]`, `[Run Policy Simulation]`). No ambiguous single-word labels.
> - **Zero Disruption to Core Engine**: Reuses existing APIs (`/counselor/cases`, `/interventions`, `/alerts`, `/analytics/overview`, `/analytics/heatmap`, `/analytics/simulate`), preserving schema and RBAC security.

---

## Proposed Changes

### 1. Navigation & Information Architecture
#### [MODIFY] [`Sidebar.tsx`](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/components/Sidebar.tsx)
- Reorganize Counselor links:
  - **Command Center & Triage**: `/counselor`
  - **Prioritized Case Queue**: `/counselor/cases`
  - **Distress Alerts**: `/counselor/alerts`
  - **Support Pathways & Outcomes**: `/counselor/interventions`
- Reorganize Admin links:
  - **Jurisdiction Overview**: `/admin`
  - **Regional Distress Map**: `/admin/heatmap`
  - **Policy & What-If Simulator**: `/admin/simulator`

---

### 2. Counselor Portal Redesign
#### [MODIFY] [`CounselorDashboardPage.tsx`](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/counselor/CounselorDashboardPage.tsx)
- Daily Command Center answering *"What needs my attention today?"*.
- Priority Attention Cards with **"What Changed"** indicators (*Stress ↑ to 9/10*, *Sleep ↓ to 4.0h*), explainable priority logic, search, and stage filtering.
- Urgent Follow-up Tracker (Due Today, Due This Week).

#### [MODIFY] [`CaseDetailsPage.tsx`](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/counselor/CaseDetailsPage.tsx)
- Unified, high-density **Case Review Workspace**:
  - Pseudonymous Header & Case Stage Journey tracker (`MP-1042`).
  - **"What Changed?"** section highlighting personal deviations from baseline.
  - Interactive multi-signal trend viewer (7d / 30d / 90d, toggles for Stress, Sleep, Mood, Safety, Hearing Tension).
  - AI-Assisted Telemetry Synthesis with explicit *Human Review Required* notice and SHAP-derived possible contributing signals.
  - Longitudinal Case Timeline (check-ins, alerts, interventions, stage changes).
  - Inline Support Action modal + Follow-up scheduler with optimistic confirmation.

#### [MODIFY] [`AlertsQueuePage.tsx`](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/alerts/AlertsQueuePage.tsx)
- Actionable escalation inbox with severity badges (`COUNSELOR_REVIEW`, `WATCH`).
- 1-click Acknowledge action and direct `[Review Case]` navigation into the Case Review Workspace.

#### [MODIFY] [`InterventionsPage.tsx`](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/interventions/InterventionsPage.tsx)
- Support Pathways lifecycle manager (*Identified → Support Initiated → In Progress → Follow-up Scheduled → Completed*).
- Before vs. After outcome telemetry comparison card (*Pre-Intervention vs. Post-Intervention*).
- Clear action buttons for marking completed, recording follow-ups, and viewing outcome delta.

---

### 3. Admin Portal Redesign
#### [MODIFY] [`InstitutionalAnalyticsPage.tsx`](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/analytics/InstitutionalAnalyticsPage.tsx)
- Story-driven government population dashboard answering *"What is happening across my jurisdiction?"*.
- Key metrics: active cases, check-in engagement, support utilization, counselor workload.
- Population distress distribution (pie chart) and case journey stage tension (bar chart).
- District comparison table with quick navigation to heatmap and simulator.

#### [MODIFY] [`CampusHeatmapPage.tsx`](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/heatmap/CampusHeatmapPage.tsx)
- Privacy-preserving (k ≥ 5) regional distress view.
- Zone cards with distress indicators, sample size, and recommended institutional actions.

#### [MODIFY] [`WhatIfSimulatorPage.tsx`](file:///c:/Users/dille/Desktop/web-projects/MindPulse/frontend/src/features/simulator/WhatIfSimulatorPage.tsx)
- 5-step guided scenario simulator for policy planning.
- Sliders and switches for counselor hours, witness transit, and fast-track compensation.
- Directional impact estimates with clear simulation disclaimers.

---

## Verification Plan

### Automated Verification
- Run `npm --prefix frontend run build` (`tsc && vite build`) to ensure all components and routes compile with zero type errors.

### Manual & Interactive Workflow Verification
- **Counselor Workflow**: Command Center → Priority Queue → Open MP-1042 → Review "What Changed" & Trends → Record Support Action → Schedule Follow-up → Review Outcomes.
- **Admin Workflow**: Jurisdiction Overview → District Comparison → Regional Heatmap → Run What-If Simulation.
