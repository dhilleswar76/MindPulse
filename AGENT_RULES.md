# AGENT_RULES.md — Multi-Agent & Developer Engineering Rules

> **MANDATORY INSTRUCTION FOR ALL AI CODING AGENTS & HUMAN DEVELOPERS:**
> Before making ANY modifications, inspect, read, and adhere strictly to these 14 rules.

---

## Rule 1 — Inspect Before Editing
Before modifying anything:
1. Read `AGENT_RULES.md` thoroughly.
2. Inspect the repository structure and verify existing conventions.
3. Identify the specific feature being modified.
4. Identify the exact files owned by that feature.
5. Inspect shared dependencies before touching them.
6. Avoid touching unrelated files or dependencies.

---

## Rule 2 — Feature Ownership Boundary
Every feature in MindPulse operates within a strict ownership boundary:
- Frontend: `frontend/src/features/<feature-name>/`
- Backend: `backend/src/features/<feature-name>/`
- Documentation: `docs/feature-map.md`

An agent assigned to work on `checkins` must ONLY modify:
- `frontend/src/features/checkins/`
- `backend/src/features/checkins/`

Do NOT modify `features/journal/`, `features/interventions/`, or `features/analytics/` unless an explicit, approved shared interface dependency exists.

---

## Rule 3 — Do Not Modify Another Feature
If you are working on Feature A:
**Never modify Feature B's files.**
If cross-feature functionality is required:
1. Document the interface requirement.
2. Make the minimal necessary shared utility change in `src/utils/` or `src/services/`.
3. Do not refactor or restructure Feature B's internal business logic.

---

## Rule 4 — Shared Files Are Sensitive
Treat the following directories as high-conflict, sensitive zones:
- `frontend/src/components/`
- `frontend/src/services/`
- `frontend/src/types/`
- `backend/src/middleware/`
- `backend/src/utils/`
- `backend/src/services/`

Do not unnecessarily edit shared files. Prefer creating feature-local components, hooks, or helpers inside your feature folder.

---

## Rule 5 — No Unrelated Refactoring
An agent must NEVER:
- Reformat or prettify untouched unrelated files.
- Rename files or exports outside its feature boundary.
- Rewrite architectural foundations on a whim.
- Upgrade or alter package dependencies unnecessarily.
- Change global styling or theme variables without explicit approval.
- Delete code it does not fully understand.

---

## Rule 6 — Preserve Existing APIs
Do not silently modify existing API routes, parameter signatures, or response JSON schemas.
If an API contract must change:
1. Update `docs/api-overview.md`.
2. Update shared TypeScript types in `types/`.
3. Ensure backwards compatibility or update all affected consumers.
4. Clearly state breaking changes in the agent handoff note.

---

## Rule 7 — Do Not Overwrite Teammate Work
Before editing:
- Run `git status` and inspect current workspace state.
- Inspect recent changes in files you intend to touch.
- Never reset (`git reset --hard`), force-clean, or overwrite teammates' active implementations.

---

## Rule 8 — Keep Changes Small & Atomic
Work in focused increments:
```text
1 feature  →  1 focused change  →  1 pull request
```
Avoid sweeping changes that span across multiple unrelated domains.

---

## Rule 9 — Test Before Finishing
Every agent must run verification commands before completing its task:
- TypeScript type checking: `npm run typecheck`
- Linting: `npm run lint`
- Frontend build: `npm run build`
- Relevant unit tests / health checks
Do not report a task as complete if verification commands fail.

---

## Rule 10 — Document Feature Changes
When adding or updating a feature:
1. Update `docs/feature-map.md`.
2. Update `docs/api-overview.md` if endpoints are modified.
3. Update `README.md` if user-facing capabilities or flows change.

---

## Rule 11 — Security & Privacy Safeguards
Never commit:
- `.env` files or real secret tokens.
- Private JWT signing secrets or database credentials.
- Real, identifiable mental-health or psychological records.

Always use parameterized queries/schemas and sanitize user inputs with Zod.

---

## Rule 12 — Mental Health Safety & Non-Diagnostic Language
MindPulse is a **non-diagnostic decision-support and early intervention platform**.
Never use language in UI, code comments, or API responses that claims:
- Clinical diagnosis (e.g., "User has Depression/Anxiety Disorder").
- Guaranteed medical certainty or causal truth.
- Autonomous medical or psychiatric decisions.

Always use:
- `risk signal`
- `possible contributing factor`
- `early warning indicator`
- `decision-support estimate`
- `requires human / counselor review`

---

## Rule 13 — Synthetic Data Only
All development, testing, and demonstration data must be 100% synthetic and generated programmatically. Real patient data is strictly prohibited in this codebase.

---

## Rule 14 — Standard Agent Handoff Report
At the completion of each task, every agent MUST provide a structured handoff report in the following format:

```text
Feature worked on: <name>
Files changed: <list of modified files>
New files: <list of created files>
APIs changed: <list of endpoints affected>
Dependencies added: <any packages added>
Tests run: <commands executed for verification>
Known limitations: <what is stubbed / mock vs real>
Potential conflicts: <areas teammates should be aware of>
```
