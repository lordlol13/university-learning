# Architectural Analysis & Audit Report: Requirement R2 (End-to-End Courseware & Repeat Practice System)

**Date**: 2026-09-30  
**Specialist**: Explorer 2 (Courseware, Tracks & Repeat Practice Specialist)  
**Working Directory**: `.agents/teamwork/explorer_survey_r2`  
**Reference Specification**: `.agents/teamwork/ORIGINAL_REQUEST.md` (Requirement R2)

---

## Executive Summary

An exhaustive end-to-end investigation of the Uplift University learning platform was conducted, focusing on **Requirement R2 (Courseware, Campus Tracks, Lesson Progression, and Repeat Practice System)**.

All four active campus tracks (`ai-ml`, `physics-engineering`, `mathematics`, and `italian-language` / `italian-culture`), encompassing **20 curriculum lessons** and **20 detailed authored lesson modules**, were verified. Every lesson module contains rich authored content: introductions, mathematical formula cards with KaTeX formatting, structured step-by-step worked examples, numerical practice problems with tolerance checks, multiple-choice quizzes with detailed rationales, and summary takeaways.

The **Repeat & Practice system** (`/repeat`, `RepeatTasksView`, `repeat-tasks.ts`) correctly aggregates **95 repeatable tasks** across **20 themes**. However, key architectural deficiencies were identified:
1. Repeat tasks currently load all 95 tasks across all 20 lessons (including locked future lessons) without defaulting or filtering to **previously completed themes**.
2. **Practice sessions are not recorded**: there is no session tracking entity, session summary/celebration screen, or persistent session log.
3. Once an answer is checked in repeat mode, there is no **"Try Again"** mechanism for incorrect attempts.
4. Track completion achievements exist **only for AI & ML (`ai-explorer`)**, with no achievements defined or awarded for completing Physics, Mathematics, Italian, or Repeat Practice sessions.
5. There is **zero automated test coverage** for the repeat practice system.

---

## 1. Inventory & Structural Audit of Campus Tracks

The platform implements 7 total university directions in `src/data/curriculum.ts`, with 4 actively populated campus tracks:

| Track ID | Track Title | Short Title | Lessons Count | Difficulty Range | Subject/Domain Focus |
|---|---|---|---|---|---|
| `ai-ml` | AI & Machine Learning | AI & ML | 6 | Foundational to Intermediate | Python, Linear Algebra, Statistics, Gradient Descent, Databases, Deep Learning |
| `physics-engineering` | Physics & Engineering | Physics & Mechanics | 7 | Foundational to Advanced | SI Units, Dimensional Scaling, Water Bridge, Vector Components, Dot Product, Cross Product, Diagnostic Exam |
| `mathematics` | Mathematics & Logic | Mathematics | 4 | Foundational to Intermediate | Rates of Change & Derivatives, Integrals & Accumulation, Boolean Logic & Sets, Linear Systems |
| `italian-language` | Italian Language & Culture | Italian Language | 3 | Foundational | Greetings & Introductions, Numbers & Time, Technical Vocabulary for Engineers |
| `data-science` | Data Science | Data Science | 0 | — | *Coming soon placeholder* |
| `computer-engineering`| Computer Engineering | Engineering | 0 | — | *Coming soon placeholder* |
| `programming` | Programming | Programming | 0 | — | *Coming soon placeholder* |

### Detailed Lesson Module Audit

Every lesson in `src/data/curriculum.ts` maps 1-to-1 to a corresponding `LessonContent` structure in `src/data/lessons/`:

