# Uplift — university learning campus

A gamified university learning demo with a real, interactive Three.js campus. The existing application shell, curriculum, lesson UI, and persisted progression are retained. The AI & ML path contains an elevated spline road, raised lesson platforms, stylized scenery, and an animated stork companion.

## Run locally

Requires Node.js 20.9+ (developed with Node 24) and npm.

```sh
npm install
npm run dev
```

Open `http://localhost:3000/path/ai-ml`.

```sh
npm run build
npm run start
npm run lint
npm run typecheck
npm test
```

## Stack and routes

Next.js App Router, React, strict TypeScript, Tailwind CSS v4, Zustand, Motion, Lucide, Three.js, React Three Fiber, and Drei. Exact dependency versions are recorded in the lockfile. Canvases are dynamically imported client components.

| Route                 | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `/`                   | Redirect to the AI & ML demo                           |
| `/dashboard`          | Resume learning, statistics, recent lessons            |
| `/courses`            | Program and direction catalog                          |
| `/path/[directionId]` | 3D campus, accessible lesson list, lesson dialog       |
| `/lesson/[lessonId]`  | Standalone lesson, knowledge check, completion, review |
| `/achievements`       | Earned and locked badges                               |
| `/leaderboard`        | Sample classmates with the learner's live XP           |
| `/profile`            | Learner details, level progress, demo reset            |
| `/mascot-playground` | Standalone interactive character studio                |
| `/api/mascot`         | Availability of the optional local stork model         |

Unknown directions and lessons show the shared not-found UI. Unavailable directions have explicit empty states. Locked lessons enforce prerequisites even through direct URLs.

## 3D world

- `src/data/learning-world.ts` defines spline control points, road dimensions, scenery, and each lesson's normalized arc-length position `t`.
- `src/lib/world-geometry.ts` builds a closed, indexed road mesh with a beveled profile around a `CatmullRomCurve3`. Platforms and mascot positions use the same curve.
- `src/components/learning-world/` contains the perspective camera, terrain, trees, campus buildings, road, and interactive raised platforms. A 35° camera uses gentle easing and separate narrow-screen framing.
- Completed platforms are green with geometry check marks; the current platform is blue with a pulsing ring; locked platforms are gray with geometry locks. Raycast hover and click work on the meshes. Native HTML labels provide readable text and keyboard access.
- Starting the current platform opens the existing lesson UI in a native modal dialog. Completion closes it, updates progress, celebrates, and moves the stork along the road to the next lesson. The canvas stays mounted during this flow.
- The alternate **Lesson list** provides a DOM curriculum and remains usable without WebGL.

## Shared stork and reactions

`StorkMascot` is shared between `WorldStork` and the transparent sidebar assistant canvas. With no external asset, it renders an original procedural stork with a graduation cap, tassel, green backpack, long beak, black wing tips, and expressive eyes. Materials and base geometries are shared.

The optional `public/models/stork.glb` is discovered through `/api/mascot`. Discovery is cached once per page lifetime. `useGLTF` shares the network resource; each instance receives an independent skeleton clone and `useAnimations` mixer. Missing or invalid models retain the procedural fallback. See `public/models/README.md` for the asset contract.

`StorkController` manages `idle`, `walk`, `point`, `wave`, `celebrate`, and `thinking`, with bounded queued reactions and hover/click cooldowns. Priority is completion → level → achievement → explicit click → navigation → hover → idle. Frames update Three.js objects directly without per-frame React state updates.

The store commits progress before emitting typed provider-scoped events: `LESSON_STARTED`, `LESSON_COMPLETED`, `XP_GAINED`, `LEVEL_UP`, `ACHIEVEMENT_UNLOCKED`, and `CURRENT_LESSON_CHANGED`. Mascots subscribe to events; lesson components do not control animation internals. Movement waits for reactions, walks along the spline, points on arrival, then returns to idle.

The assistant follows the pointer subtly with its head, waves on hover/click, and shows dismissible Motion speech bubbles derived from the current lesson, XP, and completed lessons. Automatic messages have a cooldown and priority. On mobile, a small button expands the same 3D assistant.

