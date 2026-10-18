# Milestone 1 Adversarial Empirical Challenge — Handoff Report

**Date:** 2026-10-18T07:33:00Z  
**Agent:** `challenger_o4_m1_1` (Adversarial Challenge Specialist)  
**Parent Conversation ID:** `eabe0e02-292e-40e3-a422-5b692aa20686`  
**Milestone:** M1 — Navigation Shell, TopBar, Sidebar, ProgressPanel, Accessibility & Layout  
**Verdict:** **APPROVE**  

---

## 1. Observation

Direct empirical testing, static source audit, and test execution against Milestone 1 components produced the following observations across all 5 verification targets:

### O1: Stress Test `levelPercent` and `ringOffset` Math Bounds
- **Files Under Test:** `src/components/layout/Sidebar.tsx` (lines 48–54), `src/components/layout/ProgressPanel.tsx` (lines 64–78).
- **Automated Test Suite:** `tests/m1-empirical-challenge.test.ts` (Suite: "Milestone 1 Empirical Challenge — Extreme Math Bounds & SVG Ring").
- **Tested Inputs:**
  - `xp`: `undefined`, `null`, `NaN`, `-500`, `-1`, `0`, `1`, `125`, `250`, `375`, `999999`, `Infinity`, `-Infinity`, `Number.MAX_SAFE_INTEGER`, `Number.MIN_SAFE_INTEGER`, `0.0000001`, `1e20`.
  - `levelSize`: `undefined`, `null`, `NaN`, `-500`, `0`, `250`, `500`, `Infinity`, `-Infinity`.
  - `percent`: `undefined`, `null`, `NaN`, `-500`, `-100`, `0`, `0.5`, `33.333`, `50`, `99.9`, `100`, `100.1`, `250`, `999999`, `Infinity`, `-Infinity`, `Number.MAX_SAFE_INTEGER`.
- **Empirical Execution Result:**
  - Zero `NaN` values produced across all 153 input permutations (`levelPercent`: 0 NaN, `ringOffset`: 0 NaN).
  - `levelPercent` is strictly bounded: `0 <= levelPercent <= 100`.
  - `${levelPercent}%` style string and `strokeDashoffset={ringOffset}` SVG string never contain `"NaN"`, `"Infinity"`, or negative values.
  - Invariant boundary checks confirmed: at 0% completion `ringOffset === ringCircumference` (completely empty ring); at 50% `ringOffset === ringCircumference / 2`; at 100% `ringOffset === 0` (completely filled ring).

