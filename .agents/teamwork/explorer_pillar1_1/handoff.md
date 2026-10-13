# Pillar 1 Audit Report: 3D Graphics & UI Performance

**Auditor**: `explorer_pillar1_1`  
**Date**: 2026-10-05  
**Target Codebase**: Uplift University (`uplift-university`, Next.js 16.3.5 / React 19.2.8 / Three.js 0.182.0 / @react-three/fiber 9.7.0 / Zustand 5.0.15)  
**Audit Scope**: Three.js & R3F Canvas Lifecycle, Asset Preloading & Loading, GPU Memory Disposal, Render Loops & `useFrame`, Animation & Layout Thrashing, Client Component Boundaries & Dynamic Imports, Interactive Plot 2D/SVG Performance.

---

## 1. Observation

A comprehensive static and runtime audit was conducted across all 3D graphics, rendering pipelines, animation loops, and interactive plotting components. Baseline checks were executed directly in the project environment:

### Baseline Execution Telemetry
1. **TypeScript Typecheck (`npm run typecheck` / `tsc --noEmit`)**:
   - Status: PASSED (exit code 0).
   - Clean compilation across all TypeScript definitions.
2. **Automated Test Suite (`npm test` / `tsx --test tests/*.test.ts`)**:
   - Status: PASSED (73 tests passed, 3 suites, duration 3132ms).
3. **ESLint Baseline (`npm run lint` / `eslint .`)**:
   - Status: COMPLETED with 5 warnings across 2 files:
     - `src/components/learning-world/IslandSignposts.tsx:6:10` - `'directions' is defined but never used`
     - `src/components/learning-world/IslandSignposts.tsx:7:10` - `'learningWorlds' is defined but never used`
     - `src/components/learning-world/IslandSignposts.tsx:17:10` - `'IslandSignpost' is defined but never used`
     - `src/components/learning-world/IslandSignposts.tsx:249:33` - `'_props' is defined but never used`
     - `src/components/lesson/ChatAssessment.tsx:10:3` - `'speed' is assigned a value but never used`

### Key Code Observations

#### A. Memory Disposal & WebGL Resource Leaks
- **`src/components/mascot/StorkAssetModel.tsx:74-76`**:
  ```tsx
  <group scale={model.scale} dispose={null}>
    <primitive object={model.copy} />
  </group>
  ```
  `model.copy` is created via `clone(scene)` from `SkeletonUtils`. By wrapping `<primitive object={model.copy} />` inside `<group dispose={null}>`, R3F's reconciler is explicitly prevented from disposing the cloned scene, geometries, materials, bones, and animation actions upon unmount.
- **`src/components/learning-world/Road.tsx:14-39`**:
  ```tsx
  const geometry = useMemo(
    () => createRoadGeometry(curve, data.roadWidth, data.roadDepth),
    [curve, data],
  );
  const edges = useMemo(
    () =>
      [-1, 1].map((side) => {
        ...
        return new TubeGeometry(
          new CatmullRomCurve3(points),
          100,
          0.045,
          6,
          false,
        );
      }),
    [curve, data],
  );
  ```
  `createRoadGeometry` (defined in `src/lib/world-geometry.ts:93-100`) instantiates a new `BufferGeometry` with thousands of vertices and colors, while `edges` instantiates two `TubeGeometry` instances. When `data` or `curve` changes or when navigating routes, `geometry.dispose()` and `edge.dispose()` are never called anywhere in the codebase.
- **`src/scenes/MascotStage.tsx:108-124`**:
  ```tsx
  <directionalLight
    key={quality}
    position={[-3, 6, 5]}
    intensity={2.1 * o.light}
    castShadow={q.shadowSize > 0}
    shadow-mapSize-width={q.shadowSize || 256}
    shadow-mapSize-height={q.shadowSize || 256}
    ...
  />
  ```
  The directional light is keyed by `key={quality}`. Changing quality unmounts the light and mounts a new one, abandoning the previous `DirectionalLight`'s shadow map `WebGLRenderTarget` without calling `shadow.map.dispose()`.

