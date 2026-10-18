import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  allLessons,
  getDirection,
  getDirectionLessons,
  getLesson,
  getLessonDirection,
} from "../data/curriculum";
import { initialProgress, levelSize } from "../data/demo";
import type { Lesson, LessonStatus } from "../types/curriculum";
import type { LessonActivity } from "../types/lesson-engine";
import {
  createLearningEvents,
  type LearningEvents,
} from "../lib/learning-events";
import { resetSolvedTasks, clearPracticeSessions } from "../lib/repeat-tasks";

export interface ProgressState {
  lessonActivities?: Record<string, LessonActivity>;
  currentDirectionId: string;
  currentLessonId: string | null;
  completedLessons: string[];
  unlockedLessons: string[];
  xp: number;
  level: number;
  streak: number;
  achievements: string[];
}
interface ProgressActions {
  recordLessonActivity: (key: string, kind: keyof LessonActivity, id: string) => void;
  resetLessonActivity: (key: string) => void;
  startLesson: (lessonId: string) => boolean;
  completeLesson: (lessonId: string) => boolean;
  addXP: (amount: number) => void;
  setCurrentLesson: (lessonId: string) => boolean;
  setCurrentDirection: (directionId: string) => void;
  unlockLesson: (lessonId: string) => boolean;
  unlockAchievement: (achievementId: string) => boolean;
  resetProgress: () => void;
}
export type ProgressStore = ProgressState & ProgressActions;
export function getLessonStatus(
  lesson: Lesson,
  state: Pick<ProgressState, "completedLessons" | "unlockedLessons">,
): LessonStatus {
  const completed = Array.isArray(state?.completedLessons)
    ? state.completedLessons
    : [];
  const unlocked = Array.isArray(state?.unlockedLessons)
    ? state.unlockedLessons
    : [];
  if (completed.includes(lesson.id)) return "completed";
  return unlocked.includes(lesson.id) &&
    lesson.prerequisites.every((id) => completed.includes(id))
    ? "current"
    : "locked";
}
export function getDirectionProgress(
  directionId: string,
  state: Pick<ProgressState, "completedLessons">,
) {
  const direction = getDirection(directionId);
  const lessons = direction ? getDirectionLessons(direction) : [];
  const completedList = Array.isArray(state?.completedLessons)
    ? state.completedLessons
    : [];
  const completed = lessons.filter((lesson) =>
    completedList.includes(lesson.id),
  ).length;
  return {
    completed,
    total: lessons.length,
    percent: lessons.length
      ? Math.round((completed / lessons.length) * 100)
      : 0,
  };
}
const freshProgress = (): ProgressState => structuredClone(initialProgress);

