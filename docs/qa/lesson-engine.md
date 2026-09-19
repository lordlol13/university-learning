# Lesson engine verification — 2026-09-14

**Flow:** AI & ML course step → structured Gradient Descent lesson → shared graph/algorithm state → practice and quiz → local progress → XP and next lesson unlock.

| Check | Result and evidence |
| --- | --- |
| Production rendering | Fresh production server rendered `/lesson/gradient-descent` with an empty browser console/error log. |
| Existing path integration | The existing Start lesson button opens the renderer inside the Machine Learning dialog. At 768px, one dialog was open, its lesson engine was present, and page width remained 768px. Close lesson returned to the path. |
| Update mathematics | Two iteration clicks produced x = 4.4, then x = 3.92 from x = 5 with eta = 0.1. First-step loss was 6.76. |
| Reverse and synchronization | Two Previous step clicks restored the gradient operation at x = 5 with gradient 6 and the corresponding active pseudocode line. |
| Playback | Play advanced the shared state; Pause left position unchanged over a further 1.1 seconds. |
| Sliders | Keyboard End on the learning-rate slider selected 1.2, reset the trajectory, and the next step reached x = -2.2. Contextual guidance explained increasing error. |
| Pan and zoom | Zoom altered the function's SVG path, graph reset restored it, and keyboard pan altered coordinates. A native mouse drag was also inspected. |
| Formula exploration | Clicking Learning rate revealed its explanation. Authored equations rendered without KaTeX errors. |
| Implementation | NumPy tab displayed the NumPy implementation. A normal browser click on Copy changed the button to Copied. Programmatic untrusted clipboard attempts correctly exposed the fallback message. |
| Practice | Wrong numerical answer showed feedback; hint opened; 3.2 and 2.44 completed both practice problems. |
| Quiz | Wrong direction answer showed feedback and left XP at 357. Correct answers completed all three questions. |
| Completion | After all required activities, Complete lesson awarded 120 XP (357 → 477), completed machine-learning, and unlocked databases. Reload retained 477 XP and completed activity. Existing store tests verify duplicate rewards are rejected. |
| Responsive layout | Desktop 1440×1000, tablet 768×1024, and mobile 390×844 inspected. All seven sections checked at 390px without horizontal page overflow; formulas had no parse-error markup. Mobile graph uses a 360×320 viewBox and reduced tick density. |
| Automated checks | TypeScript, ESLint, 25 tests, and production build passed. |

Screenshots:

- `lesson-desktop.png`: lesson introduction and navigation.
- `lesson-lab-desktop.png`: full-width desktop plotting system.
- `lesson-mobile.png`: compact plotting layout and readable labels.
- `lesson-from-world.png`: renderer inside the existing course dialog.
- `lesson-graph-pan.png`: graph after native mouse dragging.

Issues found and fixed during verification: missing Prism C dependency before C++; a global heading style affecting the new lesson layout; small mobile graph labels; and an existing mascot memo initializer that violated the current React lint rule. A stale development error overlay disappeared on a fresh production server; the final production session reported no application errors.

Progress is intentionally local to the device. Code examples are not executed by the application. Neither requires a backend in this scope.
