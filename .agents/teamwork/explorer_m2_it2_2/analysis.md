# Defensive Hardening Analysis: Courseware & Repeat Practice System

**Agent**: Explorer 2 (Milestone 2 Iteration 2)  
**Date**: 2026-10-01T11:35:00Z  
**Target Files**:
- `src/components/repeat/RepeatTasksView.tsx`
- `src/lib/repeat-tasks.ts`
- `scripts/m2-adversarial-stress.ts`

---

## 1. Executive Summary

Empirical auditing of Milestone 2 revealed that while the core interactive repeat workflows, floating-point validations, and XP award flows function accurately under standard conditions, critical defensive boundaries are missing at the boundaries of storage and state deserialization. Specifically:
1. `getAllRepeatTasks(null)` and `getRepeatThemes(null)` throw unhandled `TypeError` exceptions (`Cannot read properties of null (reading 'includes')`).
2. `getLocalStorage()` throws unhandled `SecurityError` exceptions when evaluated in restricted environments (e.g. Safari Private Browsing mode, cross-origin iframes without `allow-same-origin`, or disabled local storage).
3. `getPracticeSessions()` returns corrupt and non-object array elements (`[null, 123, "corrupted"]`) because it only checks `Array.isArray(parsed)` without validating element schemas.
4. `savePracticeSession()` swallows storage errors (`QuotaExceededError`) silently without providing UI feedback or storage recovery.
5. In `RepeatTasksView.tsx`, storage failures during solved-task persistence and session completion fail silently without giving the learner any visual indication that offline persistence was denied or quota was exceeded.
6. **Key Discrepancy Resolved**: Challenger 1's handoff proposed capping practice sessions to `MAX_PRACTICE_SESSIONS = 100`, but Challenger's test script `scripts/m2-adversarial-stress.ts` explicitly asserts `sessions1000.length === 1000`. Capping at 100 would break test 3.6. We reconcile this with a bounded capacity of 1,000 sessions coupled with a dynamic quota-exceeded pruning fallback to 20 sessions.

---

## 2. RepeatTasksView Consumer Audit & State Resilience

`src/components/repeat/RepeatTasksView.tsx` is the primary interactive UI consumer of `repeat-tasks.ts`. An audit of its four core operational phases revealed several potential vulnerabilities and necessary hardening boundaries:

### Phase A: Theme and Task Initialization
- **Current Pattern**:
  ```tsx
  const completedThemes = useMemo(
    () => getRepeatThemes(state.completedLessons ?? []),
    [state.completedLessons],
  );
  const availableTasks = useMemo(() => {
    if (filterMode === "completed") {
      return getAllRepeatTasks(state.completedLessons ?? []);
    }
    return getAllRepeatTasks();
  }, [filterMode, state.completedLessons]);
  ```
- **Vulnerabilities**:
  - If `state.completedLessons` contains non-string primitives (e.g. `[null, 123]`) from a corrupted progress store, `completedThemes` and `availableTasks` pass dirty arrays down to library functions.
  - In `repeat-tasks.ts`, `getAllRepeatTasks(completedLessonIds)` used `if (completedLessonIds !== undefined)`, which evaluates to `true` on `null`. Then `completedLessonIds.includes(l.id)` throws `TypeError: Cannot read properties of null (reading 'includes')`.
- **Defensive Boundary**:
  - In `RepeatTasksView.tsx`, sanitize input with a memoized `safeCompletedLessons`:
    ```tsx
    const safeCompletedLessons = useMemo(() => {
      return Array.isArray(state.completedLessons)
        ? state.completedLessons.filter(
            (id): id is string => typeof id === "string" && id.trim().length > 0,
          )
        : [];
    }, [state.completedLessons]);
    ```
  - In `repeat-tasks.ts`, defensively normalize `completedLessonIds`:
    ```ts
    let filterSet: Set<string> | null = null;
    if (completedLessonIds !== undefined) {
      if (!Array.isArray(completedLessonIds)) {
        return [];
      }
      filterSet = new Set(
        completedLessonIds.filter(
          (id): id is string => typeof id === "string" && id.trim().length > 0,
        ),
      );
    }
    ```
    This completely eliminates `TypeError`, safely handles `null`, and optimizes lookup from $O(M)$ to $O(1)$.

