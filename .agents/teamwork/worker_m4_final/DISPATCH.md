## 2026-10-01T11:46:06Z
You are the Final QA & Verification Specialist for Milestone 4 in Uplift University.

Working Directory: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_m4_final

Required Reading:
- Authoritative User Request: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Scope: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\orchestrator_2\PROJECT.md
- Gate Status: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\orchestrator_2\GATE_STATUS.md

Your Tasks:
1. Execute the full end-to-end verification pipeline and capture exact outputs:
   - npm test
   - npx tsx scripts/m1-adversarial-stress.ts
   - npx tsx scripts/m2-adversarial-stress.ts
   - npm run typecheck
   - npm run lint
   - npm run build
2. Systematically audit all Acceptance Criteria from ORIGINAL_REQUEST.md:
   - Interactive Graphics & Math Engine: coordinate pinning with slope/curvature on first try, formula presets like exp(-x^2 / 2) and 2X + 1, canvas stability.
   - Courseware & Repeat Practice: non-coding tracks show theory/math without code runners, lesson progress persistence, Repeat tasks filtered by completed themes, "Try Again" retry flow, achievements (physics-master, math-pioneer, italian-scholar, practice-champion).
   - 3D World & Campus Scenery: 4 campus islands, front-facing objects, clearance with pedestrian roads, elevated step markers.
   - Build & Verification: 50+ tests passing, 0 typecheck errors, 0 lint errors/warnings, production build succeeding across all routes.
3. Write your complete final verification report to handoff.md in your working directory.
4. Send your completion message to parent with the final release status.
