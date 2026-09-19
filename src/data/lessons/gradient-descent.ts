import type { LessonContent } from "../../types/lesson-engine";

export const gradientDescentLesson: LessonContent = {
  id: "gradient-descent",
  curriculumLessonId: "machine-learning",
  version: 1,
  title: "Gradient Descent",
  description: "How small, thoughtful steps teach a model to learn.",
  estimatedMinutes: 25,
  difficulty: "Foundational",
  xp: 120,
  prerequisites: ["statistics"],
  learningObjectives: [
    "Read a gradient as a direction and a rate of change.",
    "Predict how the learning rate changes an optimization path.",
    "Calculate an update, then implement it in Python.",
  ],
  sections: [
    {
      id: "understand",
      title: "Find your downhill",
      stage: "Understand",
      blocks: [
        {
          id: "motivation",
          type: "introduction",
          title: "A model needs a way to improve",
          paragraphs: [
            "Imagine a model predicting house prices. Its predictions begin imperfectly. A loss function turns those mistakes into one number: smaller means better. Training means adjusting the model’s parameters to reduce that number.",
            "But which way should a parameter move? Instead of trying every possible value, gradient descent uses the local slope to take a useful next step. Repeat that simple decision, and a model can improve.",
          ],
        },
        {
          id: "intuition",
          type: "intuition",
          title: "A hillside, a compass, and a step",
          paragraphs: [
            "Imagine standing on a hillside in fog. You cannot see the whole landscape, but you can feel which way the ground rises. Walk in the opposite direction to go downhill.",
            "The gradient is your uphill compass. The learning rate decides how far you step. Small steps are cautious; large steps can overshoot the valley. A slope is local information, so a downhill direction does not guarantee that a huge step will lower the loss.",
          ],
        },
        {
          id: "objective",
          type: "formula",
          title: "Our landscape",
          latex: "f(x) = (x-2)^2 + 1",
          explanation:
            "Here $x$ is one adjustable parameter and $f(x)$ is its loss. The square is never negative, so the smallest loss is $1$, reached at $x=2$. We know the answer here so we can inspect how the algorithm finds it.",
        },
      ],
    },
    {
      id: "mathematics",
      title: "The math behind a step",
      stage: "Visualize",
      blocks: [
        {
          id: "definition",
          type: "theory",
          title: "Turn slope into direction",
          paragraphs: [
            "A derivative measures how quickly a function changes at a point. For a small displacement $\\Delta x$, the change in loss is approximately $f'(x)\\Delta x$. Choosing $\\Delta x=-\\eta f'(x)$ makes this approximately $-\\eta[f'(x)]^2$, which is nonpositive for $\\eta>0$.",
            "This is a local approximation, not a promise about a large step. For many parameters, the gradient $\\nabla J(\\theta)$ collects all partial derivatives into a vector. Subtracting it applies the same idea in every coordinate.",
          ],
        },
        {
          id: "derivative",
          type: "formula",
          title: "Differentiate our objective",
          latex:
            "\\begin{aligned}f'(x)&=2(x-2)\\cdot 1 + 0\\\\&=2(x-2)\\\\x_{t+1}&=x_t-\\eta\\,2(x_t-2)\\end{aligned}",
          explanation:
            "The chain rule differentiates the square; the inside derivative is $1$. The constant contributes $0$. At $x=5$, the slope is $6$, so subtracting a positive multiple moves left. At $x=0$, the slope is $-4$, so the update moves right.",
        },
        {
          id: "breakdown",
          type: "formula-breakdown",
          title: "One rule. Three useful ideas.",
          parts: [
            {
              latex: "\\theta_{t+1}",
              variable: {
                latex: "\\theta_{t+1}",
                name: "Next parameters",
                explanation:
                  "The model parameters after this update. The subscript counts iterations, not powers.",
              },
            },
            { latex: "=" },
            {
              latex: "\\theta_t",
              variable: {
                latex: "\\theta_t",
                name: "Current parameters",
                explanation:
                  "Where the model is now. In our one-dimensional lab, this is the number x.",
              },
            },
            { latex: "-" },
            {
              latex: "\\eta",
              variable: {
                latex: "\\eta",
                name: "Learning rate",
                explanation:
                  "A positive number controlling step size. A larger value moves farther along the negative gradient.",
              },
            },
            {
              latex: "\\nabla J(\\theta_t)",
              variable: {
                latex: "\\nabla J(\\theta_t)",
                name: "Gradient of the objective",
                explanation:
                  "A vector of partial derivatives evaluated at the current parameters. It points toward steepest local increase, which is why we subtract it.",
              },
            },
          ],
        },
        {
          id: "stability",
          type: "formula",
          title: "When do the steps settle down?",
          latex: "x_{t+1}-2=(1-2\\eta)(x_t-2)",
          explanation:
            "The distance to the minimum shrinks when $|1-2\\eta|<1$, or $0<\\eta<1$. At $\\eta=0.5$ we reach the minimum in one step. Between $0.5$ and $1$ we alternate sides while converging. At $\\eta=1$ we oscillate; above $1$ the error grows (unless we start exactly at the minimum). These thresholds apply to this quadratic, not every loss function.",
        },
      ],
    },
    {
      id: "experiment",
      title: "The optimization lab",
      stage: "Experiment",
      blocks: [
        {
          id: "graph",
          type: "interactive-graph",
          title: "Make the next step yours",
          visualization: "gradient-descent",
          simulationId: "quadratic",
          parameters: { initialX: 5, learningRate: 0.1 },
        },
        {
          id: "algorithm",
          type: "algorithm-visualizer",
          title: "Inside the algorithm",
          visualization: "gradient-descent",
          simulationId: "quadratic",
          parameters: { initialX: 5, learningRate: 0.1 },
        },
      ],
    },
    {
      id: "implement",
      title: "From numbers to code",
      stage: "Implement",
      blocks: [
        {
          id: "worked",
          type: "worked-example",
          title: "Two updates, by hand",
          problem:
            "Start at $x_0=5$ with $\\eta=0.1$. Calculate two updates and check whether the loss decreases.",
          steps: [
            {
              title: "Write down what we know",
              text: "Our initial loss is $f(5)=10$. Use the derivative of the same objective throughout.",
              latex: "f'(x)=2(x-2),\\quad x_0=5,\\quad \\eta=0.1",
            },
            {
              title: "Calculate the first gradient",
              text: "The positive gradient tells us to move left.",
              latex: "g_0=2(5-2)=6",
            },
            {
              title: "Substitute, then update",
              text: "The step has magnitude $0.6$; this is the learning rate times the slope.",
              latex: "x_1=5-0.1\\times6=4.4",
            },
            {
              title: "Evaluate the new loss",
              text: "The loss drops from $10$ to $6.76$.",
              latex: "f(4.4)=(4.4-2)^2+1=6.76",
            },
            {
              title: "Recalculate the slope and repeat",
              text: "The slope is smaller now. We must recompute it at the new position.",
              latex:
                "\\begin{aligned}g_1&=2(4.4-2)=4.8\\\\x_2&=4.4-0.1\\times4.8=3.92\\\\f(3.92)&=4.6864\\end{aligned}",
            },
          ],
          interpretation:
            "Both updates reduce the loss. Steps get smaller near the bottom because the derivative approaches zero. Notice that the minimum loss is $1$, not $0$: a nonzero loss can still be optimal.",
        },
        {
          id: "implementation",
          type: "code",
          title: "Implement the same rule",
          examples: [
            {
              language: "python",
              label: "Python",
              highlightLines: [8, 11, 12],
              code: "def loss(x):\n    return (x - 2) ** 2 + 1\n\nx, eta = 5.0, 0.1\nhistory = [(x, loss(x))]\n\nfor iteration in range(100):\n    gradient = 2 * (x - 2)\n    if abs(gradient) < 1e-6:\n        break\n    x = x - eta * gradient\n    history.append((x, loss(x)))\n\nprint(round(x, 4), round(loss(x), 4))\n# Approximately: 2.0 1.0",
            },
            {
              language: "numpy",
              label: "NumPy",
              highlightLines: [9, 12],
              code: "import numpy as np\n\n# Three independent starting points, updated together.\nx = np.array([5.0, 0.0, -1.0])\neta = 0.1\nhistory = [x.copy()]\n\nfor iteration in range(100):\n    gradient = 2 * (x - 2)\n    if np.max(np.abs(gradient)) < 1e-6:\n        break\n    x = x - eta * gradient\n    history.append(x.copy())\n\nprint(np.round(x, 4))\n# Approximately: [2. 2. 2.]",
            },
          ],
        },
        {
          id: "code-context",
          type: "theory",
          title: "What carries over to real models?",
          paragraphs: [
            "The loop remains: compute a gradient, update parameters, measure loss. Here we wrote the derivative by hand. Frameworks can compute gradients automatically for much larger models.",
            "The iteration cap prevents an endless loop, and the gradient tolerance gives a practical stopping rule. A small gradient does not always imply a global minimum: other objectives can have saddle points or many local minima. Our convex quadratic has a single global minimum.",
          ],
        },
      ],
    },
    {
      id: "practice",
      title: "Try it yourself",
      stage: "Practice",
      blocks: [
        {
          id: "practice-block",
          type: "practice",
          title: "Your turn to calculate",
          problemIds: ["next-position", "next-loss"],
        },
      ],
    },
    {
      id: "test",
      title: "Check your understanding",
      stage: "Test",
      blocks: [
        {
          id: "quiz-block",
          type: "quiz",
          title: "Make the ideas stick",
          questionIds: ["direction", "rate", "minimum"],
        },
      ],
    },
    {
      id: "summary",
      title: "Take the idea with you",
      stage: "Reflect",
      blocks: [
        {
          id: "summary-block",
          type: "summary",
          title: "Small steps. A powerful idea.",
          takeaways: [
            "A gradient describes steepest local increase. Subtract it to search downhill.",
            "The learning rate scales the move. Larger does not always mean faster convergence.",
            "For $f(x)=(x-2)^2+1$, the minimum is at $x=2$, with loss $1$.",
            "Keep the formula, code, and loss tied to the same current parameters.",
            "In real training, track validation performance too: minimizing training loss alone does not guarantee good predictions on unseen data.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "next-position",
      prompt:
        "For $f(x)=(x-2)^2+1$, start at $x=4$ and use $\\eta=0.2$. What is the next position?",
      answer: 3.2,
      tolerance: 0.005,
      hint: "First find $f'(4)=2(4-2)$. Then subtract $0.2$ times this gradient from $4$.",
      explanation:
        "$f'(4)=4$, so $x_{new}=4-0.2\\times4=3.2$. A positive slope produces a move to the left.",
    },
    {
      id: "next-loss",
      prompt: "After that update, $x=3.2$. What is the new loss $f(3.2)$?",
      answer: 2.44,
      tolerance: 0.005,
      hint: "The loss is $(3.2-2)^2+1$. Square the difference before adding $1$.",
      explanation:
        "$f(3.2)=1.2^2+1=2.44$. The previous loss was $5$, so this step improved the objective.",
    },
  ],
  quiz: [
    {
      id: "direction",
      prompt:
        "At $x=0$, our derivative is $-4$. With a positive learning rate, which way will the next update move?",
      options: [
        "Left, because the gradient is negative",
        "Right, because we subtract a negative number",
        "Nowhere; negative gradients cannot be used",
      ],
      answerIndex: 1,
      explanation:
        "$x_{new}=0-\\eta(-4)=4\\eta>0$. The negative gradient points right, toward the minimum.",
    },
    {
      id: "rate",
      prompt:
        "Starting at $x=5$, what happens with $\\eta=1.1$ for this quadratic?",
      options: [
        "The error grows while alternating sides",
        "It always converges faster",
        "It reaches the minimum in one step",
      ],
      answerIndex: 0,
      explanation:
        "The error is multiplied by $1-2(1.1)=-1.2$ each iteration. Its magnitude grows by $20\\%$ and its sign flips.",
    },
    {
      id: "minimum",
      prompt:
        "The algorithm reaches $x=2$ and the loss stays at $1$. What does this tell us?",
      options: [
        "It failed because every loss must reach zero",
        "The learning rate must increase",
        "It reached this function’s global minimum",
      ],
      answerIndex: 2,
      explanation:
        "The square $(x-2)^2$ cannot be negative. At $x=2$ it is zero, so $1$ is the smallest possible loss and the gradient is zero.",
    },
  ],
};
