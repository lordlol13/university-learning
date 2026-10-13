# Survey Analysis: 3D Learning World (R3) & Quality/Test Infrastructure

**Specialist**: Explorer 3 (3D Learning World & Quality/Test Infrastructure)  
**Date**: 2026-09-30  
**Project**: Uplift University (`university-learning`)  
**Mission**: Audit Requirement R3 (3D Learning World & Island Layout) and Build/Quality/Test Infrastructure.

---

## 1. Executive Summary

- **Requirement R3 Status**: **Fully implemented, robust, and mathematically verified**.
  - All four campus islands (`ai-ml`, `physics-engineering`, `mathematics`, `italian-language`) feature dedicated discipline-specific landmark architecture, thematic 3D apparatuses/monuments, 12 normalized trees across 6 species, raised Catmull-Rom beveled spline roads, and floating directional signposts.
  - Viewer orientation is compensated throughout the scene: all landmark building facades, thematic apparatuses, and symbols face the elevated camera (+Y: 19.5, +Z: 23.5) with upward pitch tilts (7°–21°) and zero backwards faces.
  - Zero mesh clipping or path obstruction: verified via automated tests (`tests/island-redesign.test.ts`) across 5 physical clearance criteria (road spline, platforms, signposts, pairwise entities, and terrain bounds).
  - Step info markers implement an adaptive density system: default "Smart labels" mode renders compact pill pins (height ~25px) to prevent occluding island scenery, expanding only on hover/select, with an optional "All labels" toggle in the toolbar.
- **Quality & Build Infrastructure Status**: **All core verification scripts pass cleanly**.
  - `npm run typecheck`: **PASSED** (0 TypeScript diagnostics, TS 6.0.3).
  - `npm test`: **PASSED** (39/39 passing tests across 6 suites in ~707ms via Node.js native test runner + `tsx`).
  - `npm run lint`: **PASSED** (0 ESLint errors or warnings, ESLint 9.39.5).
  - `npm run build`: **PASSED** (Next.js 16.3.5 Turbopack builds and prerenders all 39 static and dynamic routes in ~1.4s).
- **Identified Gaps & Recommended Fixes**:
  1. Missing automated test suite for the Repeat & Practice engine (`src/lib/repeat-tasks.ts`).
  2. Unused stub components in `src/components/learning-world/` (`IslandNavigator.tsx`, `WorldSwitcher.tsx`).
  3. Direction ID naming note: The canonical direction ID in data and routing is `italian-language` (Title: "Italian Language & Culture", route: `/path/italian-language`).

---

## 2. 3D Learning World & Island Layout Audit (Requirement R3)

### 2.1 3D Canvas & Engine Architecture
- **Framework**: `@react-three/fiber` (v9.7.0), `@react-three/drei` (v10.7.8), and `three` (v0.182.0).
- **Core Canvas Component (`src/components/learning-world/WorldCanvas.tsx`)**:
  - Encapsulated in `SceneBoundary` (`src/components/ui/SceneBoundary.tsx`), providing an accessible text fallback if WebGL is unavailable or disabled.
  - Next.js dynamic import with `ssr: false` in `LearningWorld.tsx` and custom animated loading indicator (`Bringing your campus to life…`).
  - Lighting rig: Warm ambient light (`#fffdf5`, intensity 0.65), hemisphere sky/ground light (`#e8f3ff` / `#7cae58`, intensity 0.65), key directional shadow-casting sun light (`position: [-8, 16, 9]`, intensity 2.5, PCFShadowMap 1024x1024), and fill light (`position: [7, 8, -8]`, intensity 0.5).
  - Dynamic frameloop: `always` when active and unpaused, `demand` when user prefers reduced motion, `never` when tab is hidden, blurred, or a modal lesson dialog is open.
- **Camera Controller (`src/components/learning-world/CameraController.tsx`)**:
  - Smooth camera lerp with easing towards destination vector.
  - Subtle pointer parallax (disabled under reduced motion or mobile viewport).
  - Responsive aspect ratio handling: when aspect ratio < 0.75 (portrait mobile viewports), applies narrow zoom multiplier (1.25x) and adjusts target X center so the island remains perfectly framed without horizontal cutoff.
- **Accessible Fallback**:
  - `LearningWorld.tsx` includes a view switcher between **World** (3D WebGL canvas) and **Lesson list** (DOM accessible list).
  - `LearningPath.tsx` renders an ordered `<ol>` with full semantic landmarks and keyboard accessible navigation.

---

### 2.2 Campus Islands Inventory & Features

