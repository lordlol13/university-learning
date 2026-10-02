# Handoff Report: Milestone 2 Adversarial Stress Testing & Verification

**Type**: Hard Handoff (Adversarial Audit Complete)  
**Agent**: Challenger 1 (Courseware & Repeat Practice Empirical Challenger)  
**Parent Agent**: `bf2db472-bdd3-4a78-9dbf-e40029168829`  
**Working Directory**: `c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\challenger_m2_gen2_1`  
**Target Code**:
- `src/lib/repeat-tasks.ts`
- `src/components/repeat/RepeatTasksView.tsx`

**Test Harness**: `scripts/m2-adversarial-stress.ts` (97 test scenarios executed)  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

An adversarial stress-test suite comprising 97 empirical scenarios across four categories was executed via `scripts/m2-adversarial-stress.ts`. While core happy paths, formula tolerances, and standard filtering pass, four concrete vulnerabilities were empirically reproduced:

### Observation 1: Unhandled TypeError on `null` in `getAllRepeatTasks` and `getRepeatThemes`
- **File**: `src/lib/repeat-tasks.ts`, lines 63–65:
  ```ts
  if (completedLessonIds !== undefined) {
    dirLessons = dirLessons.filter((l) => completedLessonIds.includes(l.id));
  }
  ```
- **Execution & Output**:
  ```powershell
  npx tsx -e "import { getAllRepeatTasks } from './src/lib/repeat-tasks.js'; getAllRepeatTasks(null as any);"
  ```
  **Verbatim Error**:
  ```
  TypeError: Cannot read properties of null (reading 'includes')
      at dirLessons.filter.l (c:\Users\Home1\OneDrive\Desktop\university-learning\src\lib\repeat-tasks.ts:64:59)
      at Array.filter (<anonymous>)
      at getAllRepeatTasks (c:\Users\Home1\OneDrive\Desktop\university-learning\src\lib\repeat-tasks.ts:64:30)
  ```
- **Direct Cause**: `null !== undefined` evaluates to `true`. Calling `null.includes()` throws an unhandled `TypeError`. `getRepeatThemes(null as any)` delegates directly to `getAllRepeatTasks` and fails with the identical error.

### Observation 2: Unhandled `SecurityError` when `localStorage` Access is Restricted
- **File**: `src/lib/repeat-tasks.ts`, lines 42–50:
  ```ts
  function getLocalStorage(): Storage | null {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      return globalThis.localStorage;
    }
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    return null;
  }
  ```
- **Execution & Output**:
  Under sandboxed browser environments (e.g. Safari Private Browsing mode, sandboxed iframes, or when third-party cookies/storage are blocked by browser security policy), accessing `globalThis.localStorage` or `window.localStorage` throws a `DOMException: SecurityError` ("Access is denied for this origin").
- **Direct Cause**: `getLocalStorage()` accesses `globalThis.localStorage` without a `try...catch` block. Furthermore, `getPracticeSessions()`, `savePracticeSession()`, and `clearPracticeSessions()` invoke `getLocalStorage()` outside of their respective `try...catch` blocks.
  **Verbatim Error**:
  ```
  SecurityError: Access to localStorage is denied
      at getLocalStorage (c:\Users\Home1\OneDrive\Desktop\university-learning\src\lib\repeat-tasks.ts:43:43)
      at getPracticeSessions (c:\Users\Home1\OneDrive\Desktop\university-learning\src\lib\repeat-tasks.ts:189:19)
  ```

### Observation 3: Corrupt / Non-Session Array Elements Leaked by `getPracticeSessions`
- **File**: `src/lib/repeat-tasks.ts`, lines 188–199:
  ```ts
  export function getPracticeSessions(): PracticeSession[] {
    const storage = getLocalStorage();
    if (!storage) return [];
    try {
      const raw = storage.getItem(PRACTICE_SESSIONS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  ```
- **Execution & Output**:
  When `localStorage` contains an array with null or corrupt primitive entries (e.g. `"[null, 123, \"corrupted\", {\"incomplete\": true}]"`):
  ```
  ✖ FAIL [Corrupt Data Sanitization] getPracticeSessions filters out or sanitizes corrupt/null array elements
     Actual:   [null,123,"corrupted",{"incomplete":true}]
     Notes:    Array contains null/primitive entries, violating PracticeSession schema
  ```
- **Direct Cause**: `Array.isArray(parsed)` is `true`, so `getPracticeSessions()` returns corrupt entries without validating that items conform to `PracticeSession` shape (`s && typeof s === 'object' && typeof s.id === 'string' && ...`). Any consumer reading properties on the returned sessions will encounter runtime errors.

### Observation 4: Unbounded Session Array and Storage Quota Exhaustion
- **File**: `src/lib/repeat-tasks.ts`, lines 201–212:
  ```ts
  export function savePracticeSession(session: PracticeSession): void {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      const sessions = getPracticeSessions();
      sessions.unshift(session);
      storage.setItem(PRACTICE_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.error("Failed to save practice session:", err);
    }
  }
  ```
