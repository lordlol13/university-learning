import { allLessons, directions } from "@/data/curriculum";
import { lessonContents } from "@/data/lessons";

export interface RepeatTask {
  id: string;
  themeId: string;
  themeTitle: string;
  directionId: string;
  directionTitle: string;
  kind: "quiz" | "practice";
  prompt: string;
  options?: string[];
  answerIndex?: number;
  numericAnswer?: number;
  tolerance?: number;
  hint?: string;
  explanation: string;
}

export interface RepeatTheme {
  id: string;
  title: string;
  directionId: string;
  directionTitle: string;
  tasksCount: number;
}

export interface PracticeSession {
  id: string;
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  xpEarned: number;
  themeId: string;
  themeTitle?: string;
  directionId?: string;
}

export const PRACTICE_SESSIONS_STORAGE_KEY = "uplift_practice_sessions";
export const MAX_PRACTICE_SESSIONS = 1000;

function getLocalStorage(): Storage | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Access denied by browser sandbox / privacy settings
  }
  try {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // Access denied
  }
  return null;
}

/** Type guard verifying that an item conforms strictly to the PracticeSession schema. */
export function isValidPracticeSession(item: unknown): item is PracticeSession {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  const s = item as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    s.id.trim().length > 0 &&
    typeof s.completedAt === "string" &&
    s.completedAt.length > 0 &&
    typeof s.scorePercent === "number" &&
    Number.isFinite(s.scorePercent) &&
    typeof s.totalQuestions === "number" &&
    Number.isFinite(s.totalQuestions) &&
    typeof s.correctCount === "number" &&
    Number.isFinite(s.correctCount) &&
    typeof s.xpEarned === "number" &&
    Number.isFinite(s.xpEarned) &&
    typeof s.themeId === "string" &&
    s.themeId.length > 0
  );
}

/** Builds and returns repeatable tasks across all or specified previous themes. */
export function getAllRepeatTasks(completedLessonIds?: string[]): RepeatTask[] {
  const tasks: RepeatTask[] = [];

  const filterSet = Array.isArray(completedLessonIds)
    ? new Set(
        completedLessonIds.filter((id): id is string => typeof id === "string"),
      )
    : null;

  for (const direction of directions) {
    let dirLessons = allLessons.filter((l) =>
      direction.subjects.some((s) =>
        s.units.some((u) => u.lessons.some((ul) => ul.id === l.id)),
      ),
    );

    if (filterSet !== null) {
      dirLessons = dirLessons.filter((l) => filterSet.has(l.id));
    }

    for (const lesson of dirLessons) {
      const detailed = lessonContents.find(
        (lc) => lc.id === lesson.id || lc.curriculumLessonId === lesson.id,
      );

      // 1. Add practice problems from detailed lesson content
      if (detailed?.practiceProblems) {
        for (const problem of detailed.practiceProblems) {
          tasks.push({
            id: `repeat-practice-${problem.id}`,
            themeId: lesson.id,
            themeTitle: detailed.title || lesson.title,
            directionId: direction.id,
            directionTitle: direction.shortTitle,
            kind: "practice",
            prompt: problem.prompt,
            numericAnswer: problem.answer,
            tolerance: problem.tolerance ?? 0,
            hint: problem.hint,
            explanation: problem.explanation,
          });
        }
      }

      // 2. Add quiz questions from detailed lesson content
      if (detailed?.quiz) {
        for (const q of detailed.quiz) {
          tasks.push({
            id: `repeat-quiz-${q.id}`,
            themeId: lesson.id,
            themeTitle: detailed.title || lesson.title,
            directionId: direction.id,
            directionTitle: direction.shortTitle,
            kind: "quiz",
            prompt: q.prompt,
            options: q.options,
            answerIndex: q.answerIndex,
            explanation: q.explanation,
          });
        }
      }

      // 3. Fallback: curriculum check-your-understanding question if no detailed quiz/practice
      if (
        (!detailed?.practiceProblems || detailed.practiceProblems.length === 0) &&
        (!detailed?.quiz || detailed.quiz.length === 0) &&
        lesson.content?.question
      ) {
        tasks.push({
          id: `repeat-curriculum-${lesson.id}`,
          themeId: lesson.id,
          themeTitle: lesson.title,
          directionId: direction.id,
          directionTitle: direction.shortTitle,
          kind: "quiz",
          prompt: lesson.content.question,
          options: lesson.content.options,
          answerIndex: lesson.content.answerIndex,
          explanation: lesson.content.explanation,
        });
      }
    }
  }

  return tasks;
}