| Campus Island / Direction | Landmark Buildings (`Environment.tsx`) | Thematic 3D Scenery (`WorldScenery.tsx` / `PhysicsObjects.tsx`) | Lesson Platforms | Tree Species Distribution |
| :--- | :--- | :--- | :--- | :--- |
| **AI & Machine Learning** (`ai-ml`) | **AI Tech Institute** (`main`): Dark obsidian foundation, cantilever entrance canopy, illuminated brand sign, quantum computing geodesic dome with glowing energy halo, server heat-sink fin tower with status LEDs.<br>**Research Annex** (`annex`): Modern wing with cyan illuminated ribbon windows and solar array. | **Neural Lattice**: 3-layer floating neural network (3 input, 4 hidden, 2 output) with illuminated synaptic connection beams.<br>**Quantum Core**: Superconducting cryogenic column with dual counter-rotating magnetic containment rings.<br>**Tech Overlook**: Ergonomic cyber bench with cyan luminescence and paved tech terrace. | 6 platforms (`python-basics` to `deep-learning`, t: 0.03 → 0.93) | 12 trees: Birch (4), Round Oak (5), Blooming Cherry (3). |
| **Physics & Engineering** (`physics-engineering`) | **Astronomical Observatory** (`observatory`): Heavy stone foundation, cylindrical drum tower with arched windows, hemispherical dome with dark telescope slit aperture and brass peering telescope.<br>**Workshop Annex** (`annex`): Research station with solar array. | **Wind Turbine**: Tapered mast, aviation warning beacon, 3 aerodynamic rotating blades with high-vis red tips.<br>**Harmonic Pendulum**: Mahogany base, protractor arc, brass A-frame, swinging brass bob.<br>**Optical Prism**: Incident collimated white laser refracting into 7 spectral rainbow rays (Red to Violet).<br>**Weather Station Radar**: Rotating parabolic dish (tilted 24°), spinning 3-cup anemometer, PV solar panel.<br>**Vector Gimbal**: Rotating 3D Cartesian basis vectors ($\hat{i}$ red, $\hat{j}$ green, $\hat{k}$ blue) and orbital unit magnitude ring. | 7 platforms (`si-base-units` to `physics-tactical-exam`, t: 0.04 → 0.94) | 12 trees: Alpine Pine (8), Birch (3), Tall Shade Tree (1). |
| **Mathematics & Logic** (`mathematics`) | **Classical Geodesic Atrium** (`main`): Octagonal marble podium, fluted pilasters at all 8 vertices, grand geodesic glass dome with golden wireframe lattice and spire finial, classical entrance portal with pediment gable and golden emblem.<br>**Study Annex** (`annex`): Geometric entrance portal. | **Geometric Solids**: Stepped octagonal marble plinth, compass/ruler inlay, rotating amethyst icosahedron in golden cage, golden dodecahedron, stella octangula.<br>**Möbius Loop**: Parametric continuous one-sided ribbon with traveling luminous energy pulse.<br>**Archimedean Spiral**: Stepped limestone paver tiles with golden nodes ($r = a + b\theta$).<br>**Sine Wave Ribbon**: Harmonic wave steps ($y = \sin x$) along coordinate axis. | 4 platforms (`calc-derivatives` to `linear-systems`, t: 0.08 → 0.89) | 12 trees: Tall Shade Tree (5), Alpine Pine (3), Birch (2), Round Oak (2). |
| **Italian Language & Culture** (`italian-language`) | **Italian Renaissance Villa** (`villa`): Stone foundation plinth, palazzo body, terracotta hipped tile roof, front loggia portico with rounded arches, classical campanile clock tower with terracotta pyramid belfry and bronze bell.<br>**Villa Annex** (`annex`): Terracotta hip roof. | **Renaissance Fountain**: Octagonal stepped marble basin, 4 lion-head spouts with water stream arcs, upper scalloped basin, bubbling finial jet, pulsating water mesh.<br>**Marble Colonnade**: Classical Roman podium, 4 fluted Corinthian columns, 3 semicircular triumphal arches, architrave and decorative attic frieze.<br>**Terracotta Urns**: Handcrafted clay amphorae with ripe yellow citrus lemons and magenta bougainvillea.<br>**Stone Balustrades**: Scenic cliffside terrace with 9 molded balusters, end pillars with finial spheres, stone bench. | 3 platforms (`italian-greetings` to `italian-engineering-terms`, t: 0.12 → 0.88) | 12 trees: Mediterranean Tuscan Cypress (6), Blooming Cherry (3), Round Oak (3). |

---

