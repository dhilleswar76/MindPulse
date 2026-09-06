# CONTRIBUTING.md — MindPulse Contribution Guide

Thank you for contributing to MindPulse! To maintain a clean, conflict-free, and modular codebase across multiple developers and AI agents, please follow these guidelines.

---

## 1. Development Workflow

1. **Create a focused feature branch**:
   ```bash
   git checkout -b feature/<feature-name>
   ```
   *Examples*:
   - `feature/checkin-slider-ux`
   - `feature/risk-shap-explainability`
   - `feature/counselor-case-triage`
   - `feature/admin-k-anonymity-filter`

2. **Read AGENT_RULES.md**:
   Adhere to strict feature boundaries. Only touch the files owned by your feature.

3. **Develop within your feature domain**:
   - Frontend UI: `frontend/src/features/<feature>/`
   - Backend APIs: `backend/src/features/<feature>/`
   - ML Logic: `ml-service/app/`

4. **Verify changes before committing**:
   ```bash
   # Run type checks and build
   npm run typecheck
   npm run build
   npm run lint
   ```

5. **Commit with conventional messages**:
   ```bash
   git commit -m "feat(checkins): add sleep quality breakdown to daily checkin"
   ```

6. **Submit a Pull Request**:
   - Provide a clear summary of changes.
   - Attach your Agent Handoff Report (see Rule 14 in `AGENT_RULES.md`).

---

## 2. Code Quality Checklist

- [ ] Strict TypeScript (no `any` without explicit justification).
- [ ] Zod schema validation on all backend endpoints.
- [ ] Non-diagnostic safety language maintained throughout UI & comments.
- [ ] Zero hardcoded credentials or real user data.
- [ ] Responsive UI verified across mobile and desktop breakpoints.
- [ ] Documentation updated in `docs/feature-map.md` and `docs/api-overview.md`.
