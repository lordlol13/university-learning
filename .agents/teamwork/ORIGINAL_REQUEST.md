# Original User Request

## 2026-09-30T03:34:08Z

Audit all Desmos interactive plot graphics across the Uplift University learning platform, ensure every math and lab visualization is responsive, robust, and interactive, and verify and polish all core areas of the project across lessons, practice/repeat mode, and the 3D learning world.

Working directory: c:\Users\Home1\OneDrive\Desktop\university-learning
Integrity mode: development

## Requirements

### R1. Desmos Graphics & Interactive Plotting Verification
- Ensure the interactive graph system (`src/components/lesson/plot/InteractivePlot.tsx`, `src/lib/plot-math.ts`) operates smoothly with zero latency or layout jumps.
- Verify double-click / double-tap point pinning reliably triggers on the first attempt across mouse, trackpad, and touch inputs.
- Ensure all interactive features (crosshair curve tracing, derivative tangent lines, critical points auto-detection, definite integral shading, custom formula compilation, equation presets, and dark/light math themes) function without errors or NaN states.
- Ensure explanations in non-coding tracks (Mathematics, Physics & Engineering, Italian Language & Culture) present rich mathematical and conceptual visualizations without superfluous code runner windows.

### R2. End-to-End Courseware & Repeat Practice System
- Audit all lesson modules across the four campus tracks (`ai-ml`, `physics-engineering`, `mathematics`, `italian-culture`) to ensure seamless lesson flow, accurate progress persistence, XP rewards, and achievement triggers.
- Verify the Repeat & Practice system (`src/app/repeat/page.tsx`, `src/components/repeat/RepeatTasksView.tsx`, `src/lib/repeat-tasks.ts`), enabling students to review and solve questions from previously completed themes with immediate feedback and scoring.

### R3. 3D Learning World & Island Layout
- Verify the 3D world canvas (`src/components/learning-world/`) across all four campus islands.
- Ensure all landmark buildings, trees, thematic objects, and lesson platforms are correctly oriented toward the viewer, have zero mesh clipping or path obstructions, and have clean non-overlapping step info markers.

## Acceptance Criteria

### Interactive Graphics & Usability
- [ ] Double-clicking the interactive plot canvas places a coordinate pin with slope and curvature metrics on the very first try.
- [ ] Formula presets and custom expression compiler parse valid equations and handle edge cases gracefully.
- [ ] Graph canvas remains fully responsive across both mobile portrait screens and widescreen desktop viewports.
- [ ] Subject-specific content rendering displays code sandboxes only for technical/coding subjects (`ai-ml`) and clean visual math/theory explanations for others.

### Courseware & Learning System
- [ ] All lesson tracks allow navigating through intro, theory, interactive labs, and quiz checkpoints with state persistence.
- [ ] The Repeat Practice page loads review tasks from past lessons, accepts student answers, and records completed practice sessions.

### Build, Quality & Test Suite
- [ ] `npm test` runs and passes 100% of all automated test suites with zero failures.
- [ ] `npm run typecheck` passes with zero TypeScript diagnostics.
- [ ] `npm run lint` passes cleanly with zero ESLint errors or warnings.
- [ ] `npm run build` generates optimized production artifacts for all static and dynamic application routes.

## Follow-up — 2026-10-01T11:18:14Z

Audit all Desmos interactive plot graphics across the Uplift University learning platform, ensure every math and lab visualization is responsive, robust, and interactive, and verify and polish all core areas of the project across lessons, practice/repeat mode, and the 3D learning world.

Working directory: c:\Users\Home1\OneDrive\Desktop\university-learning
Integrity mode: development

## Requirements

### R1. Desmos Graphics & Mathematical Visualizations
- Verify that the interactive plotting engine (`src/components/lesson/plot/InteractivePlot.tsx`, `src/lib/plot-math.ts`) operates without latency, layout stutter, or console errors.
- Ensure double-tap / double-click point pinning functions reliably on the first try across mouse, trackpad, and touch screens.
- Verify formula compilation handles exponential expressions (`exp(x)`), uppercase variables (`X`), and unary negations (`-x^2`) cleanly with mathematical operator precedence.
- Ensure definite integral numerical integration gracefully handles boundary singularities without `NaN` propagation.

### R2. Four-Track Courseware & Repeat Practice System
- Audit all four campus directions:
  - **AI & Machine Learning** (`ai-ml`)
  - **Physics & Engineering** (`physics-engineering`)
  - **Mathematics** (`mathematics`)
  - **Italian Language & Culture** (`italian-culture`)
