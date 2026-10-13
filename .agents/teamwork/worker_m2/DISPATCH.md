## 2026-09-30T06:24:12Z
You are Worker 2 (Courseware & Repeat Practice Specialist).
Your working directory is: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\worker_m2
The authoritative user request is in: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md
The project scope document is in: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\orchestrator_1\PROJECT.md
The explorer survey report is in: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\explorer_survey_r2\analysis.md
The explorer handoff is in: c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\explorer_survey_r2\handoff.md
The project root is: c:\Users\Home1\OneDrive\Desktop\university-learning

You MUST read c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\ORIGINAL_REQUEST.md first.

Review the explorer's detailed technical investigation in `c:\Users\Home1\OneDrive\Desktop\university-learning\.agents\teamwork\explorer_survey_r2\analysis.md`.

Write ownership:
You own and may ONLY edit the following files:
- `src/lib/repeat-tasks.ts`
- `src/components/repeat/RepeatTasksView.tsx`
- `src/stores/progress-store.ts`
- `src/data/demo.ts`
- `src/app/path/[directionId]/page.tsx`
- `tests/repeat-tasks.test.ts`

Your mission: Implement all features and fixes for Milestone 2 (Courseware & Repeat Practice System):
1. F2.1 Repeat Practice Filtering by Completed Themes:
   - In `src/lib/repeat-tasks.ts`, update `getAllRepeatTasks` (or add `getRepeatTasks(completedLessonIds?: string[])`) to allow filtering tasks to completed lessons.
   - In `RepeatTasksView.tsx`, use `state.completedLessons` from `useProgressStore` to default to completed themes ("Completed Units" mode), while allowing the student to toggle to "All Themes". If no lessons are completed, show a helpful empty state or default to available intro tasks.
2. F2.2 Practice Session Recording & Completion Flow:
   - In `src/lib/repeat-tasks.ts`, define `PracticeSession` interface (`id`, `completedAt`, `totalQuestions`, `correctCount`, `scorePercent`, `xpEarned`, `themeId`) and functions to record/retrieve sessions (`savePracticeSession`, `getPracticeSessions`).
   - In `RepeatTasksView.tsx`, track questions answered correctly. When the student reaches the end of the current set, display a rich session summary card (accuracy percentage, XP earned, questions answered, congratulatory feedback, and a button to review or restart). Save the completed session to persistent storage (`uplift_practice_sessions`).
3. F2.3 "Try Again" Retries for Pedagogical Mastery:
   - In `RepeatTasksView.tsx`, when a student checks an answer and it is incorrect, provide a "Try Again" button allowing them to re-attempt the task instead of only being able to advance to the next task.
4. F2.4 Expanded Achievement Badges:
   - In `src/data/demo.ts`, add achievement badges for track completions:
     - `physics-master`: "Physics & Engineering Master"
     - `math-pioneer`: "Mathematics Pioneer"
     - `italian-scholar`: "Italian Culture Scholar"
     - `practice-champion`: "Practice Champion"
   - In `src/stores/progress-store.ts:completeLesson`, trigger track completion badges when all lessons for that track are completed.
5. F2.5 Route Alias `/path/italian-culture`:
   - In `src/app/path/[directionId]/page.tsx`, map `italian-culture` to `italian-language` or include it in `generateStaticParams` so navigating to `/path/italian-culture` loads the Italian Language & Culture track smoothly without a 404 error.
6. F2.6 Automated Unit Tests:
   - Create `tests/repeat-tasks.test.ts` with comprehensive unit tests verifying task extraction, completed lesson filtering, answer validation, and session recording.
7. Verification:
   - Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` and ensure all tests and quality checks pass 100%.
