## 2026-10-18T07:14:24Z

You are worker_o4_m1, an implementation specialist.
Your working directory is:
c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_o4_m1

Read:
1. c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md (specifically ## 2026-10-18T06:55:55Z).
2. c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\explorer_o4_shell\handoff.md (contains exact line-by-line observations, root causes, and recommended code snippets for all 17 bugs).
3. c:\Users\Home1\OneDrive\Desktop\university-learning\PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL BOUNDARY CONSTRAINT:
Strictly preserve all 3D Island files:
Do NOT alter src/components/learning-world/*, src/app/world.css, or src/app/path/[directionId]/* in any way.

File Write Boundaries (you exclusively own these files for Milestone 1):
- src/components/layout/AppShell.tsx
- src/components/layout/TopBar.tsx
- src/components/layout/Sidebar.tsx
- src/components/layout/ProgressPanel.tsx
- src/app/globals.css (navigation shell, sidebar, topbar, search, skip-link, and progress ring classes)

Tasks for Milestone 1:
1. TopBar & AppShell Drawer Trap (Observation O13, O14):
   - Fix inert trap on AppShell so TopBar hamburger button remains operable or handle drawer overlay without breaking hamburger.
   - Make onMenuClick a toggle: () => setMenuOpen((p) => !p).
   - In TopBar, render <X size={21} /> and aria-label="Close navigation" when menuOpen is true; otherwise <Menu size={21} /> and "Open navigation".
   - Close drawer on pathname change in AppShell.
2. TopBar Search & Combobox Accessibility (Observation O1, O4, O17):
   - Add ArrowUp, ArrowDown, and Enter keyboard navigation with selectedIndex.
   - Add WAI-ARIA combobox roles: role="combobox", aria-expanded={searchOpen}, aria-controls="campus-search-results", aria-activedescendant.
   - Fix search-results dropdown width and positioning in globals.css so it does not cause horizontal page overflow on 375px viewports (e.g. max-width: calc(100vw - 32px)).
   - Style suggestion chips (.search-suggestion-chips button) in globals.css with clean pill styling, hover, and focus states.
3. TopBar Profile Pill & Safe Numeric Formatting (Observation O2, O3, O5):
   - Change className="topbar-profile-meta" to "topbar-profile-text" in TopBar.tsx so globals.css typography and @media (max-width: 1250px) display: none take effect.
   - Add nullish coalescing on (xp ?? 0).toLocaleString(), (streak ?? 0), etc. to prevent unhandled TypeError.
   - Add profile pill hover and focus-visible polish.
4. Sidebar Level XP Progress Bar & Class Mismatches (Observation O6, O7, O8, O9):
   - Align class names with globals.css:
     - sidebar-xp-bar -> sidebar-level-track
     - sidebar-xp-text -> sidebar-level-xp
     - sidebar-user-info -> sidebar-user-meta
   - Clamp levelPercent: Math.min(100, Math.max(0, Math.round(((Math.max(0, xp ?? 0) % levelSize) / levelSize) * 100))).
   - Add active route highlighting for lessons: if pathname starts with /lesson/ and lesson matches direction, or keep parent route active.
   - Prevent focus-visible outline clipping on sidebar links.
5. ProgressPanel SVG & Weekly Streak (Observation O10, O11):
   - Fix activeDaysCount: streak > 0 ? Math.min(7, streak) : 0 so Monday is NOT falsely checked on a 0-day streak.
   - Clamp percent (0-100) and guard ringOffset against NaN.
   - Align weekly streak class names with globals.css (.weekly-days-row, .done, .week-day-circle).
6. Accessibility Polish & Sound Toggle (Observation O12, O16):
   - Style .skip-link with high contrast background, border, padding, and visible focus.
   - Surface sound/audio toggle in ProgressPanel (using getSoundPreference/setSoundPreference from island-audio.ts) with accessible button and icon.

Verification:
- Run `npm test` and verify that all test suites pass.
- Write your comprehensive handoff report to:
  c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_o4_m1\handoff.md
- Message parent with summary of changes and verification results.
