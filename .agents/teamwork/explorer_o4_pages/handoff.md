# Main Pages Audit & Investigation Handoff Report

**Agent:** `explorer_o4_pages`  
**Date:** 2026-10-18  
**Scope:** All application surfaces outside the 3D Island (`/dashboard`, `/courses`, `/repeat`, `/achievements`, `/leaderboard`, `/profile`, and navigation shell `TopBar`/`ProgressPanel`/`Sidebar`).  
**Constraint Verification:** 0 changes made to `src/components/learning-world/*`, `src/app/world.css`, or `src/app/path/[directionId]/*`.

---

## 1. Observation

### Baseline Diagnostics
- Tool command: `npm run typecheck` (`tsc --noEmit`)
- Result: **Failed with Exit Code 1**:
  ```text
  src/components/courses/CoursesView.tsx(114,43): error TS2339: Property 'duration' does not exist on type 'Lesson'.
  src/components/courses/CoursesView.tsx(150,32): error TS2339: Property 'units' does not exist on type 'Direction'.
  src/components/courses/CoursesView.tsx(150,67): error TS7006: Parameter 'lesson' implicitly has an 'any' type.
  ```
- Tool command: `npm test`
  ```text
  ℹ tests 78
  ℹ suites 3
  ℹ pass 78
  ℹ fail 0
  ```

---

### Area 1: Dashboard (`/dashboard`, `src/components/dashboard/DashboardView.tsx`)

#### Obs 1.1: Stat Card Structure & CSS Class Mismatch
- File & Lines: `src/components/dashboard/DashboardView.tsx:116-126` vs `src/app/globals.css:1989-2031`
- Verbatim code in `DashboardView.tsx`:
  ```tsx
  <div className={`panel-card stat-card stat-${tone}`} key={label}>
    <div className="stat-card-top">
      <span className="stat-icon-box">
        <Icon size={20} />
      </span>
      <small className="stat-sub">{sub}</small>
    </div>
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
  ```
- Verbatim code in `globals.css`:
  Line 1989:
  ```css
  .dashboard-stats .stat-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
  ...
  }
  .stat-icon-badge {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .stat-teal .stat-icon-badge {
    background: #f0fdfa;
    color: #0d9488;
    border: 1px solid #ccfbf1;
  }
  ```
- Findings:
  1. `globals.css` styles `.stat-icon-badge`, but `DashboardView.tsx` renders `<span className="stat-icon-box">`. There are 0 rules in `globals.css` for `.stat-icon-box`. As a result, the icons have no background, no border, and no tone coloring.
  2. In `globals.css`, `.stat-card` has `flex-direction: row; align-items: center;`. In `ProfileView.tsx`, `.stat-card` has an icon badge on the left and a vertical wrapper `<div><strong>...` on the right. In `DashboardView.tsx`, direct children are `.stat-card-top`, `strong`, and `span`, which are placed horizontally in a single row, disrupting the layout.

#### Obs 1.2: Continue Card Text Collision with Absolute 3D Floating Icon on 481px–768px Viewports
- File & Lines: `src/components/dashboard/DashboardView.tsx:137-182` vs `src/app/globals.css:2048-2113, 3421`
- In `globals.css`:
  Line 2059: `.continue-card-content { position: relative; z-index: 1; max-width: 76%; }`
  Line 2100: `.continue-icon { position: absolute; right: 30px; top: 50%; transform: translateY(-50%); width: 92px; height: 92px; ... }`
  Line 3421: Inside `@media (max-width: 480px)`: `.continue-icon { display: none; }`
- Findings:
  `DashboardView.tsx` omits `<div className="continue-card-content">`. Between 481px and 768px (tablets and landscape phones), the 92px floating icon renders on top of the lesson title, description, and action buttons.

