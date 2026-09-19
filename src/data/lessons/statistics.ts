import type { LessonContent } from "../../types/lesson-engine";

export const statisticsLesson: LessonContent = {
  id: "statistics",
  curriculumLessonId: "statistics",
  version: 1,
  title: "Statistics: Central Tendency & Variance",
  description: "Descriptive statistics, distribution shapes, and how noise and outliers affect data analysis.",
  estimatedMinutes: 18,
  difficulty: "Foundational",
  xp: 100,
  prerequisites: ["linear-algebra"],
  learningObjectives: [
    "Contrast mean and median when analyzing skewed data distributions.",
    "Calculate sample variance and standard deviation to quantify data spread.",
    "Evaluate the impact of extreme outliers on statistical summaries.",
  ],
  sections: [
    {
      id: "understand",
      title: "Describing Data Distributions",
      stage: "Understand",
      blocks: [
        {
          id: "stats-intro",
          type: "introduction",
          title: "The Signal Within the Noise",
          paragraphs: [
            "Data in the real world is rarely uniform. When training models, summarizing thousands of measurements into informative indicators is essential for understanding data distributions.",
            "Measures of central tendency capture the center of a distribution, while measures of dispersion capture how tightly or widely values spread around that center.",
          ],
        },
        {
          id: "stats-intuition",
          type: "intuition",
          title: "Mean vs. Median Under Outliers",
          paragraphs: [
            "The mean is the arithmetic balance point: every single value pulls on it. If nine people earn \\$50,000 and a billionaire enters the room, the mean skyrockets, but the typical income remains unchanged.",
            "The median sorts all measurements and selects the middle value. Because the median relies on rank rather than magnitude, it remains robust against extreme outliers.",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "Quantifying Center and Spread",
      stage: "Visualize",
      blocks: [
        {
          id: "mean-formula",
          type: "formula",
          title: "The Arithmetic Mean",
          latex: "\\mu = \\frac{1}{N} \\sum_{i=1}^N x_i = \\frac{x_1 + x_2 + \\dots + x_N}{N}",
          explanation:
            "The sum of all observed values divided by the sample count $N$.",
        },
        {
          id: "variance-formula",
          type: "formula",
          title: "Population Variance",
          latex: "\\sigma^2 = \\frac{1}{N} \\sum_{i=1}^N (x_i - \\mu)^2",
          explanation:
            "The average of the squared distances from the mean. Standard deviation is $\\sigma = \\sqrt{\\sigma^2}$, restoring the original units of measurement.",
        },
        {
          id: "variance-breakdown",
          type: "formula-breakdown",
          title: "Dissecting the Variance Equation",
          parts: [
            {
              latex: "\\sigma^2",
              variable: {
                latex: "\\sigma^2",
                name: "Variance",
                explanation: "The expected squared deviation from the center.",
              },
            },
            { latex: "=" },
            {
              latex: "\\frac{1}{N}",
              variable: {
                latex: "\\frac{1}{N}",
                name: "Average Factor",
                explanation: "Averages across all N data points.",
              },
            },
            {
              latex: "\\sum_{i=1}^N",
              variable: {
                latex: "\\sum_{i=1}^N",
                name: "Summation",
                explanation: "Iterates through each individual measurement.",
              },
            },
            {
              latex: "(x_i - \\mu)^2",
              variable: {
                latex: "(x_i - \\mu)^2",
                name: "Squared Deviation",
                explanation:
                  "Squaring prevents positive and negative differences from canceling and penalizes large errors.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "code-statistics",
      title: "Descriptive Statistics with NumPy",
      stage: "Code",
      blocks: [
        {
          id: "numpy-stats-code",
          type: "code",
          title: "Computing Summary Statistics",
          examples: [
            {
              language: "numpy",
              label: "NumPy Statistics",
              code: `import numpy as np

# Sample sensor readings
readings = np.array([18.2, 20.1, 19.5, 21.0, 39.8])  # Note outlier 39.8

# Central tendency
mean_val = np.mean(readings)      # 23.72 (pulled by outlier)
median_val = np.median(readings)  # 20.10 (resilient to outlier)

# Dispersion
variance = np.var(readings)       # 65.41
std_dev = np.std(readings)        # 8.09

print(f"Mean: {mean_val:.2f}, Median: {median_val:.2f}")
print(f"Standard Deviation: {std_dev:.2f}")`,
              highlightLines: [4, 7, 8, 11, 12],
            },
            {
              language: "python",
              label: "Standard Python",
              code: `import statistics

data = [18.2, 20.1, 19.5, 21.0, 39.8]

print("Mean:", statistics.mean(data))
print("Median:", statistics.median(data))
print("Standard Deviation:", statistics.stdev(data))`,
              highlightLines: [5, 6, 7],
            },
          ],
        },
      ],
    },
    {
      id: "worked-variance",
      title: "Worked Calculation",
      stage: "Apply",
      blocks: [
        {
          id: "worked-variance-calc",
          type: "worked-example",
          title: "Calculating Mean and Variance by Hand",
          problem:
            "Compute the arithmetic mean $\\mu$ and population variance $\\sigma^2$ for the dataset $[2, 4, 4, 6]$.",
          steps: [
            {
              title: "Calculate the arithmetic mean",
              text: "Sum the four values and divide by $N = 4$.",
              latex: "\\mu = \\frac{2 + 4 + 4 + 6}{4} = \\frac{16}{4} = 4.0",
            },
            {
              title: "Calculate squared deviations from the mean",
              text: "Subtract $\\mu = 4$ from each data point and square the result.",
              latex: "(2-4)^2 = 4,\\quad (4-4)^2 = 0,\\quad (4-4)^2 = 0,\\quad (6-4)^2 = 4",
            },
            {
              title: "Average the squared deviations",
              text: "Add the squared deviations and divide by $N = 4$.",
              latex: "\\sigma^2 = \\frac{4 + 0 + 0 + 4}{4} = \\frac{8}{4} = 2.0",
            },
          ],
          interpretation:
            "The mean is $4.0$, with a variance of $2.0$. The standard deviation is $\\sigma = \\sqrt{2} \\approx 1.414$.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "stats-practice-block",
          type: "practice",
          problemIds: ["calc-mean", "calc-variance"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "stats-quiz-block",
          type: "quiz",
          questionIds: ["robust-center", "variance-scaling", "why-square-deviations"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "stats-summary-block",
          type: "summary",
          title: "Essential Statistical Concepts",
          takeaways: [
            "The mean incorporates every value, making it sensitive to extreme values.",
            "The median separates the top 50% from the bottom 50% of the sample.",
            "Variance measures average squared distance from the mean; standard deviation restores original data units.",
            "Data normalization (z-score) standardizes features: $z = (x - \\mu) / \\sigma$.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "calc-mean",
      prompt:
        "What is the arithmetic mean of the dataset $[10, 20, 30, 40, 50]$?",
      answer: 30,
      tolerance: 0,
      hint: "Sum the 5 values and divide by 5: $(10 + 20 + 30 + 40 + 50) / 5$.",
      explanation:
        "The sum is $150$. Dividing by $5$ gives a mean of $30$.",
    },
    {
      id: "calc-variance",
      prompt:
        "For values $[2, 4, 6, 8]$, the mean is $5$. What is the population variance $\\sigma^2$?",
      answer: 5,
      tolerance: 0,
      hint: "Calculate squared differences: $(2-5)^2 + (4-5)^2 + (6-5)^2 + (8-5)^2 = 9 + 1 + 1 + 9$. Divide by $N=4$.",
      explanation:
        "The squared deviations are $9, 1, 1, 9$. Their sum is $20$. Dividing by $4$ gives $\\sigma^2 = 5$.",
    },
  ],
  quiz: [
    {
      id: "robust-center",
      prompt: "Which metric of central tendency is least distorted by extreme outliers?",
      options: [
        "Median",
        "Mean",
        "Range",
      ],
      answerIndex: 0,
      explanation:
        "The median depends on rank order rather than numerical magnitude, so an extreme value does not shift it.",
    },
    {
      id: "variance-scaling",
      prompt: "If every number in a dataset is multiplied by $2$, what happens to the standard deviation $\\sigma$?",
      options: [
        "It doubles ($2\\sigma$)",
        "It quadruples ($4\\sigma$)",
        "It remains unchanged",
      ],
      answerIndex: 0,
      explanation:
        "Variance scales by the square ($2^2 = 4$), so the standard deviation $\\sqrt{4\\sigma^2}$ scales linearly by $2$.",
    },
    {
      id: "why-square-deviations",
      prompt: "Why do we square the deviations $(x_i - \\mu)$ when calculating variance?",
      options: [
        "To prevent positive and negative deviations from canceling out to zero",
        "Because variance must always be a fraction between 0 and 1",
        "To make the computation run faster in NumPy",
      ],
      answerIndex: 0,
      explanation:
        "Because the sum of raw signed deviations $\\sum (x_i - \\mu)$ is mathematically always zero, squaring ensures all deviations are non-negative and penalizes larger errors.",
    },
  ],
};
