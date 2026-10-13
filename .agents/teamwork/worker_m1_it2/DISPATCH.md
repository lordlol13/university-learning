## 2026-09-30T06:08:46Z
You are Worker M1 Iteration 2.
Your working directory is: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_m1_it2
The authoritative user request is in: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md
The project scope document is in: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\orchestrator_1\PROJECT.md
The adversarial challenge report is in: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\challenger_m1_1\handoff.md
The project root is: c:\Users\Home1\OneDrive\Desktop\university-learning

You MUST read c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md first.

Review the challenger's findings in `c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\challenger_m1_1\handoff.md` and `scripts/m1-adversarial-stress.ts`.

Write ownership:
You own and may ONLY edit:
- `src/lib/plot-math.ts`
- `tests/plot-math.test.ts`

Your mission:
Fix the unary negation before exponentiation in `compileCustomExpression`:
1. In `src/lib/plot-math.ts:compileCustomExpression`:
   - When users enter expressions like `-x^2`, `-x^3`, `exp(-x^2 / 2)`, or `-x^2 + 4`, converting `^` to `**` produces `-x**2`, which throws `SyntaxError: Unary operator used immediately before exponentiation expression` in JavaScript.
   - Pre-process or transform unary negation immediately preceding an exponentiation base into valid JavaScript syntax (such as `(-1 * <base>**<exp>)` or `-(<base>**<exp>)`).
   - Ensure expressions like `-x^2`, `-x^3`, `exp(-x^2 / 2)`, `-x^2 + 4`, `-(x)^2`, `-2^x` compile and evaluate mathematically accurately (`-x^2` at `x=3` is `-9`).
2. In `tests/plot-math.test.ts`:
   - Add automated test assertions verifying:
     - `compileCustomExpression("-x^2")` evaluates to `-9` at `x=3`.
     - `compileCustomExpression("-x^3")` evaluates to `-8` at `x=2`.
     - `compileCustomExpression("exp(-x^2 / 2)")` evaluates to `1` at `x=0`.
     - `compileCustomExpression("-x^2 + 4")` evaluates to `3` at `x=1`.
3. Verification:
   - Run `npx tsx scripts/m1-adversarial-stress.ts` (all 116 tests must pass).
   - Run `npm test` (all tests must pass).
   - Run `npm run typecheck` (0 diagnostics).
   - Run `npm run lint` (0 errors/warnings).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Document your changes and verification commands in `c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_m1_it2\handoff.md` and send a completion message to your parent (`aec9b71c-06e7-4409-8e1d-488fecfa0057`).