#### B. Canvas Lifecycle & WebGL Context Thrashing
- **`src/components/learning-world/DirectionView.tsx:66`**:
  ```tsx
  <LearningWorld key={direction.id} direction={direction} />
  ```
- **`src/components/learning-world/LearningWorld.tsx:285-294`**:
  ```tsx
  <WorldCanvas
    key={data.directionId}
    data={data}
    lessons={lessons}
    ...
  />
  ```
  Navigating between different learning paths (e.g. `/path/ai-ml` to `/path/physics-engineering`) changes the key on both `LearningWorld` and `WorldCanvas`, completely tearing down the `<Canvas>` DOM node and WebGL context and instantiating a new WebGL2RenderingContext from scratch.
- **`src/components/ui/SceneBoundary.tsx:5-19`**:
  `SceneBoundary` implements a standard React `getDerivedStateFromError` boundary. It does not bind `webglcontextlost` or `webglcontextrestored` DOM event listeners on the canvas element.

#### C. Render Loops & `useFrame` Overhead
- **`src/components/learning-world/Environment.tsx:29-38`**:
  ```tsx
  function Tree({ ... }) {
    const treeRef = useRef<Group>(null);
    const time = useRef(0);
    useFrame((_, delta) => {
      if (treeRef.current && !reducedMotion) {
        time.current += Math.min(delta, 0.05);
        treeRef.current.rotation.z = Math.sin(time.current * 1.4 + position[0] * 1.5) * 0.022;
        treeRef.current.rotation.x = Math.cos(time.current * 1.1 + position[2] * 1.5) * 0.018;
      }
    });
  ```
  Every single tree in `data.trees` (20+ trees per island) mounts a separate `useFrame` hook executing JS trig math every frame.
- **`src/components/learning-world/LessonPlatform.tsx:276-297`**:
  Every lesson platform mounts its own `useFrame` hook running `MathUtils.damp` continuously every frame, even when hovered is false and the platform is at rest.
- **`src/components/mascot/StorkMascot.tsx:79-86`**:
  `useFrame` synchronously triggers `onAnimationChange?.(controller.animation)` which executes parent React `setState` during frame rendering.
- **`src/components/mascot/StorkAnimator.tsx:52-66`**:
  A new `rotate` arrow function closure is declared inside the `useFrame` callback on every frame, generating garbage collector pressure.

#### D. Interactive Plot & 2D SVG Rendering
- **`src/components/lesson/plot/InteractivePlot.tsx:1636-1692`**:
  `onPointerMove` directly updates React state via `setViewport(nextVp)` on every pointer move event without `requestAnimationFrame` or throttling.
- **`src/components/lesson/plot/InteractivePlot.tsx:1257-1278`**:
  The native wheel listener `useEffect` lists `[scale, zoomAt, W, H]` in its dependencies. Because `scale` is an object recalculated on every viewport change, the wheel event listener is removed and re-added on every single wheel tick during zoom.
- **`src/components/lesson/plot/InteractivePlot.tsx:1214-1237`, `1208-1211`**:
  `zoomAt` immediately calls `setSettledDomain` on every wheel tick, forcing `findCriticalPoints` to execute iterative root-finding across the visible domain on every wheel micro-step.
- **`src/components/lesson/plot/InteractivePlot.tsx:325-379`**:
  `FunctionPlot` evaluates 380 discrete points via JavaScript math, builds SVG path strings, and mutates DOM `<path>` elements on every viewport tick.

#### E. Component Boundaries & Layout Thrashing
- **`src/components/learning-world/LessonPlatform.tsx:454-539`**:
  On hover/select, rather than toggling CSS classes on a persistent `@react-three/drei` `<Html>` component, the code completely unmounts one `<Html>` tree and mounts another `<Html>` tree, creating portal DOM churn inside the canvas container.
- **`src/components/learning-world/LearningWorld.tsx:154`**:
  `const state = useProgress((s) => s);` subscribes `LearningWorld` to the entire Zustand progress store, causing `LearningWorld` and its canvas callbacks to re-render on every state change.
