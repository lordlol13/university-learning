# Uplift — university learning foundation

An original, progression-based university learning UI inspired by the proportions in `docs/design/reference.png`. This phase provides a working application shell, an accessible curriculum outline, and a small lesson demo. It does not render a 3D map or mascot.

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

## Stack

Next.js App Router, React, strict TypeScript, Tailwind CSS v4, Zustand, Motion, and Lucide icons. Three.js, React Three Fiber, and Drei are installed for the next phase, but are deliberately not imported into the UI bundle and create no WebGL contexts. The npm lockfile records exact resolved versions. React 19.2.8 is used because the current React Three Fiber 9.7 peer range excludes React 19.3.

## Routes

| Route                 | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| `/`                   | Redirect to the primary AI & ML demo                     |
| `/dashboard`          | Continue learning, statistics, recent lessons            |
| `/courses`            | Program and direction catalog                            |
| `/path/[directionId]` | Data-driven direction overview and lesson outline        |
| `/lesson/[lessonId]`  | Introductory lesson, knowledge check, completion, review |
| `/achievements`       | Earned and locked badges                                 |
| `/leaderboard`        | Sample classmates with the learner's live XP             |
| `/profile`            | Learner details, level progress, demo reset              |

Unknown directions and lessons return the shared not-found UI. Unavailable directions have explicit empty states. Direct URLs to locked lessons enforce prerequisites.

## Architecture

```text
src/
  app/                      Server route entry points, metadata, error/loading states
  components/
    layout/                 Sidebar, TopBar, ProgressPanel, AppShell
    learning-world/         DirectionView, LearningWorld, LearningPath, LessonNode
                            Environment and CameraController extension slots
    mascot/                 Empty stork components for the next phase
    ui/                     Shared icons, achievement badges, progress bars
    courses/                Program and direction catalog
    dashboard/              Home and resume flow
    lesson/                 Data-driven lesson and knowledge check
    profile/                Achievements, leaderboard, learner profile
  data/                     Typed demo curriculum, learner, rewards, initial progress
  stores/                   Vanilla Zustand factory, React provider, progress selectors
  types/                    University → Program → Direction → Subject → Unit → Lesson
tests/
  progress-store.test.ts     Progression, reward, level, persistence, and guard tests
```

Server pages resolve dynamic params and validate curriculum IDs before passing serializable data into client views. The store is instantiated per provider, avoiding a shared server singleton. Client components use Zustand selectors; derived lesson statuses and progress calculations live alongside the store.

## Progress model

`currentDirectionId`, `currentLessonId`, `completedLessons`, `unlockedLessons`, `xp`, `level`, `streak`, and earned achievement IDs live in the store. Actions include `startLesson`, `completeLesson`, `setCurrentLesson`, `setCurrentDirection`, `unlockLesson`, `addXP`, and `resetProgress`.

- Initial AI path: Python Basics, Linear Algebra, and Statistics completed; Machine Learning current; Databases and Deep Learning locked.
- Initial progress: 3/6 lessons, 50%, 357 XP, Level 2, 143 XP to Level 3.
- Rewards are awarded once per lesson. Reviewing a completed lesson does not add XP.
- Completion unlocks eligible lessons using prerequisites, updates levels, and awards badges.
- Every 250 XP advances one level. The top-bar achievement count comes from earned badge IDs.
- Versioned browser-local persistence rehydrates after mount. Route changes wait for restoration before writing progress.
- The seven-day streak, learner identity, classmates, and curriculum are demonstration data. There is no authentication, backend, official university integration, or cross-device sync.

## Next-phase 3D integration

`LearningWorld` reserves a stable, responsive region with `data-slot="world-canvas"`. Replace the background slot with a dynamically imported client-only R3F Canvas while retaining an accessible DOM curriculum. `Environment` and `CameraController` are intentionally empty. No screenshot, reference background, fake 3D path, or raster mascot is used.

`StorkAssistant` reserves its own sidebar slot for a separate lightweight Canvas. `StorkMascot`, `WorldStork`, and `StorkAnimationController` are empty extension points. `StorkSpeechBubble` is a reusable text container. The future original mascot must be a stork wearing a university graduation cap and a green backpack.

## Scope choices

- Uplift is the original product identity; no third-party brand, logo, or mascot is reproduced.
- A clean two-dimensional lesson list occupies the learning-world placeholder so the foundation is useful and keyboard-accessible before the 3D implementation.
- AI & ML has the complete six-lesson demo. Other directions are intentionally marked as coming soon.
- A leaderboard route and short knowledge checks make the required navigation and state actions reviewable.
- Mobile uses a keyboard-accessible navigation drawer, and secondary progress cards are hidden on smaller screens. Motion honors reduced-motion preferences.
- Deployment, a final 3D world, mascot modeling, and official academic content are outside this phase.
