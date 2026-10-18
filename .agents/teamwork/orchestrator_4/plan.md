# Master Plan: Uplift University Full Application Audit & Remediation

## Executive Overview
A multi-agent, 4-milestone systematic audit and repair strategy to eliminate all functional, interactive, accessibility, and responsive UX/UI defects across the Uplift University web application outside the 3D Island.

---

## Phase 0: Survey & Deep Diagnostic Exploration
- **Objective**: Conduct comprehensive parallel code and diagnostic audits across all components, hooks, stores, pages, and responsive layouts.
- **Agents**:
  - `explorer_o4_shell`: Navigation Shell (TopBar search filtering, `/` shortcut, stat counters, user profile pill, Sidebar navigation states, level XP progress bar, ProgressPanel SVG circular gauge).
  - `explorer_o4_pages`: Main Pages (Dashboard `/dashboard`, All Courses `/courses`, Repeat `/repeat`, Achievements `/achievements`, Leaderboard `/leaderboard`, Profile `/profile`).
  - `explorer_o4_engine`: Lesson Engine (`/lesson/[lessonId]`), Plotting math edge cases, quiz checkpoint interactions, `localStorage` persistence, hydration, and error boundaries.
- **Deliverables**: Detailed vulnerability, bug, and remediation reports in each explorer's workspace.

---

## Milestone 1: Navigation Shell & Global Layout Remediation
- **Scope**:
  - TopBar search filtering, keyboard shortcut (`/`), stat counters, user profile pill, mobile navigation drawer.
  - Sidebar active/hover states, level XP progress bar, ProgressPanel SVG circular gauge (fixing any division-by-zero or `NaN%`).
  - ARIA attributes, keyboard accessibility, high-contrast text ratios, and responsive wrapping across mobile/tablet/desktop.
- **Workflow**: Worker implementation -> Independent Reviewers (2) -> Challengers (2) -> Forensic Auditor -> Gate.

---

## Milestone 2: Main Pages Functional, Responsive & A11y Remediation
- **Scope**:
  - `/dashboard`: Welcome card, continue learning CTA, course progress cards, quick action links, stats grid.
  - `/courses`: Direction filtering, search, difficulty filters, track cards layout, empty states, card badges.
  - `/repeat`: Practice question loading, topic filtering, interactive retry, streak/XP awards, storage sync.
  - `/achievements`: Badges grid, unlocked vs locked states, progress percentages, tooltips/modals.
  - `/leaderboard`: Podiums, user rank highlight, tab switching, mock/live data display.
  - `/profile`: User stats overview, streak heatmap / activity chart, reset progress modal, storage clearing.
  - Responsive layout validation: 375px, 768px, 1024px, 1280px+ with zero horizontal overflow.
- **Workflow**: Worker implementation -> Independent Reviewers (2) -> Challengers (2) -> Forensic Auditor -> Gate.

---

## Milestone 3: Lesson Engine, Interactive Plot & State Synchronization Hardening
- **Scope**:
  - `/lesson/[lessonId]`: Block navigation, theory cards, code sandboxes vs math theory rendering, assessment check.
  - Interactive plotting engine (`src/components/lesson/plot/InteractivePlot.tsx`, `src/lib/plot-math.ts`): Fix scientific notation parsing bug (`1e-5`), coordinate pins, touch/mouse handling.
  - State persistence & hydration: Fix SSR hydration race conditions, unify localStorage synchronization across stores, prevent NaN values.
- **Workflow**: Worker implementation -> Independent Reviewers (2) -> Challengers (2) -> Forensic Auditor -> Gate.

---

## Milestone 4: Final Verification, Cross-Device Polish & Forensic Audit
- **Scope**:
  - Run `npm run typecheck` (verify 0 errors).
  - Run `npm test` (verify 100% test suites green).
  - Run `npm run build` (verify clean build across all routes).
  - Verify zero console errors and zero horizontal overflow.
  - Verify boundary preservation: `git diff --name-only` confirms zero changes to `src/components/learning-world/*`, `src/app/world.css`, or `src/app/path/[directionId]/*`.
  - Final Forensic Audit: 100% clean verdict.
- **Deliverables**: Completion handoff to Sentinel.
