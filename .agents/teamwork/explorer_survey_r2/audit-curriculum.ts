import { lessonContents } from "../../../src/data/lessons/index.ts";
import { allLessons, directions } from "../../../src/data/curriculum.ts";

console.log("=== AUDIT SUMMARY ===");
console.log("Directions count:", directions.length);
console.log("Curriculum lessons count:", allLessons.length);
console.log("Authored lesson contents count:", lessonContents.length);

for (const d of directions) {
  const dirLessons = allLessons.filter(l =>
    d.subjects.some(s => s.units.some(u => u.lessons.some(ul => ul.id === l.id)))
  );
  console.log(`\n--- Track: ${d.id} ("${d.title}") | Lessons: ${dirLessons.length} ---`);
  for (const l of dirLessons) {
    const detailed = lessonContents.find(lc => lc.id === l.id || lc.curriculumLessonId === l.id);
    if (!detailed) {
      console.log(`  ERROR: Lesson ${l.id} has NO detailed authored content!`);
      continue;
    }
    const blocksCount = detailed.sections.reduce((acc, s) => acc + s.blocks.length, 0);
    const practiceCount = detailed.practiceProblems?.length ?? 0;
    const quizCount = detailed.quiz?.length ?? 0;
    const blockTypes = Array.from(new Set(detailed.sections.flatMap(s => s.blocks.map(b => b.type))));
    console.log(`  Lesson: ${l.id} (XP: ${l.xp})`);
    console.log(`    Title: "${detailed.title}" | Difficulty: ${detailed.difficulty} | Minutes: ${detailed.estimatedMinutes}`);
    console.log(`    Sections: ${detailed.sections.length} | Total blocks: ${blocksCount} | Types: [${blockTypes.join(", ")}]`);
    console.log(`    Practice problems: ${practiceCount} | Quiz questions: ${quizCount}`);
  }
}
