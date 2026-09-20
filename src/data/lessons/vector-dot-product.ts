import type { LessonContent } from "../../types/lesson-engine";

export const vectorDotProductLesson: LessonContent = {
  id: "vector-dot-product",
  curriculumLessonId: "vector-dot-product",
  version: 1,
  title: "Dot Product & Angle Determination",
  description: "Scalar multiplication of vectors, finding the exact angle between vectors, and the orthogonality condition.",
  estimatedMinutes: 18,
  difficulty: "Intermediate",
  xp: 130,
  prerequisites: ["vector-components"],
  learningObjectives: [
    "Calculate algebraic and geometric dot products in 2D and 3D space.",
    "Solve for the exact angle between two arbitrary vectors using the cosine relation.",
    "Apply the Orthogonality Check ($\\vec{A} \\cdot \\vec{B} = 0$) and avoid Trap 5 (mixing scalar vs. vector outputs).",
  ],
  sections: [
    {
      id: "understand",
      title: "The Scalar Product",
      stage: "Understand",
      blocks: [
        {
          id: "dot-intro",
          type: "introduction",
          title: "Projection and Work",
          paragraphs: [
            "The dot product (also called the scalar product) multiplies two vectors to yield a single numerical scalar value. In mechanics, work done by a force is $W = \\vec{F} \\cdot \\vec{d}$, representing how much of the force aligns with displacement.",
            "Trap 5 Warning: A dot product yields a SCALAR (a single real number with units), NEVER a vector. It does not contain $\\hat{i}, \\hat{j}, \\hat{k}$ directional components.",
          ],
        },
        {
          id: "angle-intuition",
          type: "intuition",
          title: "Measuring Vector Alignment",
          paragraphs: [
            "Geometrically, $\\vec{A} \\cdot \\vec{B} = AB\\cos(\\phi)$. When two vectors are aligned ($\\phi = 0^\\circ$), the dot product reaches its maximum positive value $AB$.",
            "When vectors are perpendicular (orthogonal, $\\phi = 90^\\circ$), $\\cos(90^\\circ) = 0$. Hence, any time $\\vec{A} \\cdot \\vec{B} = 0$ for non-zero vectors, the vectors are guaranteed to be orthogonal.",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "Dot Product & Angle Formulas",
      stage: "Visualize",
      blocks: [
        {
          id: "dot-formula",
          type: "formula",
          title: "Algebraic and Geometric Definitions",
          latex: "\\vec{A} \\cdot \\vec{B} = AB\\cos(\\phi) = A_x B_x + A_y B_y + A_z B_z",
          explanation:
            "Multiply corresponding Cartesian components and sum the products to evaluate the scalar projection.",
        },
        {
          id: "angle-determination-formula",
          type: "formula",
          title: "The Angle Determination Equation",
          latex: "\\phi = \\cos^{-1}\\left(\\frac{\\vec{A} \\cdot \\vec{B}}{AB}\\right) = \\cos^{-1}\\left(\\frac{A_x B_x + A_y B_y + A_z B_z}{\\sqrt{A_x^2 + A_y^2 + A_z^2}\\sqrt{B_x^2 + B_y^2 + B_z^2}}\\right)",
          explanation:
            "Divide the scalar dot product by the product of both magnitudes, then take the inverse cosine.",
        },
        {
          id: "orthogonality-breakdown",
          type: "formula-breakdown",
          title: "Diagnostic Table: Identical vs. Orthogonal",
          parts: [
            {
              latex: "\\hat{i} \\cdot \\hat{i} = 1",
              variable: {
                latex: "\\hat{i} \\cdot \\hat{i}",
                name: "Identical Unit Vectors",
                explanation: "Same direction (angle $0^\\circ$): $\\cos(0^\\circ) = 1$.",
              },
            },
            {
              latex: "\\hat{i} \\cdot \\hat{j} = 0",
              variable: {
                latex: "\\hat{i} \\cdot \\hat{j}",
                name: "Orthogonal Unit Vectors",
                explanation: "Perpendicular (angle $90^\\circ$): $\\cos(90^\\circ) = 0$.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "worked-angle",
      title: "Worked Example",
      stage: "Apply",
      blocks: [
        {
          id: "worked-dot-angle",
          type: "worked-example",
          title: "Testing Orthogonality & Finding Angles",
          problem:
            "Given $\\vec{A} = [2, 3, -1]$ and $\\vec{B} = [4, -2, 2]$, calculate $\\vec{A} \\cdot \\vec{B}$ and determine if they are orthogonal.",
          steps: [
            {
              title: "Calculate component products",
              text: "Multiply pairwise: $x$-components $(2)(4)$, $y$-components $(3)(-2)$, and $z$-components $(-1)(2)$.",
              latex: "\\vec{A} \\cdot \\vec{B} = (2)(4) + (3)(-2) + (-1)(2)",
            },
            {
              title: "Sum the scalar contributions",
              text: "Evaluate: $8 - 6 - 2 = 0$.",
              latex: "\\vec{A} \\cdot \\vec{B} = 8 - 6 - 2 = 0",
            },
            {
              title: "Apply the Orthogonality Check",
              text: "Since $\\vec{A} \\cdot \\vec{B} = 0$ and both vectors have non-zero lengths, the angle is $\\phi = \\cos^{-1}(0) = 90^\\circ$.",
              latex: "\\vec{A} \\cdot \\vec{B} = 0 \\implies \\vec{A} \\perp \\vec{B}",
            },
          ],
          interpretation:
            "The vectors are strictly perpendicular (orthogonal) in 3-dimensional space.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "dot-practice-block",
          type: "practice",
          problemIds: ["calc-dot-3d", "dot-perpendicular-val"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "dot-quiz-block",
          type: "quiz",
          questionIds: ["dot-output-nature", "identical-unit-dot", "angle-when-negative"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "dot-summary-block",
          type: "summary",
          title: "Tactical Dot Product Rules",
          takeaways: [
            "Dot product outputs a SCALAR: $\\vec{A} \\cdot \\vec{B} = A_x B_x + A_y B_y + A_z B_z$.",
            "Commutative Law: $\\vec{A} \\cdot \\vec{B} = \\vec{B} \\cdot \\vec{A}$.",
            "Orthogonality Check: $\\vec{A} \\cdot \\vec{B} = 0 \\iff$ vectors are perpendicular.",
            "Identical basis unit vectors yield 1 ($\\hat{i}\\cdot\\hat{i} = 1$), while orthogonal basis vectors yield 0 ($\\hat{i}\\cdot\\hat{j} = 0$).",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "calc-dot-3d",
      prompt:
        "Compute the scalar dot product $\\vec{A} \\cdot \\vec{B}$ for $\\vec{A} = [3, 2, 4]$ and $\\vec{B} = [2, -1, 3]$.",
      answer: 16,
      tolerance: 0,
      hint: "Multiply pairwise: $(3 \\times 2) + (2 \\times -1) + (4 \\times 3) = 6 - 2 + 12$.",
      explanation:
        "$6 - 2 + 12 = 16$. The output is a scalar.",
    },
    {
      id: "dot-perpendicular-val",
      prompt:
        "Two perpendicular vectors have magnitudes $5$ and $8$. What is the numerical value of their dot product?",
      answer: 0,
      tolerance: 0,
      hint: "Recall that $\\vec{A} \\cdot \\vec{B} = AB\\cos(90^\\circ)$.",
      explanation:
        "Because $\\cos(90^\\circ) = 0$, the dot product of any orthogonal vectors is exactly $0$.",
    },
  ],
  quiz: [
    {
      id: "dot-output-nature",
      prompt: "According to Trap 5 in the Tactical Blueprint, what type of mathematical object does the dot product produce?",
      options: [
        "A scalar (a single numerical value)",
        "A vector with $\\hat{i}, \\hat{j}, \\hat{k}$ components",
        "A $3 \\times 3$ matrix",
      ],
      answerIndex: 0,
      explanation:
        "Trap 5 warns learners never to confuse outputs: the Dot Product yields a scalar, while the Cross Product yields a vector.",
    },
    {
      id: "identical-unit-dot",
      prompt: "What is the value of the dot product between identical unit vectors $\\hat{k} \\cdot \\hat{k}$?",
      options: [
        "$1$",
        "$0$",
        "$\\hat{i}$",
      ],
      answerIndex: 0,
      explanation:
        "The angle is $0^\\circ$, and unit vectors have length $1$: $1 \\times 1 \\times \\cos(0^\\circ) = 1$.",
    },
    {
      id: "angle-when-negative",
      prompt: "If the dot product $\\vec{A} \\cdot \\vec{B}$ is negative, what does this indicate about the angle $\\phi$ between them?",
      options: [
        "The angle is obtuse ($90^\\circ < \\phi \\le 180^\\circ$)",
        "The angle is acute ($0^\\circ \\le \\phi < 90^\\circ$)",
        "The vectors must be imaginary",
      ],
      answerIndex: 0,
      explanation:
        "Cosine is negative in the second quadrant ($90^\\circ$ to $180^\\circ$), which means the vectors point generally away from each other.",
    },
  ],
};
