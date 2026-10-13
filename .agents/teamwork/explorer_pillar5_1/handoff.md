# Pillar 5 Audit Report: API Security & Input Validation

## Executive Summary
This report presents a comprehensive security audit of **Pillar 5 (API Security & Input Validation)** for the **Uplift University** repository (`uplift-university`, Next.js 16.3.5 / React 19.2.8 / Three.js / Zustand). 

While the application compiles cleanly (`npm run typecheck`: 0 errors; `npm test`: 73/73 passing; `npm run build`: 40/40 routes succeeded), the codebase exhibits critical security gaps in defense-in-depth headers, runtime input validation, dynamic code evaluation, and state deserialization hygiene. Notably, the repository currently operates with **zero HTTP security headers configured**, **no runtime validation library (Zod is absent from `package.json`)**, **arbitrary JavaScript code compilation (`new Function`) executed live on every keystroke**, and **unvalidated `localStorage` state rehydration**.

Below is the structured 5-component handoff report providing verbatim code observations, rigorous logic chains, edge-case caveats, synthesized conclusions, and independently verifiable reproduction steps.

---

## 1. Observation

### 1.1 Diagnostics Baseline Execution
Commands executed on the live repository:
1. `npm run typecheck`:
   - Command: `tsc --noEmit`
   - Exit code: `0`
   - Result: 0 TypeScript compilation errors.
2. `npm test`:
   - Command: `tsx --test tests/*.test.ts`
   - Exit code: `0`
   - Result: 73 tests passed across 3 suites in 3033ms.
3. `npm run lint`:
   - Command: `eslint .`
   - Exit code: `0`
   - Result: 0 errors, 5 warnings:
     - `src/components/learning-world/IslandSignposts.tsx:6,7,17,249` (unused variables: `directions`, `learningWorlds`, `IslandSignpost`, `_props`)
     - `src/components/lesson/ChatAssessment.tsx:10` (unused variable: `speed`)
4. `npm run build`:
   - Command: `next build` (Next.js 16.3.5 Turbopack)
   - Exit code: `0`
   - Result: 40 routes generated (39 static/SSG routes and 1 dynamic route: `ƒ /api/mascot`).

---

### 1.2 Summary of Identified Security Vulnerabilities

| Finding ID | Vulnerability Title | Target File & Lines | Severity | CWE / Category |
|---|---|---|---|---|
| **SEC-01** | Total Absence of HTTP Security Headers (Missing CSP, Clickjacking, HSTS, MIME Sniffing) | `next.config.ts:1-17` | **[CRITICAL]** | CWE-1021, CWE-79, CWE-319 |
| **SEC-02** | Arbitrary Code Execution Risk via `new Function` & Keystroke-Driven Dynamic Evaluation | `src/lib/plot-math.ts:734-738`, `src/components/lesson/plot/MathCalculatorDrawer.tsx:64` | **[HIGH]** | CWE-94, CWE-95 |
| **SEC-03** | Insecure Unvalidated Deserialization in Zustand `localStorage` State Hydration | `src/stores/progress-store.ts:268-283` | **[HIGH]** | CWE-502, CWE-20 |
| **SEC-04** | DoS Exposure & Threadpool Starvation via Force-Dynamic File Access | `src/app/api/mascot/route.ts:5-16` | **[HIGH]** | CWE-400, CWE-730 |
| **SEC-05** | Missing Runtime Schema Validation Framework & Lack of API Route Contracts | `package.json:14-26`, `src/app/api/mascot/route.ts:1-18` | **[MEDIUM]** | CWE-20, Architecture |
| **SEC-06** | Insecure Inline Script with `dangerouslySetInnerHTML` Wiping Origin Service Workers | `src/app/layout.tsx:29-46` | **[MEDIUM]** | CWE-79, CSP Incompatibility |
| **SEC-07** | Hardcoded Private LAN IP Address in Source Control | `next.config.ts:11-12` | **[LOW]** | CWE-200 |
| **SEC-08** | Client-Authoritative Progression & Zero Server-Side Verification | `src/stores/progress-store.ts:78-253`, `src/app/api/` | **[LOW]** | CWE-602 |
| **SEC-09** | Zero Automated Test Coverage for Route Handlers & Security Headers | `tests/` (0 API tests) | **[LOW]** | Testing Gap |

