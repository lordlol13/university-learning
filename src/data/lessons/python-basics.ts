import type { LessonContent } from "../../types/lesson-engine";

export const pythonBasicsLesson: LessonContent = {
  id: "python-basics",
  curriculumLessonId: "python-basics",
  version: 1,
  title: "Python Foundations for AI",
  description: "Variables, lists, loops, and data structures that power modern machine learning.",
  estimatedMinutes: 15,
  difficulty: "Foundational",
  xp: 100,
  prerequisites: [],
  learningObjectives: [
    "Structure numerical inputs using Python lists and dictionaries.",
    "Manipulate arrays using zero-based indexing and slicing.",
    "Automate repetitive data transformations using iteration and list comprehensions.",
  ],
  sections: [
    {
      id: "understand",
      title: "Data Representation in Python",
      stage: "Understand",
      blocks: [
        {
          id: "intro-python",
          type: "introduction",
          title: "The Lingua Franca of Modern AI",
          paragraphs: [
            "Before a neural network can train, data must be gathered, cleaned, and organized in memory. Python provides clean, readable primitives that bridge human logic and high-performance numerical engines.",
            "In machine learning, every sample is a collection of features. Whether predicting house prices or classifying images, features begin as numerical variables and ordered collections.",
          ],
        },
        {
          id: "variables-intuition",
          type: "intuition",
          title: "Containers, Types, and Values",
          paragraphs: [
            "Think of a variable as a labeled handle on a value in memory. A floating-point number like $x = 0.75$ might represent a normalized sensor reading.",
            "Lists group ordered measurements together. When indexing lists, Python counts from zero: the first item sits at index $0$, and negative indices like $-1$ read backward from the end.",
          ],
        },
      ],
    },
    {
      id: "code-structures",
      title: "Working with Sequences and Dictionaries",
      stage: "Code",
      blocks: [
        {
          id: "python-code-samples",
          type: "code",
          title: "Feature Extraction in Python",
          examples: [
            {
              language: "python",
              label: "Python Core",
              code: `# Raw sensor features recorded over 5 time steps
temperatures = [21.5, 22.0, 21.8, 23.2, 22.9]

# Zero-based indexing and slicing
first_reading = temperatures[0]       # 21.5
recent_window = temperatures[-3:]     # [21.8, 23.2, 22.9]

# List comprehension for feature normalization
baseline = 20.0
normalized = [round(t - baseline, 2) for t in temperatures]

# Structured record with dictionary
sample = {
    "device_id": "sensor_01",
    "features": normalized,
    "count": len(temperatures)
}`,
              highlightLines: [2, 5, 6, 10, 14],
            },
            {
              language: "numpy",
              label: "NumPy Bridge",
              code: `import numpy as np

# Convert Python list to a contiguous NumPy array
features = np.array([21.5, 22.0, 21.8, 23.2, 22.9])

# Vectorized transformation without manual loops
normalized = features - 20.0
print("Mean normalized temp:", normalized.mean())`,
              highlightLines: [4, 7],
            },
          ],
        },
      ],
    },
    {
      id: "worked-transformation",
      title: "Step-by-Step Data Pipeline",
      stage: "Apply",
      blocks: [
        {
          id: "worked-feature-scaling",
          type: "worked-example",
          title: "Normalizing a Feature Vector",
          problem:
            "Given a raw feature list of pixel values $[50, 100, 150, 200]$, normalize the values by dividing by the maximum value $200$.",
          steps: [
            {
              title: "Identify sequence length and maximum",
              text: "The list has $N = 4$ elements. The maximum scalar value in the sequence is $200$.",
              latex: "x_{max} = 200",
            },
            {
              title: "Apply the scaling transformation",
              text: "Divide each feature $x_i$ by $x_{max}$ so values lie in the range $[0, 1]$.",
              latex: "\\hat{x}_i = \\frac{x_i}{x_{max}}",
            },
            {
              title: "Construct the transformed collection",
              text: "Compute each coordinate: $50/200 = 0.25$, $100/200 = 0.5$, $150/200 = 0.75$, and $200/200 = 1.0$.",
              latex: "\\hat{\\vec{x}} = [0.25, 0.50, 0.75, 1.00]",
            },
          ],
          interpretation:
            "Scaling prevents features with large raw magnitudes from dominating machine learning optimization.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "python-practice-block",
          type: "practice",
          problemIds: ["list-indexing", "slice-sum"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "python-quiz-block",
          type: "quiz",
          questionIds: ["zero-index", "list-mutability", "comprehension-result"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "python-summary-block",
          type: "summary",
          title: "Python Principles for AI",
          takeaways: [
            "Lists preserve insertion order and use 0-indexed positions.",
            "Negative indices provide concise access to the tail of sequential datasets.",
            "List comprehensions provide an expressive syntax for mapping and filtering features.",
            "Dictionaries map human-readable feature names to numerical tensors.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "list-indexing",
      prompt:
        "Consider the list `scores = [12, 24, 36, 48, 60]`. What is the numerical value at index `scores[2]`?",
      answer: 36,
      tolerance: 0,
      hint: "Remember that Python lists start with index 0: `scores[0] == 12`.",
      explanation:
        "At index 0 is 12, index 1 is 24, and index 2 is 36.",
    },
    {
      id: "slice-sum",
      prompt:
        "For `values = [2, 4, 6, 8, 10]`, compute the sum of the slice `values[1:4]`.",
      answer: 18,
      tolerance: 0,
      hint: "The slice `[1:4]` includes elements at indices 1, 2, and 3 (the end index 4 is excluded).",
      explanation:
        "`values[1:4]` extracts `[4, 6, 8]`. Their sum is $4 + 6 + 8 = 18$.",
    },
  ],
  quiz: [
    {
      id: "zero-index",
      prompt: "What does the index `data[-1]` evaluate to in Python?",
      options: [
        "The very first element in the list",
        "The last element in the list",
        "An IndexError, because negative indices are invalid",
      ],
      answerIndex: 1,
      explanation:
        "Negative indices wrap around from the end of the collection, with `-1` targeting the final element.",
    },
    {
      id: "list-mutability",
      prompt: "Which statement accurately describes Python lists?",
      options: [
        "Lists are mutable: elements can be modified, appended, or removed in-place",
        "Lists are immutable: any change requires creating a new list",
        "Lists can only store single-character strings",
      ],
      answerIndex: 0,
      explanation:
        "Unlike tuples or strings, Python lists are mutable, allowing efficient in-place updates during batch processing.",
    },
    {
      id: "comprehension-result",
      prompt: "What is produced by `[x * 2 for x in [1, 2, 3] if x > 1]`?",
      options: ["[2, 4, 6]", "[4, 6]", "[2, 4]"],
      answerIndex: 1,
      explanation:
        "The `if x > 1` filter selects elements 2 and 3. Multiplying each by 2 yields `[4, 6]`.",
    },
  ],
};