| Lesson ID | Curriculum ID | Track | XP | Est. Min | Sections | Blocks | Practice Problems | Quiz Questions | Coding Subject? |
|---|---|---|---|---|---|---|---|---|---|
| `python-basics` | `python-basics` | `ai-ml` | 100 | 15 | 6 | 7 | 2 | 3 | Yes |
| `linear-algebra` | `linear-algebra` | `ai-ml` | 100 | 18 | 7 | 9 | 2 | 3 | Yes |
| `statistics` | `statistics` | `ai-ml` | 100 | 18 | 7 | 10 | 2 | 3 | Yes |
| `gradient-descent`| `machine-learning`| `ai-ml` | 120 | 25 | 7 | 15 | 2 | 3 | Yes |
| `databases` | `databases` | `ai-ml` | 120 | 20 | 6 | 7 | 2 | 3 | Yes |
| `deep-learning` | `deep-learning` | `ai-ml` | 150 | 22 | 7 | 10 | 2 | 3 | Yes |
| `si-base-units` | `si-base-units` | `physics-engineering` | 100 | 15 | 6 | 8 | 2 | 3 | No |
| `dimensional-scaling` | `dimensional-scaling` | `physics-engineering` | 110 | 16 | 6 | 8 | 2 | 3 | No |
| `water-equivalency` | `water-equivalency` | `physics-engineering` | 120 | 16 | 6 | 8 | 2 | 3 | No |
| `vector-components` | `vector-components` | `physics-engineering` | 120 | 18 | 6 | 8 | 2 | 3 | No |
| `vector-dot-product` | `vector-dot-product` | `physics-engineering` | 130 | 18 | 6 | 9 | 2 | 3 | No |
| `vector-cross-product` | `vector-cross-product` | `physics-engineering` | 140 | 20 | 6 | 8 | 2 | 3 | No |
| `physics-tactical-exam`| `physics-tactical-exam`| `physics-engineering` | 180 | 25 | 6 | 7 | 3 | 4 | No |
| `calc-derivatives`| `calc-derivatives`| `mathematics` | 120 | 16 | 4 | 7 | 2 | 2 | No |
| `calc-integrals` | `calc-integrals` | `mathematics` | 120 | 16 | 4 | 6 | 2 | 2 | No |
| `discrete-logic` | `discrete-logic` | `mathematics` | 110 | 15 | 4 | 7 | 2 | 2 | No |
| `linear-systems` | `linear-systems` | `mathematics` | 130 | 18 | 4 | 6 | 2 | 2 | No |
| `italian-greetings` | `italian-greetings` | `italian-language` | 100 | 14 | 4 | 6 | 2 | 2 | No |
| `italian-numbers-time` | `italian-numbers-time` | `italian-language` | 100 | 15 | 4 | 6 | 2 | 2 | No |
| `italian-engineering-terms` | `italian-engineering-terms` | `italian-language` | 120 | 16 | 4 | 6 | 2 | 2 | No |

**Total Across All Tracks**:
- **20 authored lesson modules**
- **41 numerical practice problems**
- **54 multiple-choice quiz questions**
- **95 total interactive assessment tasks**

---

## 2. Subject-Specific Content Rendering & Non-Coding Separation

In compliance with Requirement R1 & R2:
- The function `isCodingSubject(directionId, lessonId)` in `src/components/lesson/LessonRenderer.tsx` (lines 74–129) explicitly isolates coding blocks.
- Non-coding tracks (`physics-engineering`, `mathematics`, `italian-language`) cleanly suppress code sandboxes (`block.type === "code"` returns `null`).
- Furthermore, an automated side-effect (lines 464–475) marks any inadvertent code blocks in non-coding tracks as viewed/completed so students are never blocked from completing theory lessons.
- Mathematics and Physics tracks feature KaTeX-rendered equations, LaTeX formula cards, variable breakdowns, and worked examples without superfluous code runners.

---

## 3. Lesson Progression, State Persistence & XP Scoring

### Progression Flow
1. **Prerequisite Gating**: `getLessonStatus(lesson, state)` verifies whether all `lesson.prerequisites` are contained in `state.completedLessons`. Unmet prerequisites lock the lesson node.
2. **Activity Tracking**: Inside `LessonRenderer.tsx`, interaction is tracked per block via `activity = state.lessonActivities[`${lesson.id}:v${lesson.version}`]`:
   - `viewed`: recorded via `IntersectionObserver` as user scrolls.
   - `completed`: recorded when user acknowledges reading blocks ("I understand this section") or completes interactive blocks.
   - `practice`: recorded when practice problems are solved within tolerance.
   - `quiz`: recorded when quiz questions are answered correctly.