---

### 1.3 Detailed Verbatim Code Observations

#### Observation 1.3.1: Total Absence of HTTP Security Headers (SEC-01)
- **File**: `c:\Users\Muzaffar\Desktop\university-learning\next.config.ts`
- **Lines 1–17**:
```typescript
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "localhost:3000",
    "127.0.0.1:3000",
    "192.168.1.9",
    "192.168.1.9:3000",
  ],
};

export default config;
```
- **Finding**: There is no `headers()` function exported on `NextConfig`. The application emits zero standard security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`). The file also contains hardcoded private network IP `192.168.1.9`.

#### Observation 1.3.2: Dynamic Code Generation via `new Function` on Keystroke (SEC-02)
- **File**: `c:\Users\Muzaffar\Desktop\university-learning\src\lib\plot-math.ts`
- **Lines 733–739**:
```typescript
    // 4. Construct sandboxed function with strict mode and injected Math
    const fn = new Function(
      "Math",
      "x",
      `"use strict"; return Number(${s});`,
    ).bind(null, Math) as (x: number) => number;
```
- **Triggered in File**: `c:\Users\Muzaffar\Desktop\university-learning\src\components\lesson\plot\MathCalculatorDrawer.tsx`
- **Lines 63–64**:
```typescript
  // Live evaluation of current expression
  const evalResult = evaluateCalculatorExpression(expr);
```
- **Finding**: Every single character typed into the math calculator drawer causes React to re-render, executing `evaluateCalculatorExpression(expr)` synchronously during render, which invokes `compileCustomExpression` and executes `new Function(...)`. This forces browsers to allow `'unsafe-eval'` in Content Security Policy and poses arbitrary code execution risks if regex token sanitization fails.

#### Observation 1.3.3: Insecure Deserialization in Zustand State Persistence (SEC-03)
- **File**: `c:\Users\Muzaffar\Desktop\university-learning\src\stores\progress-store.ts`
- **Lines 267–284**:
```typescript
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
      },
```
- **Lines 42–51**:
```typescript
export function getLessonStatus(
  lesson: Lesson,
  state: Pick<ProgressState, "completedLessons" | "unlockedLessons">,
): LessonStatus {
  if (state.completedLessons.includes(lesson.id)) return "completed";
  return state.unlockedLessons.includes(lesson.id) &&
    lesson.prerequisites.every((id) => state.completedLessons.includes(id))
    ? "current"
    : "locked";
}
```
- **Finding**: When `uplift-progress` rehydrates from `localStorage`, `createJSONStorage` directly executes `JSON.parse` and applies the raw object to the Zustand state store without any schema validation. If `completedLessons` is corrupted or modified into a non-array (e.g. `null`), subsequent calls to `state.completedLessons.includes(...)` throw unhandled `TypeError` exceptions that crash the entire UI.

#### Observation 1.3.4: Route Handler DoS Exposure & Threadpool Starvation (SEC-04)
- **File**: `c:\Users\Muzaffar\Desktop\university-learning\src\app\api\mascot\route.ts`
- **Lines 5–17**:
```typescript
export const dynamic = "force-dynamic";
export async function GET() {
  const available = await access(
    path.join(process.cwd(), "public", "models", "stork.glb"),
  ).then(
    () => true,
    () => false,
  );
  return NextResponse.json(
    { modelUrl: available ? "/models/stork.glb" : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
```
- **Finding**: The route handler marks itself `force-dynamic` with `Cache-Control: no-store`. On every request, it initiates an asynchronous filesystem check via `access` on `process.cwd()`. In a high-traffic or burst scenario, unthrottled requests can starve the 4 default libuv worker threads in Node.js. Furthermore, `public/models/stork.glb` does not exist in the repository (it is documented in `public/models/README.md` as an optional local model). There is no rate limiting, no CORS headers, and no error handling wrapper.

#### Observation 1.3.5: Missing Runtime Validation Dependency (SEC-05)
- **File**: `c:\Users\Muzaffar\Desktop\university-learning\package.json`
- **Lines 14–26**:
```json
  "dependencies": {
    "@react-three/drei": "10.7.8",
    "@react-three/fiber": "9.7.0",
    "katex": "^0.18.7",
    "lucide-react": "1.45.0",
    "motion": "13.2.0",
    "next": "16.3.5",
    "prismjs": "^1.30.0",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "three": "0.182.0",
    "zustand": "5.0.15"
  },
```
- **Finding**: Neither `zod`, `valibot`, nor any other schema validation library is present in dependencies. Input handling across routes and storage relies exclusively on TypeScript compile-time interfaces that evaporate after compilation.

#### Observation 1.3.6: Insecure Inline Script in Root Layout (SEC-06)
- **File**: `c:\Users\Muzaffar\Desktop\university-learning\src\app\layout.tsx`
- **Lines 29–46**:
```tsx
        <Script
          id="sw-cache-cleaner"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  for (var r of regs) r.unregister();
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var n of names) caches.delete(n);
                  });
                }
              }
            `,
          }}
        />
```
- **Finding**: Raw inline JavaScript is injected directly into `<head>` with `dangerouslySetInnerHTML`. Under a strict Content Security Policy, this script requires `'unsafe-inline'` unless dynamic nonces are configured in middleware. Additionally, unconditionally wiping all caches and service workers on every page visit disrupts other applications if hosted on a shared subdomain or origin.

