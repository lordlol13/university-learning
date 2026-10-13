# Project: Uplift University Learning Platform Verification & Polish

## Architecture
- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **State Management**: Zustand with localStorage persistence (`src/stores/progress-store.ts`)
- **Graphics & 3D**: Three.js / React Three Fiber / Drei (`src/components/learning-world/`)
- **Mathematical Plotting**: Custom Desmos-like SVG engine (`src/components/lesson/plot/InteractivePlot.tsx`, `src/lib/plot-math.ts`)
- **Curriculum & Practice**: Static curriculum data (`src/data/curriculum.ts`), lesson data (`src/data/lessons/`), repeat review engine (`src/lib/repeat-tasks.ts`, `src/components/repeat/RepeatTasksView.tsx`)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F1.1 Double-Click/Tap Pinning | Fix 4px jitter threshold to 10px/12px, widen double-tap window to 480ms/32px, reduce cooldown to 250ms, guard against NaN coordinates | M1 | Survey R1 (DONE) |
| 2 | F1.2 Formula Parser Fixes | Fix implicit multiplication regex with word boundary `\b([xX])`, normalize uppercase `X`, unary negation before exponentiation (`transformUnaryPower`), Simpson's rule endpoint finite guards | M1 | Survey R1 (DONE) |
| 3 | F1.3 Plot Layout & Performance | Wrap SVG in relative canvas wrapper to prevent formula chip collision on toolbar open; decouple critical points during active drag | M1 | Survey R1 (DONE) |
| 4 | F1.4 Subject-Specific Rendering | Confirm non-coding tracks present rich visual math without code runners | M1 | Survey R1 (DONE) |
| 5 | F1.5 Plot Tests | Add tests in `tests/plot-math.test.ts` for `exp(x)`, `4*exp(-0.5*x^2)`, `X^2`, `-x^2`, `-x^3`, `exp(-x^2 / 2)`, and jitter tolerance | M1 | Survey R1 (DONE) |
| 6 | F2.1 Repeat Tasks Theme Filter | Default Repeat Practice to completed lesson themes, with fallback to all tasks | M2 | Survey R2 (DONE) |
| 7 | F2.2 Practice Session Recording | Define `PracticeSession` model, persist completed sessions, display completion summary card | M2 | Survey R2 (DONE) |
| 8 | F2.3 Repeat "Try Again" Retry | Enable retry on incorrect questions in Repeat Practice mode | M2 | Survey R2 (DONE) |
| 9 | F2.4 Track Completion Badges | Add achievements for `physics-master`, `math-pioneer`, `italian-scholar`, `practice-champion` | M2 | Survey R2 (DONE) |
| 10 | F2.5 Route Alias `italian-culture` | Map `/path/italian-culture` to `italian-language` to prevent 404 | M2 | Survey R2 (DONE) |
| 11 | F2.6 Repeat Unit Tests | Create `tests/repeat-tasks.test.ts` for task generation, filtering, validation, and session logging | M2 | Survey R2 (DONE) |
| 12 | F3.1 3D Island Scenery | 4 campus islands with custom landmark buildings, thematic objects, and spline road | M3 | Survey R3 (DONE) |
| 13 | F3.2 Viewer Camera Orientation | Verify pitch tilts and dual-sided geometry facing elevated camera | M3 | Survey R3 (DONE) |
| 14 | F3.3 Collision & Clearance | Zero mesh clipping, road spline clearance, and terrain containment | M3 | Survey R3 (DONE) |
| 15 | F3.4 Adaptive Step Markers | Compact pill pins expanding on hover/selection with Z-index separation | M3 | Survey R3 (DONE) |
| 16 | F4.1 Automated Test Suite | `npm test` runs and passes 100% of test suites with zero failures (71/71 tests) | M4 | Quality Spec (DONE) |
| 17 | F4.2 TypeScript Typecheck | `npm run typecheck` passes with zero diagnostics (0 errors) | M4 | Quality Spec (DONE) |
| 18 | F4.3 ESLint Compliance | `npm run lint` passes cleanly with zero errors/warnings | M4 | Quality Spec (DONE) |
| 19 | F4.4 Next.js Production Build | `npm run build` generates optimized production artifacts for all 40 routes | M4 | Quality Spec (DONE) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Desmos Graphics & Interactive Plotting | F1.1, F1.2, F1.3, F1.4, F1.5 (`InteractivePlot.tsx`, `plot-math.ts`, `tests/plot-math.test.ts`, `lesson.css`) | none | DONE |
| M2 | Courseware & Repeat Practice System | F2.1, F2.2, F2.3, F2.4, F2.5, F2.6 (`RepeatTasksView.tsx`, `repeat-tasks.ts`, `progress-store.ts`, `demo.ts`, `tests/repeat-tasks.test.ts`) | none | DONE (Gate Passed) |
| M3 | 3D Learning World & Island Layout | F3.1, F3.2, F3.3, F3.4 (`learning-world/`) | none | DONE (Verified in Survey) |
| M4 | Final Quality & E2E Verification | F4.1, F4.2, F4.3, F4.4 (Full test suite, typecheck, lint, build) | M1, M2, M3 | DONE |

## Code Layout & Write Boundaries
- **Milestone 1 Worker**:
  - `src/lib/plot-math.ts`
  - `src/components/lesson/plot/InteractivePlot.tsx`
  - `src/app/lesson.css`
  - `tests/plot-math.test.ts`
- **Milestone 2 Worker**:
  - `src/lib/repeat-tasks.ts`
  - `src/components/repeat/RepeatTasksView.tsx`
  - `src/stores/progress-store.ts`
  - `src/data/demo.ts`
  - `src/app/path/[directionId]/page.tsx`
  - `tests/repeat-tasks.test.ts`
- **Milestone 3**:
  - `src/components/learning-world/*` (Verified clean)
- **Milestone 4 Worker**:
  - `tests/*.test.ts`, `scripts/*.ts` (Full test, stress, typecheck, lint, build validation)