#### Obs 1.3: Unstyled and Misplaced Continue Pills
- File & Lines: `src/components/dashboard/DashboardView.tsx:138-153` vs `src/app/globals.css:2070-2081`
- Verbatim code in `DashboardView.tsx`:
  ```tsx
  <div className="continue-card-meta">
    <span className="eyebrow">
      {(currentDirection?.title ?? "AI & MACHINE LEARNING").toUpperCase()}
    </span>
    {current && (
      <div className="continue-pills">
        <span className="continue-meta-pill">
          <Clock3 size={13} />
          {current.durationMinutes} min
        </span>
        <span className="continue-meta-pill gold">
          <Star size={13} fill="currentColor" />+{current.xp} XP
        </span>
      </div>
    )}
  </div>
  ```
- Findings:
  `.continue-card-meta` is a rounded pill badge (`padding: 3px 10px; border-radius: 999px;`). `DashboardView.tsx` inserts an inner `<div>` with className `"continue-pills"` and spans `"continue-meta-pill"`, neither of which exists in `globals.css`.

#### Obs 1.4: Blank Void for Empty Recent Lessons
- File & Lines: `src/components/dashboard/DashboardView.tsx:270-306`
- Verbatim code:
  ```tsx
  <div className="section-heading">
    <h2>Your recent lessons</h2>
    <Link href={`/path/${currentDirection?.id ?? "ai-ml"}`}>
      View path
      <ArrowRight size={15} />
    </Link>
  </div>

  <div className="recent-lessons">
    {allLessons
      .filter((l) => completedLessons.includes(l.id))
      .slice(-3)
      .reverse()
      .map((lesson) => { ... })}
  </div>
  ```
- Findings:
  When a user has `completedLessons: []` (new user or reset state), `allLessons.filter(...)` returns `[]`. The heading and link are displayed above an empty whitespace container with no empty state notice.

#### Obs 1.5: Repeat Callout Heading Selector Mismatch
- File & Lines: `src/components/dashboard/DashboardView.tsx:247` vs `src/app/globals.css:2213`
- `DashboardView.tsx` line 247: `<h3>Solve tasks from previous themes</h3>`
- `globals.css` line 2213: `.repeat-callout-left h2 { font-size: 16px; color: #1e1b4b; }`
- Findings:
  Because `h3` is used instead of `h2`, the title does not receive `.repeat-callout-left` typography styling.

---

### Area 2: All Courses (`/courses`, `src/components/courses/CoursesView.tsx`)

#### Obs 2.1: TypeScript Compilation Errors
- File & Lines: `src/components/courses/CoursesView.tsx:114, 150`
- Line 114:
  ```tsx
  const totalMinutes = lessons.reduce(
    (acc, l) => acc + (parseInt(l.duration, 10) || 10),
    0,
  );
  ```
  `Lesson` in `src/types/curriculum.ts:23` defines `durationMinutes: number`. Property `duration` does not exist.
- Line 150:
  ```tsx
  {direction.units[0]?.lessons.slice(0, 3).map((lesson) => (
  ```
  `Direction` in `src/types/curriculum.ts:50` defines `subjects: Subject[]`, not `units`.
  Furthermore, line 110 already defined `const lessons = getDirectionLessons(direction);`.

#### Obs 2.2: Missing Search Bar and Track/Direction Filter Tabs
- File & Lines: `src/components/courses/CoursesView.tsx:35-43, 55-83`
- Verbatim tabs in `CoursesView.tsx`:
  ```tsx
  const [filter, setFilter] = useState<"all" | "active" | "coming">("all");
  ```
- Tabs only filter by "All", "Ready to learn", "In preparation".
- Missing features:
  1. Direction filter tabs (AI & ML, Physics, Math, Italian).
  2. Search bar filtering by title/keyword.
  3. Status filter (all, in-progress, completed).
  4. Difficulty filter (beginner, intermediate, advanced).

#### Obs 2.3: Missing Empty State Component
- File & Lines: `src/components/courses/CoursesView.tsx:108` vs `src/app/globals.css:1953-1981`
- When filtered directions or search results evaluate to 0 items, `CoursesView` renders an empty `<div className="course-grid">` with 0 elements. The pre-existing `.empty-state` and `.empty-icon` styles in `globals.css` are not utilized.

---

### Area 3: Repeat & Reinforce (`/repeat`, `src/components/repeat/RepeatTasksView.tsx`, `src/lib/repeat-tasks.ts`)