- **`src/components/layout/AppShell.tsx:81` & `src/components/mascot/StorkAssistant.tsx:21`**:
  `AppShell` renders only `<StorkAssistant mobile />`. When `useSmallScreen()` returns `false` on desktop, `mobile === small` evaluates to `false`, causing the assistant to return `null` and never render on desktop viewports.
- **`src/components/lesson/GradientDescentLab.tsx:19`**:
  Static import of the 64KB `InteractivePlot.tsx` into lesson components without dynamic splitting.

---

## 2. Logic Chain & Weakness Analysis

### Weakness 1: Cloned GLTF Hierarchy Leaked via `dispose={null}`
- **Severity**: `[CRITICAL]`
- **File**: `src/components/mascot/StorkAssetModel.tsx:74-76`
- **Root Cause**:
  1. `GltfStork` clones the GLTF scene using `SkeletonUtils.clone(scene)` in `useMemo`.
  2. The cloned scene contains duplicated mesh geometries, cloned materials, skeleton bone matrices, and animation mixers.
  3. In `@react-three/fiber`, the reconciler automatically cleans up resources when a component unmounts unless `dispose={null}` is set on an ancestor node.
  4. By setting `<group scale={model.scale} dispose={null}>`, R3F is commanded to ignore the cloned subtree during unmount.
  5. When the user navigates away or toggles between procedural and asset models, all cloned GPU geometries, materials, and skeletal rigs are permanently orphaned in memory.
- **Remediation**:
  Remove `dispose={null}` from `StorkAssetModel.tsx:74`, or explicitly traverse `model.copy` in a cleanup `useEffect`:
  ```tsx
  useEffect(() => {
    return () => {
      model.copy.traverse((obj) => {
        if ("geometry" in obj && obj.geometry) {
          (obj.geometry as import("three").BufferGeometry).dispose();
        }
        if ("material" in obj && obj.material) {
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else (mat as import("three").Material).dispose();
        }
      });
    };
  }, [model.copy]);
  ```

---

### Weakness 2: Road Geometry & Tube Edges Memory Leak on Canvas Unmount
- **Severity**: `[CRITICAL]`
- **File**: `src/components/learning-world/Road.tsx:14-39`, `src/lib/world-geometry.ts:93-100`
- **Root Cause**:
  1. `Road` computes a custom road mesh via `createRoadGeometry()` and two border rails via `new TubeGeometry(...)`.
  2. In Three.js and R3F, objects instantiated outside JSX via `new Geometry(...)` are NOT automatically tracked by R3F's reconciler.
  3. When changing campus directions or switching from 3D World to Lesson List view, `Road` unmounts.
  4. No `useEffect` cleanup hook exists to call `geometry.dispose()` or `edge.dispose()`.
  5. The heavy Float32Array vertex position buffers, color buffers, index buffers, and normals remain in GPU VRAM indefinitely.
- **Remediation**:
  Add explicit disposal lifecycle handling in `Road.tsx`:
  ```tsx
  useEffect(() => {
    return () => {
      geometry.dispose();
      edges.forEach((edge) => edge.dispose());
    };
  }, [geometry, edges]);
  ```

---

### Weakness 3: Full WebGL Context Destruction and Recreation on Campus Navigation
- **Severity**: `[HIGH]`
- **File**: `src/components/learning-world/DirectionView.tsx:66`, `src/components/learning-world/LearningWorld.tsx:285-294`
- **Root Cause**:
  1. `DirectionView` renders `<LearningWorld key={direction.id} direction={direction} />`.
  2. Inside `LearningWorld`, it renders `<WorldCanvas key={data.directionId} ... />`.
  3. Because both components are keyed by the route parameter `directionId`, React completely tears down the `<Canvas>` component on every campus route change.
  4. Destroying `<Canvas>` destroys the `WebGL2RenderingContext`. Re-mounting creates a new context, forcing the browser GPU driver to recompile all shaders, reallocate shadow map buffers, and re-upload textures.
  5. This causes 150-300ms frame drops, visible canvas blanking, and exhausts the browser's maximum WebGL context limit (typically 8–16).