## Performance and accessibility

One main canvas plus one visible assistant canvas; pixel ratios are capped. Geometry is lightweight and textures/postprocessing are unnecessary. The main scene uses one shadow-casting directional light; the assistant does not render shadows. Asset loading uses Suspense and caching.

IntersectionObserver and page visibility pause rendering outside the viewport or in a hidden tab. Reduced motion switches canvases to on-demand rendering, suppresses procedural bouncing/pulsing and long walks, and places the mascot directly at its destination. HTML labels, view switches, assistant controls, and the native lesson dialog support keyboard interaction.

## Progress model and scope

The Zustand store is instantiated per provider, with versioned browser-local persistence and hydration before route-driven updates. Initial progress is 3/6 lessons, 357 XP, Level 2; Machine Learning is next. Each 250 XP advances a level. Rewards are granted once; reviewing a lesson cannot duplicate XP. Completion unlocks eligible lessons and awards badges.

AI & ML has six demo lessons. Other directions remain marked as coming soon. Learner identity, streak, classmates, and academic content are demonstration data. Authentication, a backend, university integration, cross-device sync, deployment, and a commissioned GLB asset are outside this local implementation.

## Verification

The automated suite covers progression guards, reward idempotence, persistence, level/achievement events, event ordering, animation priority/cooldowns, normalized lesson placement, and closed road geometry. Browser checks cover actual mesh selection, lesson completion, continuous spline movement, contextual assistant speech, mobile framing, reduced-motion destination updates, and offscreen render suspension. Build, TypeScript, and lint checks must pass before changes are considered complete.

The latest polish pass passed the production build, ESLint, and all 20 tests. Desktop (1440px), tablet (1024px), mobile (390px), the complete reward flow, and reduced-motion updates were checked in a running browser. See [the visual audit and screenshots](docs/qa/README.md) for evidence and limitations.

## Demonstrate the complete learning loop

1. Open `/path/ai-ml` and choose the blue current lesson, or press **Start lesson** below the world.
2. In the lesson dialog, expand **Try the progress demo**, then press **Simulate completion**. Alternatively, answer the knowledge check and complete it normally.
3. The same guarded store action grants XP once, marks the lesson completed, unlocks its successor, advances `currentLessonId`, and updates the progress panels.
4. The dialog closes so the world remains visible: the stork celebrates, walks along the spline, points toward the next platform, then returns to idle. Reduced motion places it at its destination immediately.
5. Repeat with Databases and Deep Learning to demonstrate a level increase and the AI Explorer achievement. **Profile → Reset demo progress** restores the initial 3/6 state.

This is an explicitly local demo. There is no simulated network service and the normal lesson UI remains available.

## Curriculum structure and adding a direction

Types live in `src/types/curriculum.ts`: **University → Program → Direction → Subject → Unit → Lesson**. Curriculum content is defined in `src/data/curriculum.ts`. Lessons have globally unique IDs, descriptions, icon names, XP, duration, prerequisites, and a knowledge check. Runtime status is derived from progress; the seed `status` field is not the source of truth after interaction.

To add a learning direction:

1. Add a `Direction` to the existing program in `src/data/curriculum.ts`, containing subjects, units, and lessons. Use unique stable IDs and valid prerequisite IDs. `allLessons`, catalog pages, and generated routes derive from this data.
2. Add a `LearningWorldData` entry to `src/data/learning-world.ts`, then include it in `learningWorlds`. Define control points and increasing `t` values between 0 and 1 for the direction's lessons. Every platform is sampled with `getPointAt(t)`; do not enter independent XYZ positions for lessons.
3. Add prerequisite-free lesson IDs to the seed `unlockedLessons` in `src/data/demo.ts`. Reset the local demo after changing seed data. If preserving existing user saves, migrate the persisted store version instead of resetting progress.
4. Add any direction-specific achievement rule and catalog entry as needed. Existing AI Explorer logic only applies to the AI & ML curriculum.
5. Run tests/build and inspect the new path at desktop and mobile sizes. Directions without world data still show the working lesson list.

