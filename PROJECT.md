# Project: Uplift University Application Audit & Remediation

## Architecture
- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **State Management**: Zustand stores with localStorage persistence (`src/stores/progress-store.ts`, `src/stores/progress-provider.tsx`)
- **Navigation Shell**: TopBar (`src/components/layout/TopBar.tsx`), Sidebar (`src/components/layout/Sidebar.tsx`), ProgressPanel (`src/components/layout/ProgressPanel.tsx`), AppShell (`src/components/layout/AppShell.tsx`)
- **Main Pages**:
  - Dashboard: `src/app/dashboard/page.tsx`, `src/components/dashboard/DashboardView.tsx`
  - Courses: `src/app/courses/page.tsx`, `src/components/courses/CoursesView.tsx`
  - Repeat & Reinforce: `src/app/repeat/page.tsx`, `src/components/repeat/RepeatTasksView.tsx`, `src/lib/repeat-tasks.ts`
  - Achievements: `src/app/achievements/page.tsx`, `src/components/achievements/AchievementsView.tsx`
  - Leaderboard: `src/app/leaderboard/page.tsx`, `src/components/leaderboard/LeaderboardView.tsx`
  - Profile: `src/app/profile/page.tsx`, `src/components/profile/ProfileView.tsx`
- **Lesson Engine & Math**:
  - Lesson Engine: `src/app/lesson/[lessonId]/page.tsx`, `src/components/lesson/LessonView.tsx`, `src/components/lesson/LessonRenderer.tsx`, `Assessment.tsx`, `ChatAssessment.tsx`
  - Interactive Plot & Calculator: `src/components/lesson/plot/InteractivePlot.tsx`, `src/lib/plot-math.ts`