- Verify subject-appropriate presentation: rich code execution sandboxes for coding tracks, clean visual/formulaic explanations without superfluous code windows for non-coding tracks.
- Verify the Repeat & Practice system (`src/app/repeat/page.tsx`, `src/components/repeat/RepeatTasksView.tsx`, `src/lib/repeat-tasks.ts`), confirming that questions from completed student themes are filtered, answer checks provide clear feedback, practice sessions persist, and achievements unlock across all four tracks.

### R3. 3D Campus World & Island Environments
- Verify the 3D world canvas (`src/components/learning-world/`) across all four campus islands.
- Ensure all landmark structures, thematic elements, trees, and lesson platforms face toward the camera viewer, maintain generous clearance buffers with pedestrian roads, and have unobtrusive step info labels.

### R4. Test Suite, Type Integrity & Build Pipeline
- Ensure all unit tests in `tests/*.test.ts` pass with a 100% pass rate.
- Ensure TypeScript typechecking (`npm run typecheck`) and ESLint (`npm run lint`) pass with zero errors and zero warnings.
- Ensure Next.js production build (`npm run build`) compiles cleanly across all static and dynamic application routes.

## Acceptance Criteria

### Interactive Graphics & Math Engine
- [ ] Double-clicking graph canvas places a pinned coordinate badge with slope `dy/dx` and curvature `d²y/dx²` metrics on the very first try.
- [ ] Formula inputs like `exp(-x^2 / 2)` and `2X + 1` compile and render valid curves without throwing syntax errors.
- [ ] Graph canvas remains stable during toolbar toggles, wheel zooming, and dragging.

### Courseware & Repeat Practice
- [ ] Non-coding subjects show theory and interactive math without empty code blocks.
- [ ] Completed lesson progress, XP rewards, and practice streaks persist reliably in client storage.
- [ ] Repeat tasks filter accurately by completed themes and support interactive "Try Again" on incorrect answers.
- [ ] Subject completion achievements (`physics-master`, `math-pioneer`, `italian-scholar`) unlock correctly.

### 3D World & Campus Scenery
- [ ] All 4 campus islands exhibit front-facing objects with zero road intersections or mesh clipping.
- [ ] Step information markers are elevated and non-overlapping.

### Build & Verification
- [ ] `npm test` runs and passes 100% of all tests (50+ tests).
- [ ] `npm run typecheck` produces 0 TypeScript errors.
- [ ] `npm run lint` completes with 0 errors and 0 warnings.
- [ ] `npm run build` succeeds across all 39 routes.

## 2026-10-05T14:20:10Z

Conduct a comprehensive multi-agent audit across the Uplift University codebase (`uplift-university`, Next.js 16 / React 19 / Three.js / Zustand) to identify the project's weakest areas, ranked by severity and risk, and deliver an actionable remediation roadmap in `AUDIT_REPORT.md` without modifying existing source code.

Working directory: c:\Users\Muzaffar\Desktop\university-learning
Integrity mode: development

## Requirements

### R1. Multi-Dimensional Weakness Investigation
Examine the entire repository across five core pillars:
1. **3D Graphics & UI Performance**: Three.js / `@react-three/fiber` canvas life cycle, asset loading, memory disposal, render loops, animations (`motion`), and Next.js client component boundaries.
2. **Test Suite Coverage & Resilience**: Current unit and integration test coverage across `tests/`, unhandled edge cases, missing assertions, and failure scenarios.
3. **Architecture & State Management**: Zustand stores, state synchronization, separation of concerns, and component coupling across `src/components`, `src/scenes`, `src/stores`, and `src/data`.
4. **TypeScript Strictness & Code Quality**: Type safety gaps, `any`/loose typing, lint violations, build issues, and runtime error boundary resilience.
5. **API Security & Input Validation**: Next.js route handlers (`src/app/api`), payload validation, error leakages, and client-server boundaries.

### R2. Actionable Audit Deliverable
Generate a comprehensive, structured markdown document titled `AUDIT_REPORT.md` at the project root (`c:\Users\Muzaffar\Desktop\university-learning\AUDIT_REPORT.md`). The audit report must contain:
- **Executive Summary**: High-level health score and key findings overview.
- **Top 5 Weakest Areas**: Ranked list of the most critical vulnerabilities, bottlenecks, or architectural flaws.
- **Pillar-by-Pillar Findings**: Detailed breakdown for each of the five pillars.
- **Concrete Remediation Roadmap**: For every identified weakness, provide exact file paths, line references, root cause analysis, severity classification (Critical, High, Medium, Low), and proposed remediation code examples or design patterns.
- **Audit-Only Constraint**: Do not modify existing codebase source files; deliver the analysis strictly via `AUDIT_REPORT.md`.