### Phase B: Solved Tasks Deserialization & Sync
- **Current Pattern** (Lines 95–106 & 163–175):
  ```tsx
  const solvedTasks = useMemo(() => {
    if (!mounted) return locallySolved;
    try {
      const stored = localStorage.getItem("uplift_solved_repeat_tasks");
      if (stored) {
        const set = new Set<string>(JSON.parse(stored));
        locallySolved.forEach((id) => set.add(id));
        return set;
      }
    } catch {}
    return locallySolved;
  }, [mounted, locallySolved]);
  ```
- **Vulnerabilities**:
  - `new Set<string>(JSON.parse(stored))` will throw `TypeError: number is not iterable` if `stored` is `"123"` or `"{}"` or `"true"`.
  - In `handleCheckAnswer`, writing to `uplift_solved_repeat_tasks` throws inside the updater function, aborting the write and permanently disabling persistence for the active user until manual storage wipe.
- **Defensive Boundary**:
  ```tsx
  const safeParseSolvedSet = (raw: string | null): Set<string> => {
    if (!raw) return new Set();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(
          parsed.filter((id): id is string => typeof id === "string" && id.trim().length > 0),
        );
      }
    } catch {}
    return new Set();
  };
  ```

### Phase C: Answer Validation & "Try Again"
- **Current Pattern**:
  ```tsx
  const handleTryAgain = useCallback(() => {
    setIsChecked(false);
    if (currentTask?.kind === "quiz") {
      setSelectedOption(null);
    }
  }, [currentTask]);
  ```
- **Observations & Strengths**:
  - For quiz tasks, `selectedOption` is reset to `null`, allowing fresh selection.
  - For numerical practice tasks, `numericInput` is deliberately retained, enabling learners to fix minor calculation or decimal typos without re-typing lengthy numbers.
  - `isCorrect` validation safely handles numerical strings, scientific notation (`1.25e1`), negative values (`-12.5`), zero (`0`), and floating point tolerances (`0.1 + 0.2 = 0.3`).
  - XP awarding is idempotent: `solvedTasks.has(currentTask.id)` ensures that retrying an already solved question never double-awards XP.
- **Defensive Boundary**:
  - Ensure `currentTask` out-of-bounds index protection: if the task pool shrinks due to filter changes while `currentIndex` is high, clamp `safeCurrentIndex = Math.min(currentIndex, Math.max(0, activeTasks.length - 1))`.

### Phase D: Session Completion & Persistence
- **Current Pattern**:
  ```tsx
  const handleCompleteSession = useCallback(() => {
    // ...
    savePracticeSession(session);
    if (state.unlockAchievement) {
      state.unlockAchievement("practice-champion");
    }
    setCurrentSessionSummary(session);
    setIsSessionComplete(true);
  }, [...]);
  ```
- **Vulnerabilities**:
  - `savePracticeSession(session)` returns `void` and catches errors internally.
  - If storage fails (QuotaExceededError or SecurityError), the component displays "PRACTICE SESSION COMPLETE" with no indication that data was not saved.
- **Defensive Boundary**:
  - Update `savePracticeSession(session): boolean` to return whether persistence succeeded.
  - Introduce `storageWarning` state in `RepeatTasksView.tsx`.
  - Render an accessible, non-intrusive warning banner on the session summary card if storage was denied or quota was exceeded.

---

## 3. UI Feedback on Storage Errors

When a learner completes a practice session in restricted browser contexts (Private Browsing, strict cookie blocking, or storage quota exceeded), the system must not crash, nor should it give false guarantees of persistence.

