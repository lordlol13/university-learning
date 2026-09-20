import type { LessonContent } from "../../types/lesson-engine";

export const discreteLogicLesson: LessonContent = {
  id: "discrete-logic",
  curriculumLessonId: "discrete-logic",
  version: 1,
  title: "Discrete Mathematics: Boolean Logic & Sets",
  description: "Propositional logic, truth tables, conditional statements, and De Morgan's laws.",
  estimatedMinutes: 15,
  difficulty: "Foundational",
  xp: 110,
  prerequisites: ["calc-integrals"],
  learningObjectives: [
    "Construct and evaluate complete truth tables for composite boolean propositions.",
    "Formulate contrapositives, converses, and inverses of logical implications.",
    "Apply De Morgan's Laws to simplify boolean expressions and logical circuits.",
  ],
  sections: [
    {
      id: "concept",
      title: "Foundations of Propositional Logic",
      stage: "Understand",
      blocks: [
        {
          id: "logic-intro",
          type: "introduction",
          title: "The Binary World of Truth",
          paragraphs: [
            "Every computer architecture and formal proof rests on discrete propositional logic, where statements evaluate unambiguously to True (1) or False (0).",
            "Complex software decisions and algorithmic assertions are constructed from three fundamental operators: Conjunction (AND, $\\land$), Disjunction (OR, $\\lor$), and Negation (NOT, $\\neg$).",
          ],
        },
        {
          id: "demorgan-formula",
          type: "formula",
          title: "De Morgan's Laws",
          latex: "\\neg (A \\land B) \\iff (\\neg A) \\lor (\\neg B)",
          explanation: "Negating a conjunction turns it into a disjunction of negations. Similarly, the negation of an OR is the AND of the negations.",
        },
        {
          id: "demorgan-breakdown",
          type: "formula-breakdown",
          title: "Anatomy of De Morgan Equivalence",
          parts: [
            {
              latex: "\\neg (A \\land B)",
              variable: {
                latex: "\\neg(AB)",
                name: "Negated joint condition",
                explanation: "It is not the case that both A and B are simultaneously true.",
              },
            },
            {
              latex: "\\iff",
              variable: {
                latex: "\\equiv",
                name: "Logical equivalence",
                explanation: "Both sides produce identical truth values for every assignment.",
              },
            },
            {
              latex: "(\\neg A) \\lor (\\neg B)",
              variable: {
                latex: "A' + B'",
                name: "Disjunctive alternative",
                explanation: "At least one of the two components is false.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "implication-sec",
      title: "Material Implication & The Contrapositive",
      stage: "Visualize",
      blocks: [
        {
          id: "implication-formula",
          type: "formula",
          title: "Material Implication and Equivalence",
          latex: "(P \\implies Q) \\iff (\\neg P \\lor Q)",
          explanation: "An implication P => Q is only false when the hypothesis P is true but the conclusion Q is false. It is logically equivalent to its contrapositive (not Q => not P).",
        },
        {
          id: "implication-worked",
          type: "worked-example",
          title: "Simplifying a Logic Circuit Expression",
          problem: "Simplify the boolean expression: $\\neg ( (A \\land \\neg B) \\lor C )$.",
          steps: [
            {
              title: "Apply De Morgan to the outer OR",
              text: "The outer disjunction transforms into a conjunction of both negated operands.",
              latex: "\\neg( (A \\land \\neg B) \\lor C ) = \\neg(A \\land \\neg B) \\land \\neg C",
            },
            {
              title: "Apply De Morgan to the inner AND",
              text: "Distribute the negation and eliminate double negation on B.",
              latex: "\\neg(A \\land \\neg B) = (\\neg A) \\lor B",
            },
            {
              title: "Combine simplified terms",
              text: "The expression is reduced to a concise conjunctive normal form.",
              latex: "( (\\neg A) \\lor B ) \\land \\neg C",
            },
          ],
          interpretation: "The simplified condition requires that C is False, and simultaneously either A is False or B is True.",
        },
      ],
    },
    {
      id: "practice-sec",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "logic-practice-block",
          type: "practice",
          problemIds: ["p-log-1", "p-log-2"],
        },
      ],
    },
    {
      id: "quiz-sec",
      title: "Mastery Assessment",
      stage: "Reflect",
      blocks: [
        {
          id: "logic-quiz-block",
          type: "quiz",
          questionIds: ["q-log-1", "q-log-2"],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "p-log-1",
      prompt: "How many rows are present in a complete truth table for a proposition with 3 independent variables $P, Q, R$?",
      answer: 8,
      tolerance: 0,
      hint: "Each variable has 2 possible truth states (T/F). Compute $2^n$.",
      explanation: "$2^3 = 8$ rows are needed to enumerate all combinations.",
    },
    {
      id: "p-log-2",
      prompt: "In binary logic where True = 1 and False = 0, what is the numerical value of (1 AND 0) OR (NOT 0)?",
      answer: 1,
      tolerance: 0,
      hint: "1 AND 0 = 0. NOT 0 = 1. Then evaluate 0 OR 1.",
      explanation: "$0 \\lor 1 = 1$ (True).",
    },
  ],
  quiz: [
    {
      id: "q-log-1",
      prompt: "Which of the following propositions is a tautology (always True regardless of P)?",
      options: [
        "P OR (NOT P)",
        "P AND (NOT P)",
        "P => (NOT P)",
      ],
      answerIndex: 0,
      explanation: "By the law of the excluded middle, P OR (NOT P) is always True for every boolean assignment.",
    },
    {
      id: "q-log-2",
      prompt: "Under what condition is the biconditional statement P <=> Q True?",
      options: [
        "When P and Q have identical truth values",
        "Only when both P and Q are True",
        "Whenever P is True",
      ],
      answerIndex: 0,
      explanation: "The biconditional P <=> Q is True if and only if both P and Q are True, or both are False.",
    },
  ],
};