## Acceptance Criteria

### Deliverable & Format
- [ ] `AUDIT_REPORT.md` is created at the repository root (`c:\Users\Muzaffar\Desktop\university-learning\AUDIT_REPORT.md`).
- [ ] No existing project source code files (`src/`, `tests/`, `package.json`, etc.) are modified during the audit.
- [ ] The report contains all five required sections: Executive Summary, Top 5 Weakest Areas, Pillar-by-Pillar Findings, Diagnostics Baseline, and Remediation Roadmap.

### Depth & Verifiability
- [ ] All five focus pillars (3D & Performance, Test Coverage, State & Architecture, TypeScript & Lint, API & Security) are thoroughly analyzed with distinct subsections.
- [ ] Every identified weakness cites exact file paths and line ranges existing in the repository.
- [ ] Every weakness is assigned a standardized severity tag (`[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, or `[LOW]`).
- [ ] Every weakness includes a concrete remediation plan with code examples or architectural guidance.
- [ ] Baseline checks (`npm run typecheck`, `npm test`, `npm run lint`) are executed and their current outcomes are documented in the report.

## 2026-10-18T06:55:55Z

Conduct a comprehensive multi-agent audit to find and fix all functional, interactive, accessibility, and UX/UI bugs across the Uplift University web application.

Working directory: c:\Users\Home1\OneDrive\Desktop\university-learning
Integrity mode: development

## Requirements

### R1. Comprehensive Bug Discovery & Diagnostic Audit
Audit all application surfaces outside the 3D Island:
- **Navigation Shell**: TopBar search filtering, keyboard shortcuts (`/`), stat counters, user profile pill, Sidebar navigation states, level XP progress bar, and ProgressPanel SVG circular gauge.
- **Main Pages**: Dashboard (`/dashboard`), All Courses (`/courses`), Repeat & Reinforce (`/repeat`), Achievements (`/achievements`), Leaderboard (`/leaderboard`), Profile (`/profile`), and Lesson Engine (`/lesson/[lessonId]`).
- Check for functional regressions, console errors, state persistence / reset bugs in `localStorage`, hydration mismatches, broken layout wrapping, text truncation, accessibility/contrast issues, and missing ARIA roles.

### R2. Bug Remediation & UI Polish
Fix all discovered issues directly in the codebase:
- Resolve any logic errors, race conditions, or unhandled null/undefined states.
- Fix UI defects across responsive viewports (Mobile 375px, Tablet 768px–1024px, Desktop 1280px–1920px), ensuring zero horizontal page overflow, unclipped text, and consistent typography and spacing.
- Ensure all interactive controls (quiz options, numeric inputs, hint toggles, filter tabs, modal dialogs) respond with immediate, clear visual feedback.

### R3. Island Integrity Constraint
Strictly preserve all 3D Island files and assets without modifications:
- Do not alter `src/components/learning-world/*`, `src/app/world.css`, or `src/app/path/[directionId]/*`.

## Verification Resources

- **Automated Tests**: Run `npm test` to verify the 78+ unit tests in `tests/*.test.ts`.
- **TypeScript Typecheck**: Run `npm run typecheck` (`tsc --noEmit`) to verify zero type errors.
- **Next.js Production Build**: Run `npm run build` to verify clean compilation and static generation.
- **Island Boundary Check**: Run `git status --short` to verify zero diff in `src/components/learning-world/`, `src/app/world.css`, or island routes.

## Acceptance Criteria

### Correctness & Build
- [ ] `npm run typecheck` passes with 0 errors.
- [ ] `npm test` passes with 100% of test suites green.
- [ ] `npm run build` succeeds without bundle or linting errors.

### User Experience & Responsive Design
- [ ] Zero unhandled console warnings or errors across all views.
- [ ] Seamless responsive layout at 375px (mobile), 768px (tablet), and 1280px+ (desktop) with no horizontal scrollbar or element overflow.
- [ ] All interactive elements (search bar, filter tabs, quiz options, numerical inputs, buttons, links) have appropriate hover, focus-visible, and active states.
- [ ] State persistence (XP, streak, completed lessons, achievements, reset controls) functions reliably without data corruption or NaN values.

### Boundary Preservation
- [ ] `git diff --name-only` confirms no changes made to `src/components/learning-world/`, `src/app/world.css`, or `src/app/path/[directionId]/`.