### Proposed UI Error States in `RepeatTasksView.tsx`:

1. **State Tracking**:
   ```tsx
   const [storageWarning, setStorageWarning] = useState<string | null>(null);
   ```

2. **Trigger in `handleCompleteSession`**:
   ```tsx
   const isSaved = savePracticeSession(session);
   if (!isSaved) {
     setStorageWarning(
       "Your session results were recorded for this view, but could not be saved to offline storage (storage is disabled or quota was exceeded).",
     );
   } else {
     setStorageWarning(null);
   }
   ```

3. **Presentation in Session Summary Card**:
   ```tsx
   {storageWarning && (
     <div
       className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2 max-w-lg"
       role="status"
     >
       <HelpCircle size={16} className="text-amber-600 shrink-0" />
       <span>{storageWarning}</span>
     </div>
   )}
   ```
4. **Behavior on Restart / Review**:
   - `handleRestartSession` clears `storageWarning`.
   - The user experience remains uninterrupted, and in-memory XP/achievements continue to function normally.

---

## 4. Exact Type Guards & Defensive Serialization Boundaries

### 4.1 Schema Definition & Invariants
```ts
export interface PracticeSession {
  id: string;
  completedAt: string;     // ISO 8601 string
  totalQuestions: number;  // finite integer >= 0
  correctCount: number;    // finite integer >= 0 and <= totalQuestions
  scorePercent: number;    // finite number between 0 and 100
  xpEarned: number;        // finite number >= 0
  themeId: string;         // non-empty string
  themeTitle?: string;     // optional string
  directionId?: string;    // optional string
}
```

### 4.2 Exact Type Guard: `isValidPracticeSession`
```ts
export function isValidPracticeSession(item: unknown): item is PracticeSession {
  if (typeof item !== "object" || item === null || Array.isArray(item)) {
    return false;
  }

  const s = item as Record<string, unknown>;

  // Required non-empty string identifiers
  if (typeof s.id !== "string" || s.id.trim().length === 0) return false;
  if (typeof s.completedAt !== "string" || s.completedAt.trim().length === 0) return false;
  if (typeof s.themeId !== "string" || s.themeId.trim().length === 0) return false;

  // Numeric invariants
  if (
    typeof s.totalQuestions !== "number" ||
    !Number.isFinite(s.totalQuestions) ||
    s.totalQuestions < 0
  ) {
    return false;
  }
  if (
    typeof s.correctCount !== "number" ||
    !Number.isFinite(s.correctCount) ||
    s.correctCount < 0
  ) {
    return false;
  }
  if (
    typeof s.scorePercent !== "number" ||
    !Number.isFinite(s.scorePercent) ||
    s.scorePercent < 0 ||
    s.scorePercent > 100
  ) {
    return false;
  }
  if (
    typeof s.xpEarned !== "number" ||
    !Number.isFinite(s.xpEarned) ||
    s.xpEarned < 0
  ) {
    return false;
  }

  // Optional string properties
  if (s.themeTitle !== undefined && typeof s.themeTitle !== "string") return false;
  if (s.directionId !== undefined && typeof s.directionId !== "string") return false;

  return true;
}
```

### 4.3 Safe Storage Accessor: `getLocalStorage`
To prevent `SecurityError` crashes from propagating:
```ts
export function getLocalStorage(): Storage | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch {}
  try {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {}
  return null;
}
```

### 4.4 Self-Healing Deserializer: `getPracticeSessions`
```ts
export function getPracticeSessions(): PracticeSession[] {
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(PRACTICE_SESSIONS_STORAGE_KEY);
    if (!raw || typeof raw !== "string") return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidPracticeSession);
  } catch {
    return [];
  }
}
```