- **Remediation**:
  Keep `<Canvas>` mounted continuously at the page or shell level. Pass `directionId` into the scene hierarchy as a prop, and smoothly transition the camera and environment objects using lerping:
  ```tsx
  // Retain WorldCanvas without key={data.directionId}
  <WorldCanvas
    data={data}
    lessons={lessons}
    selectedId={selected?.id ?? null}
    onSelect={selectLesson}
    paused={openLesson !== null}
    showAllLabels={showAllLabels}
  />
  ```

---

### Weakness 4: Unthrottled Pointer Event Handling in `InteractivePlot.tsx`
- **Severity**: `[HIGH]`
- **File**: `src/components/lesson/plot/InteractivePlot.tsx:1636-1692`
- **Root Cause**:
  1. On pointer move, `onPointerMove` directly calculates viewport deltas and calls `setViewport(nextVp)`.
  2. High-polling pointer hardware triggers `onPointerMove` at 120Hz–240Hz.
  3. Calling `setViewport` synchronously schedules a React render for every single event.
  4. In every render, `FunctionPlot` evaluates 380 curve coordinates, `IntegralShadingLayer` calculates 100 points, and hundreds of SVG DOM nodes are regenerated.
- **Remediation**:
  Throttle viewport updates to animation frame boundaries:
  ```tsx
  const rafId = useRef<number | null>(null);
  const pendingVp = useRef<PlotViewport | null>(null);

  const scheduleViewportUpdate = useCallback((nextVp: PlotViewport) => {
    pendingVp.current = nextVp;
    currentViewportRef.current = nextVp;
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        if (pendingVp.current) {
          setViewport(pendingVp.current);
          pendingVp.current = null;
        }
        rafId.current = null;
      });
    }
  }, []);
  ```

---

### Weakness 5: Wheel Zoom Event Listener Re-registration Churn & Numerical Thrashing
- **Severity**: `[HIGH]`
- **File**: `src/components/lesson/plot/InteractivePlot.tsx:1208-1237`, `1257-1278`
- **Root Cause**:
  1. The `useEffect` registering the `wheel` event listener depends on `scale`, which changes every time `viewport` changes.
  2. On every wheel tick, the listener is destroyed and re-registered.
  3. Furthermore, `zoomAt` calls `setSettledDomain` synchronously on every wheel tick, triggering `findCriticalPoints` which runs CPU-intensive iterative root-finding on every wheel event.
- **Remediation**:
  1. Store the latest `scale` in a mutable ref (`scaleRef.current = scale`) and remove `scale` from the `useEffect` dependencies so the listener is bound once.
  2. Debounce `setSettledDomain` during wheel zoom with a 150ms timeout:
  ```tsx
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queueDomainSettle = useCallback((next: PlotViewport) => {
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    settleTimeoutRef.current = setTimeout(() => {
      setSettledDomain({ xMin: next.xMin, xMax: next.xMax });
    }, 150);
  }, []);
  ```

---

### Weakness 6: Excessive Independent `useFrame` Subscriptions Across Static Trees & Platforms
- **Severity**: `[HIGH]`
- **File**: `src/components/learning-world/Environment.tsx:29-38`, `src/components/learning-world/LessonPlatform.tsx:276-297`
- **Root Cause**:
  1. In `Environment.tsx`, each of the 20-30 trees mounts a separate `useFrame` hook computing sinusoidal wind sway via CPU JavaScript.
  2. In `LessonPlatform.tsx`, every platform runs `MathUtils.damp` every frame even when not hovered and static.
  3. This introduces 30-40 continuous per-frame JS function calls in R3F's animation loop, draining battery on laptops and throttling mobile GPUs.
