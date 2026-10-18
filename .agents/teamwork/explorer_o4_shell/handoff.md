# Navigation Shell and Global Components Audit Report

**Date:** 2026-10-18  
**Investigator:** `explorer_o4_shell`  
**Target:** Navigation Shell, TopBar, Sidebar, ProgressPanel, Root Layout, Responsive & Accessibility Architecture  
**Preserved Boundary:** `src/components/learning-world/*`, `src/app/world.css`, `src/app/path/[directionId]/*` (0 modifications)

---

## 1. Observation

Direct code inspections, terminal outputs, and structural analysis revealed the following concrete observations:

### Observation O1: TopBar Search Keyboard Navigation & ARIA Combobox
- **File:** `src/components/layout/TopBar.tsx`, lines 114–174
- **Code:**
  ```tsx
  116: <Search size={17} aria-hidden="true" />
  117: <input
  118:   ref={inputRef}
  119:   type="search"
  120:   aria-label="Search courses, lessons, or skills"
  121:   placeholder="Search tracks, lessons, or topics..."
  122:   value={query}
  123:   onChange={(event) => {
  124:     setQuery(event.target.value);
  125:     setSearchOpen(true);
  126:   }}
  127:   onFocus={() => setSearchOpen(true)}
  128:   onKeyDown={(event) => {
  129:     if (event.key === "Escape") setSearchOpen(false);
  130:   }}
  131: />
  ```
