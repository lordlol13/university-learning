import type { LessonContent } from "../../types/lesson-engine";

export const vectorComponentsLesson: LessonContent = {
  id: "vector-components",
  curriculumLessonId: "vector-components",
  version: 1,
  title: "Vector Components & Analytical Addition",
  description: "Rectangular resolution, quadrant mapping, resultant magnitude and direction, and avoiding quadrant blindness.",
  estimatedMinutes: 18,
  difficulty: "Foundational",
  xp: 120,
  prerequisites: ["water-equivalency"],
  learningObjectives: [
    "Differentiate scalars (magnitude only) from vectors (magnitude and direction).",
    "Resolve 2D vectors into rectangular components $A_x = A\\cos\\theta$ and $A_y = A\\sin\\theta$.",
    "Overcome Trap 2 (Quadrant Blindness) by verifying quadrant signs before computing direction angles.",
  ],
  sections: [
    {
      id: "understand",
      title: "Scalars, Vectors, and Coordinates",
      stage: "Understand",
      blocks: [
        {
          id: "vector-intro",
          type: "introduction",
          title: "The Tactical Blueprint: Vectors Defined",
          paragraphs: [
            "A scalar is a physical quantity completely described by magnitude (a real number) and a unit—such as temperature ($295\\text{ K}$) or volume ($3\\text{ m}^3$).",
            "A vector requires both magnitude AND a direction in space—such as velocity ($35\\text{ m/s}$ North) or force ($450\\text{ N}$ at $30^\\circ$). The net change in position of an object is its displacement vector.",
          ],
        },
        {
          id: "components-intuition",
          type: "intuition",
          title: "Rectangular Resolution & Quadrant Mapping",
          paragraphs: [
            "Adding vectors geometrically (via Triangle or Parallelogram rules) can lead to graphical inaccuracies. The analytical method breaks every vector into independent horizontal ($A_x$) and vertical ($A_y$) projections.",
            "Trap 1 Warning: $A_x = A\\cos\\theta$ and $A_y = A\\sin\\theta$ ONLY hold when $\\theta$ is measured relative to the horizontal $x$-axis. If $\\theta$ is given relative to the vertical $y$-axis, the trigonometric functions swap!",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "Analytical Equations & Quadrant Matrix",
      stage: "Visualize",
      blocks: [
        {
          id: "resolution-formula",
          type: "formula",
          title: "Resolution and Resultant Equations",
          latex: "\\begin{aligned}A_x &= A\\cos(\\theta), \\quad A_y = A\\sin(\\theta)\\\\A &= \\sqrt{A_x^2 + A_y^2}, \\quad \\theta = \\tan^{-1}\\left(\\frac{A_y}{A_x}\\right)\\\\R_x &= \\sum A_x, \\quad R_y = \\sum A_y, \\quad R = \\sqrt{R_x^2 + R_y^2}\\end{aligned}",
          explanation:
            "Sum components along each axis separately, then recombine using the Pythagorean theorem and arctangent.",
        },
        {
          id: "quadrant-matrix-formula",
          type: "formula",
          title: "Quadrant Mapping Matrix",
          latex: "\\begin{aligned}\\text{QI: } & A_x (+), A_y (+) \\implies \\theta = \\theta_{\\text{calc}}\\\\\\text{QII: } & A_x (-), A_y (+) \\implies \\theta = \\theta_{\\text{calc}} + 180^\\circ\\\\\\text{QIII: } & A_x (-), A_y (-) \\implies \\theta = \\theta_{\\text{calc}} + 180^\\circ\\\\\\text{QIV: } & A_x (+), A_y (-) \\implies \\theta = \\theta_{\\text{calc}} + 360^\\circ\\end{aligned}",
          explanation:
            "Trap 2 (Quadrant Blindness): Calculators cannot distinguish between $(-y)/(-x)$ and $(+y)/(+x)$. You must manually check the component signs and adjust the angle!",
        },
      ],
    },
    {
      id: "worked-vector-sum",
      title: "Worked Example",
      stage: "Apply",
      blocks: [
        {
          id: "worked-resultant-calc",
          type: "worked-example",
          title: "Analytical Addition of Two Forces",
          problem:
            "Calculate the magnitude of the resultant vector $\\vec{R} = \\vec{A} + \\vec{B}$ where $\\vec{A} = [3\\text{ N}, 4\\text{ N}]$ and $\\vec{B} = [3\\text{ N}, 4\\text{ N}]$.",
          steps: [
            {
              title: "Sum the x-components",
              text: "Add horizontal coordinates: $R_x = A_x + B_x = 3 + 3 = 6\\text{ N}$.",
              latex: "R_x = 3\\text{ N} + 3\\text{ N} = 6\\text{ N}",
            },
            {
              title: "Sum the y-components",
              text: "Add vertical coordinates: $R_y = A_y + B_y = 4 + 4 = 8\\text{ N}$.",
              latex: "R_y = 4\\text{ N} + 4\\text{ N} = 8\\text{ N}",
            },
            {
              title: "Compute resultant magnitude",
              text: "Apply the Pythagorean theorem: $R = \\sqrt{R_x^2 + R_y^2} = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10\\text{ N}$.",
              latex: "R = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10\\text{ N}",
            },
          ],
          interpretation:
            "Because both $R_x > 0$ and $R_y > 0$, the resultant lies in Quadrant I with angle $\\theta = \\tan^{-1}(8/6) \\approx 53.13^\\circ$.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "components-practice-block",
          type: "practice",
          problemIds: ["calc-vector-magnitude", "calc-resultant-x"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "components-quiz-block",
          type: "quiz",
          questionIds: ["scalar-vs-vector", "quadrant-blindness-fix", "swap-trig-angle"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "components-summary-block",
          type: "summary",
          title: "Vector Blueprint Essentials",
          takeaways: [
            "Scalars have magnitude only; vectors possess both magnitude and direction.",
            "Decompose into rectangular components: $A_x = A\\cos\\theta$ and $A_y = A\\sin\\theta$ (relative to $x$-axis).",
            "Quadrant Blindness: Always check component signs before trusting a calculator's $\\tan^{-1}(R_y/R_x)$ output.",
            "Triangle, Parallelogram, and Polygon head-to-tail methods represent geometric additions equivalent to component summation.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "calc-vector-magnitude",
      prompt:
        "A displacement vector has orthogonal components $A_x = 6\\text{ m}$ and $A_y = 8\\text{ m}$. What is its overall magnitude $A$?",
      answer: 10,
      tolerance: 0,
      hint: "Use $A = \\sqrt{A_x^2 + A_y^2} = \\sqrt{6^2 + 8^2}$.",
      explanation:
        "$\\sqrt{36 + 64} = \\sqrt{100} = 10\\text{ m}$.",
    },
    {
      id: "calc-resultant-x",
      prompt:
        "Vector $\\vec{A}$ has $A_x = -5\\text{ N}$, and vector $\\vec{B}$ has $B_x = 12\\text{ N}$. What is the x-component of the resultant vector $R_x = A_x + B_x$?",
      answer: 7,
      tolerance: 0,
      hint: "Add the signed scalar values: $(-5) + 12$.",
      explanation:
        "$R_x = -5 + 12 = 7\\text{ N}$.",
    },
  ],
  quiz: [
    {
      id: "scalar-vs-vector",
      prompt: "Which of the following physical quantities is a VECTOR rather than a scalar?",
      options: [
        "Velocity ($25\\text{ m/s}$ East)",
        "Temperature ($300\\text{ K}$)",
        "Mass ($50\\text{ kg}$)",
      ],
      answerIndex: 0,
      explanation:
        "Velocity requires both magnitude ($25\\text{ m/s}$) and direction (East). Temperature and mass are scalars.",
    },
    {
      id: "quadrant-blindness-fix",
      prompt: "A resultant vector has $R_x = -4$ and $R_y = +4$ (Quadrant II). A calculator outputs $\\tan^{-1}(-1) = -45^\\circ$. What is the true direction angle relative to the $+x$ axis?",
      options: [
        "$135^\\circ$ ($-45^\\circ + 180^\\circ$)",
        "$-45^\\circ$",
        "$315^\\circ$",
      ],
      answerIndex: 0,
      explanation:
        "In Quadrant II ($R_x < 0, R_y > 0$), adding $180^\\circ$ to the blind calculator angle corrects for quadrant blindness: $-45^\\circ + 180^\\circ = 135^\\circ$.",
    },
    {
      id: "swap-trig-angle",
      prompt: "According to Trap 1, what happens to the component formulas if angle $\\theta$ is measured relative to the vertical $y$-axis rather than the $x$-axis?",
      options: [
        "The trigonometric functions swap: $A_x = A\\sin\\theta$ and $A_y = A\\cos\\theta$",
        "The formulas remain identical: $A_x = A\\cos\\theta$",
        "The magnitude doubles",
      ],
      answerIndex: 0,
      explanation:
        "When adjacent to the $y$-axis, the opposite side of the right triangle is horizontal ($x$), so $A_x = A\\sin\\theta$ and $A_y = A\\cos\\theta$.",
    },
  ],
};
