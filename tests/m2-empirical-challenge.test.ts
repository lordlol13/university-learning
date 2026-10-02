import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProgressStore } from "../src/stores/progress-store";
import {
  directions,
  getDirection,
  getDirectionLessons,
} from "../src/data/curriculum";
import { achievementCatalog, initialProgress } from "../src/data/demo";
import DirectionPage, {
  generateMetadata,
  generateStaticParams,
} from "../src/app/path/[directionId]/page";
import {
  savePracticeSession,
  getPracticeSessions,
  type PracticeSession,
} from "../src/lib/repeat-tasks";

// Mock localStorage with failure-injection capability
let removeItemFails = false;
const memory = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      if (removeItemFails) throw new Error("SecurityError: Storage clearance blocked");
      memory.delete(key);
    },
    clear: () => {
      memory.clear();
    },
  },
});

beforeEach(() => {
  removeItemFails = false;
  memory.clear();
});

describe("Milestone 2 Empirical Challenge — Track Completion Achievements", () => {
  it("verifies achievementCatalog has complete definitions for all 4 new badges", () => {
    const requiredBadges = [
      { id: "physics-master", expectedTitle: "Physics & Engineering Master" },
      { id: "math-pioneer", expectedTitle: "Mathematics Pioneer" },
      { id: "italian-scholar", expectedTitle: "Italian Culture Scholar" },
      { id: "practice-champion", expectedTitle: "Practice Champion" },
    ];

    for (const badge of requiredBadges) {
      const entry = achievementCatalog.find((a) => a.id === badge.id);
      assert.ok(entry, `achievementCatalog missing entry for ${badge.id}`);
      assert.equal(entry.title, badge.expectedTitle);
      assert.ok(entry.description.length > 10, `${badge.id} description too short`);
      assert.ok(entry.icon && entry.icon.length > 0, `${badge.id} missing icon`);
      assert.ok(entry.color && entry.color.length > 0, `${badge.id} missing color`);
    }
  });

  it("physics-master: unlocks ONLY when all 7 physics lessons are completed, never with 1 to 6 lessons", () => {
    const store = createProgressStore();
    const physicsDir = getDirection("physics-engineering");
    assert.ok(physicsDir);
    const physicsLessons = getDirectionLessons(physicsDir);
    assert.equal(physicsLessons.length, 7, "Physics direction must contain exactly 7 lessons");

    // Complete lessons 0 through 5 (6 of 7 lessons) sequentially via valid progression
    for (let i = 0; i < physicsLessons.length - 1; i++) {
      const lesson = physicsLessons[i];
      store.setState((prev) => ({
        ...prev,
        currentDirectionId: "physics-engineering",
        currentLessonId: lesson.id,
        unlockedLessons: Array.from(new Set([...prev.unlockedLessons, lesson.id])),
      }));

      const success = store.getState().completeLesson(lesson.id);
      assert.equal(success, true, `Failed to complete physics lesson ${lesson.id}`);

      const achievements = store.getState().achievements;
      assert.equal(
        achievements.includes("physics-master"),
        false,
        `physics-master unlocked prematurely with only ${i + 1}/7 lessons completed!`,
      );
      assert.equal(
        achievements.includes("math-pioneer"),
        false,
        "math-pioneer leaked during physics completion",
      );
      assert.equal(
        achievements.includes("italian-scholar"),
        false,
        "italian-scholar leaked during physics completion",
      );
    }

    // Now complete the 7th and final lesson
    const finalLesson = physicsLessons[6];
    store.setState((prev) => ({
      ...prev,
      currentDirectionId: "physics-engineering",
      currentLessonId: finalLesson.id,
      unlockedLessons: Array.from(new Set([...prev.unlockedLessons, finalLesson.id])),
    }));

    const finalSuccess = store.getState().completeLesson(finalLesson.id);
    assert.equal(finalSuccess, true, `Failed to complete final physics lesson ${finalLesson.id}`);

    const finalAchievements = store.getState().achievements;
    assert.equal(
      finalAchievements.includes("physics-master"),
      true,
      "physics-master must unlock after all 7 lessons are completed",
    );
    assert.equal(
      finalAchievements.includes("math-pioneer"),
      false,
      "math-pioneer should not unlock from physics",
    );
    assert.equal(
      finalAchievements.includes("italian-scholar"),
      false,
      "italian-scholar should not unlock from physics",
    );
  });

  it("physics-master: does NOT unlock if ANY single lesson out of 7 is missing (7 permutations)", () => {
    const physicsDir = getDirection("physics-engineering");
    assert.ok(physicsDir);
    const physicsLessons = getDirectionLessons(physicsDir);

    for (let omitIndex = 0; omitIndex < physicsLessons.length; omitIndex++) {
      const omittedLesson = physicsLessons[omitIndex];
      const sixCompleted = physicsLessons
        .filter((_, idx) => idx !== omitIndex)
        .map((l) => l.id);

      const store = createProgressStore();
      store.setState((prev) => ({
        ...prev,
        completedLessons: [...prev.completedLessons, ...sixCompleted],
      }));

      // Trigger a completion of another unrelated lesson (e.g. machine-learning) to run achievement checks
      store.setState((prev) => ({
        ...prev,
        currentDirectionId: "ai-ml",
        currentLessonId: "machine-learning",
        unlockedLessons: Array.from(new Set([...prev.unlockedLessons, "machine-learning"])),
      }));
      store.getState().completeLesson("machine-learning");

      assert.equal(
        store.getState().achievements.includes("physics-master"),
        false,
        `physics-master unlocked when lesson ${omittedLesson.id} was missing!`,
      );
    }
  });

  it("math-pioneer: unlocks ONLY when all 4 math lessons are completed, never with 1 to 3 lessons", () => {
    const store = createProgressStore();
    const mathDir = getDirection("mathematics");
    assert.ok(mathDir);
    const mathLessons = getDirectionLessons(mathDir);
    assert.equal(mathLessons.length, 4, "Mathematics direction must contain exactly 4 lessons");

    for (let i = 0; i < mathLessons.length - 1; i++) {
      const lesson = mathLessons[i];
      store.setState((prev) => ({
        ...prev,
        currentDirectionId: "mathematics",
        currentLessonId: lesson.id,
        unlockedLessons: Array.from(new Set([...prev.unlockedLessons, lesson.id])),
      }));

      const success = store.getState().completeLesson(lesson.id);
      assert.equal(success, true, `Failed to complete math lesson ${lesson.id}`);

      const achievements = store.getState().achievements;
      assert.equal(
        achievements.includes("math-pioneer"),
        false,
        `math-pioneer unlocked prematurely with only ${i + 1}/4 lessons completed!`,
      );
    }

    // Complete the 4th and final lesson
    const finalLesson = mathLessons[3];
    store.setState((prev) => ({
      ...prev,
      currentDirectionId: "mathematics",
      currentLessonId: finalLesson.id,
      unlockedLessons: Array.from(new Set([...prev.unlockedLessons, finalLesson.id])),
    }));

    const finalSuccess = store.getState().completeLesson(finalLesson.id);
    assert.equal(finalSuccess, true, `Failed to complete final math lesson ${finalLesson.id}`);

    const finalAchievements = store.getState().achievements;
    assert.equal(
      finalAchievements.includes("math-pioneer"),
      true,
      "math-pioneer must unlock after all 4 lessons are completed",
    );
    assert.equal(finalAchievements.includes("physics-master"), false);
    assert.equal(finalAchievements.includes("italian-scholar"), false);
  });

  it("math-pioneer: does NOT unlock if ANY single lesson out of 4 is missing (4 permutations)", () => {
    const mathDir = getDirection("mathematics");
    assert.ok(mathDir);
    const mathLessons = getDirectionLessons(mathDir);

    for (let omitIndex = 0; omitIndex < mathLessons.length; omitIndex++) {
      const omittedLesson = mathLessons[omitIndex];
      const threeCompleted = mathLessons
        .filter((_, idx) => idx !== omitIndex)
        .map((l) => l.id);

      const store = createProgressStore();
      store.setState((prev) => ({
        ...prev,
        completedLessons: [...prev.completedLessons, ...threeCompleted],
      }));

      store.setState((prev) => ({
        ...prev,
        currentDirectionId: "ai-ml",
        currentLessonId: "machine-learning",
        unlockedLessons: Array.from(new Set([...prev.unlockedLessons, "machine-learning"])),
      }));
      store.getState().completeLesson("machine-learning");

      assert.equal(
        store.getState().achievements.includes("math-pioneer"),
        false,
        `math-pioneer unlocked when math lesson ${omittedLesson.id} was missing!`,
      );
    }
  });

  it("italian-scholar: unlocks ONLY when all 3 Italian lessons are completed, never with 1 to 2 lessons", () => {
    const store = createProgressStore();
    const italianDir = getDirection("italian-language");
    assert.ok(italianDir);
    const italianLessons = getDirectionLessons(italianDir);
    assert.equal(italianLessons.length, 3, "Italian direction must contain exactly 3 lessons");

    for (let i = 0; i < italianLessons.length - 1; i++) {
      const lesson = italianLessons[i];
      store.setState((prev) => ({
        ...prev,
        currentDirectionId: "italian-language",
        currentLessonId: lesson.id,
        unlockedLessons: Array.from(new Set([...prev.unlockedLessons, lesson.id])),
      }));

      const success = store.getState().completeLesson(lesson.id);
      assert.equal(success, true, `Failed to complete Italian lesson ${lesson.id}`);

      const achievements = store.getState().achievements;
      assert.equal(
        achievements.includes("italian-scholar"),
        false,
        `italian-scholar unlocked prematurely with only ${i + 1}/3 lessons completed!`,
      );
    }

    // Complete the 3rd and final lesson
    const finalLesson = italianLessons[2];
    store.setState((prev) => ({
      ...prev,
      currentDirectionId: "italian-language",
      currentLessonId: finalLesson.id,
      unlockedLessons: Array.from(new Set([...prev.unlockedLessons, finalLesson.id])),
    }));

    const finalSuccess = store.getState().completeLesson(finalLesson.id);
    assert.equal(finalSuccess, true, `Failed to complete final Italian lesson ${finalLesson.id}`);

    const finalAchievements = store.getState().achievements;
    assert.equal(
      finalAchievements.includes("italian-scholar"),
      true,
      "italian-scholar must unlock after all 3 lessons are completed",
    );
    assert.equal(finalAchievements.includes("physics-master"), false);
    assert.equal(finalAchievements.includes("math-pioneer"), false);
  });

  it("italian-scholar: does NOT unlock if ANY single lesson out of 3 is missing (3 permutations)", () => {
    const italianDir = getDirection("italian-language");
    assert.ok(italianDir);
    const italianLessons = getDirectionLessons(italianDir);

    for (let omitIndex = 0; omitIndex < italianLessons.length; omitIndex++) {
      const omittedLesson = italianLessons[omitIndex];
      const twoCompleted = italianLessons
        .filter((_, idx) => idx !== omitIndex)
        .map((l) => l.id);

      const store = createProgressStore();
      store.setState((prev) => ({
        ...prev,
        completedLessons: [...prev.completedLessons, ...twoCompleted],
      }));

      store.setState((prev) => ({
        ...prev,
        currentDirectionId: "ai-ml",
        currentLessonId: "machine-learning",
        unlockedLessons: Array.from(new Set([...prev.unlockedLessons, "machine-learning"])),
      }));
      store.getState().completeLesson("machine-learning");

      assert.equal(
        store.getState().achievements.includes("italian-scholar"),
        false,
        `italian-scholar unlocked when Italian lesson ${omittedLesson.id} was missing!`,
      );
    }
  });

  it("unlockAchievement awards practice-champion, deduplicates, and prevents double-awarding", () => {
    const store = createProgressStore();
    assert.equal(store.getState().achievements.includes("practice-champion"), false);

    const firstResult = store.getState().unlockAchievement("practice-champion");
    assert.equal(firstResult, true);
    assert.equal(store.getState().achievements.includes("practice-champion"), true);

    const secondResult = store.getState().unlockAchievement("practice-champion");
    assert.equal(secondResult, false);
    const count = store.getState().achievements.filter((a) => a === "practice-champion").length;
    assert.equal(count, 1, "Achievement should only appear once");
  });
});