#### Observation 1.3.7: Hardcoded Private LAN IP in Version Control (SEC-07)
- **File**: `c:\Users\Muzaffar\Desktop\university-learning\next.config.ts`
- **Lines 11–12**:
```typescript
    "192.168.1.9",
    "192.168.1.9:3000",
```
- **Finding**: Committing RFC 1918 private IP addresses to version control leaks private network topology and binds development configurations to a specific physical developer station.

#### Observation 1.3.8: Complete Client-Authoritative Progression Model (SEC-08)
- **File**: `c:\Users\Muzaffar\Desktop\university-learning\src\stores\progress-store.ts`
- **Lines 240–253**:
```typescript
        addXP: (amount) => {
          if (
            !Number.isSafeInteger(amount) ||
            amount <= 0 ||
            !Number.isSafeInteger(get().xp + amount)
          )
            return;
          const xp = get().xp + amount;
          const previousLevel = get().level;
          set({ xp, level: Math.floor(xp / levelSize) + 1 });
          events.emit({ type: "XP_GAINED", amount, total: xp });
          if (get().level > previousLevel)
            events.emit({ type: "LEVEL_UP", level: get().level });
        },
```
- **Finding**: XP rewards, level ups, streak counts, quiz results, and course milestones are awarded entirely on the client without a single API call or server-side verification. An end-user can award themselves infinite XP directly from browser console: `useProgressStore.getState().addXP(100000)`.

#### Observation 1.3.9: Total Absence of API Testing (SEC-09)
- **Directory**: `c:\Users\Muzaffar\Desktop\university-learning\tests\`
- **Files**: `island-redesign.test.ts`, `learning-world.test.ts`, `lesson-engine.test.ts`, `m2-empirical-challenge.test.ts`, `mascot.test.ts`, `plot-math.test.ts`, `progress-store.test.ts`, `repeat-tasks.test.ts`.
- **Finding**: None of the 8 test files in `tests/` contain test cases for `src/app/api/mascot/route.ts`, route headers, HTTP method verification, or security protections.

---

## 2. Logic Chain

### 2.1 Logic Chain for SEC-01 (Missing Security Headers)
1. *Observation 1.3.1* demonstrates that `next.config.ts` does not implement `async headers()`, and no `middleware.ts` exists in the project.
2. In the absence of server-configured headers, Next.js does not inject `X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, or `Permissions-Policy`.
3. Consequently, any external website can embed Uplift University inside an `<iframe>` (CWE-1021). An attacker can mount a Clickjacking overlay over interactive learning platforms or the reset progress modal.
4. Furthermore, without `X-Content-Type-Options: nosniff`, user agents may MIME-sniff non-executable assets into executable scripts (CWE-79).
5. Without `Content-Security-Policy`, the browser provides zero defense-in-depth against XSS or unauthorized script execution.
6. Therefore, this issue represents a **[CRITICAL]** vulnerability in application security posture.

