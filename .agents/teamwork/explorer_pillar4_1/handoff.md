# Pillar 4 Audit Report: TypeScript Strictness & Code Quality

**Target Workspace**: `c:\Users\Muzaffar\Desktop\university-learning`  
**Agent**: `explorer_pillar4_1`  
**Mode**: STRICT AUDIT-ONLY (Read-Only Analysis)  
**Date**: 2026-10-05  

---

## 1. Observation

Direct diagnostics, tool outputs, and source code observations across the repository:

### 1.1 Baseline Diagnostic Command Results

1. **`npm run typecheck` (`tsc --noEmit`)**:
   - Exit Code: `0`
   - Diagnostic Output: Passed cleanly with 0 TypeScript diagnostics under current `tsconfig.json` configuration.

2. **`npm test` (`tsx --test tests/*.test.ts`)**:
   - Exit Code: `0`
   - Output Summary:
     ```
     ℹ tests 73
     ℹ suites 3
     ℹ pass 73
     ℹ fail 0
     ℹ duration_ms 3685.6412
     ```

3. **`npm run lint` (`eslint .`)**:
   - Exit Code: `0` (process), but **FAILED zero-warning acceptance criteria** with 5 warnings across 2 files:
     ```
     C:\Users\Muzaffar\Desktop\university-learning\src\components\learning-world\IslandSignposts.tsx
         6:10  warning  'directions' is defined but never used      @typescript-eslint/no-unused-vars
         7:10  warning  'learningWorlds' is defined but never used  @typescript-eslint/no-unused-vars
        17:10  warning  'IslandSignpost' is defined but never used  @typescript-eslint/no-unused-vars
       249:33  warning  '_props' is defined but never used          @typescript-eslint/no-unused-vars

     C:\Users\Muzaffar\Desktop\university-learning\src\components\lesson\ChatAssessment.tsx
       10:3  warning  'speed' is assigned a value but never used  @typescript-eslint/no-unused-vars

     ✖ 5 problems (0 errors, 5 warnings)
     ```
   - Performance: Execution took ~3 minutes because `eslint.config.mjs` does not ignore `.agents/**`, forcing ESLint to crawl 44 directories and hundreds of agent metadata files.

---

### 1.2 Direct Source Code Evidence

#### A. Compiler Configuration (`tsconfig.json:1-28`)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```
- Missing strictness flags: `noUncheckedIndexedAccess`, `forceConsistentCasingInFileNames`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- `target`: Legacy `"ES2017"` despite project utilizing Next.js 16, React 19, and Node.js 22+.
- `include`: Broad `"**/*.ts"`, `"**/*.tsx"` blindly incorporates test scripts, benchmarks, and multi-agent workspaces.

#### B. Direct Array Indexing Without Undefined Guards (`FormulaBreakdown.tsx:12-15`)
```tsx
export function FormulaBreakdown({
  block,
}: {
  block: Extract<LessonBlock, { type: "formula-breakdown" }>;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const variable =
    selected === null ? undefined : block.parts[selected].variable;
```
- Line 14 directly accesses `block.parts[selected].variable`. If `selected` exceeds `block.parts.length - 1` (e.g. state retention across block prop transitions), `block.parts[selected]` is `undefined`, causing `TypeError: Cannot read properties of undefined (reading 'variable')`.

#### C. Runtime Errors in React Render Phase (`LessonRenderer.tsx:241-244, 267-270`)
```tsx
// Lines 241-244:
{block.problemIds.map((id, i) => {
  const problem = lesson.practiceProblems.find((p) => p.id === id);
  if (!problem) throw new Error(`Unknown practice problem ${id}`);
  return ( ... );
})}

// Lines 267-270:
{block.questionIds.map((id, i) => {
  const question = lesson.quiz.find((q) => q.id === id);
  if (!question) throw new Error(`Unknown quiz question ${id}`);
  return ( ... );
})}
```
- Unhandled synchronous `throw new Error(...)` during React element evaluation without an encompassing Error Boundary.