- **Execution & Output**:
  In a high-volume capacity test of 1,000 practice sessions:
  `sessions.unshift(session)` prepends without an upper bound. In storage-constrained environments or long-term student usage, this triggers `QuotaExceededError`:
  ```
  Failed to save practice session: Error [QuotaExceededError]: QuotaExceededError: The quota has been exceeded
  ```
  No session eviction, pruning, or capacity limit (e.g., keeping the top 50 or 100 sessions) is implemented.

---

## 2. Logic Chain

1. **Defensive Parameter Guarding**:
   - `getAllRepeatTasks(completedLessonIds?: string[])` uses `if (completedLessonIds !== undefined)`.
   - In JavaScript, `null !== undefined` evaluates to `true`.
   - When callers pass `null` (such as deserialized query state or uninitialized progress), calling `completedLessonIds.includes(l.id)` throws an unhandled `TypeError`.
   - A defensive check `if (completedLessonIds && Array.isArray(completedLessonIds))` is required to guarantee safe execution.

2. **Sandbox & Security Sandbox Safety**:
   - Web browsers strictly enforce origin boundaries. Accessing `window.localStorage` in private browsing or embedded iframes throws a `SecurityError`.
   - Because `getLocalStorage()` accesses `globalThis.localStorage` without wrapping it in a `try...catch`, the platform crashes for learners operating in restricted security contexts.
   - Wrapping storage checks inside `try { ... } catch { return null; }` completely mitigates this vulnerability.

3. **Schema Integrity & Self-Healing Storage**:
   - Client storage is susceptible to tampering, schema evolution, or data corruption.
   - Returning `Array.isArray(parsed) ? parsed : []` allows non-session objects, numbers, and `null` to masquerade as `PracticeSession[]`.
   - Downstream components (such as dashboard widgets or session summary cards) reading `session.scorePercent` will crash when encountering `null`. Filtering with a type guard ensures storage self-heals by pruning corrupt records.

4. **Capacity Bounding**:
   - `localStorage` typically enforces a strict 5MB quota shared across the entire origin.
   - Storing unbounded history eventually leads to `QuotaExceededError`, permanently blocking practice session saves.
   - Limiting history to a reasonable window (e.g., `sessions.slice(0, 100)`) guarantees bounded storage while retaining extensive student history.

---

## 3. Caveats

- In the current `RepeatTasksView.tsx` component implementation, `state.completedLessons ?? []` is passed, which prevents `null` from being passed directly by that specific component in standard state. However, `getAllRepeatTasks` and `getRepeatThemes` are exported library utilities consumed across routes and tests, and must be defensively resilient.
- Standard happy paths, floating-point validation with epsilon tolerances (e.g. `0.1 + 0.2 = 0.3`), scientific notation, whitespace trimming, and quiz option checking passed 100% of their test cases.

---

## 4. Conclusion & Verdict

**Verdict**: **REQUEST_CHANGES**

Milestone 2 cannot be approved in its current state due to unhandled `TypeError` exceptions under `null` inputs, unhandled `SecurityError` exceptions in sandboxed storage environments, corrupt data leakage from `getPracticeSessions()`, and unbounded storage growth in `savePracticeSession()`.

### Required Worker Fixes:
1. **In `src/lib/repeat-tasks.ts` (`getAllRepeatTasks`)**:
   Change:
   ```ts
   if (completedLessonIds !== undefined) {
   ```
   To:
   ```ts
   if (completedLessonIds && Array.isArray(completedLessonIds)) {
   ```
2. **In `src/lib/repeat-tasks.ts` (`getLocalStorage`)**:
   Wrap property access in `try...catch`:
   ```ts
   function getLocalStorage(): Storage | null {
     try {
       if (typeof window !== "undefined" && window.localStorage) {
         return window.localStorage;
       }
       if (typeof globalThis !== "undefined" && globalThis.localStorage) {
         return globalThis.localStorage;
       }
     } catch {
       return null;
     }
     return null;
   }
   ```
3. **In `src/lib/repeat-tasks.ts` (`getPracticeSessions`)**:
   Filter parsed entries with schema validation:
   ```ts
   return Array.isArray(parsed)
     ? parsed.filter(
         (s): s is PracticeSession =>
           Boolean(
             s &&
               typeof s === "object" &&
               typeof s.id === "string" &&
               typeof s.completedAt === "string" &&
               typeof s.scorePercent === "number",
           ),
       )
     : [];
   ```
4. **In `src/lib/repeat-tasks.ts` (`savePracticeSession`)**:
   Cap the maximum retained practice sessions:
   ```ts
   const MAX_PRACTICE_SESSIONS = 100;
   const sessions = getPracticeSessions();
   sessions.unshift(session);
   storage.setItem(
     PRACTICE_SESSIONS_STORAGE_KEY,
     JSON.stringify(sessions.slice(0, MAX_PRACTICE_SESSIONS)),
   );
   ```

---

## 5. Verification Method

1. **Execute Adversarial Stress Harness**:
   ```powershell
   npx tsx scripts/m2-adversarial-stress.ts
   ```
   *Expected after fixes*: 97 passing scenarios, 0 failures, exit code 0.
2. **Execute Full Project Test Suite**:
   ```powershell
   npm test
   ```
   *Expected*: All test suites pass 100%.
3. **Typecheck & Lint**:
   ```powershell
   npm run typecheck
   npm run lint
   ```
   *Expected*: 0 errors, 0 warnings.