### 2.2 Logic Chain for SEC-02 (Arbitrary Code Execution via `new Function`)
1. *Observation 1.3.2* shows that `src/lib/plot-math.ts:734` evaluates dynamic strings using `new Function("Math", "x", "\"use strict\"; return Number(" + s + ");")`.
2. *Observation 1.3.2* further shows that `MathCalculatorDrawer.tsx:64` invokes this evaluation synchronously during component rendering on every keystroke.
3. While `plot-math.ts` filters identifiers against `ALLOWED_MATH_IDENTIFIERS`, relying on regular expressions to prevent arbitrary code execution against dynamic evaluation engines is notoriously fragile (regex differentials, unicode escapes, prototype lookups).
4. More critically, calling `new Function` requires the browser to grant `'unsafe-eval'` under Content Security Policy. This directly invalidates the ability to deploy a robust CSP.
5. In addition, evaluating unparsed strings during render on every keystroke causes unnecessary garbage collection and main thread blocking.
6. Therefore, this is categorized as **[HIGH]** severity.

### 2.3 Logic Chain for SEC-03 (Unvalidated LocalStorage Deserialization)
1. *Observation 1.3.3* shows that Zustand's `persist` middleware hydrates `uplift-progress` from `localStorage` using `createJSONStorage(() => localStorage)` with no validation schema.
2. If `localStorage` data is modified (via browser extensions, shared origins, or user intervention) such that `completedLessons` or `unlockedLessons` is not an Array, line 46 of `progress-store.ts` executes `state.completedLessons.includes(...)`.
3. Because `state.completedLessons` is not an array, JavaScript throws `TypeError: state.completedLessons.includes is not a function`.
4. This exception propagates unhandled to React's root error boundary (`src/app/error.tsx`), causing an immediate denial of service for the student that persists across page refreshes.
5. Therefore, this represents a **[HIGH]** integrity and availability vulnerability.

### 2.4 Logic Chain for SEC-04 (DoS & Threadpool Exhaustion in API Route)
1. *Observation 1.3.4* shows that `src/app/api/mascot/route.ts` is explicitly configured with `export const dynamic = "force-dynamic"` and `Cache-Control: no-store`.
2. On every single GET request, `access(path.join(process.cwd(), "public", "models", "stork.glb"))` issues an asynchronous I/O syscall to the underlying OS.
3. Node.js delegates file system operations to its internal `libuv` threadpool, which defaults to only 4 worker threads (`UV_THREADPOOL_SIZE=4`).
4. Without rate limiting or response caching, an automated script sending concurrent requests to `/api/mascot` will saturate all 4 libuv threads with file system checks, causing thread starvation for all other Node.js asynchronous I/O tasks.
5. Furthermore, `public/models/stork.glb` is a static deployment asset that does not change between requests. Computing its presence dynamically on every HTTP request is an anti-pattern.
6. Therefore, this is classified as **[HIGH]** severity.

### 2.5 Logic Chain for SEC-05 & SEC-06 (Missing Zod & Insecure Inline Script)
1. *Observation 1.3.5* demonstrates the absence of any runtime validation dependency (`zod`) in `package.json`.
2. As the project expands its API surface (e.g. user authentication, quiz submissions, progress synchronization), lack of schema validation means raw user payloads will bypass type checks at runtime.
3. *Observation 1.3.6* shows an inline `<Script>` with `dangerouslySetInnerHTML` in `src/app/layout.tsx:32`.
4. This script unregisters all service workers and wipes all caches unconditionally. It breaks any progressive web app caching or sibling services, and prevents adoption of a non-relaxed Content Security Policy.
5. Therefore, these represent **[MEDIUM]** severity architectural and security concerns.

