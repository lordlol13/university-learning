/** Serializable authoring contract. Content can be authored in TS or loaded as JSON. */
export type RichText = string; // $...$ is inline mathematics, rendered with KaTeX.
export interface FormulaVariable {
  latex: string;
  name: string;
  explanation: string;
}
interface BlockBase {
  id: string;
  title?: string;
}
export type LessonBlock = BlockBase &
  (
    | { type: "introduction" | "intuition" | "theory"; paragraphs: RichText[] }
    | { type: "formula"; latex: string; explanation: RichText }
    | {
        type: "formula-breakdown";
        parts: Array<{ latex: string; variable?: FormulaVariable }>;
      }
    | {
        type: "interactive-graph" | "algorithm-visualizer";
        visualization: "gradient-descent";
        simulationId: string;
        parameters: { initialX: number; learningRate: number };
      }
    | { type: "code"; examples: CodeSample[] }
    | {
        type: "worked-example";
        problem: RichText;
        steps: Array<{ title: string; text: RichText; latex?: string }>;
        interpretation: RichText;
      }
    | { type: "practice"; problemIds: string[] }
    | { type: "quiz"; questionIds: string[] }
    | { type: "summary"; takeaways: RichText[] }
  );
export interface CodeSample {
  language: "python" | "numpy" | "pytorch" | "cpp" | "sql";
  label: string;
  code: string;
  highlightLines?: number[];
}
export interface PracticeProblem {
  id: string;
  prompt: RichText;
  answer: number;
  tolerance: number;
  hint: RichText;
  explanation: RichText;
}
export interface QuizQuestion {
  id: string;
  prompt: RichText;
  options: string[];
  answerIndex: number;
  explanation: RichText;
}
export interface LessonContent {
  id: string;
  curriculumLessonId: string;
  version: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  xp: number;
  prerequisites: string[];
  learningObjectives: RichText[];
  sections: Array<{
    id: string;
    title: string;
    stage: string;
    blocks: LessonBlock[];
  }>;
  practiceProblems: PracticeProblem[];
  quiz: QuizQuestion[];
}
export interface LessonActivity {
  viewed: string[];
  completed: string[];
  practice: string[];
  quiz: string[];
}
/** An execution adapter can be supplied by a future secure sandbox. No eval in the UI. */
export interface CodeExecutor {
  execute(
    sample: CodeSample,
    signal: AbortSignal,
  ): Promise<{ stdout: string; stderr: string }>;
}