3. **Strict Completion Invariant**: `lessonCompletion(lesson, activity)` requires 100% of blocks to be completed, 100% of practice problems solved, and 100% of quiz questions answered. Page views or reading alone cannot complete a lesson (tested in `tests/lesson-engine.test.ts`).
4. **Completion Action & XP Reward**:
   - `completeLesson(lessonId)` in `src/stores/progress-store.ts` adds `lesson.xp` to `state.xp`.
   - Recomputes level: `Math.floor(xp / 250) + 1`.
   - Emits learning events (`LESSON_COMPLETED`, `XP_GAINED`, `LEVEL_UP`, `ACHIEVEMENT_UNLOCKED`, `CURRENT_LESSON_CHANGED`).
   - Automatically unblocks the next eligible lesson in the track.
   - Guarded against double-awarding XP on repeat visits (`alreadyCompleted` check).
5. **Persistence Mechanism**:
   - Built on Zustand vanilla store with `persist` middleware (`name: "uplift-progress"`) and `localStorage`.
   - Hydration safety: `ProgressProvider` (`src/stores/progress-provider.tsx`) awaits `store.persist.rehydrate()` with a 100ms timeout fallback. `useProgressReady()` ensures components do not write to or render stale states before hydration finishes.

---

## 4. Deep Audit of the Repeat & Practice System

### Architecture
- **Page Route**: `src/app/repeat/page.tsx`
- **Component**: `src/components/repeat/RepeatTasksView.tsx`
- **Data Generator**: `src/lib/repeat-tasks.ts`
- **Integration Points**:
  - Global Sidebar (`src/components/layout/Sidebar.tsx:110` -> `/repeat`)
  - Dashboard banner card (`src/components/dashboard/DashboardView.tsx:89-104`)
  - 3D Learning World toolbar button (`src/components/learning-world/LearningWorld.tsx:224` -> `RepeatDialog`)

### Verification of Existing Features
1. **Question Aggregation**: `getAllRepeatTasks()` iterates through all tracks and extracts practice problems (kind: `"practice"`) and quizzes (kind: `"quiz"`), falling back to curriculum checkpoint questions if none exist.
2. **Immediate Feedback**:
   - Quiz questions highlight green (`correct`) or red (`incorrect`), display checkmarks, and render KaTeX explanations.
   - Practice questions evaluate numeric inputs within floating-point tolerance (`Math.abs(val - answer) <= tolerance`).
3. **Review XP Scoring**:
   - Correctly awards **+15 Review XP** on first solve of each task.
   - Deduplicates solves in `localStorage["uplift_solved_repeat_tasks"]` to prevent infinite XP farming.
4. **Keyboard Accessibility**: Supports 1-4 / A-D hotkeys, Enter for submit/next, and ArrowLeft/ArrowRight navigation.

---

## 5. Identified Deficiencies, Bugs & Architectural Gaps

### Defect 1: Repeat Practice does not default to or filter by previously completed themes
- **Location**: `src/components/repeat/RepeatTasksView.tsx:75–84`, `src/lib/repeat-tasks.ts:29–104`
- **Description**: Requirement R2 states students should *"review and solve questions from previously completed themes"*. Currently, `getAllRepeatTasks()` returns all 95 tasks across all 20 lessons without checking completion status. `RepeatTasksView` defaults to `"all"`, exposing locked future lessons (e.g. `deep-learning`, `physics-tactical-exam`) to beginner students.
- **Impact**: Violates student pedagogical sequence; contradicts dashboard copy ("from completed units").

### Defect 2: Practice Sessions are not recorded ("records completed practice sessions")
- **Location**: `src/components/repeat/RepeatTasksView.tsx:476–486`, `src/lib/repeat-tasks.ts`
- **Description**: Requirement R2 and its acceptance criteria state: *"The Repeat Practice page loads review tasks from past lessons, accepts student answers, and records completed practice sessions."* Currently, no `PracticeSession` entity exists. When a student completes all questions in a theme, the view simply loops back to index 0 via "Repeat from start". No session summary, score percentage, or persisted session record is generated.
- **Impact**: Student practice effort is not logged, leaving no record of sessions completed over time.

