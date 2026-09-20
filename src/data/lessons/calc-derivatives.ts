import type { LessonContent } from "../../types/lesson-engine";

export const calcDerivativesLesson: LessonContent = {
  id: "calc-derivatives",
  curriculumLessonId: "calc-derivatives",
  version: 1,
  title: "Calculus: Rates of Change & Derivatives",
  description: "Instantaneous rates of change, tangent slopes, difference quotients, and the power rule.",
  estimatedMinutes: 16,
  difficulty: "Foundational",
  xp: 120,
  prerequisites: [],
  learningObjectives: [
    "Define the derivative as the limit of difference quotients as the interval approaches zero.",
    "Apply differentiation rules including the power rule and sum rule.",
    "Interpret derivatives geometrically as tangent slopes and physically as instantaneous rates.",
  ],
  sections: [
    {
      id: "concept",
      title: "The Problem of Instantaneous Velocity",
      stage: "Understand",
      blocks: [
        {
          id: "deriv-intro",
          type: "introduction",
          title: "From Average Speed to Instantaneous Slope",
          paragraphs: [
            "If a vehicle travels 120 kilometers in 2 hours, its average velocity is 60 km/h. But at any single instant, the speedometer may read 90 km/h or 0 km/h.",
            "Differential calculus solves the challenge of finding the instantaneous rate of change by shrinking the time interval $\\Delta t$ toward zero.",
          ],
        },
        {
          id: "deriv-limit-def",
          type: "formula",
          title: "The Definition of the Derivative",
          latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}",
          explanation: "The difference quotient represents the slope of a secant line between x and x + h. As h approaches zero, the secant line becomes the tangent line.",
        },
        {
          id: "deriv-breakdown",
          type: "formula-breakdown",
          title: "Anatomy of the Difference Quotient",
          parts: [
            {
              latex: "f(x + h) - f(x)",
              variable: {
                latex: "\\Delta y",
                name: "Vertical displacement",
                explanation: "The change in function value over the interval h.",
              },
            },
            {
              latex: "h",
              variable: {
                latex: "\\Delta x",
                name: "Horizontal step",
                explanation: "The increment in the independent variable.",
              },
            },
            {
              latex: "\\lim_{h \\to 0}",
              variable: {
                latex: "L",
                name: "Limiting process",
                explanation: "Observes the slope behavior as the step approaches zero.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "power-rule-sec",
      title: "The Power Rule for Polynomials",
      stage: "Visualize",
      blocks: [
        {
          id: "power-rule-formula",
          type: "formula",
          title: "The Power Rule",
          latex: "\\frac{d}{dx}\\left(x^n\\right) = n x^{n - 1}",
          explanation: "For any real exponent n, bring the power to the front as a multiplier and decrease the exponent by 1.",
        },
        {
          id: "deriv-worked",
          type: "worked-example",
          title: "Differentiating a Quadratic Trajectory",
          problem: "Find the derivative of the height function $h(t) = -5t^2 + 20t + 2$.",
          steps: [
            {
              title: "Apply linearity and power rule to each term",
              text: "The exponent 2 is multiplied by the coefficient -5 to yield -10t.",
              latex: "\\frac{d}{dt}(-5t^2) = -5(2t) = -10t",
            },
            {
              title: "Differentiate the linear term",
              text: "t has exponent 1, leaving the constant 20.",
              latex: "\\frac{d}{dt}(20t) = 20(1) = 20",
            },
            {
              title: "Differentiate the constant term",
              text: "Constants do not change, so their derivative is zero.",
              latex: "\\frac{d}{dt}(2) = 0",
            },
          ],
          interpretation: "Combining terms gives $h'(t) = -10t + 20$. At $t = 2$ seconds, velocity is $0$ m/s, marking the apex.",
        },
      ],
    },
    {
      id: "practice-sec",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "deriv-practice-block",
          type: "practice",
          problemIds: ["p-deriv-1", "p-deriv-2"],
        },
      ],
    },
    {
      id: "quiz-sec",
      title: "Mastery Assessment",
      stage: "Reflect",
      blocks: [
        {
          id: "deriv-quiz-block",
          type: "quiz",
          questionIds: ["q-deriv-1", "q-deriv-2"],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "p-deriv-1",
      prompt: "What is the slope of the tangent line to $f(x) = x^2$ at $x = 3$?",
      answer: 6,
      tolerance: 0,
      hint: "First find $f'(x) = 2x$, then substitute $x = 3$.",
      explanation: "$f'(x) = 2x$. At $x = 3$, $f'(3) = 2(3) = 6$.",
    },
    {
      id: "p-deriv-2",
      prompt: "If $f(x) = 4x^3$, what is the value of the derivative $f'(x)$ evaluated at $x = 1$?",
      answer: 12,
      tolerance: 0,
      hint: "Use the power rule: $d/dx(4x^3) = 4 \\cdot 3x^2 = 12x^2$.",
      explanation: "$f'(x) = 12x^2$. At $x = 1$, $12(1)^2 = 12$.",
    },
  ],
  quiz: [
    {
      id: "q-deriv-1",
      prompt: "What geometric property does the derivative f'(a) represent on the curve y = f(x)?",
      options: [
        "The area bounded between the curve and the x-axis",
        "The slope of the tangent line to the curve at x = a",
        "The distance from the origin to the point (a, f(a))",
      ],
      answerIndex: 1,
      explanation: "The derivative at a point is by definition the slope of the tangent line to the curve at that point.",
    },
    {
      id: "q-deriv-2",
      prompt: "If a moving body has position s(t) = 3t^2, what is its acceleration a(t)?",
      options: [
        "a(t) = 6t",
        "a(t) = 6",
        "a(t) = 3",
      ],
      answerIndex: 1,
      explanation: "Velocity is s'(t) = 6t. Acceleration is the second derivative s''(t) = 6.",
    },
  ],
};
