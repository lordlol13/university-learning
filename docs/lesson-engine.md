# Interactive lesson engine

Open `/lesson/gradient-descent` or the existing Machine Learning step on the AI & ML path. Both use the same lesson and saved progress. The 3D path architecture and its six curriculum nodes are preserved.

## Authoring

`src/types/lesson-engine.ts` defines the serializable `LessonContent` contract. The complete example is `src/data/lessons/gradient-descent.ts`. Add a lesson to `src/data/lessons/index.ts` to register its route alias and connect it to a curriculum lesson. Author sections and typed blocks instead of a custom page. TypeScript checks block-specific fields, and the renderer has an exhaustive switch.

Supported blocks: introduction, intuition, theory, formula, formula breakdown, interactive graph, algorithm visualizer, code, worked example, practice, quiz, and summary. Rich text uses `$...$` for inline equations; display blocks accept LaTeX directly. Content is trusted, local, structured data; there is no remote MDX evaluation.

`MathFormula` uses KaTeX HTML plus accessible MathML, with untrusted commands disabled. Equations remain text, not raster images. Tests cover all authored formulas and additional matrices, vectors, summations, integrals, partial derivatives, probabilities, and piecewise functions. Integration follows the [KaTeX rendering API](https://katex.org/docs/api.html) and [options](https://katex.org/docs/options.html).

## Visualization and execution state

`plot/InteractivePlot.tsx` provides the shared SVG coordinate system, function plot, hover tooltip, zoom, drag pan, keyboard pan, and reset controls. Mobile uses a taller coordinate system with fewer ticks. Plot controls have touch targets; keyboard users can use the buttons or focus the graph and use arrow keys, plus/minus, and zero to reset.

`lib/gradient-descent.ts` is the deterministic numerical core. A cursor represents initialize → gradient → update → loss. The graph, trajectory, preview, numerical substitution, explanation, and highlighted pseudocode all derive from that cursor. Reversing recomputes the exact earlier state. The full-iteration button completes the current iteration; the algorithm controls move one mathematical operation at a time. Parameters reset the trajectory. Convergence, divergence, and 80-iteration guards stop playback. Playback pauses while the document is hidden, and its timer is cleaned up on section changes. Reduced-motion preferences disable point transitions.

Put the graph and algorithm blocks for a shared simulation in one section, with the same `simulationId` and parameters. The section provides their shared simulation context. Additional labs can reuse the plotting primitives and `AlgorithmVisualizer` with a separate deterministic state model and provider. The demo uses one shared simulation per section.

## Progress and course integration

Activity is stored inside the existing `uplift-progress` persistence record under `lessonActivities`, keyed by lesson ID and content version. Existing version-1 course saves remain compatible. Bump the content version when changed requirements should require fresh lesson activity.

An intersection observer records viewed blocks. Reading sections require explicit acknowledgment after their blocks have been visible. The lab requires at least two updates and explicit confirmation. Practice requires correct numerical answers within the authored tolerance; every quiz question must be correct. Incorrect answers support hints and retries. Viewed blocks alone earn no completion credit.

The renderer only offers completion after all required blocks and assessments are done. It then uses the existing course start/completion actions, retaining their prerequisite checks, one-time XP, unlocks, and mascot events. Course reset also clears detailed activity. This is local learning progress, not a server-verified assessment or cross-device account sync.

## Code examples

`CodeExample` supports language selection, syntax highlighting, highlighted lines, and clipboard copy with a manual-copy fallback. The demo contains Python and NumPy implementations. Code samples are read-only, so there is no edit/reset action. The type model supports PyTorch, C++, and SQL. `CodeExecutor` is a separate optional interface for future sandbox integration; this implementation never evaluates student code or starts an execution server.

## Validation

- `npm run typecheck`, `npm run lint`, `npm test` (25 tests), and `npm run build` pass.
- Numerical tests cover exact updates, reverse states, convergence, oscillation, divergence, and iteration limits.
- Browser checks cover formula interactions; graph controls; learning-rate input; play, pause, and reverse; code tabs/copy; wrong and correct assessments; completion; refresh persistence; and course unlocking.
- Desktop, tablet, and mobile layouts were inspected. Screenshots are in `docs/qa/lesson-*.png`; the verification record is `docs/qa/lesson-engine.md`.

The existing mascot's `StorkSurface` memo initializer was changed to an inline callback to satisfy the repository's React lint rule; its behavior is unchanged.