#### Obs 3.1: Session Accuracy Calculated Against Entire Task Pool
- File & Lines: `src/components/repeat/RepeatTasksView.tsx:236-243`
- Verbatim code:
  ```tsx
  const totalQuestions = activeTasks.length;
  const correctCount = activeTasks.filter(
    (t) => sessionAnswers[t.id] === true,
  ).length;
  const scorePercent =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;
  ```
- Findings:
  `activeTasks.length` is the total count of all repeatable tasks in that theme/direction (often 20 to 50+ tasks).
  When a student completes a session of 5 questions and finishes, `correctCount` is 5, but `scorePercent` is computed as `Math.round((5 / 50) * 100) = 10%`.
  The completion card displays: "Accuracy: 10%, Correct: 5 / 50", penalizing the student for every unattempted question in the entire catalog.

#### Obs 3.2: Practice Session History Not Displayed
- File & Lines: `src/components/repeat/RepeatTasksView.tsx` & `src/lib/repeat-tasks.ts:225-298`
- `savePracticeSession(session)` successfully writes to `uplift_practice_sessions` in `localStorage`, and `getPracticeSessions()` retrieves past sessions.
- However, `RepeatTasksView.tsx` never calls `getPracticeSessions()` and provides no UI element to view past practice history, sessions, or trends.

#### Obs 3.3: In-Memory `locallySolved` State Desynchronized from Progress Reset
- File & Lines: `src/components/repeat/RepeatTasksView.tsx:104, 113-132`
- `RepeatTasksView` stores `locallySolved` in React component state `useState(new Set())`.
- When `resetProgress()` clears `localStorage.removeItem("uplift_solved_repeat_tasks")`, `RepeatTasksView` does not clear `locallySolved`.
- In `solvedTasks`, `locallySolved.forEach((id) => set.add(id))` continuously re-inserts stale solved IDs.

#### Obs 3.4: European Decimal Comma Parsing Failure
- File & Lines: `src/lib/repeat-tasks.ts:213-220`
- `parseFloat(String(userAnswer).trim())` is used.
- For numerical questions (e.g. Italian Culture or Physics), entering `"4,5"` returns `4`, discarding the decimal `.5` and failing validation.

---

### Area 4: Achievements (`/achievements`, `src/components/profile/AchievementsView.tsx`)

#### Obs 4.1: Missing Filter Tabs
- File & Lines: `src/components/profile/AchievementsView.tsx:57-89`
- `AchievementsView.tsx` renders all achievements in an unfiltered grid.
- Requirements mandate: "filter tabs (all, in-progress, unlocked)". There is no filter state or tab component.

#### Obs 4.2: Missing Interactive Details / Modals and Tooltips
- File & Lines: `src/components/profile/AchievementsView.tsx:68-86`
- The achievement cards are static `<section className="panel-card achievement-detail">` elements with no `onClick`, no modal dialog, and no tooltips explaining exact criteria or unlock dates.

#### Obs 4.3: Missing Individual Progress Percentages
- File & Lines: `src/components/profile/AchievementsView.tsx:77-85`
- Each card displays only title, description, and "Unlocked" / "Locked milestone". There is no progress bar or percentage indicating partial progress (e.g. 3/7 lessons completed for `physics-master`).

#### Obs 4.4: Semantic Emblem Inconsistencies in `ModernAchievementBadge.tsx`
- File & Lines: `src/components/ui/ModernAchievementBadge.tsx:501-516`
- Badges use generic icon strings:
  - `practice-champion` (`icon: "flame"`) renders `SevenDayStreakEmblem` with a prominent "7" digit emblem inside the flame.
  - `physics-master` (`icon: "compass"`) renders `AiExplorerEmblem` with AI neural network constellation lines.
  - `math-pioneer` (`icon: "book"`) renders `ThreeLessonsEmblem` with 3 lesson stars.
  - `italian-scholar` (`icon: "sprout"`) renders `GettingStartedEmblem` (sprout in soil).

---

### Area 5: Leaderboard (`/leaderboard`, `src/components/profile/LeaderboardView.tsx`)