describe("Milestone 2 Empirical Challenge — Route Alias Logic", () => {
  it("generateStaticParams returns all canonical direction IDs plus the italian-culture alias", () => {
    const params = generateStaticParams();
    assert.ok(Array.isArray(params));

    const paramIds = params.map((p) => p.directionId);

    // Verify all canonical directions exist
    for (const dir of directions) {
      assert.ok(
        paramIds.includes(dir.id),
        `generateStaticParams missing canonical direction ${dir.id}`,
      );
    }

    // Verify italian-culture alias exists
    assert.ok(
      paramIds.includes("italian-culture"),
      "generateStaticParams missing 'italian-culture' alias",
    );

    // Verify both italian-culture and italian-language are present
    assert.ok(paramIds.includes("italian-language"));
    assert.ok(paramIds.includes("italian-culture"));
  });

  it("generateMetadata resolves italian-culture to Italian Language & Culture metadata without error", async () => {
    const metadataFromAlias = await generateMetadata({
      params: Promise.resolve({ directionId: "italian-culture" }),
    });
    assert.equal(metadataFromAlias.title, "Italian Language & Culture");

    const metadataCanonical = await generateMetadata({
      params: Promise.resolve({ directionId: "italian-language" }),
    });
    assert.equal(metadataCanonical.title, "Italian Language & Culture");

    const metadataOther = await generateMetadata({
      params: Promise.resolve({ directionId: "physics-engineering" }),
    });
    assert.equal(metadataOther.title, "Physics & Engineering");

    const metadataInvalid = await generateMetadata({
      params: Promise.resolve({ directionId: "nonexistent-course" }),
    });
    assert.equal(metadataInvalid.title, "Path not found");
  });

  it("DirectionPage renders DirectionView with target direction for both italian-culture and italian-language", async () => {
    const pageFromAlias = await DirectionPage({
      params: Promise.resolve({ directionId: "italian-culture" }),
    });
    assert.ok(pageFromAlias, "DirectionPage must return a rendered element");
    // Verify props contain direction with id "italian-language"
    assert.equal(pageFromAlias.props.direction.id, "italian-language");
    assert.equal(pageFromAlias.props.direction.title, "Italian Language & Culture");

    const pageCanonical = await DirectionPage({
      params: Promise.resolve({ directionId: "italian-language" }),
    });
    assert.ok(pageCanonical);
    assert.equal(pageCanonical.props.direction.id, "italian-language");

    // Invalid route should trigger notFound()
    await assert.rejects(
      async () => {
        await DirectionPage({
          params: Promise.resolve({ directionId: "nonexistent-path-slug" }),
        });
      },
      (err: unknown) => {
        const message = String(err);
        const digest = (err as { digest?: string })?.digest;
        return (
          message.includes("NEXT_HTTP_ERROR_FALLBACK") ||
          message.includes("404") ||
          digest === "NEXT_HTTP_ERROR_FALLBACK;404"
        );
      },
      "DirectionPage should trigger notFound for invalid slug",
    );
  });

  it("resolves route aliases under high iteration stress without recursion or memory penalty", async () => {
    const startTime = performance.now();
    for (let i = 0; i < 20000; i++) {
      const meta = await generateMetadata({
        params: Promise.resolve({ directionId: "italian-culture" }),
      });
      assert.equal(meta.title, "Italian Language & Culture");
    }
    const elapsed = performance.now() - startTime;
    assert.ok(elapsed < 2000, `High iteration alias resolution took ${elapsed}ms (expected < 2000ms)`);
  });
});

