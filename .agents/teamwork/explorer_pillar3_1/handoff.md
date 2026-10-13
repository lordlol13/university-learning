# Pillar 3: Architecture & State Management Audit Report

## 1. Observation

### Diagnostics Baseline
- **Automated Test Suite (`npm test`)**: 73 passing tests across 3 suites in 2.78s (`tsx --test tests/*.test.ts`).
- **TypeScript Typecheck (`npm run typecheck`)**: 0 errors (`tsc --noEmit`).
- **ESLint (`npm run lint`)**: 0 errors, 5 unused variable warnings in `IslandSignposts.tsx` (lines 6, 7, 17, 249) and `ChatAssessment.tsx` (line 10).

---

### Detailed Architectural Findings

#### Finding 3.1: [CRITICAL] Ubiquitous Whole-Store Subscriptions (`useProgress((s) => s)`) Triggering Universal Re-Render Cascades
- **File Paths & Line Numbers**:
  - `src/components/dashboard/DashboardView.tsx:12`: `const state = useProgress((s) => s);`
  - `src/components/learning-world/DirectionView.tsx:15`: `const state = useProgress((s) => s);`
  - `src/components/courses/CoursesView.tsx:17`: `const state = useProgress((s) => s);`
  - `src/components/layout/ProgressPanel.tsx:16`: `const state = useProgress((s) => s);`
  - `src/components/learning-world/LearningWorld.tsx:154`: `const state = useProgress((s) => s);`
  - `src/components/learning-world/LearningPath.tsx:10`: `const state = useProgress((s) => s);`
  - `src/components/repeat/RepeatTasksView.tsx:44`: `const state = useProgress((s) => s);`
  - `src/components/profile/ProfileView.tsx:11`: `const state = useProgress((s) => s);`
  - `src/components/lesson/LessonView.tsx:32`: `const state = useProgress((s) => s);`
  - `src/components/mascot/StorkAssistant.tsx:32`: `const state = useProgress((s) => s);`
- **Verbatim Code / Mechanism**:
  `src/stores/progress-provider.tsx:61-66`:
  ```typescript
  export function useProgress<T>(selector: (state: ProgressStore) => T): T {
    const store = useContext(ProgressContext);
    if (!store)
      throw new Error("useProgress must be used inside ProgressProvider");
    return useStore(store, selector);
  }
  ```
  In `src/components/layout/AppShell.tsx:71, 81`, `<ProgressPanel />` and `<StorkAssistant />` are permanently rendered in the layout shell for all non-lesson pages.
  When a user scrolls in `LessonRenderer.tsx:456` and triggers `recordLessonActivity(key, "viewed", id)` via `IntersectionObserver`, `set({ lessonActivities: ... })` creates a new store state reference.
  Because Zustand's default equality check is `Object.is`, `useStore(store, (s) => s)` receives a new reference on every single mutation. This forces `ProgressPanel`, `StorkAssistant` (which hosts 3D Three.js canvas `<AssistantCanvas />`), `DashboardView`, and `LearningWorld` to re-render in unison.

#### Finding 3.2: [CRITICAL] State Fragmentation Across Multiple Unsynchronized Storage Systems
- **File Paths & Line Numbers**:
  - `src/stores/progress-store.ts:268-283`: Persistent key `"uplift-progress"` managed via Zustand `persist` middleware.
  - `src/components/repeat/RepeatTasksView.tsx:114, 192, 211`: Direct synchronous read/write to independent key `"uplift_solved_repeat_tasks"`:
    ```typescript
    localStorage.setItem("uplift_solved_repeat_tasks", JSON.stringify(Array.from(set)));
    ```
  - `src/lib/repeat-tasks.ts:40, 229, 251, 298`: Direct synchronous read/write to independent key `"uplift_practice_sessions"`.
  - `src/components/lesson/plot/InteractivePlot.tsx:1146, 1160`: Direct synchronous read/write to independent key `"uplift_math_studio_settings_v3"`.
  - `src/components/repeat/RepeatTasksView.tsx:102, 106, 107`: Unsaved in-memory React states `locallySolved`, `sessionAnswers`, `sessionXpEarned`.
  - `src/stores/progress-store.ts:254-265`: Imperative cleanup in `resetProgress()`:
    ```typescript
    resetProgress: () => {
      try {
        if (typeof globalThis !== "undefined" && globalThis.localStorage) {
          globalThis.localStorage.removeItem("uplift_solved_repeat_tasks");
          globalThis.localStorage.removeItem("uplift_practice_sessions");
        } else if (typeof localStorage !== "undefined") {
          localStorage.removeItem("uplift_solved_repeat_tasks");
          localStorage.removeItem("uplift_practice_sessions");
        }
      } catch {}
      set({ ...freshProgress(), lessonActivities: {} });
    }
    ```