### 2.3 Viewer Orientation Analysis
- **Root Group**: The scene in `WorldCanvas.tsx` applies `rotation={[0, Math.PI, 0]}` to `<group name="island-world-group">`.
- **Camera Perspective**: Camera is elevated at `[0.5, 19.5, 23.5]` looking down at target `[0, 0.5, 0]`.
- **Orientation Compensation**:
  - Every landmark building applies `effectiveRotation = building.rotation + Math.PI`. Since entrances and facades are constructed on local $+Z$, combining `effectiveRotation` with the root group's `Math.PI` rotation produces a net world rotation of `building.rotation` (facing world $+Z$, straight into the camera view frustum).
  - All thematic scenery objects across `WorldScenery.tsx` and `PhysicsObjects.tsx` use `rotation={[pitch, Math.PI, 0]}`, where `pitch` is between `0.12` and `0.25` radians (~7° to ~15°). This tilts the models upwards toward the elevated camera eye-line.
  - 3D Platform Symbols (`LessonPlatform.tsx`) use `rotation={[0.32, Math.PI + 0.24, 0]}` (pitch ~18°), perfectly presenting 3D locks, neural networks, charts, and laurel medals to the user.
  - **Zero Backwards / Blank Faces**: Dual-sided geometry is implemented on directional signs, completed laurel medals, and padlock keyhole escutcheon plates (identical detail front and back) ensuring crisp visibility from all camera angles.

---

### 2.4 Mesh Clipping, Path Obstructions & Physical Clearances
In `tests/island-redesign.test.ts`, the clearance of all 3D scene elements is mathematically verified against the spline curve and terrain shape across all 4 worlds:

1. **Road Spline Clearance**:
   - The road has a width of 2.8m (half-width = 1.4m).
   - Sampled across 400 equidistant points along the Catmull-Rom spline curve.
   - Every building, tree, scenery prop, bench, and signpost maintains a clearance $\ge 1.4\text{m} + \text{entity radius}$.
   - **Result**: Zero road clipping.
2. **Platform Clearance**:
   - Platform radius is 1.25m.
   - Every scenery entity maintains distance $d \ge 1.25\text{m} + \text{entity radius}$ from every lesson platform.
   - **Result**: Zero platform clipping.
3. **Signposts Clearance**:
   - Physical base radius is 0.45m; interactive click-target radius is 1.1m.
   - Every entity maintains distance $d \ge 0.45\text{m} + \text{entity radius}$ from signpost base, and interactive entities maintain $d \ge 1.1\text{m} + \text{entity radius}$.
   - **Result**: Zero signpost obstruction.
4. **Pairwise Entity Collision**:
   - For all entity pairs $(e_1, e_2)$, distance $d \ge e_1.\text{radius} + e_2.\text{radius}$.
   - **Result**: Zero overlapping meshes or prop collision.
5. **Terrain Perimeter Boundary**:
   - Evaluated against the exact 300-point bezier curve polygon of the island landmass.
   - Every entity is strictly inside the lawn boundary with at least `0.30m` margin from the cliff edge.
   - **Result**: Zero objects hanging off cliffs or floating in void.
6. **Road Geometry Integrity**:
   - `createRoadGeometry` generates a manifold beveled 3D mesh with finite positions and normals.
   - Every edge in the road geometry is shared by exactly two triangular faces, including closed end-caps (`tests/learning-world.test.ts`).

---

### 2.5 Step Info Markers & Density Management
- **Issue in Standard 3D Dioramas**: When all lesson labels are displayed simultaneously in 3D space, overlapping HTML labels obscure the diorama and clutter the camera view.
- **Implemented Solution in Uplift University**:
  - **Adaptive Smart Pins**:
    - Unselected, unhovered lesson platforms display a compact circular pill badge (`.world-lesson-pin`) placed at $Y = 1.45\text{m}$ (height ~25px), displaying the lesson index ("01", "02") and status icon (`Check`, `Play`, or `LockKeyhole`).
    - The active/current lesson has a distinct glowing border and "START" tag.
    - Hovering or clicking any platform instantly expands it into the full descriptive card (`.world-lesson-label`) at $Y = 1.88\text{m}$.
    - **Z-Index Layering**: Expanded label uses `zIndexRange={[30, 0]}` while compact pins use `zIndexRange={[10, 0]}`, ensuring expanded cards always float above adjacent pins without visual clipping.
  - **User Density Toggle**:
    - In `LearningWorld.tsx`, a toolbar button (`.world-labels-toggle`) allows users to toggle between **Smart labels** (clean, uncluttered view) and **All labels** (all expanded simultaneously).

---

### 2.6 Component Inventory & Stubs in `src/components/learning-world/`