#### D. Missing Global and Route-Level Error Boundaries
- `src/app/global-error.tsx`: **DOES NOT EXIST**.
- Sub-route `error.tsx` (`src/app/lesson/[lessonId]/error.tsx`, `src/app/path/[directionId]/error.tsx`, `src/app/repeat/error.tsx`): **NONE EXIST**.
- `src/app/error.tsx:3-8`:
  ```tsx
  export default function ErrorPage({
    reset,
  }: {
    error: Error & { digest?: string };
    reset: () => void;
  }) {
  ```
  `error` parameter is completely omitted from component arguments, discarded without logging, telemetry, or user diagnostic display.

#### E. Rehydration Without Schema Validation (`src/stores/progress-store.ts:267-284`)
```ts
{
  name: "uplift-progress",
  version: 1,
  skipHydration: true,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    lessonActivities: state.lessonActivities,
    currentDirectionId: state.currentDirectionId,
    currentLessonId: state.currentLessonId,
    completedLessons: state.completedLessons,
    unlockedLessons: state.unlockedLessons,
    xp: state.xp,
    level: state.level,
    streak: state.streak,
    achievements: state.achievements,
  }),
}
```
- No schema validator, no `migrate` function, and raw reference to `localStorage` in closure (`() => localStorage`).

#### F. Division by Zero Causing User-Facing `NaN%` (`src/lib/lesson-progress.ts:27-32`)
```ts
return {
  done,
  total,
  percent: Math.round((done / total) * 100),
  complete: done === total,
};
```
- When `total === 0`, `(0 / 0) * 100` evaluates to `NaN`, rendering `NaN%` in `ProgressPanel.tsx:42` and `aria-label="NaN% completed"`.

#### G. ESLint Suppressions and Blanket Rules
- `scripts/m1-adversarial-stress.ts:1`: `/* eslint-disable */`
- `scripts/m2-adversarial-stress.ts:1`: `/* eslint-disable */`
- `scripts/m2-challenger2-harness.ts:1`: `/* eslint-disable */`
- `src/components/mascot/StorkAnimator.tsx:4`: `/* eslint-disable react-hooks/immutability */`
- `src/scenes/MascotStage.tsx:82`: `// eslint-disable-next-line react-hooks/immutability`
- `src/components/mascot/StorkAssetModel.tsx:64`: `// eslint-disable-next-line react-hooks/immutability`

---

## 2. Logic Chain

From the observed facts to the architectural assessment:

### Chain 1: TypeScript Compiler Strictness Deficits Lead to Silent Runtime Crashes
1. `tsconfig.json` specifies `"strict": true`, but omits `"noUncheckedIndexedAccess": true`.
2. In TypeScript, omitting `noUncheckedIndexedAccess` causes array index lookups `arr[i]` and object map lookups `dict[k]` to be typed as `T` rather than `T | undefined`.
3. In `FormulaBreakdown.tsx:14`, `block.parts[selected].variable` is assumed by the compiler to always resolve to a defined object.
4. When lesson blocks dynamically re-render or state lags during navigation, `selected` can point to an out-of-range index.
5. Because TypeScript did not enforce checking for `undefined`, code executes without optional chaining (`?.`), throwing an unhandled `TypeError` at runtime.
6. Similar vulnerabilities occur in `Environment.tsx:983` (`flowerColors[cIdx as number]`) and `curriculum.ts:670` (`university.programs[0]`).

### Chain 2: ESLint Failures Violate Production CI Acceptance Criteria
1. `ORIGINAL_REQUEST.md` (lines 41, 74, 97) mandates: *"npm run lint passes cleanly with zero ESLint errors or warnings."*
2. Running `npm run lint` yields **5 warnings** across `IslandSignposts.tsx` and `ChatAssessment.tsx`.
3. `IslandSignposts.tsx` defines unused variables `directions`, `learningWorlds`, an unused helper function `IslandSignpost`, and an unused parameter `_props` in an empty stub.
4. `ChatAssessment.tsx` extracts `speed` but hardcodes `800` ms, leaving `speed` unused.
5. In addition, `eslint.config.mjs` fails to ignore `.agents/**`, forcing ESLint to parse hundreds of non-source markdown and metadata files, causing multi-minute lint runtimes.
6. Therefore, the codebase currently **fails the zero-warning build acceptance criteria** and suffers from severe CI performance degradation.

