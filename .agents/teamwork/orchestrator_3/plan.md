# Uplift University Codebase Audit Plan

## Objective
Deliver a comprehensive, multi-agent audit across the Uplift University codebase (`uplift-university`, Next.js 16 / React 19 / Three.js / Zustand), identifying weakest areas ranked by severity and risk, with an actionable remediation roadmap in `AUDIT_REPORT.md` at project root, strictly adhering to the audit-only constraint.

## Architecture & Work Breakdown

### Phase 1: Diagnostics Baseline Execution
- Dispatch worker `worker_diag_1` to run:
  - `npm run typecheck`
  - `npm test`
  - `npm run lint`
- Capture stdout, stderr, exit codes, test counts, type check outputs, lint warnings/errors.
- Store results in `.agents/teamwork/worker_diag_1/diagnostics.md`.

### Phase 2: Parallel Specialist Deep-Dive Explorations (The 5 Pillars)
- **Pillar 1**: 3D Graphics & UI Performance (`explorer_pillar1_1`)
  - Scope: Three.js / `@react-three/fiber` canvas life cycle, asset loading, memory disposal, render loops, animations (`motion`), Next.js client component boundaries.
  - Directories: `src/components/learning-world`, `src/scenes`, `src/components/common`, etc.
  - Deliverable: `.agents/teamwork/explorer_pillar1_1/handoff.md` with exact file/line references, root cause, severity, remediation code.
- **Pillar 2**: Test Suite Coverage & Resilience (`explorer_pillar2_1`)
  - Scope: Unit & integration test coverage across `tests/`, unhandled edge cases, missing assertions, failure scenarios, mock quality.
  - Directories: `tests/`, test configs, uncovered source modules.
  - Deliverable: `.agents/teamwork/explorer_pillar2_1/handoff.md` with test inventory, gaps, missing coverage calculations, failure risks, remediation code.
- **Pillar 3**: Architecture & State Management (`explorer_pillar3_1`)
  - Scope: Zustand stores, state synchronization, separation of concerns, component coupling, persistence, reactivity.
  - Directories: `src/stores`, `src/data`, `src/components`, `src/lib`.
  - Deliverable: `.agents/teamwork/explorer_pillar3_1/handoff.md` with store architecture breakdown, coupling hot-spots, anti-patterns, remediation code.
- **Pillar 4**: TypeScript Strictness & Code Quality (`explorer_pillar4_1`)
  - Scope: Type safety gaps, `any`/loose typing, lint violations, build issues, runtime error boundary resilience, Next.js 16 / React 19 compatibility.
  - Files: `tsconfig.json`, `eslint.config.*`, types definitions, component prop types, error boundaries.
  - Deliverable: `.agents/teamwork/explorer_pillar4_1/handoff.md` with loose type inventory, boundary gaps, remediation code.
- **Pillar 5**: API Security & Input Validation (`explorer_pillar5_1`)
  - Scope: Next.js route handlers (`src/app/api`), payload validation (e.g. Zod/manual), error leakages, rate limiting, authentication/authorization, client-server boundaries.
  - Directories: `src/app/api`, `src/app`, API callers in `src/`.
  - Deliverable: `.agents/teamwork/explorer_pillar5_1/handoff.md` with security vector analysis, route audits, remediation code.

### Phase 3: Synthesis & Report Assembly
- Synthesize all findings from Diagnostics Baseline + 5 Pillars into `AUDIT_REPORT.md` at root.
- Calculate overall health score, rank Top 5 Weakest Areas by severity & risk.
- Ensure all acceptance criteria are met:
  - Exact file paths and line numbers
  - Standardized severity tags (`[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[LOW]`)
  - Root cause analysis
  - Actionable remediation code examples / design patterns
  - Baseline checks documented
- Synthesis Worker (`worker_synth_1`) writes `AUDIT_REPORT.md`.

### Phase 4: Independent Review & Verification
- Reviewer (`reviewer_audit_1`) examines `AUDIT_REPORT.md` for completeness, accuracy, consistency, and adherence to acceptance criteria.
- Challenger (`challenger_audit_1`) verifies file/line citations exist in repository and ensures zero source code modifications were made.

### Phase 5: Delivery & Parent Notification
- Orchestrator reviews gate verdicts, verifies clean status, writes final handoff, and notifies parent.
