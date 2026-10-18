import { allLessons } from "../../../src/data/curriculum";
import { lessonContents } from "../../../src/data/lessons";
import { getDemoComponent } from "../../../src/components/lesson/demos";
import { compileCustomExpression, evaluateCalculatorExpression, numericalDefiniteIntegral } from "../../../src/lib/plot-math";

console.log("=== AUDIT CHECK SCRIPT ===");
console.log("Total Curriculum Lessons:", allLessons.length);
console.log("Total Authored Lessons:", lessonContents.length);

let missingDemos = 0;
let missingProblems = 0;
let missingQuizzes = 0;

for (const lesson of lessonContents) {
  for (const section of lesson.sections) {
    for (const block of section.blocks) {
      if ("demoId" in block && block.demoId) {
        const comp = getDemoComponent(block.demoId);
        if (!comp) {
          console.error(`[DEMO MISSING] Lesson: ${lesson.id}, Block: ${block.id}, DemoId: ${block.demoId}`);
          missingDemos++;
        }
      }
      if (block.type === "practice") {
        for (const pid of block.problemIds) {
          const p = lesson.practiceProblems.find(item => item.id === pid);
          if (!p) {
            console.error(`[PRACTICE MISSING] Lesson: ${lesson.id}, ProblemId: ${pid}`);
            missingProblems++;
          }
        }
      }
      if (block.type === "quiz") {
        for (const qid of block.questionIds) {
          const q = lesson.quiz.find(item => item.id === qid);
          if (!q) {
            console.error(`[QUIZ MISSING] Lesson: ${lesson.id}, QuestionId: ${qid}`);
            missingQuizzes++;
          }
        }
      }
    }
  }
}

// Scan all useProgress calls
import fs from "fs";
import path from "path";

function scanUseProgress(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanUseProgress(full);
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      const content = fs.readFileSync(full, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.includes("useProgress(")) {
          const trimmed = line.trim();
          if (trimmed.includes("(s) => s)") || trimmed.includes("(state) => state") || trimmed === "useProgress()") {
            console.log(`[WHOLE STORE] ${full}:${idx + 1}: ${trimmed}`);
          }
        }
      });
    }
  }
}
scanUseProgress("./src");


// Check non-coding lessons for code blocks
for (const lesson of lessonContents) {
  const codeBlocks = lesson.sections.flatMap(s => s.blocks).filter(b => b.type === "code");
  if (codeBlocks.length > 0) {
    console.log(`Lesson ${lesson.id} has ${codeBlocks.length} code blocks.`);
  }
}

// Test plot-math scientific notation edge cases
const sciCases = [
  "1e-5",
  "1e5",
  "2.5e3",
  ".5e2",
  "0.5e2",
  "1.e2",
  "1e+3",
  "1e-0",
  "1.23e-4",
];

for (const c of sciCases) {
  const fn = compileCustomExpression(c);
  const val = fn ? fn(0) : "FAILED (null)";
  const calc = evaluateCalculatorExpression(c);
  console.log(`Sci Notation "${c}": fn(0)=${val}, calc=${calc.success ? calc.result : "FAILED (" + calc.error + ")"}`);
}

// Test Simpson's rule on boundary singularities
const intCases = [
  { name: "1/sqrt(x) on [0, 1]", fn: (x: number) => (x <= 0 ? Infinity : 1 / Math.sqrt(x)), a: 0, b: 1, expected: 2 },
  { name: "ln(x) on [0, 1]", fn: (x: number) => (x <= 0 ? -Infinity : Math.log(x)), a: 0, b: 1, expected: -1 },
  { name: "1/sqrt(1-x^2) on [-1, 1]", fn: (x: number) => (Math.abs(x) >= 1 ? Infinity : 1 / Math.sqrt(1 - x * x)), a: -1, b: 1, expected: Math.PI },
];

for (const ic of intCases) {
  const res = numericalDefiniteIntegral(ic.fn, ic.a, ic.b);
  console.log(`Integral "${ic.name}": result=${res}, expected=${ic.expected}, finite=${Number.isFinite(res)}`);
}