### Chain 3: Absence of Error Boundaries Leaves App Vulnerable to Fatal White-Screen Crashes
1. In Next.js App Router, `app/error.tsx` only intercepts exceptions inside nested route segments; it **cannot** catch errors originating in `app/layout.tsx`.
2. `src/app/layout.tsx` wraps the entire application with `<ProgressProvider>` and `<AppShell>`.
3. No `src/app/global-error.tsx` exists in the repository.
4. If `ProgressProvider` fails during store creation, rehydration, or script execution, Next.js has no error boundary to render, resulting in an unrecoverable white screen in production.
5. Furthermore, nested routes (`/lesson/[lessonId]`, `/path/[directionId]`) lack localized `error.tsx` files.
6. When `LessonRenderer.tsx:243, 269` throws `throw new Error(...)` for an unmapped question ID, the failure bubbles past the lesson view directly to the root `app/error.tsx`.
7. This completely unmounts the user's active lesson workspace, sidebar state, and top navigation, maximizing the failure blast radius for an isolated data lookup error.

### Chain 4: Unsanitized State Persistence and Mathematical Edge Cases
1. `src/stores/progress-store.ts` rehydrates persisted state from `localStorage` using `createJSONStorage(() => localStorage)` without a schema validator or migration guard.
2. If corrupt or stale JSON exists in `localStorage` (e.g. `completedLessons: null`), subsequent methods like `.includes()` crash the client application.
3. In `src/lib/lesson-progress.ts:30`, calculating `Math.round((done / total) * 100)` when `total === 0` produces `NaN`.
4. This `NaN` renders in `ProgressPanel.tsx` as `"NaN%"`, degrading user trust and violating mathematical display requirements.

---

## 3. Findings Matrix & Concrete Remediation

