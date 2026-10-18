# Milestone 1 Adversarial Empirical Challenge — Handoff Report

**Date:** 2026-10-18T07:35:00Z  
**Agent:** `challenger_o4_m1_2` (Adversarial Challenge Specialist)  
**Parent Conversation ID:** `eabe0e02-292e-40e3-a422-5b692aa20686`  
**Milestone:** M1 — Navigation Shell, TopBar, Sidebar, ProgressPanel, Accessibility & Layout  
**Verdict:** **APPROVE**

---

## 1. Observation

Direct empirical inspection, mathematical modeling, and automated test execution yielded the following observations across the five adversarial verification targets:

### O1: Verification of CSS Class Names in `globals.css` and `Sidebar.tsx` / `TopBar.tsx`
- **`sidebar-level-track`**:
  - `src/app/globals.css` (lines 397–409):
    ```css
    .sidebar-level-track {
      height: 6px;
      border-radius: 999px;
      background: #e2e8f0;
      overflow: hidden;
    }
    .sidebar-level-track > span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #0d9488, #10b981);
      transition: width 0.35s ease;
    }
    ```
  - `src/components/layout/Sidebar.tsx` (line 216):
    ```tsx
    <div
      className="sidebar-level-track"
      role="progressbar"
      aria-valuenow={levelPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Level progress"
    >
      <span style={{ width: `${levelPercent}%` }} />
    </div>
    ```
  - Obsolete `sidebar-xp-bar` is 100% eliminated from `Sidebar.tsx`.

- **`sidebar-level-xp`**:
  - `src/app/globals.css` (lines 391–396):
    ```css
    .sidebar-level-xp {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      font-variant-numeric: tabular-nums;
    }
    ```
  - `src/components/layout/Sidebar.tsx` (line 213):
    ```tsx
    <span className="sidebar-level-xp">{(xp ?? 0).toLocaleString()} XP</span>
    ```
  - Obsolete `sidebar-xp-text` is 100% eliminated from `Sidebar.tsx`.

- **`sidebar-user-meta`**:
  - `src/app/globals.css` (lines 429–449):
    ```css
    .sidebar-user-meta {
      min-width: 0;
      flex: 1;
    }
    .sidebar-user-meta strong { ... }
    .sidebar-user-meta small { ... }
    ```
  - `src/components/layout/Sidebar.tsx` (line 233):
    ```tsx
    <div className="sidebar-user-meta">
      <strong>{learner.name}</strong>
      <small>{university.shortName}</small>
    </div>
    ```
  - Obsolete `sidebar-user-info` is 100% eliminated from `Sidebar.tsx`.

- **`topbar-profile-text`**:
  - `src/app/globals.css` (lines 755–768, 3120–3122):
    ```css
    .topbar-profile-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    /* Responsive rule at line 3120 */
    @media (max-width: 1250px) {
      .topbar-profile-text {
        display: none;
      }
    }
    ```
  - `src/components/layout/TopBar.tsx` (line 304):
    ```tsx
    <span className="topbar-profile-text">
      <strong>{learner.firstName}</strong>
      <small>Level {level ?? 1}</small>
    </span>
    ```
  - Obsolete `topbar-profile-meta` is 100% eliminated from `TopBar.tsx`. Responsive hiding below 1250px correctly hides the text, collapsing the profile pill down to the circular avatar to prevent header overflow.

### O2: Verification of Responsive Layout Widths (375px Viewport)
- **CSS Properties in `src/app/globals.css`** (lines 540–553):
  ```css
  .search-results {
    position: absolute;
    left: 0;
    top: 49px;
    background: #ffffff;
    border: 1px solid var(--line);
    box-shadow: 0 18px 42px -8px rgba(15, 23, 42, 0.16);
    border-radius: 16px;
    padding: 12px;
    min-width: 0;
    width: max(100%, 280px);
    max-width: calc(100vw - 32px);
    z-index: 50;
  }
  ```
- **Mobile Viewport Geometry Model (375px)**:
  - TopBar horizontal padding: `16px` (`padding: 0 16px`).
  - Hamburger toggle button (`.menu-toggle`): `38px` width.
  - Flex gap between button and search wrapper: `10px`.
  - Left anchor position of `.search-wrap`: `16 + 38 + 10 = 64px`.
  - Base dropdown width: `max(100%, 280px)` = `280px`.
  - Maximum allowed width: `calc(100vw - 32px)` = `375 - 32 = 343px`.
  - Computed dropdown width: `Math.min(280, 343) = 280px`.
  - Dropdown right-edge coordinate: `64px + 280px = 344px`.
  - Right margin to viewport boundary: `375px - 344px = 31px`.
  - **Horizontal page overflow**: **`0px`** (strictly fits within viewport with 31px safety buffer).