- **Observed Behavior**:
  There is no unified storage coordinator or transaction boundary. State is fragmented across 4 separate `localStorage` keys and disjoint React component states.
  When `resetProgress()` is called:
  1. It deletes `"uplift_solved_repeat_tasks"` and `"uplift_practice_sessions"`, but does NOT reset `"uplift_math_studio_settings_v3"`.
  2. It has no mechanism to notify mounted React components; `locallySolved` in `RepeatTasksView` retains previous task IDs in memory.
  3. Resetting resets to Alex Morgan's demo progress (`initialProgress` from `src/data/demo.ts:69-86` with 3 completed lessons and 357 XP) rather than a clean slate.

#### Finding 3.3: [HIGH] Hydration Race Condition & SSR Mismatch Masked by `suppressHydrationWarning`
- **File Paths & Line Numbers**:
  - `src/app/layout.tsx:27-28`:
    ```tsx
    <html lang="en" className={`${nunito.className} ${nunito.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
    ```
  - `src/stores/progress-store.ts:270`: `skipHydration: true` configured in Zustand persist options.
  - `src/stores/progress-provider.tsx:27-44`:
    ```typescript
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
      let active = true;
      const markHydrated = () => {
        if (active) setHydrated(true);
      };
      try {
        Promise.resolve(store.persist?.rehydrate()).then(markHydrated, markHydrated);
      } catch {
        markHydrated();
      }
      const timer = setTimeout(markHydrated, 100);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }, [store]);
    ```
  - `src/components/layout/TopBar.tsx:21-23`, `src/components/dashboard/DashboardView.tsx:12`, `src/components/courses/CoursesView.tsx:17`, `src/components/layout/ProgressPanel.tsx:16`, `src/components/profile/ProfileView.tsx:11`: Components do not check `useProgressReady()`.
- **Observed Behavior**:
  The store initializes on SSR with `initialProgress` from `src/data/demo.ts` (Alex Morgan, 357 XP, level 2, streak 7).
  Server-rendered HTML contains these hardcoded numbers.
  On the client, the components initially mount with the demo state. Afterwards, `store.persist?.rehydrate()` completes asynchronously (or after the arbitrary 100ms `setTimeout`), modifying the store and causing an abrupt visual flash/layout shift when the user's actual localStorage data overrides the demo values.
  Only `DirectionView.tsx:17` and `LessonRenderer.tsx:432` inspect `useProgressReady()`; all other UI surfaces render unhydrated values immediately. `suppressHydrationWarning` was added to `layout.tsx` to silence React's console warnings instead of resolving the hydration mismatch.

#### Finding 3.4: [HIGH] Absence of URL Query Parameter Synchronization in Interactive Flows
- **File Paths & Line Numbers**:
  - `src/app/repeat/page.tsx:8-14`: `<RepeatTasksView />` mounted without route query parameters.
  - `src/components/repeat/RepeatTasksView.tsx:45-51, 86-90, 143-148`:
    `filterMode` (`"completed"` | `"all"`), `selectedThemeId`, `currentIndex` are stored purely in local `useState`.
  - `src/components/lesson/plot/InteractivePlot.tsx:1106, 1119, 1122, 1133`:
    Formula expression (`customExpr`), viewport boundaries (`viewport`), pinned points (`pinnedPoints`), and integral bounds (`integralBounds`) are stored purely in component `useState`.
- **Observed Behavior**:
  Neither `/repeat` nor `/lesson/[lessonId]` synchronizes active filter, selected theme, or visualization settings with the URL (`?theme=...&q=...`).
  If a student is solving practice problems in Physics on `/repeat` and refreshes the browser, all navigation state is lost, reverting to the initial default question.
  Furthermore, students cannot deep-link or share customized mathematical curves or specific repeat practice themes.

#### Finding 3.5: [HIGH] Heavy Business Logic, Quota Management & Direct Storage Access Leaking into UI
- **File Paths & Line Numbers**:
  - `src/components/lesson/plot/InteractivePlot.tsx:1-1996`: 1,996 lines in a single component combining SVG rendering, mathematical derivatives, second derivatives, numerical Simpson's rule integrals, formula compilation, gesture physics (pinch/zoom/pan), and direct `localStorage` read/writes (`uplift_math_studio_settings_v3`).
  - `src/components/repeat/RepeatTasksView.tsx:177-223, 251-278`: Contains answer correctness evaluation, raw XP calculation (+15 XP), imperative store dispatch (`state.addXP(15)`), achievement unlocking (`state.unlockAchievement("practice-champion")`), and direct JSON serialization to `localStorage`.
  - `src/components/lesson/LessonRenderer.tsx:473-484`:
    ```typescript
    useEffect(() => {
      if (!codingSubject) {
        lesson.sections.forEach((s) => {
          s.blocks.forEach((b) => {
            if (b.type === "code" && !activity.completed.includes(b.id)) {
              record("completed", b.id);
              record("viewed", b.id);
            }
          });
        });
      }
    }, [codingSubject, lesson, activity.completed, record]);
    ```
    UI component automatically completes code blocks for non-coding tracks via an effect loop that mutates global store state.
  - `src/components/lesson/LessonView.tsx:45` & `src/components/lesson/LessonRenderer.tsx:520-522`:
    ```typescript
    if (state.startLesson(lesson.id) && state.completeLesson(lesson.id))
    ```
    UI components manually orchestrate multi-step lifecycle transitions instead of dispatching a single semantic store command.

#### Finding 3.6: [MEDIUM] Tight Bidirectional Coupling Between State Store and Static Curriculum Data
- **File Paths & Line Numbers**:
  - `src/stores/progress-store.ts:3-10, 152-197`: Imports `allLessons`, `getDirection`, `getDirectionLessons`, `getLesson`, `getLessonDirection` from `../data/curriculum`.
  - `src/stores/progress-store.ts:162-196`: Hardcodes domain strings and track completion achievements directly inside `completeLesson`:
    ```typescript
    const ai = getDirection("ai-ml");
    if (ai && getDirectionLessons(ai).every((item) => completedLessons.includes(item.id)))
      achievements.add("ai-explorer");
    const physics = getDirection("physics-engineering");
    if (physics && getDirectionLessons(physics).every((item) => completedLessons.includes(item.id)))
      achievements.add("physics-master");
    const math = getDirection("mathematics");
    if (math && getDirectionLessons(math).every((item) => completedLessons.includes(item.id)))
      achievements.add("math-pioneer");
    const italian = getDirection("italian-language");
    if (italian && getDirectionLessons(italian).every((item) => completedLessons.includes(item.id)))
      achievements.add("italian-scholar");
    ```
  - `src/components/learning-world/DirectionView.tsx:18-20`:
    ```typescript
    useEffect(() => {
      if (hydrated) setCurrentDirection(direction.id);
    }, [direction.id, setCurrentDirection, hydrated]);
    ```
- **Observed Behavior**:
  The state store has compile-time dependencies on curriculum data structures, and the UI route triggers imperative side-effects on the store upon mount. Modifying curriculum structure or adding tracks requires directly altering core store logic.

#### Finding 3.7: [MEDIUM] Redundant Derived State & Dead Fields in `ProgressStore`
- **File Paths & Line Numbers**:
  - `src/stores/progress-store.ts:23, 138-140, 152-156, 277`: `unlockedLessons` is persisted in `localStorage`.
  - `src/stores/progress-store.ts:37, 128-141`: `unlockLesson(lessonId)` is an orphaned action never called anywhere in the codebase.
  - `src/stores/progress-store.ts:26`: `streak: number` exists in `ProgressState`, but there is no action, timestamp logic, or calculation anywhere in the project to calculate or update streaks; it is permanently stuck at 7.
- **Observed Behavior**:
  `unlockedLessons` is entirely derivable from `completedLessons` and curriculum prerequisites. Persisting it in localStorage creates synchronization drift if prerequisites change. `streak` is a dead static value.

#### Finding 3.8: [MEDIUM] Scroll-Driven Storage Write Storm in `LessonRenderer`
- **File Paths & Line Numbers**:
  - `src/components/lesson/LessonRenderer.tsx:41-60, 434, 456`: `IntersectionObserver` dispatches `recordActivity(key, "viewed", id)` on every visible content block.
  - `src/stores/progress-store.ts:78-83, 271`: `recordLessonActivity` mutates `lessonActivities`. The persist middleware executes `createJSONStorage(() => localStorage).setItem("uplift-progress", ...)` synchronously on the main JavaScript thread for every view event.
- **Observed Behavior**:
  Rapid scrolling through a lesson containing 15-20 blocks triggers dozens of synchronous JSON serializations and disk writes in milliseconds, causing thread blocking and frame stutter during reading.

#### Finding 3.9: [LOW] Context Severance Risk & Redundant Store Subscriptions Across React Three Fiber Boundary
- **File Paths & Line Numbers**:
  - `src/components/learning-world/WorldCanvas.tsx:40-41`: `completedLessons` and `unlockedLessons` subscribed outside the R3F Canvas in the DOM tree.
  - `src/components/mascot/WorldStork.tsx:24-25`: `currentLessonId` and `completed` re-subscribed inside the R3F Canvas tree.
- **Observed Behavior**:
  `WorldStork` subscribes to Zustand context inside the R3F Canvas reconciler root. While functional in React 19, reading store state inside the Canvas frame loop without passing down explicit props from `WorldCanvas` creates architectural coupling and breaks data flow isolation between the DOM UI and 3D scenes.

---

## 2. Logic Chain

1. **Premise**: In React 19 and Zustand 5, `useStore(store, selector)` re-renders whenever `equalityFn(previousSelectedValue, newSelectedValue)` returns `false`.
2. **Observation**: 10 primary UI components call `useProgress((s) => s)`.
3. **Inference**: Every single state mutation—whether an XP increment, block scroll intersection, or lesson start—creates a new root state reference, forcing all 10 components to re-render. Since `ProgressPanel` and `StorkAssistant` are mounted inside `AppShell`, layout re-render cascades occur continuously.
4. **Premise**: Robust client applications require a single source of truth for persistent data.
5. **Observation**: Persistent state is split across `"uplift-progress"`, `"uplift_solved_repeat_tasks"`, `"uplift_practice_sessions"`, and `"uplift_math_studio_settings_v3"`.
6. **Inference**: Clearing progress via `resetProgress()` cannot guarantee consistency across components, does not clear math studio settings, and leaves in-memory React state in `RepeatTasksView` desynchronized.
7. **Premise**: Next.js Server Components require consistent markup between server rendering and initial client hydration to prevent layout shifts.
8. **Observation**: SSR renders hardcoded demo progress (357 XP), while client persistence rehydrates asynchronously under a 100ms timeout race condition. 8 of 10 components do not check `useProgressReady()`. `suppressHydrationWarning` in `layout.tsx` was applied as a band-aid.
9. **Inference**: Users experience unavoidable layout shifts and flashes of demo content before saved progress loads.
10. **Premise**: Separation of concerns dictates that presentation components delegate business logic, persistence, and complex computations to dedicated hooks, stores, or services.
11. **Observation**: `InteractivePlot.tsx` contains 1,996 lines of UI, math evaluation, and localStorage calls; `RepeatTasksView.tsx` directly computes XP and unlocks achievements; `LessonRenderer.tsx` automates completion via effects.
12. **Inference**: The UI layer is heavily coupled to business rules and storage APIs, severely hindering maintainability, modularity, and automated testing.

---

## 3. Caveats

- **Scope Boundary**: Audit focused strictly on Pillar 3 (Architecture & State Management). Three.js mesh disposal, specific test assertions, TypeScript typing, and API endpoint vulnerabilities are investigated by peer explorer agents.
- **Audit-Only Constraint**: No existing source code files were edited or overwritten during this audit.
- **Build Lock Observation**: `npm run build` encountered a temporary process collision (`Another next build process is already running`) caused by a concurrent agent run; all static type checking and unit test suites were independently verified and completed cleanly.

---

## 4. Conclusion & Concrete Architectural Remediation Roadmap

The architecture and state management of Uplift University functions adequately for isolated demo scenarios, but possesses critical structural vulnerabilities:
1. **Severe Re-Render Cascades**: Whole-store destructuring (`(s) => s`) causes universal component churn.
2. **Data Fragmentation**: 4 uncoordinated localStorage keys prevent atomic state transitions and clean resets.
3. **Fragile Hydration**: SSR hydration mismatches are suppressed rather than resolved.
4. **Monolithic UI Coupling**: Critical business logic, persistence, and mathematical compilation are trapped inside oversized presentation components.

### Remediation Roadmap & Architectural Patterns

#### Remediation 1: Granular Slice Pattern & Atomic Selector Hooks (Fixes 3.1 & 3.7)
Replace monolithic `ProgressStore` with modular Zustand slices and export dedicated atomic hooks using `useShallow`:

```typescript
// Proposed: src/stores/slices/learning-slice.ts
import { StateCreator } from "zustand";