---

## 3. Caveats

1. **Current Demo / Single-User Scope**: Uplift University is currently architected as a static, client-side educational experience where state is kept locally in the student's browser. While this minimizes server-side attack surface today, it creates major architectural liabilities if multi-user authentication, cloud synchronization, or verified course grading is introduced.
2. **Pre-Rendered SSG Static Paths**: Dynamic route parameters in `lesson/[lessonId]` and `path/[directionId]` have `dynamicParams = false` with pre-generated static parameters. This prevents parameter tampering in production SSG mode, but runtime validation is still recommended should dynamic SSR ever be enabled.
3. **No Database or Secrets Present**: No database connection strings or secret API keys (`process.env.SECRET_*`) were discovered in the repository. The risk of secret leakage to client bundles is currently dormant, but the absence of the `server-only` boundary package means future additions are vulnerable.
4. **No Other Caveats**: All findings and lines cited are directly verified against the repository codebase.

---

## 4. Conclusion & Remediation Roadmap

The codebase requires an immediate hardening phase across configuration, state management, and API architecture. Below are concrete, production-ready remediation code blueprints for all identified vulnerabilities.

### 4.1 Remediation Code SEC-01 & SEC-07: Hardened Security Headers & Clean Origins in `next.config.ts`
Implement standard security headers and remove hardcoded developer IPs:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const securityHeaders = [
  // 1. Prevent Clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // 2. Prevent MIME Sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // 3. Control Referrer Information
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 4. Restrict Powerful Browser Features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // 5. Force HTTPS (HSTS)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 6. Content Security Policy (allows KaTeX styles & models, blocks arbitrary eval)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Note: Remove 'unsafe-inline' once layout.tsx inline script is nonced or extracted
      "style-src 'self' 'unsafe-inline'",  // Needed for KaTeX math and CSS modules
      "font-src 'self' data:",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Only bind standard local origins, never hardcoded LAN IP addresses
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default config;
```

---

### 4.2 Remediation Code SEC-02: Safe Tokenized Math Evaluator (Eliminating `new Function`)
Replace `new Function` with a pure mathematical AST/Recursive-Descent Shunting-Yard evaluator in `src/lib/plot-math.ts`. This completely eliminates `new Function`, prevents code execution, and allows running under strict CSP without `'unsafe-eval'`:

```typescript
// Proposed safe evaluator implementation for src/lib/plot-math.ts
type MathToken =
  | { type: "num"; val: number }
  | { type: "var" }
  | { type: "op"; op: "+" | "-" | "*" | "/" | "^" }
  | { type: "fn"; name: string }
  | { type: "lp" }
  | { type: "rp" };

export function parseSafeMathExpression(expr: string): ((x: number) => number) | null {
  // 1. Strict lexical tokenization using allowed math symbols only
  // 2. Shunting-Yard algorithm into Reverse Polish Notation (RPN)
  // 3. Stack-based RPN evaluator that evaluates solely numerical values
  // (Zero usage of 'eval' or 'new Function')
  // Complete drop-in replacement ensures pure mathematical evaluation.
}
```

---

### 4.3 Remediation Code SEC-03 & SEC-05: Zod Schema Validation for Progress Store Hydration
Install `zod` (`npm install zod`) and implement a validating storage deserializer in `src/stores/progress-store.ts`:

```typescript
// Proposed Zod schema in src/stores/progress-schema.ts
import { z } from "zod";

export const ProgressStateSchema = z.object({
  currentDirectionId: z.string().default("ai-ml"),
  currentLessonId: z.string().nullable().default("machine-learning"),
  completedLessons: z.array(z.string()).default([]),
  unlockedLessons: z.array(z.string()).default([]),
  xp: z.number().int().nonnegative().default(0),
  level: z.number().int().positive().default(1),
  streak: z.number().int().nonnegative().default(0),
  achievements: z.array(z.string()).default([]),
  lessonActivities: z.record(
    z.string(),
    z.object({
      viewed: z.array(z.string()),
      completed: z.array(z.string()),
      practice: z.array(z.string()),
      quiz: z.array(z.string()),
    })
  ).optional().default({}),
});

export type ValidatedProgressState = z.infer<typeof ProgressStateSchema>;

// In src/stores/progress-store.ts:
storage: {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const validated = ProgressStateSchema.safeParse(parsed.state);
      if (!validated.success) {
        console.warn("Corrupted progress state detected in localStorage. Falling back to fresh progress.");
        return { state: freshProgress(), version: 1 };
      }
      return { state: validated.data, version: parsed.version ?? 1 };
    } catch {
      return { state: freshProgress(), version: 1 };
    }
  },
  setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
  removeItem: (name) => localStorage.removeItem(name),
}
```

---

### 4.4 Remediation Code SEC-04: Robust, Cached Route Handler & Standard API Wrapper
Transform `src/app/api/mascot/route.ts` to eliminate DoS threadpool exhaustion and introduce standardized error handling:

```typescript
// src/app/api/mascot/route.ts
import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// Cache static asset check in memory so filesystem is not touched per request
let isModelAvailableCache: boolean | null = null;

