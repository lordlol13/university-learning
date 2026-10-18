## 2026-10-18T08:12:05Z
You are worker_o4_m3, an implementation specialist.
Your working directory is:
c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_o4_m3

Read:
1. c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md (specifically ## 2026-10-18T06:55:55Z).
2. c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\explorer_o4_engine\handoff.md (contains exact line-by-line observations, root causes, and recommended code snippets for lesson engine, plotting math, and state architecture).
3. c:\Users\Home1\OneDrive\Desktop\university-learning\PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL BOUNDARY CONSTRAINT:
Strictly preserve all 3D Island files:
Do NOT alter src/components/learning-world/*, src/app/world.css, or src/app/path/[directionId]/* in any way.

File Write Boundaries (you exclusively own these files for Milestone 3):
- src/lib/plot-math.ts
- src/components/lesson/plot/InteractivePlot.tsx
- src/components/lesson/Assessment.tsx
- src/components/lesson/ChatAssessment.tsx
- src/stores/progress-store.ts
- src/stores/progress-provider.tsx
- src/lib/repeat-tasks.ts
- src/app/lesson.css
- tests/plot-math.test.ts

Tasks for Milestone 3:
1. Scientific Notation & Plot Math Fixes (Obs 1.1, 1.8):
   - In src/lib/plot-math.ts: fix scientific notation regex in compileCustomExpression & evaluateCalculatorExpression to support decimals without leading zero (e.g. .5e2) and with trailing dot (1.e2) as well as standard formats (1e-5, 2.5e3). Ensure .5e2 compiles to 50, 1.e2 to 100, 1e-5 to 0.00001.
   - In numericalDefiniteIntegral: guard boundary singularities (when evaluating at endpoints yields Infinity or NaN) by offsetting limits by eps = 1e-7 inside the domain.
   - Add unit tests in tests/plot-math.test.ts verifying .5e2, 1.e2, 1e-5, and singularity integrations.
2. InteractivePlot Performance & Coordinate Guards (Obs 1.2):
   - Throttle pointermove handler: coalesce setHover updates via requestAnimationFrame to avoid 120-240Hz re-render cascades.
   - Guard rect.width <= 0 || rect.height <= 0 in coordinate transform calculations so zero-size rects do not produce NaN or Infinity coordinates.
   - Debounce/coalesce wheel zoom updates.
3. Assessment Decimal Comma & Feedback Styling (Obs 1.3, 1.4):
   - In Assessment.tsx and ChatAssessment.tsx: normalize decimal comma in numeric inputs: Number(answer.trim().replace(',', '.')).
   - In Assessment.tsx: ensure .incorrect visual feedback class is applied to selected wrong options and styled in src/app/lesson.css with clear red/rose border, background, and indicator.
4. State Persistence, Storage & Hydration Synchronization (Obs 1.5, 1.6, 1.7):
   - In progress-store.ts: ensure resetProgress() purges all storage keys and resets in-memory store cleanly.
   - In repeat-tasks.ts: add resetSolvedTasks() and clear in-memory locallySolved Set upon reset.
   - In progress-provider.tsx & LessonView.tsx: ensure useProgressReady() eliminates hydration race conditions and flash of locked cards.

Verification:
- Run `npm test` and verify that all test suites pass.
- Run `npm run typecheck` (`tsc --noEmit`) and verify 0 errors.
- Write your comprehensive handoff report to:
  c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_o4_m3\handoff.md
- Message parent with summary of changes and verification results.