| ID | Finding Title | Severity | Location | Root Cause |
|---|---|---|---|---|
| **F-01** | Missing `src/app/global-error.tsx` Root Boundary | **[CRITICAL]** | `src/app/` (missing) | Layout-level crashes in `layout.tsx` have no fallback and cause total white screen. |
| **F-02** | ESLint 5 Unused Variable Warnings Fail Acceptance Criteria | **[HIGH]** | `src/components/learning-world/IslandSignposts.tsx:6-249`, `src/components/lesson/ChatAssessment.tsx:10` | Stubbed component and hardcoded timer leave unused imports, functions, and props. |
| **F-03** | Missing `noUncheckedIndexedAccess: true` in Compiler | **[HIGH]** | `tsconfig.json:2-18` | `strict: true` omits index check; allows crashes like `FormulaBreakdown.tsx:14`. |
| **F-04** | Missing Route-Level `error.tsx` in Dynamic Sub-Routes | **[HIGH]** | `src/app/lesson/[lessonId]/`, `src/app/path/[directionId]/` | Localized component crashes unmount entire application shell back to root error page. |
| **F-05** | Synchronous `throw new Error` in React Render Phase | **[HIGH]** | `src/components/lesson/LessonRenderer.tsx:243, 269` | Unhandled exceptions thrown directly in JSX mapping loop without component boundary. |
| **F-06** | Severe ESLint Crawl Performance Bottleneck | **[HIGH]** | `eslint.config.mjs:8` | Unignored `.agents/**` directory causes 3+ minute lint runs across 44 subfolders. |
| **F-07** | Rehydration Without Schema Sanitization in Zustand Store | **[HIGH]** | `src/stores/progress-store.ts:267-284` | Corrupted `localStorage` payload directly injected into store without type guard. |
| **F-08** | Division by Zero Yields `NaN%` in Lesson Progress | **[HIGH]** | `src/lib/lesson-progress.ts:30` | `total === 0` produces `NaN`, leaking to progress ring UI and ARIA labels. |
| **F-09** | Missing `forceConsistentCasingInFileNames: true` | **[MEDIUM]** | `tsconfig.json:2-18` | Windows vs Linux case-sensitivity discrepancy risks CI build failure. |
| **F-10** | Missing Defensive Compiler Flags (`exactOptionalPropertyTypes`, etc.) | **[MEDIUM]** | `tsconfig.json:2-18` | Missing `noImplicitReturns`, `noFallthroughCasesInSwitch`, `exactOptionalPropertyTypes`. |
| **F-11** | Blanket `/* eslint-disable */` in Test Harnesses | **[MEDIUM]** | `scripts/m1-adversarial-stress.ts:1`, `scripts/m2-*.ts:1` | Blanket suppressions obscure genuine syntax and type violations across 900+ lines. |
| **F-12** | React Hooks Immutability Suppressions in Mascot | **[MEDIUM]** | `src/components/mascot/StorkAnimator.tsx:4`, `src/scenes/MascotStage.tsx:82` | Ad-hoc comments disable immutability linting for imperative Three.js mutations. |
| **F-13** | Root `error.tsx` Discards `error` Parameter | **[MEDIUM]** | `src/app/error.tsx:3-8` | `error` is untyped, unused, and unlogged, losing `digest` and stack traces. |
| **F-14** | Direct `localStorage` Reference in Store Initialization | **[MEDIUM]** | `src/stores/progress-store.ts:271` | `createJSONStorage(() => localStorage)` risks `ReferenceError` during SSR or Node test. |
| **F-15** | Loose `as StageOptions[...]` DOM Casts in Event Handlers | **[MEDIUM]** | `src/scenes/MascotPlayground.tsx:314, 368, 385` | Unvalidated DOM strings cast directly to union types without runtime guard. |
| **F-16** | Blind `as Mesh` Type Assertion in Scene Traversal | **[MEDIUM]** | `src/components/mascot/StorkDebug.tsx:73` | Casts `Object3D` to `Mesh` before verifying `mesh.isMesh`. |
| **F-17** | Broad Compiler `include` Pattern Coupling App & Scripts | **[MEDIUM]** | `tsconfig.json:19-25` | `"**/*.ts"` forces application compiler to typecheck scripts and agent harnesses. |
| **F-18** | Outdated Compiler Target `"target": "ES2017"` | **[LOW]** | `tsconfig.json:3` | Legacy target on modern Next.js 16 / React 19 / Node 22 stack. |
| **F-19** | Missing Return Type Annotations on Exported APIs | **[LOW]** | `src/data/curriculum.ts:671-683`, `src/data/lessons/index.ts:47` | Public exports lack explicit return signatures (`Direction \| undefined`, etc.). |
| **F-20** | Inconsistent `Metadata` Typing in App Router Pages | **[LOW]** | `src/app/courses/page.tsx:2`, `src/app/repeat/page.tsx:3`, etc. | Missing `Metadata` type annotations on exported metadata objects. |

---

### Detailed Remediation Guidance & Code Examples

#### Remediation F-01: Create Root `src/app/global-error.tsx`
```tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root layout crash:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="standard-page flex min-h-screen items-center justify-center p-6 font-sans">
        <section className="panel-card empty-state max-w-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900">Application Error</h1>
          <p className="mt-2 text-sm text-gray-600">
            A fatal error occurred in the campus layout. We have recorded this issue.
          </p>
          {error.digest && (
            <p className="mt-1 font-mono text-xs text-gray-400">
              Error code: {error.digest}
            </p>
          )}
          <button
            type="button"
            className="button primary mt-6"
            onClick={() => reset()}
          >
            Reload application
          </button>
        </section>
      </body>
    </html>
  );
}
```

