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
