## 2026-09-30T03:45:11Z

You are Worker 1 (Interactive Plotting Specialist).
Your working directory is: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_m1
The authoritative user request is in: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md
The project scope document is in: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\orchestrator_1\PROJECT.md
The project root is: c:\Users\Home1\OneDrive\Desktop\university-learning

You MUST read c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md first.

Review the explorer's detailed technical investigation before making changes:
- c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\explorer_survey_r1\analysis.md
- c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\explorer_survey_r1\handoff.md

Write ownership:
You own and may ONLY edit the following files:
- `src/lib/plot-math.ts`
- `src/components/lesson/plot/InteractivePlot.tsx`
- `src/app/lesson.css`
- `tests/plot-math.test.ts`

Your task: Implement all fixes for Milestone 1 (Desmos Graphics & Interactive Plotting Verification):
1. F1.1 Point Pinning Usability & Reliability:
   - In `InteractivePlot.tsx`, fix the drag threshold in `onPointerMove`: increase from 4px to 10px (12px for touch pointers) before setting `d.hasMoved = true` and wiping `lastTapRef.current`. This prevents normal micro-jitter from aborting double-click / double-tap detection.
   - Widen double-tap timing threshold from 380ms to 480ms and distance tolerance from 25px to 32px.
   - In `triggerDoubleTapAt`, reduce deduplication cooldown from 450ms to 250ms.
   - Guard against non-finite values in `triggerDoubleTapAt`: check `if (!Number.isFinite(graphX) || !Number.isFinite(graphY)) return;`.
2. F1.2 Formula Parser & Calculus Fixes:
   - In `src/lib/plot-math.ts`, fix the implicit multiplication regex using word boundary: `s = s.replace(/\b([xX])\s*([a-zA-Z0-9(])/g, "$1*$2");` so `exp(x)` is never corrupted into `ex*p(x)`.
   - Normalize uppercase variable: `s = s.replace(/\bX\b/g, "x");` so inputs like `X^2` or `2X` compile without ReferenceError.
   - In `numericalDefiniteIntegral`, guard `fn(a)` and `fn(b)` with `Number.isFinite` so non-finite endpoints do not poison Simpson's rule.
3. F1.3 Layout & Performance:
   - Wrap the SVG canvas and on-graph overlay badges in a container `<div className="desmos-canvas-wrapper" style={{ position: "relative" }}>` and anchor `.desmos-active-formula-chip` to the canvas container (e.g. `top: 10px; left: 14px;`) rather than `.interactive-plot` `top: 50px`. This prevents toolbar overlap when integral or custom formula bars expand.
   - In `InteractivePlot.tsx`, optimize `findCriticalPoints` so it does not perform expensive calculations on every pointermove frame during drag/pan.
4. F1.5 Automated Unit Tests:
   - In `tests/plot-math.test.ts`, add comprehensive tests verifying `compileCustomExpression` for `exp(x)`, `4*exp(-0.5*x^2)`, `4/(1+exp(-2x))`, `X^2`, uppercase `X`, Simpson's rule endpoint safety, and double-tap jitter tolerance.
5. Verification:
   - Run `npm test`, `npm run typecheck`, and `npm run lint` and verify everything passes cleanly.