describe("Milestone 2 Empirical Challenge — resetProgress State & Storage Hygiene", () => {
  it("resets heavily polluted store state back to initialProgress cleanly", () => {
    const store = createProgressStore();

    // Pollute store with extensive progress
    store.setState({
      currentDirectionId: "physics-engineering",
      currentLessonId: "vector-components",
      completedLessons: [
        "python-basics",
        "linear-algebra",
        "statistics",
        "machine-learning",
        "si-base-units",
        "dimensional-scaling",
        "calc-derivatives",
        "calc-integrals",
        "italian-greetings",
      ],
      unlockedLessons: [
        "python-basics",
        "linear-algebra",
        "statistics",
        "machine-learning",
        "databases",
        "si-base-units",
        "dimensional-scaling",
        "water-equivalency",
        "calc-derivatives",
        "calc-integrals",
        "discrete-logic",
        "italian-greetings",
        "italian-numbers-time",
      ],
      xp: 4500,
      level: 19,
      streak: 42,
      achievements: [
        "getting-started",
        "seven-day-streak",
        "three-lessons",
        "ai-explorer",
        "physics-master",
        "math-pioneer",
        "italian-scholar",
        "practice-champion",
      ],
      lessonActivities: {
        "python-basics": { viewed: ["intro"], completed: ["takeaways"], practice: [], quiz: ["q0"] },
        "calc-derivatives": { viewed: ["calc-1"], completed: [], practice: ["p1"], quiz: [] },
      },
    });

    const dirtyState = store.getState();
    assert.equal(dirtyState.completedLessons.length, 9);
    assert.equal(dirtyState.xp, 4500);
    assert.equal(dirtyState.achievements.length, 8);
    assert.ok(Object.keys(dirtyState.lessonActivities ?? {}).length > 0);

    // Call resetProgress
    store.getState().resetProgress();

    // Verify completely restored to initialProgress
    const cleanState = store.getState();
    assert.equal(cleanState.currentDirectionId, initialProgress.currentDirectionId);
    assert.equal(cleanState.currentLessonId, initialProgress.currentLessonId);
    assert.deepEqual(cleanState.completedLessons, initialProgress.completedLessons);
    assert.deepEqual(cleanState.unlockedLessons, initialProgress.unlockedLessons);
    assert.equal(cleanState.xp, initialProgress.xp);
    assert.equal(cleanState.level, initialProgress.level);
    assert.equal(cleanState.streak, initialProgress.streak);
    assert.deepEqual(cleanState.achievements, initialProgress.achievements);
    assert.deepEqual(cleanState.lessonActivities, {});

    // Ensure none of the track completion achievements remain
    assert.equal(cleanState.achievements.includes("physics-master"), false);
    assert.equal(cleanState.achievements.includes("math-pioneer"), false);
    assert.equal(cleanState.achievements.includes("italian-scholar"), false);
    assert.equal(cleanState.achievements.includes("practice-champion"), false);
  });

  it("removes repeat practice sessions and solved task keys from localStorage", () => {
    // Seed localStorage with repeat practice data and third-party data
    memory.set("uplift_solved_repeat_tasks", JSON.stringify(["quiz-1", "practice-2"]));
    const session: PracticeSession = {
      id: "sess-abc",
      completedAt: new Date().toISOString(),
      totalQuestions: 5,
      correctCount: 5,
      scorePercent: 100,
      xpEarned: 75,
      themeId: "python-basics",
      themeTitle: "Python Basics",
    };
    savePracticeSession(session);
    memory.set("unrelated_app_setting", "preserve-this-value");

    assert.ok(memory.has("uplift_solved_repeat_tasks"));
    assert.equal(getPracticeSessions().length, 1);
    assert.ok(memory.has("unrelated_app_setting"));

    const store = createProgressStore();
    store.getState().resetProgress();

    // Verify practice storage keys are removed via standard localStorage getItem and memory map
    assert.equal(localStorage.getItem("uplift_solved_repeat_tasks"), null);
    assert.equal(localStorage.getItem("uplift_practice_sessions"), null);
    assert.equal(memory.has("uplift_solved_repeat_tasks"), false);
    assert.equal(memory.has("uplift_practice_sessions"), false);
    assert.deepEqual(getPracticeSessions(), []);

    // Verify unrelated key was preserved
    assert.equal(memory.get("unrelated_app_setting"), "preserve-this-value");
  });

  it("survives and resets in-memory state cleanly even if localStorage.removeItem throws an error", () => {
    const store = createProgressStore();
    store.setState({
      xp: 9999,
      level: 40,
      completedLessons: ["python-basics", "linear-algebra", "statistics", "calc-derivatives"],
    });

    // Simulate removeItem throwing a security error
    removeItemFails = true;

    // resetProgress must catch removeItem errors and not throw unhandled exception
    assert.doesNotThrow(() => {
      store.getState().resetProgress();
    });

    // In-memory state must still be reset
    assert.equal(store.getState().xp, initialProgress.xp);
    assert.equal(store.getState().completedLessons.length, initialProgress.completedLessons.length);
  });

  it("persisted store rehydration reflects the clean state after reset", async () => {
    const store1 = createProgressStore();
    // Complete an additional lesson
    store1.getState().completeLesson("machine-learning");
    assert.ok(store1.getState().completedLessons.includes("machine-learning"));

    // Reset progress
    store1.getState().resetProgress();

    // Create a new store instance and rehydrate
    const store2 = createProgressStore();
    await store2.persist.rehydrate();

    assert.equal(store2.getState().xp, initialProgress.xp);
    assert.deepEqual(store2.getState().completedLessons, initialProgress.completedLessons);
    assert.equal(store2.getState().completedLessons.includes("machine-learning"), false);
  });
});