export const createProgressStore = (
  events: LearningEvents = createLearningEvents(),
) =>
  createStore<ProgressStore>()(
    persist(
      (set, get) => ({
        ...freshProgress(),
        recordLessonActivity: (key, kind, id) => {
          const activities = get().lessonActivities ?? {};
          const activity = activities[key] ?? { viewed: [], completed: [], practice: [], quiz: [] };
          if (activity[kind].includes(id)) return;
          set({ lessonActivities: { ...activities, [key]: { ...activity, [kind]: [...activity[kind], id] } } });
        },
        resetLessonActivity: (key) => {
          const activities = { ...(get().lessonActivities ?? {}) };
          delete activities[key];
          set({ lessonActivities: activities });
        },
        startLesson: (lessonId) => {
          const lesson = getLesson(lessonId);
          const direction = getLessonDirection(lessonId);
          if (
            !lesson ||
            !direction ||
            getLessonStatus(lesson, get()) === "locked"
          )
            return false;
          const previousLessonId = get().currentLessonId;
          set({ currentLessonId: lessonId, currentDirectionId: direction.id });
          events.emit({ type: "LESSON_STARTED", lessonId });
          if (previousLessonId !== lessonId)
            events.emit({
              type: "CURRENT_LESSON_CHANGED",
              previousLessonId,
              lessonId,
            });
          return true;
        },
        setCurrentLesson: (lessonId) => get().startLesson(lessonId),
        setCurrentDirection: (directionId) => {
          const direction = getDirection(directionId);
          if (!direction) return;
          const next = getDirectionLessons(direction).find(
            (lesson) => getLessonStatus(lesson, get()) === "current",
          );
          const previousLessonId = get().currentLessonId;
          set({
            currentDirectionId: directionId,
            currentLessonId: next?.id ?? null,
          });
          if (previousLessonId !== (next?.id ?? null))
            events.emit({
              type: "CURRENT_LESSON_CHANGED",
              previousLessonId,
              lessonId: next?.id ?? null,
            });
        },
        unlockLesson: (lessonId) => {
          const lesson = getLesson(lessonId);
          const state = get();
          if (
            !lesson ||
            !lesson.prerequisites.every((id) =>
              state.completedLessons.includes(id),
            )
          )
            return false;
          if (!state.unlockedLessons.includes(lessonId))
            set({ unlockedLessons: [...state.unlockedLessons, lessonId] });
          return true;
        },
        completeLesson: (lessonId) => {
          const state = get();
          const lesson = getLesson(lessonId);
          if (
            !lesson ||
            state.currentLessonId !== lessonId ||
            getLessonStatus(lesson, state) !== "current"
          )
            return false;
          const completedLessons = [...state.completedLessons, lessonId];
          const unlockedLessons = allLessons
            .filter((item) =>
              item.prerequisites.every((id) => completedLessons.includes(id)),
            )
            .map((item) => item.id);
          const xp = state.xp + lesson.xp;
          const achievements = new Set(state.achievements);
          if (completedLessons.length >= 1) achievements.add("getting-started");
          if (completedLessons.length >= 3) achievements.add("three-lessons");
          if (state.streak >= 7) achievements.add("seven-day-streak");
          const ai = getDirection("ai-ml");
          if (
            ai &&
            getDirectionLessons(ai).every((item) =>
              completedLessons.includes(item.id),
            )
          )
            achievements.add("ai-explorer");

          const physics = getDirection("physics-engineering");
          if (
            physics &&
            getDirectionLessons(physics).every((item) =>
              completedLessons.includes(item.id),
            )
          )
            achievements.add("physics-master");

          const math = getDirection("mathematics");
          if (
            math &&
            getDirectionLessons(math).every((item) =>
              completedLessons.includes(item.id),
            )
          )
            achievements.add("math-pioneer");

          const italian = getDirection("italian-language");
          if (
            italian &&
            getDirectionLessons(italian).every((item) =>
              completedLessons.includes(item.id),
            )
          )
            achievements.add("italian-scholar");
          const direction = getLessonDirection(lessonId);
          const next =
            direction &&
            getDirectionLessons(direction).find(
              (item) =>
                !completedLessons.includes(item.id) &&
                unlockedLessons.includes(item.id),
            );
          set({
            completedLessons,
            unlockedLessons,
            xp,
            level: Math.floor(xp / levelSize) + 1,
            achievements: [...achievements],
            currentLessonId: next?.id ?? null,
          });
          events.emit({
            type: "LESSON_COMPLETED",
            lessonId,
            nextLessonId: next?.id ?? null,
          });
          events.emit({ type: "XP_GAINED", amount: lesson.xp, total: xp });
          const level = Math.floor(xp / levelSize) + 1;
          if (level > state.level) events.emit({ type: "LEVEL_UP", level });
          achievements.forEach((achievementId) => {
            if (!state.achievements.includes(achievementId))
              events.emit({ type: "ACHIEVEMENT_UNLOCKED", achievementId });
          });
          events.emit({
            type: "CURRENT_LESSON_CHANGED",
            previousLessonId: lessonId,
            lessonId: next?.id ?? null,
          });
          return true;
        },
        unlockAchievement: (achievementId) => {
          const state = get();
          if (state.achievements.includes(achievementId)) return false;
          const achievements = [...state.achievements, achievementId];
          set({ achievements });
          events.emit({ type: "ACHIEVEMENT_UNLOCKED", achievementId });
          return true;
        },
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
        resetProgress: () => {
          try {
            resetSolvedTasks();
          } catch {}
          try {
            clearPracticeSessions();
          } catch {}
          try {
            const keys = [
              "uplift_solved_repeat_tasks",
              "uplift_practice_sessions",
              "uplift_math_studio_settings_v3",
              "uplift_sound_enabled",
              "uplift-progress",
            ];
            const storage =
              (typeof window !== "undefined" && window.localStorage) ||
              (typeof globalThis !== "undefined" && globalThis.localStorage) ||
              null;
            if (storage) {
              for (const key of keys) {
                try {
                  storage.removeItem(key);
                } catch {}
              }
            }
          } catch {}
          set({ ...freshProgress(), lessonActivities: {} });
        },
      }),
      {
        name: "uplift-progress",
        version: 1,
        skipHydration: true,
        storage: createJSONStorage(() => {
          if (typeof window !== "undefined" && window.localStorage) {
            return window.localStorage;
          }
          if (typeof globalThis !== "undefined" && globalThis.localStorage) {
            return globalThis.localStorage;
          }
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }),
        merge: (persistedState: unknown, currentState: ProgressStore) => {
          if (!persistedState || typeof persistedState !== "object") {
            return currentState;
          }
          const p = persistedState as Partial<ProgressState>;
          return {
            ...currentState,
            ...p,
            completedLessons: Array.isArray(p.completedLessons)
              ? p.completedLessons
              : currentState.completedLessons,
            unlockedLessons: Array.isArray(p.unlockedLessons)
              ? p.unlockedLessons
              : currentState.unlockedLessons,
            achievements: Array.isArray(p.achievements)
              ? p.achievements
              : currentState.achievements,
            xp:
              typeof p.xp === "number" && Number.isFinite(p.xp) && p.xp >= 0
                ? p.xp
                : currentState.xp,
            level:
              typeof p.level === "number" &&
              Number.isFinite(p.level) &&
              p.level >= 1
                ? p.level
                : currentState.level,
            streak:
              typeof p.streak === "number" &&
              Number.isFinite(p.streak) &&
              p.streak >= 0
                ? p.streak
                : currentState.streak,
            lessonActivities:
              p.lessonActivities && typeof p.lessonActivities === "object"
                ? p.lessonActivities
                : currentState.lessonActivities,
          };
        },
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
    ),
  );