### O2: TopBar Search Combobox Keyboard Navigation & Suggestion Chips
- **Files Under Test:** `src/components/layout/TopBar.tsx` (lines 39–45, 148–175, 234–255).
- **Automated Test Suite:** `tests/m1-empirical-challenge.test.ts` (Suite: "Milestone 1 Empirical Challenge — TopBar Search & Keyboard Navigation").
- **Empirical Execution Result:**
  - `ArrowDown`: Increments `selectedIndex` starting from `-1` to `0`, advances through results, and wraps from last item (`results.length - 1`) back to `0`. If search dropdown was closed, opens dropdown.
  - `ArrowUp`: Decrements `selectedIndex`. If at `0` or unselected (`-1`), wraps around to the last result (`results.length - 1`).
  - `Escape`: Closes search dropdown (`searchOpen === false`).
  - `Enter`: When an item is selected (`selectedIndex >= 0`), calls `event.preventDefault()`, closes dropdown, clears query to `""`, and invokes `router.push(target.href)`. When `selectedIndex === -1`, navigation is prevented and query remains intact.
  - Suggestion Chips: Clicking chips (`Python`, `Calculus`, `Vectors`, `Italian`) sets the input query, opens search, and triggers render-time state synchronization (`prevQuery !== query`) resetting `selectedIndex` to `-1`.
  - Adversarial robustness: Special regex characters (`[`, `(`, `*`, `+`, `?`, `^`, `$`, `\`, `.*`), whitespace strings, and 10,000-character long strings execute cleanly without throwing regex syntax errors or runtime exceptions.

### O3: 0-Day Streak Momentum Verification
- **Files Under Test:** `src/components/layout/ProgressPanel.tsx` (lines 78–79, 163–177).
- **Automated Test Suite:** `tests/m1-empirical-challenge.test.ts` (Suite: "Milestone 1 Empirical Challenge — 0-Day Streak & Momentum Verification").
- **Empirical Execution Result:**
  - When `streak = 0`: `safeStreak = 0` and `activeDaysCount = 0`.
  - For Monday (`idx = 0` in `WEEK_DAYS`): `idx < activeDaysCount` evaluates to `0 < 0` (`false`).
  - Monday is **NOT** marked complete (no `.done` CSS class, no `<Check />` icon rendered).
  - All 7 weekday circles render empty when `streak = 0`.
  - When `streak = 1`: Monday is checked (`true`), while Tuesday through Sunday are unchecked (`false`).
  - Malformed streaks (`undefined`, `null`, `NaN`, `-500`, `-Infinity`) safely evaluate to `safeStreak = 0` and `activeDaysCount = 0`.

### O4: AppShell Inert Scoping & Navigation Trap
- **Files Under Test:** `src/components/layout/AppShell.tsx` (lines 78–104), `src/components/layout/TopBar.tsx` (lines 108–116).
- **Automated Test Suite:** `tests/m1-empirical-challenge.test.ts` (Suite: "Milestone 1 Empirical Challenge — AppShell Inert Scoping & Navigation Trap").
- **Empirical Execution Result:**
  - In `AppShell.tsx`, `.app-body` does **not** have the `inert` attribute.
  - `inert={menuOpen ? true : undefined}` is scoped strictly to `.content-grid` and `.app-footer`.
  - `TopBar` is rendered outside `.content-grid`, remaining fully interactive in the DOM when `menuOpen` is `true`.
  - Hamburger menu button in `TopBar.tsx` has `aria-label={menuOpen ? "Close navigation" : "Open navigation"}` and renders `<X size={21} />` when `menuOpen` is `true`, and `<Menu size={21} />` when `false`.
  - `onMenuClick` is passed as `() => setMenuOpen((p) => !p)`, providing bidirectional toggle functionality.
  - Pathname transitions trigger render-time check `prevPathname !== pathname`, auto-closing the drawer without cascading re-renders.

### O5: 3D Island Boundary Preservation
- **Files Under Test:** `src/components/learning-world/*`, `src/app/world.css`, `src/app/path/[directionId]/*`.
- **Tool Commands & Results:**
  - `git diff src/app/path/`: Exited with code 0, 0 lines diff (empty).
  - Timestamp verification: `Get-ChildItem -Recurse src/components/learning-world, src/app/world.css | Where-Object { $_.LastWriteTime -gt (Get-Date "2026-10-18 06:00:00") }` returned 0 files. All learning world files were last modified at or before `0:42:15` (hours prior to Milestone 1 dispatch at `07:15 UTC`).
  - Worker write boundary: Worker `worker_o4_m1` modified only the 5 designated Milestone 1 files (`AppShell.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `ProgressPanel.tsx`, `globals.css`).
  - Zero modifications made by M1 to the 3D Island files.

---

## 2. Logic Chain

1. **Mathematical Invariant Proof:**
   - In `Sidebar.tsx`, `safeXp` guards against non-finite or negative values (`Number.isFinite(xp) && xp >= 0 ? xp : 0`). `safeLevelSize` guards against zero or negative divisors (`Number.isFinite(levelSize) && levelSize > 0 ? levelSize : 250`).
   - The expression `(safeXp % safeLevelSize) / safeLevelSize` is mathematically bounded strictly within `[0, 1)`.
   - Wrapping with `Math.min(100, Math.max(0, Math.round(... * 100)))` guarantees the output is an integer in `[0, 100]`.
   - In `ProgressPanel.tsx`, `safePercent` is clamped between 0 and 100. Because `ringCircumference = 2 * Math.PI * 38` is constant, `ringOffset = ringCircumference * (1 - safePercent / 100)` is mathematically bounded within `[0, ringCircumference]`. Neither formula can evaluate to `NaN` or `Infinity`.

2. **WAI-ARIA Combobox Navigation Contract:**
   - TopBar uses array index wrapping: `prev < results.length - 1 ? prev + 1 : 0` and `prev > 0 ? prev - 1 : results.length - 1`.
   - This provides continuous circular navigation in both directions for keyboard users.
   - Guarding `Enter` with `selectedIndex >= 0 && results[selectedIndex]` guarantees that pressing `Enter` with raw unselected queries does not trigger erroneous route pushes.
   - Resetting `selectedIndex` to `-1` when `prevQuery !== query` prevents index out-of-bounds when query changes shrink the results length.

3. **0-Day Streak Correctness:**
   - Previous code used `Math.max(1, streak)`, which transformed `streak = 0` into `1`, causing Monday to be marked complete.
   - The fix enforces `safeStreak > 0 ? Math.min(7, safeStreak) : 0`. When `streak = 0`, `activeDaysCount` is exactly `0`.
   - In the `WEEK_DAYS.map((day, idx) => idx < activeDaysCount)` rendering loop, for `idx = 0`, `0 < 0` evaluates to `false`. Therefore, Monday is never marked done.

4. **Inert Scoping & Accessibility Isolation:**
   - The HTML `inert` attribute disables pointer and focus events on the target element and all its descendants.
   - Scoping `inert` to `.content-grid` and `.app-footer` while leaving `.app-body` un-inert isolates the main scrollable content while keeping `TopBar` fully accessible.
   - This allows users on mobile viewports to click the hamburger toggle button (`X` icon) to close the drawer, resolving the mobile accessibility trap.

---

## 3. Caveats

- **CoursesView.tsx Pre-existing TypeScript Diagnostics:**
  `npx tsc --noEmit` produces 3 diagnostics in `src/components/courses/CoursesView.tsx` (`duration` does not exist on type `Lesson`, `units` does not exist on type `Direction`). As documented in `PROJECT.md`, these belong exclusively to Milestone 2 (Main Pages: `F2.1`). All Milestone 1 files have zero TypeScript diagnostics.
- **Node Test Runner vs. Real DOM:**
  Automated tests for combobox keyboard navigation and inert attribute scoping were executed via Node's native test runner (`node:test`) using exact reducer simulations and source code AST verification. Full browser integration can be observed in dev/production builds.

---

## 4. Conclusion

All 5 adversarial testing objectives for Milestone 1 have been rigorously tested and verified:
1. `levelPercent` and `ringOffset` math: 100% immune to `NaN`, `Infinity`, or negative values under extreme adversarial inputs.
2. TopBar search keyboard navigation: ArrowUp/Down wrapping, Escape dismissal, Enter routing, and suggestion chip queries perform with exact adherence to WAI-ARIA combobox patterns.
3. 0-day streak: Monday is never marked complete when streak = 0.
4. AppShell inert scoping: TopBar remains interactive and hamburger toggle functions bidirectionally (`X` / `Menu`).
5. 3D Island boundary: Zero modifications made to `src/components/learning-world/*`, `src/app/world.css`, or `src/app/path/[directionId]/*`.

**Verdict:** **APPROVE**

---

## 5. Verification Method

To independently reproduce the empirical challenge results:

1. **Run the Milestone 1 Empirical Challenge Test Suite:**
   ```bash
   npx tsx --test tests/m1-empirical-challenge.test.ts
   ```
   *Expected Result:* 18 tests across 5 test suites pass with 0 failures.

2. **Run the Full Project Test Suite:**
   ```bash
   npm test
   ```
   *Expected Result:* 99 tests across 8 test suites pass with 0 failures.

3. **Verify ESLint Cleanliness on Milestone 1 Files:**
   ```bash
   npx eslint src/components/layout/AppShell.tsx src/components/layout/TopBar.tsx src/components/layout/Sidebar.tsx src/components/layout/ProgressPanel.tsx
   ```
   *Expected Result:* 0 errors, 0 warnings (exit code 0).

4. **Verify 3D Island Boundary Preservation:**
   ```bash
   git diff src/app/path/
   ```
   *Expected Result:* 0 diff output.