- Suggestion chips (`.search-suggestion-chips` in `globals.css` lines 633–658) specify `flex-wrap: wrap`, preventing horizontal stretching.

### O3: Verification of Keyboard Accessibility, Contrast Ratios & ARIA Combobox
- **`.skip-link` Contrast Ratios (`src/app/globals.css` lines 1727–1748)**:
  - Default state: `position: fixed; left: 16px; top: -80px; z-index: 1000; background: #ffffff; color: #0f766e; border: 2px solid #0d9488;`.
  - Focus state: `.skip-link:focus, .skip-link:focus-visible { top: 16px; outline: 3px solid #0d9488; outline-offset: 2px; }`.
  - **Text Contrast Ratio**: `#0f766e` on `#ffffff` has a relative luminance ratio of **`5.47:1`**, exceeding the WCAG 2.1 Level AA threshold of `4.5:1`.
  - **Non-Text / Border Contrast Ratio**: `#0d9488` on `#ffffff` has a contrast ratio of **`3.74:1`**, exceeding the WCAG 2.1 Level AA Success Criterion 1.4.11 threshold of `3.0:1`.
- **Focus-Visible Outlines**:
  - Global default (`globals.css` line 103): `:focus-visible { outline: 3px solid #0d9488; }`.
  - Sidebar links (`globals.css` lines 245–249):
    ```css
    .sidebar .nav-item:focus-visible,
    .sidebar .brand:focus-visible,
    .sidebar .sidebar-user-card:focus-visible {
      outline-offset: 1px;
    }
    ```
    This `1px` offset ensures outlines remain visible and are not clipped by the sidebar's `overflow-x: hidden`.
  - Specific focus ring enhancements verified for `.topbar-profile-pill:focus-visible`, `.search-suggestion-chips button:focus-visible`, `.search-results a:focus-visible`, and `.sound-toggle-btn:focus-visible`.
- **WAI-ARIA Combobox 1.2 Specifications (`src/components/layout/TopBar.tsx`)**:
  - Input attributes: `role="combobox"`, `aria-expanded={searchOpen && Boolean(normalized)}`, `aria-haspopup="listbox"`, `aria-autocomplete="list"`, `aria-controls="campus-search-results"`, and `aria-activedescendant={selectedIndex >= 0 && results[selectedIndex] ? "search-item-" + selectedIndex : undefined}`.
  - Dropdown container: `id="campus-search-results"`, `role="listbox"`, `aria-label="Campus search results"`.
  - Result option items: `id="search-item-${index}"`, `role="option"`, `aria-selected={isSelected}`, and dynamic `.active` class.
  - Keyboard handlers: `ArrowDown` (increments and circular wraps), `ArrowUp` (decrements and circular wraps), `Enter` (navigates to `target.href` via `router.push`), and `Escape` (dismisses dropdown).

### O4: Test Suite Execution (`npm test`)
- Command: `npm test`
- Result: **113 tests passed across 11 test suites with 0 failures, 0 skipped, 0 errors** (Duration: 4.05s).
- ESLint verification: `npx eslint src/components/layout/AppShell.tsx src/components/layout/TopBar.tsx src/components/layout/Sidebar.tsx src/components/layout/ProgressPanel.tsx` passed with **0 errors and 0 warnings**.
- TypeScript layout verification: Zero diagnostics in `src/components/layout/*` and `src/app/globals.css`.