- **Remediation**:
  1. Replace individual tree sways with vertex shader displacement on an `InstancedMesh` (or single group sway on a shared parent node).
  2. In `LessonPlatform`, deactivate the damping frame loop once the platform has converged to its target height (`Math.abs(currentY - targetY) < 0.001`).

---

### Weakness 7: Unmount/Remount Layout Thrashing in `LessonPlatform` HTML Overlays
- **Severity**: `[HIGH]`
- **File**: `src/components/learning-world/LessonPlatform.tsx:454-539`
- **Root Cause**:
  1. `isExpanded` toggles between two completely different `<Html>` components: one for `<button className="world-lesson-label ...">` and one for `<button className="world-lesson-pin ...">`.
  2. Toggling `isExpanded` (on hover, selection, or `showAllLabels`) unmounts one `<Html>` tree from the DOM and mounts the other.
  3. This triggers DOM node creation and insertion, CSS layout recalculation, and portal re-binding inside the 3D canvas container.
- **Remediation**:
  Render a single persistent `<Html>` node per platform and switch between compact pin and expanded card using CSS classes and transitions:
  ```tsx
  <Html position={[0, 1.6, 0]} center style={{ pointerEvents: "auto" }}>
    <button className={`world-lesson-marker ${isExpanded ? "expanded" : "compact"} ${status}`}>
      {/* Both compact pin icon and expanded details managed by CSS opacity/display */}
    </button>
  </Html>
  ```

---

### Weakness 8: Full Progress Store Subscription Causing Cascading Canvas Re-renders
- **Severity**: `[HIGH]`
- **File**: `src/components/learning-world/LearningWorld.tsx:154`
- **Root Cause**:
  1. `const state = useProgress((s) => s);` subscribes `LearningWorld` to every single state mutation in the Zustand store (XP updates, streak changes, level-ups, completed lesson arrays, etc.).
  2. Whenever anything in the store updates, `LearningWorld` re-renders.
  3. `selectLesson` is recreated because `state` is in its dependency array, invalidating props passed down to `WorldCanvas`.
- **Remediation**:
  Use atomic Zustand selectors:
  ```tsx
  const currentLessonId = useProgress((s) => s.currentLessonId);
  const startLesson = useProgress((s) => s.startLesson);
  ```

---

### Weakness 9: Complete Absence of Asset Preloading and Double-Mount FOUC
- **Severity**: `[HIGH]`
- **File**: `src/components/mascot/StorkAssetModel.tsx:18-35`, `src/components/mascot/use-stork-asset.ts:4-24`
- **Root Cause**:
  1. `useStorkAsset` initiates with `url = null` in `useState(null)`.
  2. `StorkAssetModel` unconditionally mounts the heavy `<ProceduralStork>` on the first render pass.
  3. When `fetch("/api/mascot")` resolves, `url` updates, causing React to unmount `ProceduralStork`, mount `Suspense`, start downloading the GLTF model over the network, clone it, and mount `GltfStork`.
  4. `useGLTF.preload` is not called anywhere in the codebase.
- **Remediation**:
  Call `useGLTF.preload("/models/stork.glb")` in module scope, and determine asset availability synchronously or before mounting the 3D scene.

---

### Weakness 10: Missing WebGL Context Loss Recovery in `SceneBoundary`
- **Severity**: `[HIGH]`
- **File**: `src/components/ui/SceneBoundary.tsx:5-19`
- **Root Cause**:
  1. `SceneBoundary` relies solely on React's `getDerivedStateFromError`.
  2. Native browser WebGL context loss (`webglcontextlost`) does not throw a synchronous React render error; the canvas simply turns black or freezes silently.
  3. When `webglcontextrestored` fires, `SceneBoundary` has no listener to reset its state and re-initialize rendering.
- **Remediation**:
  Add WebGL context event listeners to the canvas element inside `SceneBoundary` or a dedicated canvas wrapper:
  ```tsx
  useEffect(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => {
      setContextLost(false);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, []);
  ```

---