#### Remediation F-02: Fix 5 ESLint Warnings & Configure Args Ignore Pattern
1. In `src/components/learning-world/IslandSignposts.tsx`:
   - Remove unused imports `directions` (line 6) and `learningWorlds` (line 7).
   - Remove unused function `IslandSignpost` (lines 17-247).
   - In stub export:
     ```tsx
     export function IslandSignposts() {
       return null;
     }
     ```
2. In `src/components/lesson/ChatAssessment.tsx`:
   - Connect `speed` prop in `TypewriterText` (line 10) to dynamic calculation or remove it:
     ```tsx
     // If variable typewriter speed is intended:
     const delay = Math.max(150, Math.min(1200, text.length * speed));
     const timer = setTimeout(() => { ... }, delay);
     ```
3. In `eslint.config.mjs`:
   Configure `@typescript-eslint/no-unused-vars` to permit underscore prefixes:
   ```javascript
   {
     rules: {
       "@typescript-eslint/no-unused-vars": [
         "warn",
         {
           argsIgnorePattern: "^_",
           varsIgnorePattern: "^_",
           caughtErrorsIgnorePattern: "^_",
         },
       ],
     },
   }
   ```

#### Remediation F-03 & F-09: Update `tsconfig.json` Compiler Options
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    "tests/**/*.ts",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules", ".agents"]
}
```
And guard `FormulaBreakdown.tsx:14`:
```tsx
const variable =
  selected === null ? undefined : block.parts[selected]?.variable;
