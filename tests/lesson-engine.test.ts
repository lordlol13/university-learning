import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import {
  algorithmState,
  derivative,
  nextIterationCursor,
} from "../src/lib/gradient-descent";
import { emptyActivity, lessonCompletion, lessonRequirements } from "../src/lib/lesson-progress";
import { gradientDescentLesson as lesson } from "../src/data/lessons/gradient-descent";
import { lessonContents } from "../src/data/lessons";
import { createProgressStore } from "../src/stores/progress-store";

test("algorithm phases keep graph, gradient, update and loss synchronized", () => {
  const gradient = algorithmState(5, 0.1, 1),
    update = algorithmState(5, 0.1, 2),
    loss = algorithmState(5, 0.1, 3);
  assert.equal(gradient.phase, "gradient");
  assert.equal(gradient.x, 5);
  assert.equal(gradient.gradient, 6);
  assert.equal(update.phase, "update");
  assert.equal(update.x, 4.4);
  assert.equal(update.iteration, 1);
  assert.equal(loss.phase, "loss");
  assert.ok(Math.abs(loss.loss - 6.76) < 1e-10);
  assert.deepEqual(loss.trajectory, [
    { x: 5, y: 10 },
    { x: 4.4, y: loss.loss },
  ]);
  assert.equal(algorithmState(5, 0.1, 6).x, 3.9200000000000004);
  assert.equal(nextIterationCursor(1), 3);
  assert.equal(nextIterationCursor(3), 6);
  assert.deepEqual(
    algorithmState(5, 0.1, 1),
    gradient,
    "Rewinding reconstructs the exact previous state",
  );
});
test("convergence, overshoot, oscillation and divergence are mathematically correct and bounded", () => {
  assert.equal(algorithmState(5, 0.5, 3).x, 2);
  assert.equal(algorithmState(5, 0.5, 3).stopped, true);
  assert.equal(algorithmState(2, 1.2, 0).stopped, true);
  assert.ok(Math.abs(algorithmState(5, 0.8, 30).x - 2) < 3);
  assert.equal(algorithmState(5, 1, 3).x, -1);
  assert.equal(algorithmState(5, 1, 6).x, 5);
  const diverged = algorithmState(5, 1.2, 240);
  assert.equal(diverged.stopped, true);
  assert.match(diverged.reason!, /Divergence/);
  assert.ok(Number.isFinite(diverged.loss));
  assert.ok(diverged.trajectory.length < 81);
  assert.ok(Math.abs(derivative(algorithmState(5, 0.1, 240).x)) < 1e-6);
  assert.match(algorithmState(5, 0.01, 240).reason!, /80 iterations/);
  assert.throws(() => algorithmState(5, 0, 3));
  assert.throws(() => algorithmState(NaN, 0.1, 0));
});
test("page views and reading alone cannot complete a lesson", () => {
  const requirements = lessonRequirements(lesson),
    activity = emptyActivity();
  assert.equal(lessonCompletion(lesson, activity).complete, false);
  activity.viewed = requirements.completed;
  assert.equal(lessonCompletion(lesson, activity).percent, 0);
  activity.completed = requirements.completed;
  assert.equal(lessonCompletion(lesson, activity).complete, false);
  activity.practice = requirements.practice;
  assert.equal(lessonCompletion(lesson, activity).complete, false);
  activity.quiz = requirements.quiz;
  assert.equal(lessonCompletion(lesson, activity).complete, true);
});
test("lesson IDs, references and all authored math are valid", () => {
  assert.ok(lessonContents.length >= 6);
  for (const currentLesson of lessonContents) {
    const blocks = currentLesson.sections.flatMap((s) => s.blocks),
      ids = blocks.map((b) => b.id);
    assert.equal(ids.length, new Set(ids).size, `Duplicate block IDs in ${currentLesson.id}`);
    const texts: string[] = [];
    function visit(value: unknown) {
      if (typeof value === "string") texts.push(value);
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object")
        Object.values(value).forEach(visit);
    }
    visit(currentLesson);
    const formulas = texts.flatMap((t) =>
      Array.from(t.matchAll(/\$([^$]+)\$/g), (m) => m[1]),
    );
    blocks.forEach((b) => {
      if (b.type === "formula") formulas.push(b.latex);
      if (b.type === "formula-breakdown")
        b.parts.forEach((p) => formulas.push(p.latex));
      if (b.type === "worked-example")
        b.steps.forEach((s) => {
          if (s.latex) formulas.push(s.latex);
        });
      if (b.type === "practice")
        b.problemIds.forEach((id) =>
          assert.ok(
            currentLesson.practiceProblems.some((p) => p.id === id),
            `Missing practice problem ${id} in ${currentLesson.id}`,
          ),
        );
      if (b.type === "quiz")
        b.questionIds.forEach((id) =>
          assert.ok(
            currentLesson.quiz.some((q) => q.id === id),
            `Missing quiz question ${id} in ${currentLesson.id}`,
          ),
        );
    });
    formulas.push(
      String.raw`\begin{bmatrix}1&2\\3&4\end{bmatrix}`,
      String.raw`\vec{x}`,
      String.raw`\sum_{i=1}^n x_i`,
      String.raw`\int_0^1 x\,dx`,
      String.raw`\frac{\partial J}{\partial\theta}`,
      String.raw`P(A\mid B)`,
      String.raw`\begin{cases}x&x>0\\0&x\le0\end{cases}`,
    );
    formulas.forEach((latex) =>
      assert.doesNotThrow(
        () =>
          katex.renderToString(latex, {
            throwOnError: true,
            strict: "error",
            trust: false,
          }),
        `KaTeX error in ${currentLesson.id}: ${latex}`,
      ),
    );
  }
});
test("block and assessment activity persists, deduplicates, and resets with course progress", async () => {
  const memory = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => memory.set(k, v),
      removeItem: (k: string) => memory.delete(k),
    },
  });
  const store = createProgressStore();
  const key = `${lesson.id}:v${lesson.version}`;
  store.getState().recordLessonActivity(key, "viewed", "motivation");
  store.getState().recordLessonActivity(key, "viewed", "motivation");
  store.getState().recordLessonActivity(key, "practice", "next-position");
  const reloaded = createProgressStore();
  await reloaded.persist.rehydrate();
  assert.deepEqual(reloaded.getState().lessonActivities?.[key].viewed, [
    "motivation",
  ]);
  assert.deepEqual(reloaded.getState().lessonActivities?.[key].practice, [
    "next-position",
  ]);
  assert.equal(
    reloaded.getState().completedLessons.includes("machine-learning"),
    false,
  );
  reloaded.getState().resetProgress();
  assert.deepEqual(reloaded.getState().lessonActivities, {});
});