| Component | Lines | Purpose / Status |
| :--- | :--- | :--- |
| `WorldCanvas.tsx` | 143 | Three.js / R3F Canvas, lighting, camera, road, platforms, signposts, mascot. |
| `LearningWorld.tsx` | 378 | Main learning world coordinator, toolbar, view switcher, repeat dialog, lesson modal dialog. |
| `DirectionView.tsx` | 87 | Route-level view for `/path/[directionId]`, breadcrumbs, banner progress, empty state fallback. |
| `Environment.tsx` | 1326 | Island terrain mesh, water, lighting rig, trees (6 species), discipline buildings, static props, garden beds. |
| `WorldScenery.tsx` | 944 | Thematic scenery for Math, Italian, and AI tracks. |
| `PhysicsObjects.tsx` | 521 | Thematic scenery for Physics & Engineering track. |
| `LessonPlatform.tsx` | 545 | 3-tier dais, glowing runic ring, 3D symbols, dual-sided laurel medals, adaptive step pins / labels. |
| `IslandSignposts.tsx` | 293 | Directional navigation signposts between islands, dual-sided plaquards and chevrons, floating HTML labels. |
| `Road.tsx` | 68 | Raised Catmull-Rom spline road with beveled edges, curbs, and stone support pillars. |
| `CameraController.tsx` | 41 | Responsive lerp camera controller with portrait mobile narrow-zoom support. |
| `LearningPath.tsx` | 24 | Accessible DOM list of lessons for screen readers / non-WebGL view. |
| `LessonNode.tsx` | 78 | Accessible DOM lesson node item. |
| `IslandNavigator.tsx` | 8 | **Stub returning `null`** (unused; signpost & breadcrumb navigation is used instead). |
| `WorldSwitcher.tsx` | 8 | **Stub returning `null`** (unused; signpost & breadcrumb navigation is used instead). |

---

## 3. Build, Quality & Test Infrastructure Assessment

### 3.1 Tooling & Configuration Inspection
- **Package Manifest (`package.json`)**:
  - Package: `uplift-university@0.1.0` (private, ESM `"type": "module"`).
  - Scripts:
    - `"dev": "next dev"`
    - `"build": "next build"`
    - `"start": "next start"`
    - `"lint": "eslint ."`
    - `"typecheck": "tsc --noEmit"`
    - `"test": "tsx --test tests/*.test.ts"`
- **TypeScript Configuration (`tsconfig.json`)**:
  - Target: `ES2017`, Module: `esnext`, Module Resolution: `bundler`.
  - Strict mode enabled (`"strict": true`, `"skipLibCheck": true`).
  - Path alias: `"@/*": ["./src/*"]`.
  - Includes: `next-env.d.ts`, `**/*.ts`, `**/*.tsx`.
- **ESLint Configuration (`eslint.config.mjs`)**:
  - ESLint 9 Flat Config using `defineConfig` from `eslint/config`.
  - Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
  - Ignores: `.next/**`, `next-env.d.ts`, `.qa/**`.
- **Test Runner**:
  - Node.js native test runner (`node:test`, `node:assert/strict`) executed directly with `tsx`.
  - Zero heavy testing framework dependencies (no Jest, Vitest, or heavy polyfill layers needed).
  - Test execution duration: **~707ms**.

---

### 3.2 Verification Command Results (Live Execution)

| Command | Status | Output / Diagnostics Summary |
| :--- | :--- | :--- |
| `npm run typecheck` | **PASS (Code 0)** | Clean run, 0 errors. All components, hooks, stores, and test files pass TypeScript 6.0 type checking. |
| `npm test` | **PASS (Code 0)** | **39 tests passed, 0 failed, 0 skipped**. Total duration ~707ms across 6 test suites. |
| `npm run lint` | **PASS (Code 0)** | Clean run, 0 ESLint errors, 0 ESLint warnings. |
| `npm run build` | **PASS (Code 0)** | Next.js 16.3.5 Turbopack production build succeeded in 1.4s. All 39 static and dynamic routes generated cleanly. |

---

### 3.3 Test Suite Breakdown (39 Test Cases)

1. **`tests/island-redesign.test.ts`** (2 tests):
   - `all campus islands have zero mesh clipping and generous clearance from road, platforms, and signposts`: Validates road clearance ($\ge 1.4\text{m} + r$), platform clearance ($\ge 1.25\text{m} + r$), signpost clearance ($\ge 0.45\text{m} + r$, $\ge 1.1\text{m} + r$ interactive), pairwise clearance, and terrain boundary containment across all 4 campus worlds.
   - `all tree variants are recognized species with rich distributions`: Validates tree counts ($\ge 10$ trees per island), normalized scale ($0.6 \le \text{scale} \le 1.5$), and valid species (`round`, `tall`, `pine`, `cherry`, `cypress`, `birch`).