### Defect 3: No "Try Again" option on incorrect answers in Repeat mode
- **Location**: `src/components/repeat/RepeatTasksView.tsx:344, 372, 459–486`
- **Description**: Once `handleCheckAnswer` is executed, inputs are disabled (`disabled={isChecked}`). If the answer is incorrect, the student cannot re-attempt the problem—the only options are "Next task" or "Repeat from start".
- **Impact**: Frustrating learning experience that prevents self-correction.

### Defect 4: Track completion achievements missing for Physics, Math, and Italian
- **Location**: `src/stores/progress-store.ts:155–163`, `src/data/demo.ts:10–39`
- **Description**: Only the AI track awards a track completion badge (`ai-explorer`). Completing all 7 physics lessons, all 4 math lessons, or all 3 Italian lessons yields no achievement.
- **Impact**: Disincentivizes multi-track mastery across the four campus tracks.

### Defect 5: Route slug discrepancy (`italian-culture` vs `italian-language`)
- **Location**: `src/data/curriculum.ts:610`, `src/app/path/[directionId]/page.tsx:7–9`
- **Description**: The track ID is `italian-language`, but the user specification refers to it as `italian-culture`. Because `dynamicParams = false` is configured on the route, navigating to `/path/italian-culture` yields a 404 error.
- **Impact**: Fragility if external links, breadcrumbs, or user navigation target `/path/italian-culture`.

### Defect 6: Disconnected localStorage reset between progress and repeat tasks
- **Location**: `src/stores/progress-store.ts:212`, `src/components/profile/ProfileView.tsx:88–95`
- **Description**: Resetting demo progress clears `uplift-progress` in localStorage, but leaves `uplift_solved_repeat_tasks` intact. As a result, repeat tasks remain marked as "Solved" even after an explicit demo reset.

### Defect 7: Missing automated tests for the Repeat Practice system
- **Location**: `tests/`
- **Description**: The existing test suite contains 6 files and 39 tests, but contains zero tests for `repeat-tasks.ts` or repeat review functionality.

---

## 6. Recommended Action Plan & Implementation Blueprint

1. **Enhance `repeat-tasks.ts`**:
   - Add optional `completedOnly?: boolean` or `completedLessonIds?: string[]` parameter to `getAllRepeatTasks` and `getRepeatThemes`.
   - Define `PracticeSession` interface:
     ```ts
     export interface PracticeSession {
       id: string;
       timestamp: number;
       themeId: string;
       themeTitle: string;
       directionId: string;
       totalQuestions: number;
       correctCount: number;
       accuracyPercent: number;
       xpEarned: number;
     }
     ```
   - Add helpers: `recordPracticeSession(session)` and `getPracticeSessions()`.

2. **Upgrade `RepeatTasksView.tsx`**:
   - Add a toggle/filter for "Completed Themes Only (Recommended)" vs "All Themes".
   - Default the active list to completed themes if `state.completedLessons.length > 0`.
   - Add a "Try Again" button when `isChecked && !isCurrentCorrect` to allow students to retry without navigating away.
   - When reaching the end of the question set, render a **Practice Session Complete** card displaying total answered, accuracy score, XP gained, and an action to save the session to session history.

3. **Complete Achievement Catalog in `demo.ts` & `progress-store.ts`**:
   - Add badges for `physics-master`, `math-pioneer`, `italian-scholar`, and `practice-champion`.
   - Wire achievement triggers in `completeLesson()` and `recordPracticeSession()`.

4. **Address `italian-culture` Route Alias**:
   - Add an alias mapping or static param entry so both `/path/italian-language` and `/path/italian-culture` resolve correctly.

5. **Synchronize Reset in `profile` & `progress-store`**:
   - Clear `uplift_solved_repeat_tasks` and `uplift_practice_sessions` when `resetProgress()` is triggered.

6. **Add Automated Test Suite `tests/repeat-tasks.test.ts`**:
   - Test task generation, theme aggregation, answer validation, tolerance checks, completed-only filtering, and session recording.
