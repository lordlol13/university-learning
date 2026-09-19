import type { LessonContent } from "../../types/lesson-engine";

export const deepLearningLesson: LessonContent = {
  id: "deep-learning",
  curriculumLessonId: "deep-learning",
  version: 1,
  title: "Deep Learning: Artificial Neurons & Activations",
  description: "How artificial neurons, non-linear activation functions, and deep layer stacking enable universal pattern recognition.",
  estimatedMinutes: 22,
  difficulty: "Intermediate",
  xp: 150,
  prerequisites: ["databases"],
  learningObjectives: [
    "Trace the forward pass through an artificial neuron from weighted sum to activation.",
    "Explain why non-linear activation functions are necessary for multi-layer representation.",
    "Compare Rectified Linear Units (ReLU) and Sigmoid for modern deep neural networks.",
  ],
  sections: [
    {
      id: "understand",
      title: "The Artificial Neuron",
      stage: "Understand",
      blocks: [
        {
          id: "dl-intro",
          type: "introduction",
          title: "From Linear Boundaries to Deep Representations",
          paragraphs: [
            "Linear models are limited: they can only separate classes with straight lines or hyperplanes. Deep learning overcomes this by stacking layers of artificial neurons separated by non-linear activations.",
            "Each layer transforms the input representation. Early layers discover primitive edges and textures, while deeper layers compose them into complex semantics like faces, objects, or syntax.",
          ],
        },
        {
          id: "dl-intuition",
          type: "intuition",
          title: "The Computational Neuron",
          paragraphs: [
            "An artificial neuron receives multiple inputs $\\vec{x}$, weights them by $\\vec{w}$, adds an adjustable bias scalar $b$, and feeds the sum into an activation function $f(z)$.",
            "The bias shifts the threshold at which the neuron fires. The activation function decides the non-linear response, allowing networks to approximate complex mathematical functions.",
          ],
        },
      ],
    },
    {
      id: "mathematics",
      title: "Neuron Mathematics & Non-Linearity",
      stage: "Visualize",
      blocks: [
        {
          id: "neuron-formula",
          type: "formula",
          title: "The Complete Forward Pass Equation",
          latex: "y = f(z) = f\\left(\\sum_{i=1}^n w_i x_i + b\\right)",
          explanation:
            "The pre-activation $z$ is a linear combination of inputs plus bias. The activation function $f$ introduces non-linearity.",
        },
        {
          id: "relu-formula",
          type: "formula",
          title: "The Rectified Linear Unit (ReLU)",
          latex: "\\text{ReLU}(z) = \\max(0, z) = \\begin{cases} z & z > 0 \\\\ 0 & z \\le 0 \\end{cases}",
          explanation:
            "ReLU passes positive values unchanged and clamps negative values to zero. It is computationally efficient and avoids gradient saturation.",
        },
        {
          id: "neuron-breakdown",
          type: "formula-breakdown",
          title: "Dissecting the Artificial Neuron",
          parts: [
            {
              latex: "y",
              variable: {
                latex: "y",
                name: "Activated Output",
                explanation: "The final scalar signal emitted by the neuron.",
              },
            },
            { latex: "=" },
            {
              latex: "f(z)",
              variable: {
                latex: "f(z)",
                name: "Activation Function",
                explanation:
                  "Non-linear function such as ReLU or Sigmoid that bends the feature space.",
              },
            },
            {
              latex: "\\vec{w} \\cdot \\vec{x}",
              variable: {
                latex: "\\vec{w} \\cdot \\vec{x}",
                name: "Weighted Input Sum",
                explanation:
                  "Measures alignment between learned weights and current features.",
              },
            },
            { latex: "+" },
            {
              latex: "b",
              variable: {
                latex: "b",
                name: "Bias Term",
                explanation: "Allows the activation threshold to shift freely.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "code-deep-learning",
      title: "Neuron Implementation in PyTorch",
      stage: "Code",
      blocks: [
        {
          id: "dl-code-samples",
          type: "code",
          title: "Implementing a Dense Layer with ReLU",
          examples: [
            {
              language: "pytorch",
              label: "PyTorch Module",
              code: `import torch
import torch.nn as nn

# Define a 2-layer neural network
class Classifier(nn.Module):
    def __init__(self, in_features=4, hidden_units=8, num_classes=2):
        super().__init__()
        self.fc1 = nn.Linear(in_features, hidden_units)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_units, num_classes)

    def forward(self, x):
        # Forward pass: Linear -> Non-linear -> Linear
        hidden = self.relu(self.fc1(x))
        output = self.fc2(hidden)
        return output

# Create sample input tensor of batch size 1
sample = torch.tensor([[1.5, -0.5, 2.0, 0.0]])
model = Classifier()
logits = model(sample)
print("Output logits shape:", logits.shape)`,
              highlightLines: [7, 8, 9, 14, 15],
            },
            {
              language: "numpy",
              label: "NumPy Pure Forward Pass",
              code: `import numpy as np

def relu(z):
    return np.maximum(0, z)

# Forward pass through a single neuron
weights = np.array([1.5, 3.0])
inputs = np.array([2.0, -1.0])
bias = 1.0

# Linear combination plus bias
z = np.dot(weights, inputs) + bias  # (1.5*2) + (3*-1) + 1 = 1.0
output = relu(z)                    # max(0, 1.0) = 1.0
print("Neuron activation:", output)`,
              highlightLines: [4, 12, 13],
            },
          ],
        },
      ],
    },
    {
      id: "worked-neuron",
      title: "Worked Example",
      stage: "Apply",
      blocks: [
        {
          id: "worked-neuron-forward",
          type: "worked-example",
          title: "Calculating a Neuron's Forward Pass",
          problem:
            "Given input features $\\vec{x} = [2, -1]$, synaptic weights $\\vec{w} = [1.5, 3.0]$, bias $b = 1.0$, and a ReLU activation, calculate the neuron's output.",
          steps: [
            {
              title: "Calculate the weighted dot product",
              text: "Multiply inputs by corresponding weights: $(1.5)(2) + (3.0)(-1) = 3.0 - 3.0 = 0.0$.",
              latex: "\\vec{w} \\cdot \\vec{x} = (1.5)(2) + (3.0)(-1) = 0.0",
            },
            {
              title: "Add the bias scalar",
              text: "Add the bias term $b = 1.0$ to the dot product to compute pre-activation $z$.",
              latex: "z = (\\vec{w} \\cdot \\vec{x}) + b = 0.0 + 1.0 = 1.0",
            },
            {
              title: "Apply the ReLU activation function",
              text: "Evaluate $\\text{ReLU}(z) = \\max(0, 1.0) = 1.0$.",
              latex: "y = \\max(0, 1.0) = 1.0",
            },
          ],
          interpretation:
            "Because the linear score $z=1.0$ is positive, the neuron activates and propagates signal to downstream layers.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "dl-practice-block",
          type: "practice",
          problemIds: ["calc-preactivation", "calc-relu"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "dl-quiz-block",
          type: "quiz",
          questionIds: ["why-non-linear", "relu-negative-value", "sigmoid-range"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "dl-summary-block",
          type: "summary",
          title: "Deep Learning Principles",
          takeaways: [
            "An artificial neuron computes an affine transformation $\\vec{w}^T\\vec{x} + b$ followed by an activation.",
            "Non-linear activations allow deep architectures to learn hierarchical representations.",
            "ReLU is the standard activation function for intermediate layers due to speed and gradient flow.",
            "Stacking layers allows networks to learn compositional representations from raw sensory inputs.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "calc-preactivation",
      prompt:
        "For inputs $\\vec{x} = [3, 2]$, weights $\\vec{w} = [2, -1]$, and bias $b = -2$, compute the pre-activation $z = (w_1 x_1 + w_2 x_2) + b$.",
      answer: 2,
      tolerance: 0,
      hint: "Evaluate $(3 \\times 2) + (2 \\times -1) + (-2) = 6 - 2 - 2$.",
      explanation:
        "$(3 \\times 2) + (2 \\times -1) + (-2) = 6 - 2 - 2 = 2.0$.",
    },
    {
      id: "calc-relu",
      prompt:
        "What is the output of the activation function $\\text{ReLU}(z)$ when $z = -4.5$?",
      answer: 0,
      tolerance: 0,
      hint: "Remember $\\text{ReLU}(z) = \\max(0, z)$. Any negative input is mapped to zero.",
      explanation:
        "$\\text{ReLU}(-4.5) = \\max(0, -4.5) = 0$.",
    },
  ],
  quiz: [
    {
      id: "why-non-linear",
      prompt: "Why must deep neural networks include non-linear activation functions between layers?",
      options: [
        "Without non-linear activations, consecutive linear layers collapse into a single linear layer",
        "To guarantee that all parameter weights remain positive",
        "Because computers cannot calculate matrix products without activations",
      ],
      answerIndex: 0,
      explanation:
        "The composition of two linear functions $W_2(W_1 x)$ is just a single linear transformation $(W_2 W_1) x$. Non-linearities allow the network to approximate complex curves and decision boundaries.",
    },
    {
      id: "relu-negative-value",
      prompt: "For any negative value $z < 0$, what does the ReLU activation function output?",
      options: [
        "$0$",
        "$-1$",
        "$z$ (unchanged)",
      ],
      answerIndex: 0,
      explanation:
        "$\\text{ReLU}(z) = \\max(0, z)$. For any value less than zero, the output is exactly $0$.",
    },
    {
      id: "sigmoid-range",
      prompt: "What is the mathematical output range of the Sigmoid activation function $\\sigma(z) = \\frac{1}{1 + e^{-z}}$?",
      options: [
        "Strictly between $0$ and $1$ (exclusive)",
        "Between $-1$ and $1$",
        "All positive numbers from $0$ to $\\infty$",
      ],
      answerIndex: 0,
      explanation:
        "As $z \\to -\\infty$, $\\sigma(z) \\to 0$; as $z \\to +\\infty$, $\\sigma(z) \\to 1$. Thus the range is $(0, 1)$, ideal for modeling probabilities.",
    },
  ],
};
