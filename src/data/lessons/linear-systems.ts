import type { LessonContent } from "../../types/lesson-engine";

export const linearSystemsLesson: LessonContent = {
  id: "linear-systems",
  curriculumLessonId: "linear-systems",
  version: 1,
  title: "Linear Systems & Matrix Transformations",
  description: "Systems of linear equations, Gaussian elimination, row-echelon form, and determinants.",
  estimatedMinutes: 18,
  difficulty: "Intermediate",
  xp: 130,
  prerequisites: ["discrete-logic"],
  learningObjectives: [
    "Formulate linear equation systems into the matrix form A x = b.",
    "Execute Gaussian elimination using elementary row operations to reach reduced row echelon form.",
    "Calculate determinants of 2x2 and 3x3 matrices to determine invertibility and uniqueness of solutions.",
  ],
  sections: [
    {
      id: "concept",
      title: "Matrix Representation of Systems",
      stage: "Understand",
      blocks: [
        {
          id: "sys-intro",
          type: "introduction",
          title: "Linear Equations as Geometric Hyperplanes",
          paragraphs: [
            "A system of $m$ linear equations in $n$ variables describes the intersection of geometric planes in $n$-dimensional space.",
            "By assembling coefficients into a matrix $A \\in \\mathbb{R}^{m \\times n}$ and variables into a vector $\\vec{x}$, the entire system condenses into the single compact algebraic equation $A\\vec{x} = \\vec{b}$.",
          ],
        },
        {
          id: "matrix-sys-formula",
          type: "formula",
          title: "The Matrix Equation",
          latex: "A \\vec{x} = \\vec{b} \\iff \\begin{bmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\end{bmatrix} = \\begin{bmatrix} b_1 \\\\ b_2 \\end{bmatrix}",
          explanation: "The solution vector x maps through the linear transformation A to reach the target vector b.",
        },
        {
          id: "det-formula",
          type: "formula",
          title: "Determinant and Invertibility",
          latex: "\\det(A) = a_{11}a_{22} - a_{12}a_{21}",
          explanation: "If det(A) is not zero, the matrix is non-singular and has a unique inverse A^(-1), guaranteeing a unique solution x = A^(-1) b.",
        },
      ],
    },
    {
      id: "gauss-sec",
      title: "Gaussian Elimination in Action",
      stage: "Visualize",
      blocks: [
        {
          id: "gauss-worked",
          type: "worked-example",
          title: "Solving a 2x2 System with Gaussian Elimination",
          problem: "Solve the system: $2x + y = 8$ and $x + 3y = 14$.",
          steps: [
            {
              title: "Construct the augmented matrix",
              text: "Coefficients and constants are placed in augmented format.",
              latex: "\\left[\\begin{array}{cc|c} 2 & 1 & 8 \\\\ 1 & 3 & 14 \\end{array}\\right]",
            },
            {
              title: "Swap rows to obtain pivot 1 in top-left",
              text: "Having leading entry 1 simplifies subsequent eliminations.",
              latex: "R_1 \\leftrightarrow R_2 \\implies \\left[\\begin{array}{cc|c} 1 & 3 & 14 \\\\ 2 & 1 & 8 \\end{array}\\right]",
            },
            {
              title: "Eliminate x from row 2 (R2 <- R2 - 2*R1)",
              text: "Now row 2 reads -5y = -20.",
              latex: "R_2 - 2R_1 = [2 - 2, 1 - 6, 8 - 28] = [0, -5, -20]",
            },
            {
              title: "Solve by back-substitution",
              text: "Calculate y and substitute back into row 1 to find x.",
              latex: "y = \\frac{-20}{-5} = 4, \\quad x = 14 - 3(4) = 2",
            },
          ],
          interpretation: "The system intersects at the single unique point $(x, y) = (2, 4)$.",
        },
      ],
    },
    {
      id: "practice-sec",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "sys-practice-block",
          type: "practice",
          problemIds: ["p-sys-1", "p-sys-2"],
        },
      ],
    },
    {
      id: "quiz-sec",
      title: "Mastery Assessment",
      stage: "Reflect",
      blocks: [
        {
          id: "sys-quiz-block",
          type: "quiz",
          questionIds: ["q-sys-1", "q-sys-2"],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "p-sys-1",
      prompt: "Compute the determinant of matrix $A = \\begin{bmatrix} 3 & 2 \\\\ 1 & 4 \\end{bmatrix}$.",
      answer: 10,
      tolerance: 0,
      hint: "Use formula: $\\det(A) = ad - bc = 3(4) - 2(1)$.",
      explanation: "$\\det(A) = 3 \\times 4 - 2 \\times 1 = 12 - 2 = 10$.",
    },
    {
      id: "p-sys-2",
      prompt: "For what value of $k$ does the matrix $\\begin{bmatrix} 2 & k \\\\ 4 & 6 \\end{bmatrix}$ have determinant equal to 0?",
      answer: 3,
      tolerance: 0,
      hint: "$\\det(A) = 2(6) - 4k = 12 - 4k$. Solve $12 - 4k = 0$.",
      explanation: "$12 - 4k = 0 \\implies 4k = 12 \\implies k = 3$.",
    },
  ],
  quiz: [
    {
      id: "q-sys-1",
      prompt: "What does it mean if an augmented matrix row becomes [0, 0, 0 | 5] during Gaussian elimination?",
      options: [
        "The system has infinitely many solutions",
        "The system is inconsistent and has no solution",
        "The unique solution is x = 5",
      ],
      answerIndex: 1,
      explanation: "A row [0, 0, 0 | 5] asserts 0 = 5, which is an impossible contradiction, meaning the system has no solution.",
    },
    {
      id: "q-sys-2",
      prompt: "If a square matrix A has det(A) = 7, which statement must be true?",
      options: [
        "The matrix A is invertible and A x = b has a unique solution for every b",
        "The rows of A are linearly dependent",
        "The matrix A has only integer entries",
      ],
      answerIndex: 0,
      explanation: "A non-zero determinant implies matrix invertibility, ensuring a unique solution x = A^(-1) b.",
    },
  ],
};