- **Isolated Boundary (Strict Preservation)**:
  - `src/components/learning-world/*`
  - `src/app/world.css`
  - `src/app/path/[directionId]/*`

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F1.1 TopBar Hamburger & Drawer Trap | Fix `AppShell.tsx` `inert` on `app-body`, toggle icon/label `X` / "Close navigation", auto-close drawer on pathname change | M1 | Survey O13, O14 |
| 2 | F1.2 TopBar Search Combobox & A11y | Add ArrowUp/Down/Enter keyboard navigation, WAI-ARIA combobox roles, `min-width: 0` responsive dropdown styling | M1 | Survey O1, O4, O17 |
| 3 | F1.3 TopBar CSS Mismatches & Profile Pill | Replace `topbar-profile-meta` with `topbar-profile-text`, style suggestion chips, wire profile pill dropdown/link | M1 | Survey O2, O3, O4 |
| 4 | F1.4 Safe Numeric Formatting in TopBar | Nullish coalescing on `(xp ?? 0).toLocaleString()` and stat counters to eliminate runtime TypeError | M1 | Survey O5 |
| 5 | F1.5 Sidebar Level XP Progress Bar | Fix `sidebar-xp-bar` -> `sidebar-level-track`, `sidebar-xp-text` -> `sidebar-level-xp`, `sidebar-user-info` -> `sidebar-user-meta`, clamp `levelPercent` (0-100) | M1 | Survey O6, O7 |
| 6 | F1.6 Sidebar Active Route & Focus Outline | Highlight active lesson direction on `/lesson/[lessonId]`, prevent focus-visible clipping from `overflow-x: hidden` | M1 | Survey O8, O9 |
| 7 | F1.7 ProgressPanel SVG & Weekly Streak | Fix `activeDaysCount` false positive on 0-day streak (`Math.max(0, streak)`), guard `ringOffset` against `NaN`, align class names | M1 | Survey O10, O11 |
| 8 | F1.8 Global Shell Accessibility & Sound Toggle | Style `.skip-link` with high WCAG contrast, surface audio toggle in header/panel | M1 | Survey O12, O16 |
| 9 | F2.1 CoursesView TypeScript & Filtering | Fix TypeScript errors (`durationMinutes`, `subjects`, typed params), add search, direction tabs, difficulty filter, and empty state | M2 | Survey Obs 2.1-2.4 |
| 10 | F2.2 Dashboard Layout & Responsive Polish | Fix `.stat-icon-box` -> `.stat-icon-badge`, wrap text in `continue-card-content` to prevent 92px icon collision at 481-768px, style continue pills | M2 | Survey Obs 1.1-1.4 |
| 11 | F2.3 Repeat & Reinforce Accuracy & Decimals | Fix accuracy formula to divide by attempted questions, normalize decimal commas (`replace(',', '.')`), display practice history | M2 | Survey Obs 3.1-3.3 |
| 12 | F2.4 Achievements Badges & Modals | Add filter tabs (all, in-progress, unlocked), show individual badge progress %, add interactive details modal | M2 | Survey Obs 4.1-4.2 |
| 13 | F2.5 Leaderboard Layout & Podium Mobile Order | Add period filter tabs (weekly, all-time), fix Olympic podium mobile single-column ordering (Rank #1 first on mobile), highlight current user | M2 | Survey Obs 5.1-5.3 |
| 14 | F2.6 Profile Streak Heatmap & Storage Reset | Add streak calendar/heatmap visualization, track completion breakdown, ensure `resetProgress` cleanly purges all keys without orphan state | M2 | Survey Obs 6.1-6.3 |
| 15 | F3.1 Plot Math Scientific Notation Parser | Update regex in `plot-math.ts` to support `.5e2`, `1.e2`, exponential arithmetic, and test formula compiler output | M3 | Survey Obs 1.1 |
| 16 | F3.2 Interactive Plot Performance & Guards | Throttle `pointermove` to 60fps via RAF, coalesce wheel zoom, guard `getBoundingClientRect()` <= 0 to eliminate NaN coordinates | M3 | Survey Obs 1.2 |
| 17 | F3.3 Assessment Checkpoints Decimal Comma & Feedback | Support decimal comma in `Assessment.tsx` and `ChatAssessment.tsx`, ensure `.incorrect` visual feedback on selected wrong choices | M3 | Survey Obs 1.3, 1.4 |
| 18 | F3.4 Simpson's Rule Singularity Guards | Clamp evaluate boundaries inside finite domain when numerical integration encounters vertical asymptotes | M3 | Survey Obs 1.8 |
| 19 | F3.5 State Persistence & Hydration Hardening | Synchronize multi-key localStorage (`uplift-progress`, `uplift_solved_repeat_tasks`, `uplift_practice_sessions`), resolve SSR hydration mismatch | M3 | Survey Obs 1.5, 1.6, 1.7 |
| 20 | F4.1 Automated TypeScript Diagnostics | Verify `npm run typecheck` produces 0 errors (`tsc --noEmit`) | M4 | AC Correctness |
| 21 | F4.2 100% Automated Test Pass | Verify `npm test` runs and passes 100% of test suites with zero failures | M4 | AC Correctness |
| 22 | F4.3 Clean Next.js Production Build | Verify `npm run build` succeeds cleanly across all 40 routes | M4 | AC Correctness |
| 23 | F4.4 Responsive UX & A11y Verification | Verify 375px, 768px, 1280px+ zero horizontal overflow, hover/focus/active states, and console error-free | M4 | AC UX |
| 24 | F4.5 Strict Island Boundary Verification | Confirm `git diff --name-only` has ZERO changes in `src/components/learning-world/*`, `src/app/world.css`, or `src/app/path/[directionId]/*` | M4 | AC Boundary |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Navigation Shell & Global Layout Remediation | F1.1, F1.2, F1.3, F1.4, F1.5, F1.6, F1.7, F1.8 | none | DONE |
| M2 | Main Pages Functional, Responsive & A11y Remediation | F2.1, F2.2, F2.3, F2.4, F2.5, F2.6 | none (can parallelize with M1/M3) | DONE |
| M3 | Lesson Engine, Interactive Plot & State Hardening | F3.1, F3.2, F3.3, F3.4, F3.5 | none | DONE |
| M4 | Final Quality, Cross-Device Verification & Forensic Audit | F4.1, F4.2, F4.3, F4.4, F4.5 | M1, M2, M3 | IN_PROGRESS |

---

## Code Layout & Write Boundaries
- **Milestone 1 (Navigation Shell)**:
  - `src/components/layout/AppShell.tsx`
  - `src/components/layout/TopBar.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/ProgressPanel.tsx`
  - `src/app/globals.css` (shell sections)
- **Milestone 2 (Main Pages)**:
  - `src/components/courses/CoursesView.tsx`
  - `src/components/dashboard/DashboardView.tsx`
  - `src/components/repeat/RepeatTasksView.tsx`
  - `src/components/achievements/AchievementsView.tsx`
  - `src/components/leaderboard/LeaderboardView.tsx`
  - `src/components/profile/ProfileView.tsx`
  - `src/app/globals.css` (page sections)
- **Milestone 3 (Lesson Engine & Math & State)**:
  - `src/lib/plot-math.ts`
  - `src/components/lesson/plot/InteractivePlot.tsx`
  - `src/components/lesson/Assessment.tsx`
  - `src/components/lesson/ChatAssessment.tsx`
  - `src/stores/progress-store.ts`
  - `src/stores/progress-provider.tsx`
  - `src/lib/repeat-tasks.ts`
  - `src/app/lesson.css`
  - `tests/plot-math.test.ts`
- **Milestone 4 (Final Verification)**:
  - Full codebase validation, regression tests in `tests/`, typecheck, build, forensic audit.