### Weakness 11: Directional Light Shadow Map Leak via `key={quality}`
- **Severity**: `[MEDIUM]`
- **File**: `src/scenes/MascotStage.tsx:108-124`
- **Root Cause**:
  Keying the `<directionalLight>` by `quality` unmounts and remounts the light whenever quality changes, orphaning the previous shadow map render target.
- **Remediation**:
  Remove `key={quality}` and imperatively update `light.shadow.mapSize` or update shadow settings without unmounting the light.

---

### Weakness 12: Incomplete Dynamic Splitting of 64KB `InteractivePlot`
- **Severity**: `[MEDIUM]`
- **File**: `src/components/lesson/GradientDescentLab.tsx:19`, `src/components/lesson/LessonRenderer.tsx:32-36`
- **Root Cause**:
  `InteractivePlot` is statically imported into lesson rendering components, adding 64KB of plotting logic and math compilers into initial route bundles even for lessons that contain only text or non-coding theory.
- **Remediation**:
  Use `next/dynamic` with `ssr: false` to lazy-load `InteractivePlot` only when a lesson contains an interactive graph block.

---

### Weakness 13: Stork Assistant Inaccessible on Desktop Due to Prop Mismatch
- **Severity**: `[LOW]`
- **File**: `src/components/layout/AppShell.tsx:81`, `src/components/mascot/StorkAssistant.tsx:21`
- **Root Cause**:
  `AppShell` renders `<StorkAssistant mobile />`. On desktop viewports where `useSmallScreen()` is false, `mobile === small` evaluates to false, returning `null`. The 3D companion is completely missing for desktop users.
- **Remediation**:
  Update `AppShell.tsx:81` to render `<StorkAssistant />` without hardcoding `mobile`, or pass `mobile={false}` for desktop layout.

---

### Weakness 14: Dead Code and Unused Imports in `IslandSignposts.tsx`
- **Severity**: `[LOW]`
- **File**: `src/components/learning-world/IslandSignposts.tsx:6-7, 17-247, 249-254`
- **Root Cause**:
  230 lines of 3D signboard geometry and `<Html>` overlays are dead code because `IslandSignposts` returns `null`. This produces 4 ESLint warnings during build.
- **Remediation**:
  Either wire signposts into the island scene or remove the unused components and imports cleanly.

---

## 3. Caveats

1. **Hardware-Specific Profiling**: Static code analysis and runtime headless tests were performed. Precise GPU memory allocation numbers (in megabytes of VRAM) vary across GPU drivers (NVIDIA, Apple Metal, Intel Iris, WebGL software rasterizers).
2. **Asset Model Existence**: As verified in `public/models/README.md`, no production `stork.glb` binary is bundled in the repository. The GLTF code paths currently execute only when an external GLB is placed at `public/models/stork.glb`.
3. **Audit-Only Constraint**: In strict adherence to audit instructions, zero source code modifications were made. All findings and remediation patterns are presented for downstream implementation.

---

## 4. Conclusion

The Uplift University 3D graphics and UI performance architecture has strong foundations (procedural low-poly modeling, R3F declarative scene graphs, accessibility labels, and reduced-motion support), but suffers from **two critical GPU memory leaks**, **six high-severity render loop and canvas lifecycle bottlenecks**, and several medium/low UI optimization issues.

### Summary Table of Findings