/** Alias for getAllRepeatTasks with completed theme filtering support. */
export function getRepeatTasks(completedLessonIds?: string[]): RepeatTask[] {
  return getAllRepeatTasks(completedLessonIds);
}

/** Lists distinct themes with task counts, optionally filtered to completed lessons. */
export function getRepeatThemes(completedLessonIds?: string[]): RepeatTheme[] {
  const tasks = getAllRepeatTasks(completedLessonIds);
  const themeMap = new Map<string, RepeatTheme>();

  for (const t of tasks) {
    const existing = themeMap.get(t.themeId);
    if (existing) {
      existing.tasksCount += 1;
    } else {
      themeMap.set(t.themeId, {
        id: t.themeId,
        title: t.themeTitle,
        directionId: t.directionId,
        directionTitle: t.directionTitle,
        tasksCount: 1,
      });
    }
  }

  return Array.from(themeMap.values());
}

/** Validates student answers for repeat quiz or numerical practice tasks. */
export function validateRepeatAnswer(
  task: RepeatTask,
  userAnswer: number | string | null | undefined,
): boolean {
  if (!task || userAnswer === null || userAnswer === undefined) return false;
  if (task.kind === "quiz") {
    if (typeof userAnswer === "number") {
      return userAnswer === task.answerIndex;
    }
    const parsed = parseInt(String(userAnswer).trim(), 10);
    return !isNaN(parsed) && parsed === task.answerIndex;
  }
  if (task.kind === "practice") {
    const val =
      typeof userAnswer === "number"
        ? userAnswer
        : parseFloat(String(userAnswer).trim());
    if (isNaN(val) || task.numericAnswer === undefined) return false;
    const tol = task.tolerance ?? 0.05;
    return Math.abs(val - task.numericAnswer) <= tol;
  }
  return false;
}

/** Retrieves recorded practice sessions from storage, filtering out any corrupt elements. */
export function getPracticeSessions(): PracticeSession[] {
  try {
    const storage = getLocalStorage();
    if (!storage) return [];
    const raw = storage.getItem(PRACTICE_SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidPracticeSession) : [];
  } catch {
    return [];
  }
}

/** Persists a newly completed practice session to storage with bounded capacity and quota fallback. */
export function savePracticeSession(session: PracticeSession): void {
  try {
    const storage = getLocalStorage();
    if (!storage) return;

    let sessions = getPracticeSessions();
    sessions.unshift(session);
    if (sessions.length > MAX_PRACTICE_SESSIONS) {
      sessions = sessions.slice(0, MAX_PRACTICE_SESSIONS);
    }

    try {
      storage.setItem(PRACTICE_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (err: unknown) {
      // If QuotaExceededError occurs, prune older sessions to reclaim quota
      const isQuota =
        err !== null &&
        typeof err === "object" &&
        (("name" in err &&
          (err.name === "QuotaExceededError" ||
            err.name === "NS_ERROR_DOM_QUOTA_REACHED")) ||
          ("code" in err && (err.code === 22 || err.code === 1014)));

      if (isQuota && sessions.length > 1) {
        try {
          const pruned = sessions.slice(0, Math.min(100, sessions.length));
          storage.setItem(
            PRACTICE_SESSIONS_STORAGE_KEY,
            JSON.stringify(pruned),
          );
          return;
        } catch {
          try {
            const emergencyPruned = sessions.slice(
              0,
              Math.min(20, sessions.length),
            );
            storage.setItem(
              PRACTICE_SESSIONS_STORAGE_KEY,
              JSON.stringify(emergencyPruned),
            );
            return;
          } catch {
            // If emergency save still fails, swallow
          }
        }
      }
      console.error("Failed to save practice session:", err);
    }
  } catch (err) {
    console.error("Failed to save practice session:", err);
  }
}

/** Clears all recorded practice sessions from storage safely. */
export function clearPracticeSessions(): void {
  try {
    const storage = getLocalStorage();
    if (!storage) return;
    storage.removeItem(PRACTICE_SESSIONS_STORAGE_KEY);
  } catch {}
}