```

#### Remediation F-04: Add Scoped `src/app/lesson/[lessonId]/error.tsx`
```tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lesson render error:", error);
  }, [error]);

  return (
    <div className="standard-page">
      <Link href="/courses" className="back-link">
        <ArrowLeft size={16} />
        Back to course catalog
      </Link>
      <section className="panel-card empty-state">
        <h1>Lesson currently unavailable</h1>
        <p>This lesson encountered an unexpected issue while rendering interactive components.</p>
        {error.digest && (
          <code className="mt-2 block text-xs text-gray-500">ID: {error.digest}</code>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          <button className="button primary" onClick={reset}>
            <RotateCcw size={16} />
            Try again
          </button>
          <Link className="button secondary" href="/courses">
            Choose another lesson
          </Link>
        </div>
      </section>
    </div>
  );
}
```

#### Remediation F-05: Replace Raw Synchronous Throws with Safe Fallback UI
In `src/components/lesson/LessonRenderer.tsx`:
```tsx
// Before (lines 242-243):
const problem = lesson.practiceProblems.find((p) => p.id === id);
if (!problem) throw new Error(`Unknown practice problem ${id}`);

// After:
const problem = lesson.practiceProblems.find((p) => p.id === id);
if (!problem) {
  return (
    <div key={id} className="p-4 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
      <p className="text-sm font-medium">Practice question unavailable ({id}).</p>
    </div>
  );
}
```

#### Remediation F-06: Fix ESLint Performance in `eslint.config.mjs`
```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "next-env.d.ts",
    ".qa/**",
    ".agents/**",
    "scripts/**",
    "dist/**",
    "coverage/**",
  ]),
]);
```

#### Remediation F-07: Add Rehydration Sanitizer to `progress-store.ts`
```ts
// In createProgressStore persist options:
storage: createJSONStorage(() =>
  typeof window !== "undefined" ? window.localStorage : dummyStorage
),
onRehydrateStorage: () => (state) => {
  if (!state) return;
  // Ensure array collections are valid arrays
  if (!Array.isArray(state.completedLessons)) state.completedLessons = [];
  if (!Array.isArray(state.unlockedLessons)) state.unlockedLessons = [];
  if (!Array.isArray(state.achievements)) state.achievements = [];
  if (!Number.isFinite(state.xp) || state.xp < 0) state.xp = 0;
  if (!Number.isFinite(state.level) || state.level < 1) state.level = 1;
},
```

#### Remediation F-08: Protect Against Zero Division in `lessonCompletion`
In `src/lib/lesson-progress.ts`:
```ts
export function lessonCompletion(
  lesson: LessonContent,
  activity: LessonActivity,
) {
  const requirements = lessonRequirements(lesson);
  let total = 0,
    done = 0;
  for (const key of ["completed", "practice", "quiz"] as const) {
    total += requirements[key].length;
    done += requirements[key].filter((id) => activity[key].includes(id)).length;
  }
  return {
    done,
    total,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
    complete: total > 0 && done === total,
  };
}
```

---

## 4. Caveats

1. **Audit-Only Constraint**: No project source files were altered during this audit. All findings and proposed code changes are presented for review and downstream implementation.
2. **Dynamic Route Type Generation**: In Next.js 16, page route params are typed as `Promise<{ param: string }>`. `src/app/lesson/[lessonId]/page.tsx` and `src/app/path/[directionId]/page.tsx` already correctly implement async params resolution (`await params`), which is compatible with Next.js 16 / React 19.
3. **External Dependencies**: Deprecations inside `node_modules/@react-three` or `three` are governed by upstream vendor releases; our scope is constrained to project authoring code.

---

## 5. Conclusion

The Uplift University codebase exhibits strong foundational type definitions across domain models, 100% test pass rates across 73 unit and integration tests, and clean typechecking under its default configuration.

However, Pillar 4 exhibits **several notable code quality and resilience vulnerabilities**:
1. **Critical Failure Resilience Gap**: Missing `global-error.tsx` leaves the application vulnerable to fatal white screens if root providers fail. Sub-routes lack isolated `error.tsx` boundaries, magnifying isolated component errors.
2. **ESLint Acceptance Criteria Violation**: `npm run lint` emits 5 unused variable warnings in `IslandSignposts.tsx` and `ChatAssessment.tsx`, violating the 0-error/0-warning acceptance criteria, exacerbated by multi-minute lint crawls across unignored `.agents/**` directories.
3. **Type Strictness Blind Spots**: The absence of `noUncheckedIndexedAccess: true` and `forceConsistentCasingInFileNames: true` in `tsconfig.json` masks potential runtime `TypeError` crashes on array/map indexing (e.g. `FormulaBreakdown.tsx:14`) and cross-platform CI build failures.
4. **State Rehydration and Math Edge Cases**: Unsanitized `localStorage` rehydration in `progress-store.ts` and zero-division `NaN%` propagation in `lesson-progress.ts` expose the UI to state corruption and invalid displays.

Addressing these 20 prioritized findings according to the remediation roadmap will elevate the codebase to tier-1 enterprise TypeScript strictness and zero-defect resilience.

---

## 6. Verification Method

Independent verification steps to confirm findings:

1. **Verify ESLint 5 Warnings & Sluggish Performance**:
   ```powershell
   npm run lint
   ```
   *Expected Outcome*: Emits 5 warnings (`@typescript-eslint/no-unused-vars` in `IslandSignposts.tsx` and `ChatAssessment.tsx`). Note execution duration without `.agents` ignore.

2. **Verify TypeScript Strictness & Index Access Flaw**:
   Inspect `src/components/lesson/FormulaBreakdown.tsx` at line 14:
   ```powershell
   Get-Content src/components/lesson/FormulaBreakdown.tsx | Select-Object -Index 13
   ```
   *Expected Line*: `selected === null ? undefined : block.parts[selected].variable;` (accessing `.variable` on `block.parts[selected]` without optional chaining).

3. **Verify Absence of Global Error Boundary**:
   ```powershell
   Test-Path src/app/global-error.tsx
   ```
   *Expected Outcome*: `False`.

4. **Verify Test Suite Baseline**:
   ```powershell
   npm test
   ```
   *Expected Outcome*: 73 tests passing cleanly.

5. **Verify TypeScript Baseline**:
   ```powershell
   npm run typecheck
   ```
   *Expected Outcome*: 0 diagnostics under current `tsconfig.json`.
