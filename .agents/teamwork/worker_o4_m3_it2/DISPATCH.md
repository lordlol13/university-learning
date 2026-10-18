## 2026-10-18T08:51:11Z
You are worker_o4_m3_it2, an implementation specialist for Milestone 3 Iteration 2.
Your working directory is:
c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_o4_m3_it2

Read:
1. c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md (specifically ## 2026-10-18T06:55:55Z).
2. c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\challenger_o4_m3_1\handoff.md (contains exact reproduction tests, root causes, and solution code for both defects).
3. c:\Users\Home1\OneDrive\Desktop\university-learning\PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL BOUNDARY CONSTRAINT:
Strictly preserve all 3D Island files:
Do NOT alter src/components/learning-world/*, src/app/world.css, or src/app/path/[directionId]/* in any way.

File Write Boundaries:
- src/lib/plot-math.ts
- tests/plot-math.test.ts

Tasks to Implement:
1. Fix Variable Detection in evaluateCalculatorExpression (src/lib/plot-math.ts:1157):
   - Normalize implicit multiplication before checking for variable presence:
     const normalized = clean.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2");
     const hasX = /\b[xX]\b/.test(normalized);
   - Verify evaluateCalculatorExpression("2X + 1", 3) returns { success: true, result: 7, isFunction: true }.
2. Fix Simpson's Rule Endpoint Quadrature on Algebraic Boundary Singularities (src/lib/plot-math.ts:178-187):
   - In numericalDefiniteIntegral, when fa or fb evaluates to non-finite (vertical asymptote), avoid using a tiny eps = 1e-7 that spikes to thousands and overshoots by 650%. Instead, evaluate fa at a + dir * h (open-quadrature step) and fb at b - dir * h (or safe bounded open step).
   - Test that integrating 1/sqrt(x) over [0, 1] approximates 2.0 (within 5% error), ln(x) over [0, 1] approximates -1.0, and 1/sqrt(1-x^2) over [-1, 1] approximates pi (~3.14).
3. Verification:
   - Run `npx tsx tests/challenge-milestone-3.ts` and verify all tests pass.
   - Run `npm test` and verify 100% tests pass.
   - Run `npm run typecheck` and verify 0 errors.
   - Deliver handoff report to:
     c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_o4_m3_it2\handoff.md
   - Message parent with summary of changes and verification results.
