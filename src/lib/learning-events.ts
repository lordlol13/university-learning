export type LearningEventPayload =
  | { type: "LESSON_STARTED"; lessonId: string }
  | { type: "LESSON_COMPLETED"; lessonId: string; nextLessonId: string | null }
  | { type: "XP_GAINED"; amount: number; total: number }
  | { type: "LEVEL_UP"; level: number }
  | { type: "ACHIEVEMENT_UNLOCKED"; achievementId: string }
  | {
      type: "CURRENT_LESSON_CHANGED";
      previousLessonId: string | null;
      lessonId: string | null;
    };

export type LearningEvent = LearningEventPayload & {
  sequence: number;
  timestamp: number;
};

/** Per-workspace event channel. Transient reactions never enter persisted progress. */
export function createLearningEvents() {
  const listeners = new Set<(event: LearningEvent) => void>();
  let sequence = 0;
  return {
    emit(payload: LearningEventPayload) {
      const event = { ...payload, sequence: ++sequence, timestamp: Date.now() };
      listeners.forEach((listener) => listener(event));
    },
    subscribe(listener: (event: LearningEvent) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
export type LearningEvents = ReturnType<typeof createLearningEvents>;