### O5: 3D Island Files Boundary Verification
- Git diff inspection:
  - `git diff src/app/path/`: Completely clean (**0 lines diff**).
  - Learning World timestamps: All files in `src/components/learning-world/*` and `src/app/world.css` show `LastWriteTime` between `0:18` and `0:42` (prior to the Milestone 1 audit dispatch at 06:55:55Z).
  - Worker write audit: `worker_o4_m1` modified strictly the 5 Milestone 1 files (`AppShell.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `ProgressPanel.tsx`, `globals.css`).
  - No 3D Island files or world canvas assets were modified during Milestone 1.

---

## 2. Logic Chain

1. **Visual State Harmonization:**
   - Previous class mismatches (`sidebar-xp-bar`, `sidebar-xp-text`, `sidebar-user-info`, `topbar-profile-meta`) resulted in missing CSS rules, unstyled text, and invisible progress bars.
   - Synchronizing class names between TSX and `globals.css` directly restores the 6px track height, gradient fill, typography, and responsive hiding at 1250px.
2. **Horizontal Overflow Elimination at 375px:**
   - On a 375px mobile device, an unconstrained `min-width: 300px` at offset X=64px forces the right boundary to X=364px + padding > 375px, creating a horizontal scrollbar.
   - Constraining `.search-results` with `min-width: 0; width: max(100%, 280px); max-width: calc(100vw - 32px);` guarantees that the right edge is bounded at 344px (31px before the viewport margin). Hence, horizontal overflow is mathematically 0px.
3. **WCAG 2.1 Accessibility Conformance:**
   - The skip-link uses `#0f766e` on `#ffffff`, which produces a contrast ratio of `5.47:1`, exceeding the 4.5:1 requirement for normal text under WCAG 2.1 AA.
   - Focus outline offset of `1px` inside `.sidebar` prevents outline clipping caused by `overflow-x: hidden`.
   - The TopBar search implements the WAI-ARIA 1.2 Combobox pattern with keyboard event handling and state synchronization, guaranteeing screen-reader accessibility and keyboard-only navigation.
4. **Test Suite Integrity:**
   - Two adversarial test suites (`tests/m1-empirical-challenge.test.ts` and `tests/m1-layout-integrity.test.ts`) independently verify math invariants, combobox navigation, streak calculation, inert boundary scoping, contrast ratios, and responsive widths.
   - All 113 automated tests run and pass cleanly.

---

## 3. Caveats

- **Pre-existing TypeScript Diagnostics in `CoursesView.tsx`:**
  `npx tsc --noEmit` reports 3 errors in `src/components/courses/CoursesView.tsx` (`duration` does not exist on type `Lesson`, `units` does not exist on type `Direction`). These belong exclusively to Milestone 2 (`F2.1`) and do not affect Milestone 1 layout components.
- **Pre-existing 3D Island Git Diff:**
  `git diff --name-only` includes `src/components/learning-world/LearningWorld.tsx`, `WorldCanvas.tsx`, and `world.css`. As proven by file modification timestamps, these uncommitted changes were made during the overnight diorama port before Milestone 1 began. Milestone 1 did not modify any 3D Island files.

---

## 4. Conclusion

All five Milestone 1 adversarial testing objectives have been verified through direct empirical observation and automated testing:
1. CSS class names in `globals.css` match `Sidebar.tsx` and `TopBar.tsx` verbatim (`sidebar-level-track`, `sidebar-level-xp`, `sidebar-user-meta`, `topbar-profile-text`), and deprecated classes have been removed.
2. Responsive layout widths ensure exactly 0px horizontal page overflow at 375px viewport.
3. Keyboard accessibility is fully compliant: `.skip-link` contrast ratio is 5.47:1 (exceeding WCAG AA 4.5:1), focus outlines avoid clipping, and TopBar implements complete WAI-ARIA 1.2 Combobox attributes.
4. Test suite (`npm test`) passes 100% of all 113 automated tests across 11 test suites.
5. 3D Island files were strictly untouched by Milestone 1.

**Verdict:** **APPROVE**

---

## 5. Verification Method

To independently verify these empirical results:

1. **Execute the Layout Integrity Test Suite:**
   ```bash
   npx tsx --test tests/m1-layout-integrity.test.ts
   ```
   *Expected Result:* 14 tests across 3 suites pass with exit code 0.

2. **Execute Full Test Suite:**
   ```bash
   npm test
   ```
   *Expected Result:* 113 tests across 11 suites pass with exit code 0.

3. **Verify ESLint on Milestone 1 Files:**
   ```bash
   npx eslint src/components/layout/AppShell.tsx src/components/layout/TopBar.tsx src/components/layout/Sidebar.tsx src/components/layout/ProgressPanel.tsx
   ```
   *Expected Result:* 0 errors, 0 warnings (exit code 0).

4. **Verify Milestone 1 Path Preservation:**
   ```bash
   git diff src/app/path/
   ```
   *Expected Result:* 0 lines of diff output.