export interface LearningSlice {
  completedLessons: string[];
  currentDirectionId: string;
  currentLessonId: string | null;
  lessonActivities: Record<string, LessonActivity>;
  completeLesson: (lessonId: string) => boolean;
  startLesson: (lessonId: string) => boolean;
}

// Proposed: src/stores/progress-selectors.ts
export const useCompletedLessons = () =>
  useProgress((s) => s.completedLessons);
export const useCurrentLessonId = () =>
  useProgress((s) => s.currentLessonId);
export const useUserStats = () =>
  useProgress(
    useShallow((s) => ({
      xp: s.xp,
      level: s.level,
      streak: s.streak,
    }))
  );
export const useLessonActivity = (key: string) =>
  useProgress((s) => s.lessonActivities[key] ?? emptyActivity);
```

#### Remediation 2: Unified Storage Coordinator & Schema Migration (Fixes 3.2)
Consolidate all persistent keys into a single namespaced schema managed by a central storage adapter with debounced writes:

```typescript
// Proposed: src/stores/storage-schema.ts
export interface UpliftPersistentState {
  version: 2;
  progress: ProgressState;
  repeatTasks: {
    solvedTaskIds: string[];
    sessions: PracticeSession[];
  };
  plotSettings: DesmosPlotSettings;
}

