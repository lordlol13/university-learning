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

export interface ProgressState {
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
  startLesson: (lessonId: string) => boolean;
  completeLesson: (lessonId: string) => boolean;
  addXP: (amount: number) => void;
  setCurrentLesson: (lessonId: string) => boolean;
  setCurrentDirection: (directionId: string) => void;
  unlockLesson: (lessonId: string) => boolean;
  resetProgress: () => void;
}
export type ProgressStore = ProgressState & ProgressActions;
export function getLessonStatus(
  lesson: Lesson,
  state: ProgressState,
): LessonStatus {
  if (state.completedLessons.includes(lesson.id)) return "completed";
  return state.unlockedLessons.includes(lesson.id) &&
    lesson.prerequisites.every((id) => state.completedLessons.includes(id))
    ? "current"
    : "locked";
}
export function getDirectionProgress(
  directionId: string,
  state: ProgressState,
) {
  const direction = getDirection(directionId);
  const lessons = direction ? getDirectionLessons(direction) : [];
  const completed = lessons.filter((lesson) =>
    state.completedLessons.includes(lesson.id),
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

export const createProgressStore = () =>
  createStore<ProgressStore>()(
    persist(
      (set, get) => ({
        ...freshProgress(),
        startLesson: (lessonId) => {
          const lesson = getLesson(lessonId);
          const direction = getLessonDirection(lessonId);
          if (
            !lesson ||
            !direction ||
            getLessonStatus(lesson, get()) === "locked"
          )
            return false;
          set({ currentLessonId: lessonId, currentDirectionId: direction.id });
          return true;
        },
        setCurrentLesson: (lessonId) => get().startLesson(lessonId),
        setCurrentDirection: (directionId) => {
          const direction = getDirection(directionId);
          if (!direction) return;
          const next = getDirectionLessons(direction).find(
            (lesson) => getLessonStatus(lesson, get()) === "current",
          );
          set({
            currentDirectionId: directionId,
            currentLessonId: next?.id ?? null,
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
          set({ xp, level: Math.floor(xp / levelSize) + 1 });
        },
        resetProgress: () => set(freshProgress()),
      }),
      {
        name: "uplift-progress",
        version: 1,
        skipHydration: true,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
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