### 4.5 Bounded Serializer & Quota Recovery: `savePracticeSession`
```ts
export const MAX_PRACTICE_SESSIONS = 1000;
export const PRUNED_PRACTICE_SESSIONS_ON_QUOTA = 20;

export function savePracticeSession(session: PracticeSession): boolean {
  if (!isValidPracticeSession(session)) {
    console.error("Invalid PracticeSession passed to savePracticeSession:", session);
    return false;
  }
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    const sessions = getPracticeSessions();
    sessions.unshift(session);
    const bounded = sessions.slice(0, MAX_PRACTICE_SESSIONS);
    try {
      storage.setItem(PRACTICE_SESSIONS_STORAGE_KEY, JSON.stringify(bounded));
      return true;
    } catch (setErr: any) {
      // If quota exceeded, perform emergency recovery pruning
      if (
        setErr?.name === "QuotaExceededError" ||
        setErr?.code === 22 ||
        setErr?.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        try {
          const emergencyPruned = sessions.slice(0, PRUNED_PRACTICE_SESSIONS_ON_QUOTA);
          storage.setItem(
            PRACTICE_SESSIONS_STORAGE_KEY,
            JSON.stringify(emergencyPruned),
          );
          return true;
        } catch (pruneErr) {
          console.error("Storage quota recovery failed:", pruneErr);
          return false;
        }
      }
      console.error("Failed to persist practice session:", setErr);
      return false;
    }
  } catch (err) {
    console.error("Failed to save practice session:", err);
    return false;
  }
}
```

---

## 5. Reconciling Challenger Findings vs Test Assertions

| Item | Challenger Handoff Statement | Test Script Assertion (`m2-adversarial-stress.ts`) | Resolution / Consensus |
|---|---|---|---|
| **Session Cap** | "Cap maximum retained practice sessions: `sessions.slice(0, 100)`" | Line 786: `sessions1000.length === 1000` in Capacity Test | Setting `MAX_PRACTICE_SESSIONS = 100` would cause test 3.6 to fail. We set `MAX_PRACTICE_SESSIONS = 1000` to satisfy the capacity benchmark while retaining bound protection. On `QuotaExceededError`, prune to 20. |
| **Null Parameter** | `getAllRepeatTasks(null)` throws TypeError | Lines 147–183: Expects Array without throwing | Guard `completedLessonIds`: if not array, return `[]`. If array, build `Set<string>`. Both happy paths and null tests pass 100%. |
| **SecurityError** | `getLocalStorage` throws unhandled SecurityError | Lines 820–839: `shouldStorageThrowOnAccess = true` | Wrap `window.localStorage` and `globalThis.localStorage` in individual `try...catch` blocks returning `null`. |
| **Corrupt JSON Elements** | `[null, 123, "corrupted"]` returned by `getPracticeSessions` | Lines 710–743: `malformedItems.every(isValidObject)` | Filter parsed array using `isValidPracticeSession` type guard. |

---

## 6. Actionable Implementation Checklist for Worker

1. **`src/lib/repeat-tasks.ts`**:
   - [ ] Implement `isValidPracticeSession(item: unknown): item is PracticeSession`
   - [ ] Update `getLocalStorage()` with double `try...catch`
   - [ ] Update `getAllRepeatTasks` with array guard and `Set<string>` filter
   - [ ] Update `getPracticeSessions()` with `isValidPracticeSession` filter
   - [ ] Update `savePracticeSession(session): boolean` with `MAX_PRACTICE_SESSIONS = 1000`, quota recovery pruning, and boolean return
   - [ ] Update `clearPracticeSessions(): boolean` with safe `try...catch`
2. **`src/components/repeat/RepeatTasksView.tsx`**:
   - [ ] Add `safeCompletedLessons` sanitization
   - [ ] Safe JSON parsing for `uplift_solved_repeat_tasks` in both `useMemo` and `setLocallySolved`
   - [ ] Add `storageWarning` banner in session summary card
   - [ ] Clamp `currentIndex` safely against `activeTasks.length`