## Mascot location, model replacement, and tuning

`WorldStork` finds `currentLessonId` in the direction's path placements. It retains the previous `t`, advances it toward the new `t` at the configured speed, samples the road at a lateral offset, and turns along its tangent while walking. At rest it points toward the actual platform. If the whole path is complete, it remains at the final completed lesson. Foot placement compensates for the procedural model's origin and world scale.

Place a self-contained asset at **`public/models/stork.glb`**. Expected clips are **Idle, Walk, Point, Wave, Celebrate, Thinking** (matching is case-insensitive). Use Y up, +Z forward, embedded textures, and in-place animations. Models are normalized to 2.3 scene units. A missing reaction falls back to Idle; a file without Idle safely holds its rest pose. Missing files and loader failures retain the procedural stork. Refresh the page after replacing the file. Both instances share the GLTF cache and materials but have independent skeletons and mixers.

`src/data/world-config.ts` centralizes camera framing, DPR limits, shadow resolution, mascot scale/speed, semantic animation names, crossfade timing, and interaction cooldowns. The reduced-motion hook responds to preference changes without a reload. The main world pauses while its modal covers it; inactive mobile/desktop assistants unsubscribe from reaction events and clear stale queued reactions.

Three.js and its types are pinned to **0.182.0** for compatibility with Fiber 9.7's internal Clock API. This avoids the upstream Clock deprecation introduced in r183 without suppressing console warnings or modifying dependencies. See the [Fiber compatibility issue](https://github.com/pmndrs/react-three-fiber/issues/3741). The main canvas explicitly selects PCF shadows and uses one 1024² shadow map.

The local Next.js development configuration allows `127.0.0.1` as well as its default localhost origin. No wildcard development origins are enabled.

## Reusable stork character

Open `/mascot-playground` to inspect the actual WebGL character, orbit it, preview expressions and gestures, and compare its hero, medium, and small presentations. The studio uses the same `StorkMascot` component as the application. Development builds additionally expose rig, bounds, and rendering statistics.

`StorkMascot` accepts `animation`, `expression`, `lookAt`, `pointTarget`, `backpack`, `interactive`, `quality`, `scale`, and reduced-motion options. Its ref exposes `play(animation)`, `lookAt(target)`, and `pointAt(Vector3)`. Existing application callers can still supply their external controller. An owned controller runs only when an external one is absent; the model never requires the learning-progress provider.

The procedural implementation separates the named attachment rig (`StorkRig`), geometry/materials (`StorkGeometry`, `stork-materials`), anatomy (`StorkModel`, `StorkFace`), frame-based posing (`StorkAnimator`), expressions, and reaction selection. Hover asks for a subtle look-around; a tap chooses a short friendly reaction. Controller priorities and cooldowns prevent overlapping reactions, and transient gestures return to idle. Gaze is damped and anatomically clamped; blink and idle variation can be disabled. Motion preferences and offscreen suspension remain supported.

The character has a compact pear-shaped head, moderate curved throat, projected teardrop chest, and broad expressive wings. A single custom loft runs from belly to crown. `StorkSurface` uses two lightweight render bones driven by the existing logical rig, keeping that silhouette continuous during gaze and gestures. The animator runs before the surface update in the same R3F render loop. Beak halves, eyes, eyelids, cap, wings, and legs retain their existing named controls.

Dimensions and the six-degree forward lean live in `stork-config.ts`. The head and cap are reduced together, the beak is shorter with a stronger base, and wing reach is increased about 40% in model coordinates. The existing public `scale` prop and scene placements are retained. Geometry and eight untextured materials are shared across instances; the tiny skin skeleton is instance-local and disposed on unmount. The redesign adds no dependency or asset download.

See [the mascot visual review](docs/qa/mascot-stylized/README.md) for rendered front, three-quarter, side, and silhouette checks. The optional GLB loading and missing-clip behavior described above remain available through `StorkAssetModel`; the screenshots show the procedural fallback.