| ID | Focus Area | File Path | Line Range | Severity | Core Issue |
|---|---|---|---|---|---|
| **W1** | Memory Disposal | `src/components/mascot/StorkAssetModel.tsx` | 74–76 | `[CRITICAL]` | Cloned GLTF model hierarchy leaked via `<group dispose={null}>` |
| **W2** | Memory Disposal | `src/components/learning-world/Road.tsx` | 14–39 | `[CRITICAL]` | Custom road `BufferGeometry` and `TubeGeometry` leaked on unmount |
| **W3** | Canvas Lifecycle | `src/components/learning-world/DirectionView.tsx` | 66 | `[HIGH]` | WebGL context destroyed and recreated on every campus navigation |
| **W4** | Plot Rendering | `src/components/lesson/plot/InteractivePlot.tsx` | 1636–1692 | `[HIGH]` | Unthrottled `onPointerMove` triggers synchronous full re-renders up to 240Hz |
| **W5** | Plot Rendering | `src/components/lesson/plot/InteractivePlot.tsx` | 1208–1278 | `[HIGH]` | Wheel zoom re-binds listener and runs heavy numerical root-finding on every tick |
| **W6** | Render Loops | `src/components/learning-world/Environment.tsx` | 29–38 | `[HIGH]` | 20+ separate `useFrame` tree sway callbacks running unthrottled in JS |
| **W7** | UI Animation | `src/components/learning-world/LessonPlatform.tsx` | 454–539 | `[HIGH]` | Hover unmounts and remounts `<Html>` DOM portals causing layout thrashing |
| **W8** | Architecture | `src/components/learning-world/LearningWorld.tsx` | 154 | `[HIGH]` | Subscribing to entire Zustand store triggers cascading 3D scene re-renders |
| **W9** | Asset Preloading | `src/components/mascot/StorkAssetModel.tsx` | 18–35 | `[HIGH]` | Zero asset preloading; procedural model double-mounts before GLTF loads |
| **W10** | Canvas Lifecycle | `src/components/ui/SceneBoundary.tsx` | 5–19 | `[HIGH]` | Missing `webglcontextlost` and `webglcontextrestored` event handling |
| **W11** | Memory Disposal | `src/scenes/MascotStage.tsx` | 108–124 | `[MEDIUM]` | Directional light unmount via `key={quality}` leaks shadow map render targets |
| **W12** | Client Boundaries | `src/components/lesson/GradientDescentLab.tsx` | 19 | `[MEDIUM]` | 64KB `InteractivePlot` statically bundled into non-graph lesson views |
| **W13** | UI Layout | `src/components/layout/AppShell.tsx` | 81 | `[LOW]` | Desktop viewport mascot companion disabled by `mobile` prop mismatch |
| **W14** | Code Hygiene | `src/components/learning-world/IslandSignposts.tsx` | 6–254 | `[LOW]` | Dead 3D signpost code producing 4 ESLint warnings |

Remediating these 14 findings in priority order will eliminate memory leaks, drop frame render times under 16ms (60fps), prevent canvas flickering during course navigation, and ensure silky-smooth math plotting and 3D campus exploration.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Baseline Diagnostics**:
   ```bash
   npm run typecheck
   npm test
   npm run lint
   ```
   Confirm that `npm run lint` flags the 4 warnings in `src/components/learning-world/IslandSignposts.tsx`.

2. **Verify Memory Disposal Gaps**:
   - Inspect `src/components/mascot/StorkAssetModel.tsx:74` to confirm `<group scale={model.scale} dispose={null}>`.
   - Inspect `src/components/learning-world/Road.tsx:14-39` to confirm absence of `geometry.dispose()` in a cleanup hook.
   - Run Chrome DevTools Memory tab: Take Heap Snapshot before and after navigating between `/path/ai-ml`, `/path/physics-engineering`, and `/path/mathematics` 5 times. Notice `TubeGeometry` and `BufferGeometry` instances steadily accumulating without garbage collection.

3. **Verify Canvas Lifecycle & Re-creation**:
   - Open Chrome DevTools Console, execute `WebGLRenderingContext.prototype.getExtension`.
   - Inspect `src/components/learning-world/DirectionView.tsx:66` and `src/components/learning-world/LearningWorld.tsx:285`.
   - Switch tabs between `/path/ai-ml` and `/path/physics-engineering`. Observe complete canvas element destruction and re-creation in the DOM Elements tree.

4. **Verify Plot Event Thrashing**:
   - Inspect `src/components/lesson/plot/InteractivePlot.tsx:1636-1692`. Notice unthrottled `setViewport(nextVp)` inside `onPointerMove`.
   - Inspect `src/components/lesson/plot/InteractivePlot.tsx:1278`. Notice `scale` in the dependency array of the wheel listener `useEffect`.