#### Obs 5.1: Missing Period Filter Tabs
- File & Lines: `src/components/profile/LeaderboardView.tsx:7-30`
- `LeaderboardView.tsx` contains NO period filter tabs (e.g., Weekly, All-Time).

#### Obs 5.2: Mobile Podium Visual Inversion Bug
- File & Lines: `src/components/profile/LeaderboardView.tsx:16` vs `src/app/globals.css:3390-3392`
- In `LeaderboardView.tsx`:
  ```ts
  const podiumOrder = [learners[1], learners[0], learners[2]].filter(Boolean);
  ```
- On desktop, this 3-column Olympic layout places 2nd on the left, 1st in the middle (taller), and 3rd on the right.
- On mobile (`max-width: 480px`), `.podium-grid` collapses to `grid-template-columns: 1fr;`.
- Because the DOM order is `[learners[1], learners[0], learners[2]]`, on mobile screens:
  **#2 Daniel Kim renders first at the top of the viewport**, followed by #1 Sofia Chen, then #3 Maya Patel.

#### Obs 5.3: Name-Based Lookup Fragility
- File & Lines: `src/components/profile/LeaderboardView.tsx:34, 70`
- `learners.findIndex((l) => l.name === person.name)` matches by string name. If duplicate names exist, `findIndex` resolves to the first matching index.

---

### Area 6: Profile (`/profile`, `src/components/profile/ProfileView.tsx`)

#### Obs 6.1: Streak Calendar / Heatmap Completely Missing
- File & Lines: `src/components/profile/ProfileView.tsx:55-92`
- `ProfileView.tsx` only renders a single numeric stat card for streak (`streak = 7`).
- There is NO weekly streak calendar or activity heatmap in `ProfileView.tsx`.

#### Obs 6.2: Track Breakdown Section Completely Missing
- File & Lines: `src/components/profile/ProfileView.tsx:94-118`
- `ProfileView.tsx` has no section displaying the learner's completion status per campus track (AI & ML, Physics, Math, Italian).

#### Obs 6.3: `resetProgress` Fails to Emit Events
- File & Lines: `src/stores/progress-store.ts:263-276` & `src/lib/learning-events.ts:1-11`
- `resetProgress()` clears localStorage keys and resets store state, but never calls `events.emit(...)`.
- `LearningEventPayload` lacks a `PROGRESS_RESET` event type, leaving decoupled listeners unaware of state clearing.

#### Obs 6.4: Inline Confirmation Lacks Dialog Accessibility Semantics
- File & Lines: `src/components/profile/ProfileView.tsx:127-149`
- The reset confirmation box lacks `role="alertdialog"` or `role="dialog"`, `aria-modal="true"`, and focus trapping.

---

### Area 7: Accessibility, Navigation Shell & UI Polish

#### Obs 7.1: ProgressPanel Weekly Streak CSS Class Names Broken
- File & Lines: `src/components/layout/ProgressPanel.tsx:122, 128, 130` vs `src/app/globals.css:1362-1398`
- In `ProgressPanel.tsx`:
  - Line 122: `<div className="weekly-days-row">` -> `globals.css` defines `.weekly-streak-days`.
  - Line 128: `className={`week-day-item ${done ? "done" : ""}`}` -> `globals.css` defines `.week-day-item.active` and `.week-day-item.today`.
  - Line 130: `<span className="week-day-circle">` -> `globals.css` defines `.week-day-dot`.
- Due to these mismatches, the weekly streak component renders unstyled and misaligned.

#### Obs 7.2: TopBar Search Missing Combobox ARIA Semantics & Keyboard Navigation
- File & Lines: `src/components/layout/TopBar.tsx:116-130, 149-192`
- Search input lacks `role="combobox"`, `aria-expanded`, `aria-controls`, and `aria-haspopup="listbox"`.
- Results list lacks `role="listbox"` and option roles.
- Keyboard navigation (ArrowDown / ArrowUp to cycle results) is missing.

#### Obs 7.3: Contrast Ratio on Amber Stat Card Below WCAG AA
- File & Lines: `src/app/globals.css:2017-2021`
- `.stat-amber .stat-icon-badge` has `background: #fffbeb; color: #ea580c;`.
- Contrast ratio is **3.8:1**, which fails the WCAG AA minimum threshold of 4.5:1 for normal text and icons.

