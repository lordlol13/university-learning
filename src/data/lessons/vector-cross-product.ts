import type { LessonContent } from "../../types/lesson-engine";

export const vectorCrossProductLesson: LessonContent = {
  id: "vector-cross-product",
  curriculumLessonId: "vector-cross-product",
  version: 1,
  title: "Cross Product & 3D Space",
  description: "Vector output, the 3D Right-Hand Rule, the determinant expansion method, and anti-commutativity.",
  estimatedMinutes: 20,
  difficulty: "Intermediate",
  xp: 140,
  prerequisites: ["vector-dot-product"],
  learningObjectives: [
    "Evaluate 3D vector cross products using the formal $3 \\times 3$ determinant expansion method.",
    "Determine the perpendicular direction using the Right-Hand Rule.",
    "Apply Anti-Commutativity (Trap 3: $\\vec{A} \\times \\vec{B} = -(\\vec{B} \\times \\vec{A})$) and the Parallel Check.",
  ],
  sections: [
    {
      id: "understand",
      title: "Generating Orthogonal Vectors in 3D",
      stage: "Understand",
      blocks: [
        {
          id: "cross-intro",
          type: "introduction",
          title: "The Directed Vector Product",
          paragraphs: [
            "While the dot product measures alignment and produces a scalar, the cross product (vector product) creates a brand-new vector perpendicular to both input vectors.",
            "In engineering, the cross product governs rotational mechanics: torque is $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$, and magnetic force on a charge is $\\vec{F} = q(\\vec{v} \\times \\vec{B})$.",
          ],
        },
        {
          id: "rhr-intuition",
          type: "intuition",
          title: "The Right-Hand Rule & Anti-Commutativity",
          paragraphs: [
            "Point your right fingers along $\\vec{A}$ and curl them toward $\\vec{B}$. Your extended thumb points along $\\vec{A} \\times \\vec{B}$.",
            "Trap 3 Warning: The cross product is NOT commutative! Reversing the order flips the direction: $\\vec{B} \\times \\vec{A} = -(\\vec{A} \\times \\vec{B})$.",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "Determinant Method & Cyclic Rules",
      stage: "Visualize",
      blocks: [
        {
          id: "cross-formula",
          type: "formula",
          title: "The 3D Determinant Expansion Method",
          latex: "\\vec{A} \\times \\vec{B} = (A_y B_z - A_z B_y)\\hat{i} + (A_z B_x - A_x B_z)\\hat{j} + (A_x B_y - A_y B_x)\\hat{k}",
          explanation:
            "This formula corresponds to expanding the formal $3 \\times 3$ matrix determinant with basis vectors along the top row.",
        },
        {
          id: "cyclic-breakdown",
          type: "formula-breakdown",
          title: "Diagnostic Table: Cyclic Basis Products",
          parts: [
            {
              latex: "\\hat{i} \\times \\hat{j} = \\hat{k}",
              variable: {
                latex: "\\hat{i} \\times \\hat{j}",
                name: "Cyclic Forward",
                explanation: "Positive z direction: x-axis crossed into y-axis yields +z.",
              },
            },
            {
              latex: "\\hat{j} \\times \\hat{i} = -\\hat{k}",
              variable: {
                latex: "\\hat{j} \\times \\hat{i}",
                name: "Anti-Cyclic Reversed",
                explanation: "Reversing product order flips the vector sign.",
              },
            },
            {
              latex: "\\hat{i} \\times \\hat{i} = \\vec{0}",
              variable: {
                latex: "\\hat{i} \\times \\hat{i}",
                name: "Parallel / Identical",
                explanation: "Angle is $0^\\circ$: $\\sin(0^\\circ) = 0$, yielding zero vector.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "worked-cross",
      title: "Worked Example",
      stage: "Apply",
      blocks: [
        {
          id: "worked-determinant-calc",
          type: "worked-example",
          title: "Computing $\\vec{A} \\times \\vec{B}$ in Component Form",
          problem:
            "Given $\\vec{A} = [2, 0, 0]$ (pointing along $+x$) and $\\vec{B} = [0, 3, 0]$ (pointing along $+y$), compute the cross product $\\vec{A} \\times \\vec{B}$.",
          steps: [
            {
              title: "Apply the i-component formula",
              text: "$A_y B_z - A_z B_y = (0)(0) - (0)(3) = 0$.",
              latex: "C_x = (0)(0) - (0)(3) = 0",
            },
            {
              title: "Apply the j-component formula",
              text: "$A_z B_x - A_x B_z = (0)(0) - (2)(0) = 0$.",
              latex: "C_y = (0)(0) - (2)(0) = 0",
            },
            {
              title: "Apply the k-component formula",
              text: "$A_x B_y - A_y B_x = (2)(3) - (0)(0) = 6$.",
              latex: "C_z = (2)(3) - (0)(0) = 6",
            },
          ],
          interpretation:
            "The result is $\\vec{A} \\times \\vec{B} = 6\\hat{k} = [0, 0, 6]$. Notice that magnitude is $AB\\sin(90^\\circ) = (2)(3)(1) = 6$, and the Right-Hand Rule points directly along $+z$.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "cross-practice-block",
          type: "practice",
          problemIds: ["calc-cross-k-comp", "cross-parallel-val"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "cross-quiz-block",
          type: "quiz",
          questionIds: ["anti-commutativity-rule", "parallel-cross-check", "fake-unit-vector-trap"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "cross-summary-block",
          type: "summary",
          title: "Cross Product Tactical Checklist",
          takeaways: [
            "Cross product yields a VECTOR with magnitude $AB\\sin\\theta$, directed via the Right-Hand Rule.",
            "Anti-commutative: $\\vec{A} \\times \\vec{B} = -(\\vec{B} \\times \\vec{A})$.",
            "Parallel Check: $\\vec{A} \\times \\vec{B} = \\vec{0} \\iff$ vectors are parallel or anti-parallel.",
            "Trap 4: $\\langle 1, 1, 1 \\rangle$ is NOT a unit vector; its magnitude is $\\sqrt{3} \\approx 1.73$. A unit vector must have magnitude exactly 1.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "calc-cross-k-comp",
      prompt:
        "For $\\vec{A} = [4, 2, 0]$ and $\\vec{B} = [1, 5, 0]$, what is the z-component of their cross product $C_z = A_x B_y - A_y B_x$?",
      answer: 18,
      tolerance: 0,
      hint: "Evaluate $(4 \\times 5) - (2 \\times 1) = 20 - 2$.",
      explanation:
        "$C_z = (4)(5) - (2)(1) = 20 - 2 = 18$.",
    },
    {
      id: "cross-parallel-val",
      prompt:
        "Two parallel vectors have magnitudes $4$ and $7$. What is the magnitude of their cross product $|\\vec{A} \\times \\vec{B}|$?",
      answer: 0,
      tolerance: 0,
      hint: "Since parallel vectors have angle $\\theta = 0^\\circ$, evaluate $AB\\sin(0^\\circ)$.",
      explanation:
        "Because $\\sin(0^\\circ) = 0$, the magnitude of the cross product between parallel vectors is always $0$.",
    },
  ],
  quiz: [
    {
      id: "anti-commutativity-rule",
      prompt: "According to Trap 3, what happens if you reverse the order of vectors in a cross product from $\\vec{A} \\times \\vec{B}$ to $\\vec{B} \\times \\vec{A}$?",
      options: [
        "The resulting vector reverses direction (flips sign to $-(\\vec{A} \\times \\vec{B})$)",
        "The vector remains completely identical",
        "The magnitude doubles",
      ],
      answerIndex: 0,
      explanation:
        "The cross product is anti-commutative: curling fingers in reverse flips the thumb's direction: $\\vec{B} \\times \\vec{A} = -(\\vec{A} \\times \\vec{B})$.",
    },
    {
      id: "parallel-cross-check",
      prompt: "If the cross product of two non-zero vectors is the zero vector ($\\vec{A} \\times \\vec{B} = \\vec{0}$), what does this prove?",
      options: [
        "The vectors are parallel (or anti-parallel)",
        "The vectors are perpendicular",
        "At least one vector has infinite length",
      ],
      answerIndex: 0,
      explanation:
        "Since $\\sin(\\theta) = 0$ at $0^\\circ$ and $180^\\circ$, a zero cross product confirms parallelism.",
    },
    {
      id: "fake-unit-vector-trap",
      prompt: "According to Trap 4, why is the coordinate triplet $\\langle 1, 1, 1 \\rangle$ NOT a unit vector?",
      options: [
        "Its magnitude is $\\sqrt{1^2 + 1^2 + 1^2} = \\sqrt{3} \\approx 1.73$, which is strictly greater than 1",
        "Unit vectors cannot have positive coordinates",
        "A unit vector can only exist in two dimensions",
      ],
      answerIndex: 0,
      explanation:
        "A unit vector must have magnitude exactly 1. Individual components of a 3D unit vector cannot exceed 1, and for $\\langle 1, 1, 1 \\rangle$ the length is $\\sqrt{3} \\approx 1.732$.",
    },
  ],
};
