import { getAllRepeatTasks, getRepeatThemes } from "../../../src/lib/repeat-tasks.ts";

console.log("=== REPEAT TASKS AUDIT ===");
const tasks = getAllRepeatTasks();
const themes = getRepeatThemes();

console.log("Total repeat tasks:", tasks.length);
console.log("Total repeat themes:", themes.length);

// Check tasks integrity
let invalidCount = 0;
for (const t of tasks) {
  if (t.kind === "quiz") {
    if (!t.options || t.options.length < 2) {
      console.log(`Quiz task ${t.id} has invalid options!`, t);
      invalidCount++;
    }
    if (t.answerIndex === undefined || t.answerIndex < 0 || t.answerIndex >= t.options!.length) {
      console.log(`Quiz task ${t.id} has invalid answerIndex: ${t.answerIndex}!`, t);
      invalidCount++;
    }
  } else if (t.kind === "practice") {
    if (t.numericAnswer === undefined || !Number.isFinite(t.numericAnswer)) {
      console.log(`Practice task ${t.id} has invalid numericAnswer!`, t);
      invalidCount++;
    }
  }
}

console.log("Invalid tasks found:", invalidCount);
console.log("\nThemes breakdown:");
for (const th of themes) {
  console.log(`- [${th.directionId}] ${th.title} (${th.id}): ${th.tasksCount} tasks`);
}