// In src/stores/progress-store.ts: debounce localStorage writes during scroll
import { debounce } from "@/lib/utils";

const debouncedStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: debounce((key: string, value: string) => {
    localStorage.setItem(key, value);
  }, 300),
  removeItem: (key: string) => localStorage.removeItem(key),
};
```

#### Remediation 3: Deterministic Hydration Gate & Clean Baseline State (Fixes 3.3)
Remove arbitrary `setTimeout(100)` and `suppressHydrationWarning`. Provide a deterministic `useHydrated()` hook with fallback skeletons:

```typescript
// Proposed: src/stores/progress-provider.tsx
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createProgressStore());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubHydrate = store.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    store.persist.rehydrate();
    return () => unsubHydrate();
  }, [store]);

  return (
    <ProgressContext.Provider value={store}>
      <HydrationContext.Provider value={hydrated}>
        {children}
      </HydrationContext.Provider>
    </ProgressContext.Provider>
  );
}
```

#### Remediation 4: Next.js URL Search Params Synchronization for Practice & Plot (Fixes 3.4)
Use `useSearchParams` and `useRouter` to synchronize interactive filter and theme state with browser history:

```typescript
// Proposed: src/components/repeat/use-repeat-params.ts
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function useRepeatQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const theme = searchParams.get("theme") ?? "all";
  const mode = (searchParams.get("mode") as "completed" | "all") ?? "completed";

  const setQueryParams = (newTheme: string, newMode: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("theme", newTheme);
    params.set("mode", newMode);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return { theme, mode, setQueryParams };
}
```

#### Remediation 5: Decomposition of Monolithic `InteractivePlot.tsx` (Fixes 3.5)
Split the 1,996-line file into distinct architectural modules:
- `src/components/lesson/plot/InteractivePlot.tsx`: Slim presentation shell (< 250 lines).
- `src/components/lesson/plot/CoordinateSystem.tsx`: SVG axes and grid lines.
- `src/components/lesson/plot/PlotCurves.tsx`: Function curve and critical point markers.
- `src/hooks/use-plot-viewport.ts`: Pinch, drag, and wheel coordinate math.
- `src/hooks/use-plot-math.ts`: Derivative, tangent, and integral calculations.
- `src/hooks/use-plot-settings.ts`: Plot settings management and persistence.

---

## 5. Verification Method

To independently verify these findings:
1. **Automated Baseline Verification**:
   ```powershell
   npm test
   npm run typecheck
   npm run lint
   ```
2. **Whole-Store Subscription Inspection**:
   Run grep to verify all 10 whole-store destructuring call sites:
   ```powershell
   grep -n "useProgress((s) => s)" src/components/**/*.tsx
   ```
3. **Storage Fragmentation Inspection**:
   Search for direct `localStorage` access outside of the store:
   ```powershell
   grep -n "localStorage\." src/components/repeat/RepeatTasksView.tsx src/lib/repeat-tasks.ts src/components/lesson/plot/InteractivePlot.tsx
   ```
4. **Hydration Warning Inspection**:
   Inspect `src/app/layout.tsx:27-28` for `suppressHydrationWarning`.
5. **Component Size Inspection**:
   Inspect line count of `src/components/lesson/plot/InteractivePlot.tsx` (1,996 lines).