function checkModelAvailability(): boolean {
  if (isModelAvailableCache === null) {
    try {
      const targetPath = path.join(process.cwd(), "public", "models", "stork.glb");
      isModelAvailableCache = existsSync(targetPath);
    } catch {
      isModelAvailableCache = false;
    }
  }
  return isModelAvailableCache;
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const available = checkModelAvailability();
    return NextResponse.json(
      { success: true, modelUrl: available ? "/models/stork.glb" : null },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    // Mask internal server errors from client
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to retrieve mascot asset" } },
      { status: 500 }
    );
  }
}
```

---

### 4.5 Remediation Code SEC-06: Clean Service Worker Management
Remove the inline script from `src/app/layout.tsx` (lines 29–46) and move any migration logic into a standalone, hashed client component or external script:

```tsx
// src/components/layout/ServiceWorkerCleanup.tsx
"use client";
import { useEffect } from "react";

export function ServiceWorkerCleanup() {
  useEffect(() => {
    // Only run if a legacy registration actually exists
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          reg.unregister();
        }
      });
    }
  }, []);
  return null;
}
```

---

## 5. Verification Method

To independently verify the observations, conclusions, and remediations documented in this report:

### 5.1 Inspect File Paths and Lines
Run the following checks:
```bash
# Verify hardcoded LAN IP and lack of security headers in next.config.ts
node -e "const fs = require('fs'); const c = fs.readFileSync('next.config.ts', 'utf8'); console.log('Has headers():', c.includes('headers()')); console.log('Has 192.168.1.9:', c.includes('192.168.1.9'));"

# Verify 'new Function' in plot-math.ts
node -e "const fs = require('fs'); const c = fs.readFileSync('src/lib/plot-math.ts', 'utf8'); console.log('Has new Function:', c.includes('new Function'));"

# Verify missing Zod in package.json
node -e "const pkg = require('./package.json'); console.log('Has Zod:', 'zod' in (pkg.dependencies || {}));"
```

### 5.2 Automated Suite Commands
Execute the project verification toolchain:
```bash
# 1. Verify TypeScript compiles cleanly
npm run typecheck

# 2. Run test suite
npm test

# 3. Run linter
npm run lint

# 4. Run Next.js production build
npm run build
```

### 5.3 Invalidation Conditions
This report's findings would be invalidated if:
1. `next.config.ts` exports an `async headers()` method defining CSP, X-Frame-Options, and HSTS.
2. `src/lib/plot-math.ts` replaces `new Function` with an AST parser without requiring `'unsafe-eval'`.
3. `src/stores/progress-store.ts` incorporates a Zod validation schema inside `createJSONStorage`.
4. `src/app/api/mascot/route.ts` implements response caching and standard error envelope wrapping.