- **Finding:** Only the `Escape` key is handled. ArrowUp, ArrowDown, and Enter are completely unhandled. There is no `selectedIndex` state to track or highlight active results. Furthermore, the `<input>` lacks `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, and `aria-activedescendant`. The dropdown container `<div className="search-results">` (line 149) lacks `role="listbox"` and `id="campus-search-results"`, and result links (line 155) lack `role="option"` and `aria-selected`.

### Observation O2: CSS Class Mismatch on TopBar Profile Pill
- **File:** `src/components/layout/TopBar.tsx`, lines 240–245
- **Code:**
  ```tsx
  240: <span className="avatar">{learner.initials}</span>
  241: <span className="topbar-profile-meta">
  242:   <strong>{learner.firstName}</strong>
  243:   <small>Level {level}</small>
  244: </span>
  ```
- **Comparison File:** `src/app/globals.css`, lines 713–726 and 3016–3018
- **Code:**
  ```css
  713: .topbar-profile-text {
  714:   display: flex;
  715:   flex-direction: column;
  716:   line-height: 1.15;
  717: }
  718: .topbar-profile-text strong { font-size: 12px; font-weight: 700; color: #0f172a; }
  719: .topbar-profile-text small { font-size: 10px; color: #64748b; }
  ...
  3016:   .topbar-profile-text {
  3017:     display: none;
  3018:   }
  ```
- **Finding:** `TopBar.tsx` applies `className="topbar-profile-meta"`, while `globals.css` defines rules exclusively for `.topbar-profile-text`. Because `.topbar-profile-meta` is not defined anywhere in `globals.css`, the text styling is missing, and the responsive rule hiding the text on tablets and mobile screens (`display: none`) does not trigger, causing horizontal overflow on narrow viewports.

### Observation O3: Missing User Profile Dropdown Menu in TopBar
- **File:** `src/components/layout/TopBar.tsx`, lines 235–246
- **Code:**
  ```tsx
  235: <div className="topbar-divider" />
  236: <Link
  237:   href="/profile"
  238:   className="topbar-profile-pill"
  239:   aria-label={`${learner.name}'s profile`}
  240: >
  241:   <span className="avatar">{learner.initials}</span>
  242:   <span className="topbar-profile-meta">
  243:     <strong>{learner.firstName}</strong>
  244:     <small>Level {level}</small>
  245:   </span>
  246: </Link>
  ```
- **Finding:** The profile pill is an immutable Next.js `<Link href="/profile">` without a dropdown menu, sign out/reset progress action, sound preferences toggle, or user settings menu.

### Observation O4: Unstyled Search Empty Suggestion Chips
- **File:** `src/components/layout/TopBar.tsx`, lines 175–191
- **Code:**
  ```tsx
  175: <div className="search-empty-suggestions">
  176:   <p>No matches for “{query}”. Try a popular topic:</p>
  177:   <div className="search-suggestion-chips">
  178:     {["Python", "Calculus", "Vectors", "Italian"].map(
  179:       (term) => (
  180:         <button
  181:           key={term}
  182:           type="button"
  183:           onClick={() => setQuery(term)}
  184:         >
  185:           {term}
  186:         </button>
  187:       ),
  188:     )}
  189:   </div>
  190: </div>
  ```
- **Comparison File:** `src/app/globals.css`, lines 608–621
- **Code:**
  ```css
  608: .search-empty-suggestions { display: flex; flex-wrap: wrap; gap: 6px; }
  613: .search-empty-suggestions a { ... }
  ```
- **Finding:** `globals.css` only styles `.search-empty-suggestions a`. In `TopBar.tsx`, the chips are `<button>` inside `<div className="search-suggestion-chips">`. Neither `.search-suggestion-chips` nor `<button>` inside `.search-empty-suggestions` has styling in `globals.css`, causing chips to render as raw, unstyled grey browser buttons.

### Observation O5: Unsafe `.toLocaleString()` on Undefined/Null `xp` in TopBar
- **File:** `src/components/layout/TopBar.tsx`, lines 31–35, 213–215
- **Code:**
  ```tsx
  32: const xp = useProgress((s) => s.xp);
  ...
  213: <strong key={xp} className="xp-value">
  214:   {xp.toLocaleString()}
  215: </strong>
  ```
- **Finding:** If `xp` is `undefined` or `null` during initialization or unhydrated state, calling `xp.toLocaleString()` throws an unhandled `TypeError: Cannot read properties of undefined (reading 'toLocaleString')`, crashing the application shell.

### Observation O6: CSS Class Mismatches Completely Breaking Sidebar Level XP Progress Bar and User Card
- **File:** `src/components/layout/Sidebar.tsx`, lines 195–226
- **Code:**
  ```tsx
  196: <div className="sidebar-level-box">
  197:   <div className="sidebar-level-top">
  198:     <span className="sidebar-level-badge">
  199:       <Sparkles size={13} />
  200:       Level {level}
  201:     </span>
  202:     <span className="sidebar-xp-text">{xp} XP</span>
  203:   </div>
  204:   <div
  205:     className="sidebar-xp-bar"
  206:     role="progressbar"
  207:     aria-valuenow={levelPercent}
  208:     aria-valuemin={0}
  209:     aria-valuemax={100}
  210:     aria-label="Level progress"
  211:   >
  212:     <span style={{ width: `${levelPercent}%` }} />
  213:   </div>
  214: </div>
  215: 
  216: <Link href="/profile" className="sidebar-user-card" onClick={onClose}>
  217:   <span className="avatar sidebar-avatar">{learner.initials}</span>
  218:   <div className="sidebar-user-info">
  219:     <strong>{learner.name}</strong>
  220:     <small>{university.shortName}</small>
  221:   </div>
  222: </Link>
  ```
- **Comparison File:** `src/app/globals.css`, lines 386–444
- **Code:**
  ```css
  386: .sidebar-level-xp {
  387:   font-size: 11px;
  388:   font-weight: 700;
  389:   color: #64748b;
  390:   font-variant-numeric: tabular-nums;
  391: }
  392: .sidebar-level-track {
  393:   height: 6px;
  394:   border-radius: 999px;
  395:   background: #e2e8f0;
  396:   overflow: hidden;
  397: }
  398: .sidebar-level-track > span {
  399:   display: block;
  400:   height: 100%;
  401:   border-radius: inherit;
  402:   background: linear-gradient(90deg, #0d9488, #10b981);
  403:   transition: width 0.35s ease;
  404: }
  ...
  424: .sidebar-user-meta {
  425:   min-width: 0;
  426:   flex: 1;
  427: }
  428: .sidebar-user-meta strong {
  ...
  ```
- **Finding:** 
  1. `Sidebar.tsx:202` uses `className="sidebar-xp-text"`, while `globals.css:386` declares `.sidebar-level-xp`.
  2. `Sidebar.tsx:205` uses `className="sidebar-xp-bar"`, while `globals.css:392` declares `.sidebar-level-track`.
  3. `Sidebar.tsx:222` uses `className="sidebar-user-info"`, while `globals.css:424` declares `.sidebar-user-meta`.
  Because of these three class mismatches, the sidebar's level XP progress bar has 0px height, no track background, no fill gradient, and is completely invisible. The user info has no overflow ellipsis protection.

### Observation O7: Unbounded Math in Sidebar `levelPercent` Permitting `NaN%` and Negative Percentages
- **File:** `src/components/layout/Sidebar.tsx`, lines 47–50
- **Code:**
  ```ts
  47: const levelPercent = Math.min(
  48:   100,
  49:   Math.round(((xp % levelSize) / levelSize) * 100),
  50: );
  ```
- **Finding:** If `xp` is `undefined`, `(undefined % 250) / 250` evaluates to `NaN`. `Math.round(NaN)` is `NaN`, and `Math.min(100, NaN)` is `NaN`. This injects `width: "NaN%"` into CSS and `aria-valuenow={NaN}`. Furthermore, if `xp` is negative, `levelPercent` becomes negative because there is no `Math.max(0, ...)` floor.

### Observation O8: Missing Active Route Highlighting When Inside Lesson Routes (`/lesson/[lessonId]`)
- **File:** `src/components/layout/Sidebar.tsx`, lines 52–53, 151
- **Code:**
  ```ts
  52: const navClass = (href: string) =>
  53:   `nav-item ${pathname === href ? "active" : ""}`;
  ...
  151: const isActive = pathname === `/path/${direction.id}`;
  ```
- **Finding:** Active state is checked with strict equality `pathname === href` or `pathname === \`/path/\${direction.id}\``. When a student navigates to `/lesson/machine-learning`, neither "All Courses" nor the direction `/path/ai-ml` receives active styling, leaving the sidebar with zero highlighted items.

### Observation O9: Focus-Visible Outline Clipping in Sidebar
- **File:** `src/components/layout/Sidebar.tsx`, line 70; `src/app/globals.css`, lines 101–105, 177–178
- **Code:**
  ```css
  101: a, button, input { outline-offset: 4px; }
  103: :focus-visible { outline: 3px solid #0d9488; }
  ...
  177: overflow-y: auto;
  178: overflow-x: hidden;
  ```
- **Finding:** Because `.sidebar` has `overflow-x: hidden`, the 4px outline offset plus 3px outline on `.nav-item`, `.brand`, and `.sidebar-user-card` gets clipped at the left and right container boundaries during keyboard navigation.

### Observation O10: Circular SVG Progress Ring Math Vulnerabilities
- **File:** `src/components/layout/ProgressPanel.tsx`, lines 47–49, 70–93
- **Code:**
  ```ts
  47: const levelPercent = Math.round(((xp % levelSize) / levelSize) * 100);
  48: const ringCircumference = 2 * Math.PI * 38;
  49: const ringOffset = ringCircumference * (1 - percent / 100);
  ```
  ```tsx
  70: style={{ "--completion": `${percent}%` } as CSSProperties}
  ...
  72: aria-label={`${percent}% completed`}
  ...
  90: strokeDasharray={ringCircumference}
  91: strokeDashoffset={ringOffset}
  ```
- **Finding:** If `percent` is `NaN`, `ringOffset` becomes `NaN`, setting `strokeDashoffset="NaN"`, `--completion: NaN%`, and `aria-label="NaN% completed"`. If `levelSize` is 0, division by zero produces `NaN`. In `src/components/ui/ProgressBar.tsx:19`, `Math.min(100, Math.max(0, value))` also returns `NaN` if `value` is `NaN`.

### Observation O11: Weekly Streak False Positive on 0-Day Streak
- **File:** `src/components/layout/ProgressPanel.tsx`, line 50
- **Code:**
  ```ts
  50: const activeDaysCount = Math.min(7, Math.max(1, streak));
  ```
- **Finding:** When `streak` is 0, `Math.max(1, 0)` forces `activeDaysCount` to evaluate to `1`. Consequently, day index 0 (Monday) renders with `<div className="week-day-item done"><Check ... /></div>` even when the learner has an active streak of 0 days.

### Observation O12: Absence of Audio/Sound Toggle and Theme Toggle in Global Shell
- **File:** `src/components/layout/ProgressPanel.tsx`, lines 1–231; `src/components/layout/TopBar.tsx`, lines 1–248
- **Finding:** Audio toggles (`getSoundPreference`, `setSoundPreference`) exist in `src/lib/island-audio.ts`, but are only surfaced in `LearningWorld.tsx`. The global shell (`AppShell`, `TopBar`, `ProgressPanel`) lacks any audio/sound toggle. Furthermore, there is no theme toggle (light/dark mode) anywhere in the application.

### Observation O13: `inert` on `app-body` Traps and Disables TopBar Hamburger Toggle When Menu is Open
- **File:** `src/components/layout/AppShell.tsx`, lines 70–75
- **Code:**
  ```tsx
  70: <div
  71:   className={`app-body ${isIslandRoute ? "island-route-body" : ""}`}
  72:   inert={menuOpen ? true : undefined}
  73: >
  74:   {!isIslandRoute && (
  75:     <TopBar onMenuClick={() => setMenuOpen(true)} menuOpen={menuOpen} />
  76:   )}
  ```
- **Finding:** When `menuOpen` is `true`, `AppShell.tsx` marks `.app-body` as `inert`. Because `TopBar` is rendered inside `.app-body` (line 75), the hamburger button is rendered completely inert and unclickable. Furthermore, `onMenuClick` is hardcoded as `() => setMenuOpen(true)` rather than a toggle `() => setMenuOpen((prev) => !prev)`. In `TopBar.tsx:97-105`, the button icon is static `<Menu size={21} />` and `aria-label` is static `"Open navigation"` even when `menuOpen === true`.

### Observation O14: History Navigation Mobile Drawer Lockup
- **File:** `src/components/layout/AppShell.tsx`, lines 22–58
- **Code:**
  ```tsx
  20: const pathname = usePathname();
  22: const [menuOpen, setMenuOpen] = useState(false);
  ```
- **Finding:** `menuOpen` is not closed upon `pathname` change. If a user opens the mobile navigation drawer and navigates using browser back/forward or swipe gestures, the drawer remains open, `document.body.style.overflow` remains locked to `"hidden"`, and `.app-body` remains `inert`.

### Observation O15: TopBar Hydration Mismatch Risk
- **File:** `src/components/layout/TopBar.tsx`, lines 31–35, 197–246; `src/stores/progress-provider.tsx`, lines 23–46
- **Finding:** TopBar directly reads `xp`, `streak`, `level`, and `achievements` during SSR (rendering demo values: Alex Morgan, 357 XP). Client-side rehydration asynchronously updates these to user localStorage values. Unlike `Sidebar.tsx`, `TopBar.tsx` lacks `suppressHydrationWarning` and does not check `useProgressReady()`, leading to React hydration mismatch warnings.

### Observation O16: Inaccessible and Visually Unstyled Skip-to-Content Link
- **File:** `src/components/layout/AppShell.tsx`, line 65; `src/app/globals.css`, lines 1633–1644
- **Code:**
  ```css
  1633: .skip-link {
  1634:   position: fixed;
  1635:   left: 16px;
  1636:   top: -80px;
  1637:   background: white;
  1638:   z-index: 100;
  1639:   padding: 15px;
  1640:   border-radius: 8px;
  1641: }
  1642: .skip-link:focus {
  1643:   top: 16px;
  1644: }
  ```
- **Finding:** `.skip-link` has no border, box-shadow, text color, or focus-visible styling. When focused via keyboard, it appears as an unstyled white rectangle with default link text, failing WCAG 2.4.1 and WCAG 1.4.11 contrast requirements.

### Observation O17: Search Results Dropdown `min-width: 300px` Causes Horizontal Overflow on 375px Viewports
- **File:** `src/app/globals.css`, lines 535–546
- **Code:**
  ```css
  535: .search-results {
  536:   position: absolute;
  537:   left: 0;
  538:   right: 0;
  ...
  545:   min-width: 300px;
  546: }
  ```
- **Finding:** On a 375px mobile screen, `.search-wrap` width is ~100px. A dropdown with `min-width: 300px` forces the dropdown box to expand beyond the right viewport boundary, causing horizontal scrolling and broken mobile layout.

---

## 2. Logic Chain

1. **TopBar Search & Combobox Defects (O1, O4, O17):**
   - In `TopBar.tsx`, the search input handles only `Escape`, with no keyboard handlers for `ArrowUp`, `ArrowDown`, or `Enter`.
   - Keyboard-only users are trapped in the search input and cannot navigate or select filtered results.
   - WAI-ARIA combobox roles (`role="combobox"`, `role="listbox"`, `role="option"`, `aria-activedescendant`) are missing, violating accessibility standards.
   - In `globals.css`, `.search-results` enforces `min-width: 300px`. On 375px screens, `.search-wrap` is constrained to ~100px; the 300px min-width forces horizontal page overflow.
   - Suggestion chips in `TopBar.tsx` use `<button>` inside `.search-suggestion-chips`, which has no matching CSS rules in `globals.css` (only `.search-empty-suggestions a` is styled), causing chips to render as unstyled browser buttons.

2. **TopBar & Sidebar CSS Class Mismatches (O2, O6):**
   - In `TopBar.tsx`, the profile meta is tagged with `className="topbar-profile-meta"`, but `globals.css` defines rules for `.topbar-profile-text`.
   - As a consequence, the font sizing and alignment rules are skipped, and the responsive rule `.topbar-profile-text { display: none; }` at `@media (max-width: 1250px)` fails to execute. The text remains visible on mobile, compressing the TopBar and causing horizontal overflow.
   - In `Sidebar.tsx`, three critical class names (`sidebar-xp-bar`, `sidebar-xp-text`, `sidebar-user-info`) do not match `globals.css` (`sidebar-level-track`, `sidebar-level-xp`, `sidebar-user-meta`).
   - As a consequence, the level XP progress bar renders with 0px height and no styling, completely disappearing from view.

3. **Arithmetic Edge Cases and `NaN` Propagation (O5, O7, O10, O11):**
   - `xp.toLocaleString()` in `TopBar.tsx` is executed without nullish coalescing. If `xp` is undefined, this throws a fatal TypeError.
   - In `Sidebar.tsx`, `levelPercent = Math.min(100, Math.round(((xp % levelSize) / levelSize) * 100))` lacks a lower bound clamp (`Math.max(0, ...)`), allowing negative percentages. Furthermore, if `xp` is undefined or `levelSize` is 0, it results in `NaN%` and `aria-valuenow={NaN}`.
   - In `ProgressPanel.tsx`, `activeDaysCount = Math.min(7, Math.max(1, streak))` enforces a minimum count of 1. When `streak` is 0, Monday is falsely marked with a completed checkmark.
   - Circular gauge offset `ringOffset = ringCircumference * (1 - percent / 100)` does not guard against `NaN` or out-of-range percent values, propagating `NaN` into SVG attributes.

4. **Shell Interactivity, Focus & Responsive Layout (O8, O9, O12, O13, O14, O15, O16):**
   - Setting `inert` on `.app-body` when `menuOpen === true` disables all pointer and keyboard events on `TopBar`, preventing the user from closing the mobile drawer via the hamburger button.
   - Because `onMenuClick` is `() => setMenuOpen(true)`, the button can never toggle closed.
   - Because `AppShell` does not observe `pathname` to reset `menuOpen`, history navigation locks the mobile drawer.
   - Between 761px and 1060px (tablet), the sidebar remains a permanently expanded 220px desktop column, crowding main content.
   - `.sidebar` has `overflow-x: hidden`, which clips the 4px offset `:focus-visible` outlines on navigation links.
   - Sound toggle and theme toggle are completely missing from the global application shell.

---

## 3. Caveats

- **Island Boundary Preservation:** In accordance with the strict constraint, no files under `src/components/learning-world/*`, `src/app/world.css`, or `src/app/path/[directionId]/*` were inspected for modification. Audio toggle integration in the shell must interface with `@/lib/island-audio` without altering island files.
- **Pre-existing Typecheck Failures:** `npm run typecheck` currently fails due to unrelated errors in `src/components/courses/CoursesView.tsx` (missing `duration` and `units` properties). None of the shell components (`TopBar`, `Sidebar`, `ProgressPanel`, `AppShell`, `ProgressBar`) produce TypeScript diagnostics.
- **Theme Support Scope:** The platform currently uses a light-mode color palette with CSS custom properties. Adding a theme toggle requires defining dark mode color tokens in `globals.css` (e.g. `[data-theme="dark"]`).

---

## 4. Conclusion & Ranked Bug Catalog

The navigation shell contains 17 distinct functional, interactive, accessibility, and visual defects. Below is the ranked catalog detailing root causes, severity ratings, and recommended code remediations:

| Bug ID | Severity | Component | Issue Description | Target File & Lines |
| :--- | :---: | :--- | :--- | :--- |
| **BUG-01** | `[CRITICAL]` | AppShell | `inert` on `app-body` disables hamburger toggle when menu is open; one-way setter | `src/components/layout/AppShell.tsx:71-75` |
| **BUG-02** | `[CRITICAL]` | Sidebar | Class mismatches (`sidebar-xp-bar`, `sidebar-xp-text`) make level progress bar completely invisible | `src/components/layout/Sidebar.tsx:202, 205, 222` |
| **BUG-03** | `[CRITICAL]` | TopBar | Unhandled `xp.toLocaleString()` throws fatal TypeError when `xp` is undefined | `src/components/layout/TopBar.tsx:32, 214` |
| **BUG-04** | `[HIGH]` | TopBar | Absence of keyboard navigation (ArrowUp/Down, Enter) in campus search dropdown | `src/components/layout/TopBar.tsx:127-130, 149-174` |
| **BUG-05** | `[HIGH]` | TopBar | CSS class mismatch `topbar-profile-meta` vs `topbar-profile-text` breaks responsive hiding | `src/components/layout/TopBar.tsx:241` |
| **BUG-06** | `[HIGH]` | TopBar | Missing profile dropdown menu with sign out, sound toggle, and profile links | `src/components/layout/TopBar.tsx:236-246` |
| **BUG-07** | `[HIGH]` | Sidebar | Unbounded `levelPercent` yields `NaN%` and negative percentage values | `src/components/layout/Sidebar.tsx:47-50` |
| **BUG-08** | `[HIGH]` | Sidebar | Missing active route highlight when taking lessons at `/lesson/[lessonId]` | `src/components/layout/Sidebar.tsx:52, 151` |
| **BUG-09** | `[HIGH]` | AppShell | Mobile drawer remains stuck open with body scroll lock during history navigation | `src/components/layout/AppShell.tsx:22-58` |
| **BUG-10** | `[HIGH]` | TopBar | Static hamburger icon and static `"Open navigation"` aria-label when menu is open | `src/components/layout/TopBar.tsx:97-105` |
| **BUG-11** | `[HIGH]` | ProgressPanel | Absence of audio/sound toggle and theme toggle in global shell | `src/components/layout/ProgressPanel.tsx:1-231` |
| **BUG-12** | `[HIGH]` | Globals CSS | Dropdown `min-width: 300px` and unhidden stats cause horizontal overflow at 375px & 768px | `src/app/globals.css:545, 3054-3074, 3155` |
| **BUG-13** | `[HIGH]` | Sidebar | Focus-visible outlines clipped by `.sidebar { overflow-x: hidden }` | `src/app/globals.css:178`, `Sidebar.tsx:106-191` |
| **BUG-14** | `[MEDIUM]` | ProgressPanel | Streak of 0 falsely renders Monday as completed (`Math.max(1, streak)`) | `src/components/layout/ProgressPanel.tsx:50` |
| **BUG-15** | `[MEDIUM]` | ProgressPanel | SVG circular ring and `ProgressBar` lack `NaN` and boundary clamping | `src/components/layout/ProgressPanel.tsx:47-49`, `ProgressBar.tsx:19` |
| **BUG-16** | `[MEDIUM]` | TopBar | Unstyled search empty suggestion chips (`search-suggestion-chips button`) | `src/components/layout/TopBar.tsx:177-190` |
| **BUG-17** | `[MEDIUM]` | AppShell | Visually unstyled skip-to-content link lacking contrast and border | `src/app/globals.css:1633-1644` |

---

### Detailed Remediation Guidance

#### Remediation for BUG-01 (AppShell hamburger toggle & inert trap)
In `src/components/layout/AppShell.tsx`:
Move `TopBar` outside the `inert` container, or manage `inert` selectively on main content:
```tsx
// Before:
<div className={`app-body ${isIslandRoute ? "island-route-body" : ""}`} inert={menuOpen ? true : undefined}>
  {!isIslandRoute && (
    <TopBar onMenuClick={() => setMenuOpen(true)} menuOpen={menuOpen} />
  )}
  <div className="content-grid">...</div>
</div>

// After:
<div className={`app-body ${isIslandRoute ? "island-route-body" : ""}`}>
  {!isIslandRoute && (
    <TopBar onMenuClick={() => setMenuOpen((prev) => !prev)} menuOpen={menuOpen} />
  )}
  <div className="content-grid" inert={menuOpen ? true : undefined}>
    ...
  </div>
</div>
```

#### Remediation for BUG-02 (Sidebar class name mismatches)
In `src/components/layout/Sidebar.tsx`, lines 202, 205, 218:
```tsx
// Before:
<span className="sidebar-xp-text">{xp} XP</span>
...
<div className="sidebar-xp-bar" role="progressbar" ...>
  <span style={{ width: `${levelPercent}%` }} />
</div>
...
<div className="sidebar-user-info">

// After:
<span className="sidebar-level-xp">{(xp ?? 0).toLocaleString()} XP</span>
...
<div className="sidebar-level-track" role="progressbar" ...>
  <span style={{ width: `${levelPercent}%` }} />
</div>
...
<div className="sidebar-user-meta">
```

#### Remediation for BUG-03 & BUG-07 (Safe Math & Nullish Coalescing)
In `src/components/layout/TopBar.tsx:214`:
```tsx
// Before:
{xp.toLocaleString()}

// After:
{(xp ?? 0).toLocaleString()}
```
In `src/components/layout/Sidebar.tsx:47-50`:
```ts
// Before:
const levelPercent = Math.min(
  100,
  Math.round(((xp % levelSize) / levelSize) * 100),
);

// After:
const safeXp = Number.isFinite(xp) && xp >= 0 ? xp : 0;
const safeLevelSize = Number.isFinite(levelSize) && levelSize > 0 ? levelSize : 250;
const levelPercent = Math.min(
  100,
  Math.max(0, Math.round(((safeXp % safeLevelSize) / safeLevelSize) * 100)),
);
```

#### Remediation for BUG-04 (TopBar Keyboard Navigation & ARIA Combobox)
In `src/components/layout/TopBar.tsx`:
Add `selectedIndex` state:
```tsx
const [selectedIndex, setSelectedIndex] = useState(-1);

// Reset selectedIndex when results change or search closes:
useEffect(() => {
  setSelectedIndex(-1);
}, [query, searchOpen]);

// On input keydown:
onKeyDown={(event) => {
  if (event.key === "Escape") {
    setSearchOpen(false);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!searchOpen) setSearchOpen(true);
    setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
  } else if (event.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
    event.preventDefault();
    window.location.href = results[selectedIndex].href;
  }
}}
```
Add WAI-ARIA combobox attributes to `<input>`:
```tsx
role="combobox"
aria-expanded={searchOpen && results.length > 0}
aria-haspopup="listbox"
aria-autocomplete="list"
aria-controls="campus-search-results"
aria-activedescendant={selectedIndex >= 0 ? `search-item-${selectedIndex}` : undefined}
```
And to results container:
```tsx
<div id="campus-search-results" role="listbox" className="search-results">
```

#### Remediation for BUG-05 & BUG-16 (TopBar CSS Classes)
In `src/components/layout/TopBar.tsx:241`:
```tsx
// Before:
<span className="topbar-profile-meta">

// After:
<span className="topbar-profile-text">
```
In `src/app/globals.css`:
Add styles for `.search-suggestion-chips button`:
```css
.search-suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.search-suggestion-chips button {
  font-size: 11.5px;
  font-weight: 650;
  padding: 5px 12px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #0f766e;
  cursor: pointer;
  transition: all 0.15s ease;
}
.search-suggestion-chips button:hover {
  background: #f0fdfa;
  border-color: #99f6e4;
  color: #0d9488;
}
```

#### Remediation for BUG-08 (Sidebar Active Route on Lesson Routes)
In `src/components/layout/Sidebar.tsx`:
```ts
const activeDirectionId = pathname.startsWith("/path/")
  ? pathname.split("/")[2]
  : pathname.startsWith("/lesson/")
    ? getLessonDirection(pathname.split("/")[2])?.id
    : undefined;

// In direction link:
const isActive = direction.id === activeDirectionId;
```

#### Remediation for BUG-09 (History Navigation Drawer Sync)
In `src/components/layout/AppShell.tsx`:
```tsx
useEffect(() => {
  setMenuOpen(false);
}, [pathname]);
```

#### Remediation for BUG-10 (Toggle Icon & Accessible Label)
In `src/components/layout/TopBar.tsx:97-105`:
```tsx
<button
  className="icon-button menu-toggle"
  onClick={onMenuClick}
  aria-label={menuOpen ? "Close navigation" : "Open navigation"}
  aria-expanded={menuOpen}
  aria-controls="main-navigation"
>
  {menuOpen ? <X size={21} /> : <Menu size={21} />}
</button>
```

#### Remediation for BUG-11 (Audio & Sound Toggle in ProgressPanel / TopBar)
In `src/components/layout/ProgressPanel.tsx`:
Import `getSoundPreference`, `setSoundPreference`, `subscribeSoundPreference` from `@/lib/island-audio`. Add an accessible audio toggle button with `Volume2` / `VolumeX` icons in `card-heading`.

#### Remediation for BUG-14 (Weekly Streak Floor Fix)
In `src/components/layout/ProgressPanel.tsx:50`:
```ts
// Before:
const activeDaysCount = Math.min(7, Math.max(1, streak));

// After:
const safeStreak = Number.isFinite(streak) && streak >= 0 ? streak : 0;
const activeDaysCount = Math.min(7, Math.max(0, safeStreak));
```

#### Remediation for BUG-17 (Skip-to-Content Link Contrast)
In `src/app/globals.css`:
```css
.skip-link {
  position: fixed;
  left: 16px;
  top: -80px;
  background: #ffffff;
  color: #0f766e;
  font-weight: 700;
  font-size: 13px;
  border: 2px solid #0d9488;
  box-shadow: 0 10px 25px -5px rgba(13, 148, 136, 0.25);
  z-index: 100;
  padding: 10px 18px;
  border-radius: 10px;
  text-decoration: none;
  transition: top 0.2s ease;
}
.skip-link:focus,
.skip-link:focus-visible {
  top: 16px;
  outline: 3px solid #0d9488;
  outline-offset: 2px;
}
```

---

## 5. Verification Method

To independently verify these findings and confirm resolution after remediation:

1. **Automated Test Suite Verification:**
   ```bash
   npm test
   ```
   Ensures all 78 existing unit tests continue to pass with 100% green rate.

2. **TypeScript Compilation Check:**
   ```bash
   npx tsc --noEmit
   ```
   Verify that layout files produce zero compiler diagnostics.

3. **DOM & Responsive Verification:**
   - In browser developer tools, set viewport to **375px x 667px** (Mobile):
     - Confirm TopBar search, streak, and profile avatar render without horizontal overflow.
     - Type query into search: verify dropdown stays within viewport without horizontal scrollbar.
     - Click hamburger toggle: verify icon toggles to `X`, `aria-label` toggles to `"Close navigation"`, and tapping hamburger again closes the drawer.
   - Set viewport to **768px x 1024px** (Tablet):
     - Confirm TopBar stat counters do not collide with search input or cause horizontal scrollbar.
   - Navigate to `/lesson/machine-learning`:
     - Inspect Sidebar: verify the AI & Machine Learning direction link displays active styling (`nav-item active subject-ai`).
   - Inspect Sidebar Level Progress Bar:
     - Verify `.sidebar-level-track` has `height: 6px`, visible `#e2e8f0` background, and gradient progress fill.
   - Inspect ProgressPanel circular gauge with `xp = 0` and `streak = 0`:
     - Verify 0% completed ring renders clean circle with offset equal to circumference (no `NaN`).
     - Verify weekly streak shows 0 completed checks (Monday is not checked).
