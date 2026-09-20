import type { LessonContent } from "../../types/lesson-engine";

export const physicsTacticalExam: LessonContent = {
  id: "physics-tactical-exam",
  curriculumLessonId: "physics-tactical-exam",
  version: 1,
  title: "Tactical Blueprint Diagnostic Exam",
  description: "8-part comprehensive diagnostic assessment synthesizing metric conversions, dimensional scaling, and 3D vector operations.",
  estimatedMinutes: 25,
  difficulty: "Advanced",
  xp: 180,
  prerequisites: ["vector-cross-product"],
  learningObjectives: [
    "Synthesize multi-step metric unit conversions and 3D vector calculations in engineering scenarios.",
    "Identify and eliminate all five Tactical Traps (Wrong Angles, Quadrant Blindness, Product Order, Fake Unit Vectors, and Mixing Outputs).",
    "Demonstrate rigorous problem-solving fluency across the entire Vector and Metric syllabus.",
  ],
  sections: [
    {
      id: "understand",
      title: "The 8-Part Diagnostic Progression",
      stage: "Understand",
      blocks: [
        {
          id: "exam-intro",
          type: "introduction",
          title: "Comprehensive Mechanics & Measurement Review",
          paragraphs: [
            "Welcome to the Tactical Blueprint Diagnostic Exam. This capstone assessment evaluates your mastery of engineering foundations across two critical pillars: metric scaling and vector mathematics.",
            "You will encounter problems that require converting units, decomposing forces, checking orthogonality, and calculating vector torque in three dimensions.",
          ],
        },
        {
          id: "exam-mindset",
          type: "intuition",
          title: "The Zero-Defect Engineering Standard",
          paragraphs: [
            "In engineering design, subtle conversion errors have resulted in lost spacecraft and structural collapses. A missing exponent or forgotten quadrant correction can invalidate an entire mechanical analysis.",
            "Review the five common traps before proceeding: verify whether angles are relative to $x$ or $y$, check quadrant signs before trusting arctangent outputs, and remember that dot products yield scalars while cross products yield vectors.",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "Master Formula Matrix",
      stage: "Visualize",
      blocks: [
        {
          id: "master-matrix-formula",
          type: "formula",
          title: "Tactical Equations Summary",
          latex: "\\begin{aligned}\\text{Unit Scaling: } & \\left(\\frac{1\\text{ m}}{100\\text{ cm}}\\right)^2 = \\frac{1\\text{ m}^2}{10^4\\text{ cm}^2}, \\quad 1\\text{ lb} = 4.45\\text{ N}\\\\\\text{Water Bridge: } & 1\\text{ dm}^3 \\equiv 1\\text{ L} \\equiv 1\\text{ kg}, \\quad 1\\text{ m}^3 = 1{,}000\\text{ L}\\\\\\text{Vector Sum: } & R_x = \\sum A_x, \\quad R_y = \\sum A_y, \\quad R = \\sqrt{R_x^2 + R_y^2}\\\\\\text{Dot Product: } & \\vec{A} \\cdot \\vec{B} = AB\\cos(\\phi), \\quad \\vec{A} \\perp \\vec{B} \\iff \\vec{A} \\cdot \\vec{B} = 0\\\\\\text{Cross Product: } & |\\vec{A} \\times \\vec{B}| = AB\\sin(\\theta), \\quad \\vec{A} \\times \\vec{B} = -(\\vec{B} \\times \\vec{A})\\end{aligned}",
          explanation:
            "Every formula in this matrix represents a core tool required for engineering mechanics and physical problem solving.",
        },
      ],
    },
    {
      id: "worked-synthesis",
      title: "Synthesis Problem",
      stage: "Apply",
      blocks: [
        {
          id: "worked-synthesis-problem",
          type: "worked-example",
          title: "Multi-Step Physics Synthesis: Force & Work",
          problem:
            "A cable pulls an industrial sled with a tension of $50\\text{ lb}$ at an angle of $0^\\circ$ horizontally. The sled is displaced by $4\\text{ meters}$. Convert the force into metric Newtons and compute the work done ($W = \\vec{F} \\cdot \\vec{d}$).",
          steps: [
            {
              title: "Convert force from pounds to Newtons",
              text: "Recall the non-negotiable conversion factor $1\\text{ lb} = 4.45\\text{ N}$. Multiply $50\\text{ lb}$ by $4.45\\text{ N/lb}$.",
              latex: "F = 50\\text{ lb} \\times 4.45\\text{ N/lb} = 222.5\\text{ N}",
            },
            {
              title: "Determine the angle and displacement",
              text: "The force acts along the direction of motion, so the angle is $\\phi = 0^\\circ$, and $d = 4.0\\text{ m}$.",
              latex: "\\vec{F} = [222.5\\text{ N}, 0], \\quad \\vec{d} = [4.0\\text{ m}, 0]",
            },
            {
              title: "Calculate work using the scalar dot product",
              text: "Compute $W = \\vec{F} \\cdot \\vec{d} = F d \\cos(0^\\circ) = (222.5\\text{ N})(4.0\\text{ m})(1) = 890\\text{ Joules}$.",
              latex: "W = 222.5 \\times 4.0 = 890\\text{ J}",
            },
          ],
          interpretation:
            "The synthesis requires chaining unit conversion with vector projection. The work done is $890\\text{ J}$ ($890\\text{ N}\\cdot\\text{m}$).",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Diagnostic Challenges",
      stage: "Practice",
      blocks: [
        {
          id: "exam-practice-block",
          type: "practice",
          problemIds: ["exam-force-conversion", "exam-area-scaling", "exam-orthogonal-forces"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Comprehensive Diagnostic Check",
      stage: "Assess",
      blocks: [
        {
          id: "exam-quiz-block",
          type: "quiz",
          questionIds: [
            "exam-check-orthogonal",
            "exam-check-cross-parallel",
            "exam-check-macro-water",
            "exam-check-fake-unit",
          ],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Certification Summary",
      stage: "Reflect",
      blocks: [
        {
          id: "exam-summary-block",
          type: "summary",
          title: "Tactical Blueprint Mastery Achieved",
          takeaways: [
            "You have mastered metric base quantities, scientific notation, and dimensional scaling.",
            "You can navigate the Water Equivalency Bridge seamlessly between volume and mass.",
            "You possess command of 2D and 3D vector operations: components, dot products, and cross products.",
            "You are equipped to detect and avoid standard traps in engineering mechanics.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "exam-force-conversion",
      prompt:
        "A rocket thruster exerts a force of $20\\text{ lb}$. Using the conversion $1\\text{ lb} = 4.45\\text{ N}$, what is this force in Newtons?",
      answer: 89,
      tolerance: 0.1,
      hint: "Multiply $20 \\times 4.45$.",
      explanation:
        "$20\\text{ lb} \\times 4.45\\text{ N/lb} = 89.0\\text{ N}$.",
    },
    {
      id: "exam-area-scaling",
      prompt:
        "An aircraft solar panel has a surface area of $40{,}000\\text{ cm}^2$. What is its area in square meters ($\\text{m}^2$)?",
      answer: 4,
      tolerance: 0.01,
      hint: "Remember the area scaling rule: divide by $10{,}000\\text{ cm}^2/\\text{m}^2$.",
      explanation:
        "$40{,}000\\text{ cm}^2 / 10{,}000 = 4.0\\text{ m}^2$.",
    },
    {
      id: "exam-orthogonal-forces",
      prompt:
        "Two perpendicular forces act on a joint: $F_x = 30\\text{ N}$ and $F_y = 40\\text{ N}$. What is the magnitude of the resultant force in Newtons?",
      answer: 50,
      tolerance: 0.1,
      hint: "Calculate $F = \\sqrt{30^2 + 40^2} = \\sqrt{900 + 1600}$.",
      explanation:
        "$\\sqrt{900 + 1600} = \\sqrt{2500} = 50\\text{ N}$.",
    },
  ],
  quiz: [
    {
      id: "exam-check-orthogonal",
      prompt: "Which mathematical condition definitively proves that two non-zero vectors $\\vec{A}$ and $\\vec{B}$ are orthogonal (perpendicular)?",
      options: [
        "$\\vec{A} \\cdot \\vec{B} = 0$",
        "$\\vec{A} \\times \\vec{B} = \\vec{0}$",
        "$\\vec{A} + \\vec{B} = \\vec{0}$",
      ],
      answerIndex: 0,
      explanation:
        "Because $\\vec{A} \\cdot \\vec{B} = AB\\cos(\\phi)$ and $\\cos(90^\\circ) = 0$, a zero dot product is the definitive orthogonality criterion.",
    },
    {
      id: "exam-check-cross-parallel",
      prompt: "Which mathematical condition definitively proves that two non-zero vectors $\\vec{A}$ and $\\vec{B}$ are parallel?",
      options: [
        "$\\vec{A} \\times \\vec{B} = \\vec{0}$",
        "$\\vec{A} \\cdot \\vec{B} = 0$",
        "$\\vec{A} \\cdot \\vec{B} = 1$",
      ],
      answerIndex: 0,
      explanation:
        "Because $|\\vec{A} \\times \\vec{B}| = AB\\sin(\\theta)$ and $\\sin(0^\\circ) = 0$, a zero cross product confirms parallelism.",
    },
    {
      id: "exam-check-macro-water",
      prompt: "Under the Macro Water Equivalency Bridge, what volume of water has a mass of exactly $1{,}000\\text{ kg}$ (one metric ton)?",
      options: [
        "$1\\text{ m}^3$ ($1{,}000\\text{ L}$)",
        "$1\\text{ dm}^3$ ($1\\text{ L}$)",
        "$100\\text{ cm}^3$",
      ],
      answerIndex: 0,
      explanation:
        "Since $1\\text{ L} = 1\\text{ kg}$, $1{,}000\\text{ kg}$ requires $1{,}000\\text{ L} = 1\\text{ m}^3$.",
    },
    {
      id: "exam-check-fake-unit",
      prompt: "A student proposes $\\vec{u} = \\langle 0.6, 0.8, 0 \\rangle$ as a unit vector. Is this claim mathematically valid?",
      options: [
        "Yes, because $\\sqrt{0.6^2 + 0.8^2 + 0^2} = \\sqrt{0.36 + 0.64} = 1.0$",
        "No, because unit vectors cannot contain zeros",
        "No, because components must be integers",
      ],
      answerIndex: 0,
      explanation:
        "The magnitude is $\\sqrt{0.36 + 0.64} = \\sqrt{1.0} = 1.0$, satisfying the strict unit vector definition.",
    },
  ],
};
