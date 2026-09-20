import type { LessonContent } from "../../types/lesson-engine";

export const dimensionalScalingLesson: LessonContent = {
  id: "dimensional-scaling",
  curriculumLessonId: "dimensional-scaling",
  version: 1,
  title: "Unit Cancellation & Dimensional Scaling",
  description: "The factor-label method, conversion bridges, and the dimensional scaling trap for area and volume.",
  estimatedMinutes: 16,
  difficulty: "Foundational",
  xp: 110,
  prerequisites: ["si-base-units"],
  learningObjectives: [
    "Execute multi-step unit conversions using the factor-label cancellation method.",
    "Square or cube conversion factors when transitioning between area and volume dimensions.",
    "Avoid Trap 1 (The Dimensional Scaling Trap) in engineering calculations.",
  ],
  sections: [
    {
      id: "understand",
      title: "The Factor-Label Method",
      stage: "Understand",
      blocks: [
        {
          id: "cancellation-intro",
          type: "introduction",
          title: "Algebraic Unit Cancellation",
          paragraphs: [
            "In engineering, units are algebraic quantities: they multiply, divide, and cancel just like variables. The Factor-Label Method (unit cancellation) multiplies an initial measurement by conversion ratios equivalent to 1.",
            "To eliminate an old unit, place that unit in the denominator of the conversion factor so it cancels cleanly with the numerator of the current quantity.",
          ],
        },
        {
          id: "scaling-intuition",
          type: "intuition",
          title: "The Dimensional Scaling Trap",
          paragraphs: [
            "A standard linear conversion does NOT directly apply to areas or volumes. A square meter is not $100\\text{ cm}^2$; it is a square measuring $100\\text{ cm}$ on each of its two sides.",
            "Therefore, $1\\text{ m}^2 = 100\\text{ cm} \\times 100\\text{ cm} = 10{,}000\\text{ cm}^2$. Failing to square the conversion ratio is Trap 1: The Dimensional Scaling Trap.",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "The Dimensional Scaling Rules",
      stage: "Visualize",
      blocks: [
        {
          id: "scaling-formula",
          type: "formula",
          title: "Area and Volume Scaling",
          latex: "\\left(\\frac{1\\text{ m}}{100\\text{ cm}}\\right)^2 = \\frac{1\\text{ m}^2}{10{,}000\\text{ cm}^2}, \\quad \\left(\\frac{1\\text{ m}}{100\\text{ cm}}\\right)^3 = \\frac{1\\text{ m}^3}{10^6\\text{ cm}^3}",
          explanation:
            "Converting units of dimension $d$ requires raising the entire 1D conversion factor to the power $d$.",
        },
        {
          id: "factor-label-formula",
          type: "formula",
          title: "The Unit Cancellation Equation",
          latex: "\\text{[Current Unit]} \\times \\left(\\frac{\\text{[Desired Unit]}}{\\text{[Current Unit]}}\\right) = \\text{[Desired Unit]}",
          explanation:
            "The old unit in the numerator and denominator cancel algebraically, leaving only the desired unit.",
        },
      ],
    },
    {
      id: "worked-scaling",
      title: "Worked Example",
      stage: "Apply",
      blocks: [
        {
          id: "worked-area-conversion",
          type: "worked-example",
          title: "Converting Surface Area: $258\\text{ cm}^2$ to $\\text{m}^2$",
          problem:
            "Convert an engine cylinder cross-sectional area of $258\\text{ cm}^2$ into square meters ($\\text{m}^2$).",
          steps: [
            {
              title: "Identify the 1D conversion ratio",
              text: "The linear bridge between meters and centimeters is $1\\text{ m} = 100\\text{ cm}$.",
              latex: "1\\text{ m} = 100\\text{ cm}",
            },
            {
              title: "Square the entire conversion factor",
              text: "Because area has dimension 2, square both numerator and denominator: $(1\\text{ m})^2 / (100\\text{ cm})^2 = 1\\text{ m}^2 / 10{,}000\\text{ cm}^2$.",
              latex: "\\left(\\frac{1\\text{ m}}{100\\text{ cm}}\\right)^2 = \\frac{1\\text{ m}^2}{10{,}000\\text{ cm}^2}",
            },
            {
              title: "Perform cancellation and division",
              text: "Multiply $258\\text{ cm}^2$ by the squared ratio. Divide $258$ by $10{,}000$.",
              latex: "258\\text{ cm}^2 \\times \\frac{1\\text{ m}^2}{10{,}000\\text{ cm}^2} = 0.0258\\text{ m}^2",
            },
          ],
          interpretation:
            "Notice the common trap: dividing by 100 yields $2.58\\text{ m}^2$, which is off by a factor of 100! The correct answer is $0.0258\\text{ m}^2$.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "scaling-practice-block",
          type: "practice",
          problemIds: ["convert-cm2-to-m2", "convert-m3-to-cm3"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "scaling-quiz-block",
          type: "quiz",
          questionIds: ["area-scale-factor", "inch-cm-bridge", "volume-cube-factor"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "scaling-summary-block",
          type: "summary",
          title: "Dimensional Scaling Principles",
          takeaways: [
            "Always multiply by a fraction with the old unit in the denominator to ensure cancellation.",
            "Area conversions require squaring the linear factor: $(1\\text{ m}/100\\text{ cm})^2 = 1\\text{ m}^2 / 10{,}000\\text{ cm}^2$.",
            "Volume conversions require cubing the linear factor: $(1\\text{ m}/100\\text{ cm})^3 = 1\\text{ m}^3 / 10^6\\text{ cm}^3$.",
            "Key non-negotiable conversion bridges: $1\\text{ in} = 2.54\\text{ cm}$, $1\\text{ mi} = 1.61\\text{ km} = 5280\\text{ ft}$.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "convert-cm2-to-m2",
      prompt:
        "Convert an area of $5{,}000\\text{ cm}^2$ into square meters ($\\text{m}^2$).",
      answer: 0.5,
      tolerance: 0.001,
      hint: "Remember to divide by $10{,}000\\text{ cm}^2/\\text{m}^2$ (not by 100).",
      explanation:
        "$5{,}000\\text{ cm}^2 / 10{,}000 = 0.5\\text{ m}^2$.",
    },
    {
      id: "convert-m3-to-cm3",
      prompt:
        "How many cubic centimeters ($\\text{cm}^3$) are in $2\\text{ m}^3$?",
      answer: 2000000,
      tolerance: 0,
      hint: "Cube the linear factor: $(100\\text{ cm})^3 = 1{,}000{,}000\\text{ cm}^3$ per $1\\text{ m}^3$.",
      explanation:
        "$2\\text{ m}^3 \\times 1{,}000{,}000\\text{ cm}^3/\\text{m}^3 = 2{,}000{,}000\\text{ cm}^3$.",
    },
  ],
  quiz: [
    {
      id: "area-scale-factor",
      prompt: "When converting an area from square inches to square centimeters, by what factor must you multiply the linear bridge $2.54\\text{ cm/in}$?",
      options: [
        "Square the factor: $(2.54)^2 \\approx 6.4516\\text{ cm}^2/\\text{in}^2$",
        "Use $2.54$ directly without change",
        "Cube the factor: $(2.54)^3 \\approx 16.39\\text{ cm}^3/\\text{in}^3$",
      ],
      answerIndex: 0,
      explanation:
        "Converting 2D area requires squaring the entire 1D conversion factor: $(2.54\\text{ cm}/\\text{in})^2 = 6.4516\\text{ cm}^2/\\text{in}^2$.",
    },
    {
      id: "inch-cm-bridge",
      prompt: "What is the exact non-negotiable definition of 1 inch in centimeters?",
      options: [
        "$2.54\\text{ cm}$",
        "$2.50\\text{ cm}$",
        "$3.14\\text{ cm}$",
      ],
      answerIndex: 0,
      explanation:
        "By international agreement, 1 inch is defined as exactly $2.54\\text{ cm}$.",
    },
    {
      id: "volume-cube-factor",
      prompt: "If a rectangular box's dimensions are doubled in length, width, and height, by what factor does its volume increase?",
      options: [
        "$8\\times$ ($2^3$)",
        "$4\\times$ ($2^2$)",
        "$2\\times$",
      ],
      answerIndex: 0,
      explanation:
        "Volume scales as $x^3$: doubling all three linear dimensions increases volume by $2^3 = 8$.",
    },
  ],
};
