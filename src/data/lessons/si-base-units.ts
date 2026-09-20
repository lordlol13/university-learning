import type { LessonContent } from "../../types/lesson-engine";

export const siBaseUnitsLesson: LessonContent = {
  id: "si-base-units",
  curriculumLessonId: "si-base-units",
  version: 1,
  title: "SI Base Units & Scientific Notation",
  description: "The 7 fundamental metric quantities, derived units, and exponent shift rules for scientific notation.",
  estimatedMinutes: 15,
  difficulty: "Foundational",
  xp: 100,
  prerequisites: [],
  learningObjectives: [
    "Distinguish the 7 fundamental SI base units from derived engineering units.",
    "Format measurements into standard scientific notation $M \\times 10^n$ where $1 \\le M < 10$.",
    "Apply exponent shift rules accurately for very large and very small quantities.",
  ],
  sections: [
    {
      id: "understand",
      title: "The Seven Pillars of Measurement",
      stage: "Understand",
      blocks: [
        {
          id: "si-intro",
          type: "introduction",
          title: "The Metric Foundation",
          paragraphs: [
            "All physical measurements in engineering rest upon seven fundamental base units: meter ($m$ for length), kilogram ($kg$ for mass), second ($s$ for time), ampere ($A$ for electric current), kelvin ($K$ for thermodynamic temperature), candela ($cd$ for luminous intensity), and mole ($mol$ for amount of substance).",
            "Any other unit—such as velocity ($m/s$), area ($m^2$), or force ($N = kg\\cdot m/s^2$)—is a derived unit produced by multiplying or dividing these base quantities.",
          ],
        },
        {
          id: "scientific-notation-intuition",
          type: "intuition",
          title: "Scientific Notation: Compressing Scale",
          paragraphs: [
            "Physical scales range from atomic radii ($10^{-10}$ m) to interstellar distances ($10^{16}$ m). Writing long strings of zeros is error-prone and unwieldy.",
            "Scientific notation formats every number as $M \\times 10^n$, where $M$ is a decimal mantissa strictly in the interval $1 \\le M < 10$, and $n$ is an integer exponent.",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "Scientific Notation Exponent Rules",
      stage: "Visualize",
      blocks: [
        {
          id: "sci-notation-formula",
          type: "formula",
          title: "The Standard Exponential Representation",
          latex: "x = M \\times 10^n \\quad \\text{where } 1 \\le M < 10, \\, n \\in \\mathbb{Z}",
          explanation:
            "Shifting the decimal point left increases the exponent (+n). Shifting the decimal point right decreases the exponent (-n).",
        },
        {
          id: "sci-notation-breakdown",
          type: "formula-breakdown",
          title: "Anatomy of Scientific Notation",
          parts: [
            {
              latex: "M",
              variable: {
                latex: "M",
                name: "Mantissa (Coefficient)",
                explanation: "Must satisfy $1 \\le M < 10$. Exactly one non-zero digit precedes the decimal point.",
              },
            },
            { latex: "\\times" },
            {
              latex: "10^n",
              variable: {
                latex: "10^n",
                name: "Order of Magnitude",
                explanation: "The integer power of 10 counting how many places the decimal was shifted.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "worked-notation",
      title: "Worked Example",
      stage: "Apply",
      blocks: [
        {
          id: "worked-exponent-shift",
          type: "worked-example",
          title: "Compressing Numbers into Scientific Notation",
          problem:
            "Convert the measurements $762$ and $0.0815$ into standard scientific notation.",
          steps: [
            {
              title: "Evaluate 762 (large number)",
              text: "To place the decimal after the first non-zero digit ($7$), move the decimal 2 places to the LEFT. Moving left yields a positive exponent $+2$.",
              latex: "762 \\longrightarrow 7.62 \\times 10^2",
            },
            {
              title: "Evaluate 0.0815 (small decimal)",
              text: "To place the decimal after the first non-zero digit ($8$), move the decimal 2 places to the RIGHT. Moving right yields a negative exponent $-2$.",
              latex: "0.0815 \\longrightarrow 8.15 \\times 10^{-2}",
            },
          ],
          interpretation:
            "Always verify: $7.62 \\times 100 = 762$ and $8.15 \\times 0.01 = 0.0815$. The mantissas ($7.62$ and $8.15$) both lie between 1 and 10.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "si-practice-block",
          type: "practice",
          problemIds: ["large-sci-exponent", "small-sci-exponent"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "si-quiz-block",
          type: "quiz",
          questionIds: ["base-vs-derived", "mega-prefix-power", "valid-mantissa"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "si-summary-block",
          type: "summary",
          title: "Measurement Non-Negotiables",
          takeaways: [
            "The 7 SI base quantities: meter (m), kilogram (kg), second (s), ampere (A), kelvin (K), candela (cd), mole (mol).",
            "Derived units are formed by algebraic combinations of base units (e.g. $1\\text{ N} = 1\\text{ kg}\\cdot\\text{m}/\\text{s}^2$).",
            "Move decimal left $\\to$ positive exponent ($+n$); move right $\\to$ negative exponent ($-n$).",
            "Critical prefixes: kilo ($10^3$), Mega ($10^6$), Giga ($10^9$), centi ($10^{-2}$), milli ($10^{-3}$), micro ($10^{-6}$), nano ($10^{-9}$).",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "large-sci-exponent",
      prompt:
        "When writing $45{,}000$ in standard scientific notation $4.5 \\times 10^n$, what is the integer exponent $n$?",
      answer: 4,
      tolerance: 0,
      hint: "Count how many places you move the decimal from the end of 45,000 to get 4.5.",
      explanation:
        "Moving the decimal point 4 places to the left gives $4.5 \\times 10^4$, so $n = 4$.",
    },
    {
      id: "small-sci-exponent",
      prompt:
        "When expressing $0.0032$ in standard scientific notation $3.2 \\times 10^n$, what is the integer exponent $n$?",
      answer: -3,
      tolerance: 0,
      hint: "Move the decimal 3 places to the right to reach 3.2. Remember that shifting right yields a negative exponent.",
      explanation:
        "Moving the decimal point 3 places to the right yields $3.2 \\times 10^{-3}$, so $n = -3$.",
    },
  ],
  quiz: [
    {
      id: "base-vs-derived",
      prompt: "Which of the following is an SI base unit rather than a derived unit?",
      options: [
        "Kilogram (kg)",
        "Newton (N)",
        "Pascal (Pa)",
      ],
      answerIndex: 0,
      explanation:
        "The kilogram is one of the 7 fundamental SI base units. Newtons ($kg\\cdot m/s^2$) and Pascals ($N/m^2$) are derived units.",
    },
    {
      id: "mega-prefix-power",
      prompt: "What power of 10 does the SI prefix Mega (M) correspond to?",
      options: [
        "$10^6$ (one million)",
        "$10^3$ (one thousand)",
        "$10^9$ (one billion)",
      ],
      answerIndex: 0,
      explanation:
        "Mega corresponds to $10^6$. Kilo is $10^3$, and Giga is $10^9$.",
    },
    {
      id: "valid-mantissa",
      prompt: "Which of the following correctly formats $58.4 \\times 10^3$ into proper scientific notation?",
      options: [
        "$5.84 \\times 10^4$",
        "$0.584 \\times 10^5$",
        "$584 \\times 10^2$",
      ],
      answerIndex: 0,
      explanation:
        "Standard scientific notation requires the mantissa $M$ to satisfy $1 \\le M < 10$. Moving the decimal one place left from $58.4$ yields $5.84$ and increases the exponent by 1 to $10^4$.",
    },
  ],
};
