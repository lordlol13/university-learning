import type { LessonContent } from "../../types/lesson-engine";

export const waterEquivalencyLesson: LessonContent = {
  id: "water-equivalency",
  curriculumLessonId: "water-equivalency",
  version: 1,
  title: "Mass, Weight & The Water Equivalency Bridge",
  description: "The micro and macro water bridges, volume-mass conversions, and distinguishing invariant mass from gravitational weight.",
  estimatedMinutes: 16,
  difficulty: "Foundational",
  xp: 120,
  prerequisites: ["dimensional-scaling"],
  learningObjectives: [
    "Connect metric volume, liquid capacity, and mass using the Water Equivalency Bridge.",
    "Distinguish invariant intrinsic mass ($kg$) from gravitational weight force ($N$ or $lb$).",
    "Avoid Trap 2 (Mass/Force confusion) and Trap 3 (Metric Volume Missing Link: $1\\text{ m}^3 = 1{,}000\\text{ L}$).",
  ],
  sections: [
    {
      id: "understand",
      title: "The Metric System's Elegant Cohesion",
      stage: "Understand",
      blocks: [
        {
          id: "water-bridge-intro",
          type: "introduction",
          title: "The Water Equivalency Bridge",
          paragraphs: [
            "One of the greatest achievements of the metric system is the direct physical linkage between length, volume, and mass, calibrated using pure water at maximum density ($4^\\circ\\text{C}$).",
            "This linkage operates across two distinct scales: the Micro Bridge for laboratory chemistry, and the Macro Bridge for civil, mechanical, and aerospace engineering.",
          ],
        },
        {
          id: "mass-weight-intuition",
          type: "intuition",
          title: "Mass vs. Weight: Invariant vs. Variable",
          paragraphs: [
            "Mass ($m$) is an invariant, intrinsic quantity of matter contained within an object. An astronaut with a mass of $75\\text{ kg}$ on Earth still has a mass of $75\\text{ kg}$ on the Moon or in deep space.",
            "Weight ($W = mg$) is the gravitational force pulling on that mass. On Earth, weight is measured in Newtons ($N$) or pounds ($lb$). In engineering mechanics, $1\\text{ lb} = 4.45\\text{ N}$ of force.",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "The Water Equivalency Formulations",
      stage: "Visualize",
      blocks: [
        {
          id: "micro-macro-formula",
          type: "formula",
          title: "Micro and Macro Equivalencies",
          latex: "\\begin{aligned}\\text{Micro: } & 1\\text{ cm}^3 \\equiv 1\\text{ mL} \\approx 1\\text{ g (water)}\\\\\\text{Macro: } & 1\\text{ dm}^3 \\equiv 1\\text{ L} \\equiv 1\\text{ kg (water)}\\\\\\text{Cubic Meter: } & 1\\text{ m}^3 = 1{,}000\\text{ dm}^3 = 1{,}000\\text{ L} = 1{,}000\\text{ kg}\\end{aligned}",
          explanation:
            "Because $1\\text{ dm} = 10\\text{ cm}$, a cubic decimeter is $10 \\times 10 \\times 10 = 1{,}000\\text{ cm}^3 = 1{,}000\\text{ mL} = 1\\text{ L}$.",
        },
        {
          id: "weight-force-formula",
          type: "formula",
          title: "Gravitational Force and Unit Bridge",
          latex: "W = mg, \\quad 1\\text{ lb} = 4.45\\text{ N} = 4.45\\text{ kg}\\cdot\\text{m}/\\text{s}^2",
          explanation:
            "Weight is a force ($F = ma$). Converting pounds to metric requires using $4.45\\text{ N/lb}$, not converting directly to kilograms.",
        },
      ],
    },
    {
      id: "worked-water-bridge",
      title: "Worked Example",
      stage: "Apply",
      blocks: [
        {
          id: "worked-tank-capacity",
          type: "worked-example",
          title: "Calculating Water Mass in a Metric Reservoir",
          problem:
            "A water reservoir has dimensions $2\\text{ m}$ long, $1.5\\text{ m}$ wide, and $0.8\\text{ m}$ deep. Calculate its capacity in Liters and the total water mass in kilograms.",
          steps: [
            {
              title: "Compute cubic volume",
              text: "Multiply length, width, and height: $V = l \\times w \\times h$.",
              latex: "V = 2.0\\text{ m} \\times 1.5\\text{ m} \\times 0.8\\text{ m} = 2.4\\text{ m}^3",
            },
            {
              title: "Apply the Metric Volume Link",
              text: "Recall Trap 3: $1\\text{ m}^3$ is NOT 1 Liter; $1\\text{ m}^3 = 1{,}000\\text{ L}$. Multiply $2.4$ by $1{,}000$.",
              latex: "\\text{Capacity} = 2.4\\text{ m}^3 \\times \\frac{1{,}000\\text{ L}}{1\\text{ m}^3} = 2{,}400\\text{ L}",
            },
            {
              title: "Use the Macro Water Bridge to find mass",
              text: "Since $1\\text{ L} = 1\\text{ kg}$ for pure water, $2{,}400\\text{ L}$ corresponds directly to $2{,}400\\text{ kg}$.",
              latex: "\\text{Mass} = 2{,}400\\text{ L} \\times \\frac{1\\text{ kg}}{1\\text{ L}} = 2{,}400\\text{ kg} \\, (2.4\\text{ metric tons})",
            },
          ],
          interpretation:
            "The volume in $\\text{m}^3$ easily scales to Liters and kilograms without requiring complex density unit conversions.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "water-practice-block",
          type: "practice",
          problemIds: ["liters-in-m3", "water-dm3-to-mass"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "water-quiz-block",
          type: "quiz",
          questionIds: ["micro-bridge-equiv", "mass-vs-weight-property", "pound-force-newtons"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "water-summary-block",
          type: "summary",
          title: "Water & Mechanics Non-Negotiables",
          takeaways: [
            "Micro Bridge: $1\\text{ cm}^3 \\equiv 1\\text{ mL} \\approx 1\\text{ g}$ of water.",
            "Macro Bridge: $1\\text{ dm}^3 \\equiv 1\\text{ L} \\equiv 1\\text{ kg}$ of water.",
            "Metric Volume Missing Link: $1\\text{ m}^3 = 1{,}000\\text{ dm}^3 = 1{,}000\\text{ L} = 1{,}000\\text{ kg}$.",
            "Mass is invariant ($kg$), while Weight is gravitational force ($N$). $1\\text{ lb} = 4.45\\text{ N}$.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "liters-in-m3",
      prompt:
        "How many Liters of fluid are contained within a volume of $3.5\\text{ m}^3$?",
      answer: 3500,
      tolerance: 0,
      hint: "Remember the Metric Volume Link: $1\\text{ m}^3 = 1{,}000\\text{ L}$. Multiply $3.5 \\times 1{,}000$.",
      explanation:
        "$3.5\\text{ m}^3 \\times 1{,}000\\text{ L}/\\text{m}^3 = 3{,}500\\text{ L}$.",
    },
    {
      id: "water-dm3-to-mass",
      prompt:
        "A tank contains $2.5\\text{ dm}^3$ of pure water. Using the Macro Water Bridge, what is the mass in kilograms?",
      answer: 2.5,
      tolerance: 0,
      hint: "Recall that $1\\text{ dm}^3 = 1\\text{ L} = 1\\text{ kg}$ of water.",
      explanation:
        "Because $1\\text{ dm}^3 \\equiv 1\\text{ kg}$ for water, $2.5\\text{ dm}^3$ corresponds to exactly $2.5\\text{ kg}$.",
    },
  ],
  quiz: [
    {
      id: "micro-bridge-equiv",
      prompt: "Which exact relationship defines the Micro Water Bridge?",
      options: [
        "$1\\text{ cm}^3 \\equiv 1\\text{ mL} \\approx 1\\text{ g}$",
        "$1\\text{ cm}^3 \\equiv 1\\text{ L} \\approx 1\\text{ kg}$",
        "$1\\text{ mm}^3 \\equiv 1\\text{ mL} \\approx 1\\text{ kg}$",
      ],
      answerIndex: 0,
      explanation:
        "The micro equivalency links 1 cubic centimeter to 1 milliliter and approximately 1 gram of water.",
    },
    {
      id: "mass-vs-weight-property",
      prompt: "Why does the weight of an object change when taken to Mars, while its mass remains constant?",
      options: [
        "Mass is an invariant intrinsic property, while weight depends on local gravitational acceleration ($W = mg$)",
        "Because cold Martian temperatures shrink volume",
        "Because pounds cannot be measured outside Earth's atmosphere",
      ],
      answerIndex: 0,
      explanation:
        "Mass measures quantity of matter and is invariant; weight is the force exerted by gravity ($W = mg$). Since Martian gravity is lower ($~3.7\\text{ m/s}^2$), weight decreases.",
    },
    {
      id: "pound-force-newtons",
      prompt: "In engineering mechanics, what is the force equivalent of $1\\text{ lb}$ in Newtons?",
      options: [
        "$4.45\\text{ N}$",
        "$9.81\\text{ N}$",
        "$1.61\\text{ N}$",
      ],
      answerIndex: 0,
      explanation:
        "As stated in the Tactical Blueprint: $1\\text{ lb} = 4.45\\text{ N}$. ($9.81\\text{ m/s}^2$ is gravitational acceleration $g$).",
    },
  ],
};
