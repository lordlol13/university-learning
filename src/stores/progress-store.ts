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
  state: Pick<ProgressState, "completedLessons" | "unlockedLessons">,
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
        resetProgress: () => set({ ...freshProgress(), lessonActivities: {} }),
      }),
      {
        name: "uplift-progress",
        version: 1,
        skipHydration: true,
        storage: createJSONStorage(() => localStorage),
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