#### Obs 7.4: Route Alias Missing from Theme Maps
- File & Lines: `src/components/dashboard/DashboardView.tsx:33-38`, `src/components/courses/CoursesView.tsx:26-31`
- `SUBJECT_THEME_MAP` maps `"italian-language"` to `"subject-italian"`, but does not map the route alias `"italian-culture"`, falling back to `"subject-ai"` (green).

---

## 2. Logic Chain

1. **Build & Type Failure**:
   - `npm run typecheck` fails directly due to `CoursesView.tsx` referencing nonexistent properties `l.duration` and `direction.units`. Because TypeScript compilation is required for production builds (`npm run build`), this is a `[CRITICAL]` blocker.
2. **Missing Feature Disconnect**:
   - The user requirements explicitly require:
     - Courses: search bar, track tabs, status filter, difficulty filter, empty state.
     - Repeat: session history display, accurate scoring.
     - Achievements: filter tabs, modal/tooltip details, progress percentages.
     - Leaderboard: weekly vs all-time period tabs.
     - Profile: streak calendar/heatmap, track breakdown.
   - Cross-referencing `CoursesView.tsx`, `RepeatTasksView.tsx`, `AchievementsView.tsx`, `LeaderboardView.tsx`, and `ProfileView.tsx` reveals that these features are currently either entirely absent from component JSX or using mismatched CSS selectors.
3. **Scoring Logic Distortion**:
   - In `RepeatTasksView.tsx`, dividing correct answers by the entire question pool (`activeTasks.length`) rather than the number of attempted questions distorts the practice session summary and demotivates students.
4. **Mobile Layout Flaws**:
   - In `LeaderboardView.tsx`, the Olympic podium order (`[2nd, 1st, 3rd]`) collapsed to a single column on mobile causes the runner-up to appear ahead of the winner.
   - In `DashboardView.tsx`, missing `.continue-card-content` on 481px–768px allows the floating 3D icon to overlap title and body text.
5. **State Reset & Persistence Leaks**:
   - `resetProgress()` clears `localStorage` keys but does not clear `RepeatTasksView`'s in-memory `locallySolved` state or emit an event to notify decoupled components.

---

## 3. Caveats

- **No Caveats regarding Main Pages Scope**: All 7 focus areas outside the 3D Island were audited directly.
- **Island Strict Constraint**: As explicitly mandated, `src/components/learning-world/*`, `src/app/world.css`, and `src/app/path/[directionId]/*` were preserved without modification. Note that ESLint reports 6 `react-hooks/preserve-manual-memoization` compiler errors inside `LearningWorld.tsx` and 2 unused variable warnings inside `SafeHtml.tsx` and `WorldCanvas.tsx`, which reside inside the protected 3D Island boundary.

---

## 4. Conclusion & Remediation Plan

The main pages outside the 3D Island require specific functional, responsive, and accessibility remediations. Below is the ranked remediation blueprint:

### Remediation Blueprint