2. **`tests/learning-world.test.ts`** (7 tests):
   - Arc-length platform placement along curves (monotonic, unique, $0 < t < 1$).
   - Road geometry integrity (finite positions, finite normals, 2 faces per edge, closed thick mesh).
   - Event bus & progress store state transitions (`LESSON_COMPLETED`, `XP_GAINED`, `CURRENT_LESSON_CHANGED`).
   - StorkController priority queue, animation switching, hover cooldown.
   - Level-up and achievement event payloads.
   - Stork GLB clip lookup and fallback logic.
   - Deactivating assistant cleanup.
3. **`tests/plot-math.test.ts`** (12 tests):
   - Grid line generation, nice step computation, numerical 1st and 2nd derivatives, Simpson's rule definite integration, critical point detection (roots, extrema, inflection points), math formula compiler, and equation preset stability.
4. **`tests/lesson-engine.test.ts`** (6 tests):
   - Gradient descent algorithm phase synchronization, convergence/divergence bounding.
   - Lesson progress requirements (viewed vs completed vs practice vs quiz).
   - Content validation across all lessons: unique block IDs, KaTeX LaTeX math compilation, practice problem reference integrity.
5. **`tests/progress-store.test.ts`** (7 tests):
   - Initial curriculum agreement, progression locking/unlocking, XP and level calculation, direction selection handling empty curricula, persistence rehydration.
6. **`tests/mascot.test.ts`** (5 tests):
   - 3D character mesh generation, bone weighting, skinning, look limits, idle blinking.

---

## 4. Identified Gaps, Deficiencies & Recommended Fixes

### Gap 1: Missing Automated Tests for Repeat & Practice (`src/lib/repeat-tasks.ts`)
- **Observation**:
  - `src/lib/repeat-tasks.ts` and `src/components/repeat/RepeatTasksView.tsx` implement the repeat review feature required by R2 and original request.
  - However, unlike `plot-math.test.ts`, `learning-world.test.ts`, and `lesson-engine.test.ts`, there is currently **no `tests/repeat-tasks.test.ts`**.
- **Impact**: Low risk for current build (since TypeScript compiles without errors), but leaves repeat task extraction, theme grouping, and fallback question generation unprotected against regression.
- **Recommended Fix**: Add a comprehensive test file `tests/repeat-tasks.test.ts` testing:
  - `getAllRepeatTasks()` returns tasks from all available directions.
  - `getRepeatThemes()` groups tasks accurately with correct counts.
  - `getRepeatTasksForTheme(themeId)` extracts practice problems, quiz questions, and curriculum fallback questions.
  - Practice tasks validate numerical answers within specified tolerance.
  - Quiz tasks have valid options and answerIndex within bounds.

### Gap 2: Canonical Direction ID Alignment
- **Observation**:
  - `ORIGINAL_REQUEST.md` (Requirement R2) lists `italian-culture` as one of the four campus tracks: `['ai-ml', 'physics-engineering', 'mathematics', 'italian-culture']`.
  - In the codebase (`src/data/curriculum.ts`, `src/data/learning-world.ts`, and `src/app/path/[directionId]`), the direction ID is **`italian-language`**, and its title is **`Italian Language & Culture`**.
- **Impact**: All app routing, navigation, and tests currently use `italian-language`. If any component or test checks `italian-culture`, it would fail to find the direction.
- **Recommended Action**: Keep `italian-language` as the canonical direction ID (or provide an alias redirect from `/path/italian-culture` to `/path/italian-language` if direct URL access is expected).

### Gap 3: Unused Stub Files in `learning-world`
- **Observation**:
  - `src/components/learning-world/IslandNavigator.tsx` and `src/components/learning-world/WorldSwitcher.tsx` are 8-line stubs returning `null`.
  - They are not imported anywhere in the project.
- **Recommended Action**: Leave as-is or document as future extension points; they do not cause lint or type errors.

---

## 5. Summary of Recommended Next Steps for Team

1. **Test Suite Addition**:
   - Create `tests/repeat-tasks.test.ts` to achieve 100% test coverage across all major requirements (R1 Plotting, R2 Lessons & Repeat, R3 3D Learning World).
2. **Quality Maintenance**:
   - Maintain the fast, lightweight `tsx --test tests/*.test.ts` runner. Keep all tests in `tests/*.test.ts` to match the package.json glob.
3. **No 3D Architecture Changes Needed**:
   - The 3D learning world across all 4 islands meets all Requirement R3 criteria: zero mesh clipping, zero road obstruction, viewer-facing orientation, and non-overlapping smart step pins.
