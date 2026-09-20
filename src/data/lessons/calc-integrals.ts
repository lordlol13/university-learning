import type { LessonContent } from "../../types/lesson-engine";

export const calcIntegralsLesson: LessonContent = {
  id: "calc-integrals",
  curriculumLessonId: "calc-integrals",
  version: 1,
  title: "Calculus: Integrals & Accumulation",
  description: "Riemann sums, definite integrals, antiderivatives, and the Fundamental Theorem of Calculus.",
  estimatedMinutes: 16,
  difficulty: "Foundational",
  xp: 120,
  prerequisites: ["calc-derivatives"],
  learningObjectives: [
    "Approximate area under continuous functions using Riemann partitions.",
    "Formulate the Fundamental Theorem of Calculus linking derivatives and integrals.",
    "Calculate exact definite integrals using antiderivatives.",
  ],
  sections: [
    {
      id: "concept",
      title: "The Problem of Cumulative Area",
      stage: "Understand",
      blocks: [
        {
          id: "integral-intro",
          type: "introduction",
          title: "Summing Infinitesimal Slices",
          paragraphs: [
            "While differentiation deconstructs curves into local rates of change, integration assembles tiny pieces into a cumulative total.",
            "By slicing the region under a curve into $n$ narrow vertical strips of width $\\Delta x$ and taking the limit as the strips become infinitely thin, we obtain the definite integral.",
          ],
        },
        {
          id: "ftc-formula",
          type: "formula",
          title: "The Fundamental Theorem of Calculus",
          latex: "\\int_a^b f(x)\\,dx = F(b) - F(a)",
          explanation: "If F is an antiderivative of f such that F'(x) = f(x), the net accumulation between a and b is given by F(b) - F(a).",
        },
        {
          id: "ftc-breakdown",
          type: "formula-breakdown",
          title: "Anatomy of the Definite Integral",
          parts: [
            {
              latex: "\\int_a^b",
              variable: {
                latex: "[a, b]",
                name: "Integration bounds",
                explanation: "The continuous interval from lower limit a to upper limit b.",
              },
            },
            {
              latex: "f(x)\\,dx",
              variable: {
                latex: "dA",
                name: "Differential element",
                explanation: "Height f(x) multiplied by infinitesimal width dx.",
              },
            },
            {
              latex: "F(b) - F(a)",
              variable: {
                latex: "\\Delta F",
                name: "Net evaluation",
                explanation: "The difference in antiderivative values across endpoints.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "integration-worked-sec",
      title: "Calculating Definite Integrals",
      stage: "Visualize",
      blocks: [
        {
          id: "integral-worked",
          type: "worked-example",
          title: "Work Done by a Linear Spring",
          problem: "Hooke's Law states force $F(x) = kx$. Compute the work done stretching a spring of $k = 40$ N/m from $x = 0$ m to $x = 0.5$ m.",
          steps: [
            {
              title: "Set up the integral for mechanical work",
              text: "Work is defined as the integral of force over displacement.",
              latex: "W = \\int_0^{0.5} 40x\\,dx",
            },
            {
              title: "Find the antiderivative",
              text: "Using the reverse power rule on x^1 gives x^2 / 2.",
              latex: "F(x) = 40\\left(\\frac{x^2}{2}\\right) = 20x^2",
            },
            {
              title: "Evaluate at limits 0 and 0.5",
              text: "Subtract the lower evaluation from the upper evaluation.",
              latex: "W = 20(0.5)^2 - 20(0)^2 = 20(0.25) = 5\\text{ Joules}",
            },
          ],
          interpretation: "Total mechanical energy stored in the spring is exactly 5 Joules.",
        },
      ],
    },
    {
      id: "practice-sec",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "integral-practice-block",
          type: "practice",
          problemIds: ["p-int-1", "p-int-2"],
        },
      ],
    },
    {
      id: "quiz-sec",
      title: "Mastery Assessment",
      stage: "Reflect",
      blocks: [
        {
          id: "integral-quiz-block",
          type: "quiz",
          questionIds: ["q-int-1", "q-int-2"],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "p-int-1",
      prompt: "Evaluate the definite integral of $3x^2\\,dx$ from $x = 1$ to $x = 2$.",
      answer: 7,
      tolerance: 0,
      hint: "Find the antiderivative of $3x^2$, which is $x^3$. Then calculate $2^3 - 1^3$.",
      explanation: "$[x^3]_1^2 = 2^3 - 1^3 = 8 - 1 = 7$.",
    },
    {
      id: "p-int-2",
      prompt: "Evaluate the definite integral of $5\\,dx$ from $x = 0$ to $x = 4$.",
      answer: 20,
      tolerance: 0,
      hint: "The antiderivative of $5$ is $5x$. Evaluate $5(4) - 5(0)$.",
      explanation: "$[5x]_0^4 = 5(4) - 5(0) = 20$.",
    },
  ],
  quiz: [
    {
      id: "q-int-1",
      prompt: "What is the general antiderivative of f(x) = x^4 with respect to x?",
      options: [
        "(1/5)x^5 + C",
        "4x^3 + C",
        "x^5 + C",
      ],
      answerIndex: 0,
      explanation: "By the reverse power rule, the integral of x^n dx is (x^(n+1))/(n+1) + C. For n = 4, this is (1/5)x^5 + C.",
    },
    {
      id: "q-int-2",
      prompt: "According to the Fundamental Theorem of Calculus, what is the derivative of the accumulation function g(x) = integral from 0 to x of f(t) dt?",
      options: [
        "g'(x) = f(x)",
        "g'(x) = F(x) - F(0)",
        "g'(x) = f'(x)",
      ],
      answerIndex: 0,
      explanation: "The first part of the Fundamental Theorem states that d/dx [integral from a to x of f(t) dt] = f(x).",
    },
  ],
};