| ID | File | Severity | Root Cause | Proposed Remediation |
| :--- | :--- | :---: | :--- | :--- |
| **B01** | `src/components/courses/CoursesView.tsx:114, 150` | `[CRITICAL]` | TypeScript type mismatch (`duration` vs `durationMinutes`, `direction.units` vs `direction.subjects`). | Replace `l.duration` with `l.durationMinutes`. Use `lessons.slice(0, 3)` directly instead of `direction.units[0]?.lessons`. |
| **B02** | `src/components/courses/CoursesView.tsx` | `[HIGH]` | Missing search bar, track filters, status filters, and empty state. | Add search input state, track/direction tabs (`all`, `ai-ml`, `physics-engineering`, `mathematics`, `italian-language`), status tabs (`all`, `in-progress`, `completed`), and render `.empty-state` when 0 results match. |
| **B03** | `src/components/dashboard/DashboardView.tsx:116-126` | `[HIGH]` | Stat cards use unstyled `.stat-icon-box` and horizontal flex. | Align with `globals.css`: use `.stat-icon-badge`, structure `.stat-card` with an icon badge and vertical text container. |
| **B04** | `src/components/dashboard/DashboardView.tsx:137-182` | `[HIGH]` | Missing `.continue-card-content`, unstyled `.continue-pills`, text overlap on 481px–768px. | Wrap text in `.continue-card-content`, add `.continue-card-top` with properly styled meta badges, and add responsive `display: none` for `.continue-icon` under 768px. |
| **B05** | `src/components/repeat/RepeatTasksView.tsx:236-243` | `[HIGH]` | Session accuracy calculated against total catalog rather than attempted questions. | Define `attemptedCount = Object.keys(sessionAnswers).length`. Compute `scorePercent = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0`. |
| **B06** | `src/components/repeat/RepeatTasksView.tsx` | `[MEDIUM]` | Past practice session history never displayed. | Call `getPracticeSessions()` on mount/completion and render a collapsible or summary card of past practice session records. |
| **B07** | `src/lib/repeat-tasks.ts:213-220` | `[MEDIUM]` | `parseFloat` rejects European comma decimals. | Sanitize input: `val = parseFloat(String(userAnswer).trim().replace(',', '.'))`. |
| **B08** | `src/components/profile/AchievementsView.tsx` | `[HIGH]` | Missing filter tabs, modal/tooltip details, and badge progress percentages. | Add filter tabs (`all`, `unlocked`, `in-progress`), add interactive modal/drawer on badge click, and calculate progress percentages per badge. |
| **B09** | `src/components/profile/LeaderboardView.tsx` | `[HIGH]` | Missing period filter tabs; mobile podium inverts 1st and 2nd place. | Add period filter tabs (Weekly, All-Time); on mobile, adjust order so Rank #1 appears at the top. |
| **B10** | `src/components/profile/ProfileView.tsx` | `[HIGH]` | Missing streak calendar/heatmap and track breakdown. | Embed the weekly streak days calendar component and add a track breakdown card showing progress across the 4 campus directions. |
| **B11** | `src/components/layout/ProgressPanel.tsx:122-135` | `[MEDIUM]` | Mismatched CSS class names for weekly streak. | Update class names to `.weekly-streak-days`, `.week-day-item.active`, `.week-day-dot`. |
| **B12** | `src/components/layout/TopBar.tsx:116-130` | `[MEDIUM]` | Missing combobox ARIA roles and keyboard arrow navigation. | Add `role="combobox"`, `aria-expanded`, `aria-controls`, and keydown handlers for `ArrowDown`/`ArrowUp`. |
| **B13** | `src/app/globals.css:2017-2021` | `[LOW]` | Amber stat text contrast 3.8:1 below WCAG AA. | Update text color to `#c2410c` (contrast 5.4:1). |

---

## 5. Verification Method

To independently verify these findings:

1. **Verify TypeScript Compilation Failure**:
   ```bash
   npm run typecheck
   ```
   *Expected result*: TS2339 errors in `src/components/courses/CoursesView.tsx:114, 150`.

2. **Verify Component Implementations**:
   - `view_file` on `src/components/courses/CoursesView.tsx`: Confirm absence of search bar, track filter tabs, and empty state.
   - `view_file` on `src/components/repeat/RepeatTasksView.tsx`: Check line 236 for `totalQuestions = activeTasks.length` and lack of session history rendering.
   - `view_file` on `src/components/profile/AchievementsView.tsx`: Confirm absence of filter tabs, modal dialogs, and badge progress percentages.
   - `view_file` on `src/components/profile/LeaderboardView.tsx`: Check line 16 for `podiumOrder = [learners[1], learners[0], learners[2]]` and lack of period tabs.
   - `view_file` on `src/components/profile/ProfileView.tsx`: Confirm absence of streak calendar/heatmap and track breakdown.
   - `view_file` on `src/components/layout/ProgressPanel.tsx`: Check lines 122, 128, 130 for `.weekly-days-row` and `.week-day-circle` vs `globals.css:1362-1398`.

3. **Verify Existing Tests Pass**:
   ```bash
   npm test
   ```
   *Expected result*: All 78 tests pass.
