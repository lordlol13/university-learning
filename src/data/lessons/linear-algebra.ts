import type { LessonContent } from "../../types/lesson-engine";

export const linearAlgebraLesson: LessonContent = {
  id: "linear-algebra",
  curriculumLessonId: "linear-algebra",
  version: 1,
  title: "Linear Algebra: Vectors & Dot Products",
  description: "Geometric and algebraic foundations for machine learning weights, features, and projections.",
  estimatedMinutes: 18,
  difficulty: "Foundational",
  xp: 100,
  prerequisites: ["python-basics"],
  learningObjectives: [
    "Interpret vectors as coordinate positions and weighted feature vectors.",
    "Calculate vector dot products and understand their role in similarity and linear layers.",
    "Determine dimensionality constraints for vector and matrix operations.",
  ],
  sections: [
    {
      id: "understand",
      title: "Vectors in Feature Space",
      stage: "Understand",
      blocks: [
        {
          id: "vectors-intro",
          type: "introduction",
          title: "The Coordinate Geometry of AI",
          paragraphs: [
            "In machine learning, every piece of data—whether an audio snippet, an image, or tabular user attributes—is translated into a sequence of real numbers called a vector.",
            "If a house is described by its square footage, number of bedrooms, and distance to transit, we express it as an ordered point $\\vec{x} \\in \\mathbb{R}^3$. The axes represent features, and the values represent measurements.",
          ],
        },
        {
          id: "dot-product-intuition",
          type: "intuition",
          title: "Projection and Alignment",
          paragraphs: [
            "How do we measure how closely two vectors align? The dot product multiplies corresponding coordinates and adds them up.",
            "When two vectors point in similar directions, their dot product is large and positive. When they are perpendicular (orthogonal), their dot product is zero. In an artificial neuron, weights form a vector $\\vec{w}$ that scores how strongly each input feature matches the target pattern.",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "The Dot Product Equation",
      stage: "Visualize",
      blocks: [
        {
          id: "dot-product-formula",
          type: "formula",
          title: "Algebraic Definition of the Dot Product",
          latex: "\\vec{u} \\cdot \\vec{v} = \\sum_{i=1}^n u_i v_i = u_1 v_1 + u_2 v_2 + \\dots + u_n v_n",
          explanation:
            "The sum of coordinate-wise products maps two vectors of equal dimension $n$ to a single scalar number.",
        },
        {
          id: "dot-product-breakdown",
          type: "formula-breakdown",
          title: "Anatomy of the Weighted Sum",
          parts: [
            {
              latex: "\\vec{w} \\cdot \\vec{x}",
              variable: {
                latex: "\\vec{w} \\cdot \\vec{x}",
                name: "Scalar Score",
                explanation:
                  "The aggregate response of a model parameter vector to an input instance.",
              },
            },
            { latex: "=" },
            {
              latex: "\\sum_{i=1}^n",
              variable: {
                latex: "\\sum_{i=1}^n",
                name: "Summation",
                explanation:
                  "Summing across each feature dimension from index 1 to n.",
              },
            },
            {
              latex: "w_i",
              variable: {
                latex: "w_i",
                name: "Feature Weight",
                explanation:
                  "The importance or sensitivity assigned to the i-th feature.",
              },
            },
            {
              latex: "x_i",
              variable: {
                latex: "x_i",
                name: "Input Value",
                explanation:
                  "The observed measurement for the i-th attribute.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "code-operations",
      title: "Vector Operations in NumPy",
      stage: "Code",
      blocks: [
        {
          id: "vector-numpy-code",
          type: "code",
          title: "NumPy Vector Computations",
          examples: [
            {
              language: "numpy",
              label: "NumPy Vectors",
              code: `import numpy as np

# Define two 3-dimensional vectors
weights = np.array([0.5, 2.0, -1.5])
features = np.array([4.0, 1.0, 2.0])

# Coordinate-wise multiplication
elementwise = weights * features  # [2.0, 2.0, -3.0]

# Dot product via @ operator or np.dot
score = weights @ features       # 1.0
print("Weighted sum:", score)

# Euclidean norm (magnitude)
norm = np.linalg.norm(features)  # sqrt(4^2 + 1^2 + 2^2) = sqrt(21)
print("Vector magnitude:", round(norm, 2))`,
              highlightLines: [4, 5, 11, 15],
            },
            {
              language: "python",
              label: "Pure Python",
              code: `# Computing a dot product without third-party libraries
weights = [0.5, 2.0, -1.5]
features = [4.0, 1.0, 2.0]

dot_product = sum(w * x for w, x in zip(weights, features))
print("Dot product:", dot_product)  # 1.0`,
              highlightLines: [5],
            },
          ],
        },
      ],
    },
    {
      id: "worked-dot-product",
      title: "Worked Example",
      stage: "Apply",
      blocks: [
        {
          id: "worked-linear-score",
          type: "worked-example",
          title: "Calculating a Neuron's Pre-Activation",
          problem:
            "Given input $\\vec{x} = [2, 3, -1]$ and model weights $\\vec{w} = [0.5, 2, 4]$, calculate the dot product $\\vec{w} \\cdot \\vec{x}$.",
          steps: [
            {
              title: "Pair corresponding coordinates",
              text: "Multiply index 0: $0.5 \\times 2$, index 1: $2 \\times 3$, and index 2: $4 \\times (-1)$.",
              latex: "\\vec{w} \\cdot \\vec{x} = (0.5)(2) + (2)(3) + (4)(-1)",
            },
            {
              title: "Evaluate individual products",
              text: "The intermediate products are $1.0$, $6.0$, and $-4.0$.",
              latex: "\\vec{w} \\cdot \\vec{x} = 1.0 + 6.0 - 4.0",
            },
            {
              title: "Sum the scalar contributions",
              text: "Add the terms together to find the final pre-activation scalar.",
              latex: "\\vec{w} \\cdot \\vec{x} = 3.0",
            },
          ],
          interpretation:
            "Because the result is positive ($3.0$), the features align favorably with the learned weight profile.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "linalg-practice-block",
          type: "practice",
          problemIds: ["dot-calc", "norm-squared"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "linalg-quiz-block",
          type: "quiz",
          questionIds: ["orthogonal-meaning", "matrix-mult-shape", "dimension-match"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "linalg-summary-block",
          type: "summary",
          title: "Linear Algebra Core Insights",
          takeaways: [
            "A vector pairs numerical coordinates with directions in geometric space.",
            "The dot product calculates projection, scoring alignment between inputs and weights.",
            "Orthogonal vectors produce a dot product of zero.",
            "Matrix-vector operations scale feature transformations across batches of examples.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "dot-calc",
      prompt:
        "Compute the dot product $\\vec{u} \\cdot \\vec{v}$ for $\\vec{u} = [3, 4]$ and $\\vec{v} = [2, 1]$.",
      answer: 10,
      tolerance: 0,
      hint: "Multiply each pair of coordinates and sum them: $(3 \\times 2) + (4 \\times 1)$.",
      explanation:
        "$3 \\times 2 = 6$ and $4 \\times 1 = 4$. $6 + 4 = 10$.",
    },
    {
      id: "norm-squared",
      prompt:
        "For vector $\\vec{w} = [3, 4]$, what is the squared Euclidean norm $\\|\\vec{w}\\|^2 = w_1^2 + w_2^2$?",
      answer: 25,
      tolerance: 0,
      hint: "Square each component: $3^2 + 4^2$.",
      explanation:
        "$3^2 + 4^2 = 9 + 16 = 25$. The Euclidean length $\\|\\vec{w}\\|$ is $\\sqrt{25} = 5$.",
    },
  ],
  quiz: [
    {
      id: "orthogonal-meaning",
      prompt: "What does it mean if two non-zero vectors have a dot product of zero?",
      options: [
        "They are perpendicular (orthogonal) to each other",
        "They are identical and point in the exact same direction",
        "At least one vector must have negative coordinates",
      ],
      answerIndex: 0,
      explanation:
        "The geometric formula is $\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\| \\|\\vec{v}\\| \\cos(\\theta)$. When $\\theta = 90^\\circ$, $\\cos(\\theta) = 0$, indicating perpendicularity.",
    },
    {
      id: "matrix-mult-shape",
      prompt: "If matrix $A$ has shape $3 \\times 4$ and matrix $B$ has shape $4 \\times 2$, what is the shape of the matrix product $AB$?",
      options: ["$3 \\times 2$", "$4 \\times 4$", "$3 \\times 4$"],
      answerIndex: 0,
      explanation:
        "The inner dimensions ($4$) must match for matrix multiplication, and the resulting product inherits the outer dimensions: $3 \\times 2$.",
    },
    {
      id: "dimension-match",
      prompt: "Can you compute the dot product of a 3-dimensional vector and a 4-dimensional vector?",
      options: [
        "No, the dot product requires both vectors to have the same dimension",
        "Yes, the missing dimension is automatically treated as 1",
        "Yes, the operation produces a 7-dimensional output vector",
      ],
      answerIndex: 0,
      explanation:
        "The dot product pairs elements coordinate-by-coordinate; vectors must have matching dimensionality.",
    },
  ],
};
