import type { Direction, Lesson, University } from "../types/curriculum";

const aiLessons: Lesson[] = [
  {
    id: "python-basics",
    title: "Python Basics",
    description: "Your first steps into the language of AI",
    xp: 100,
    status: "completed",
    icon: "code",
    prerequisites: [],
    durationMinutes: 8,
    content: {
      introduction:
        "Python stores values in variables. Lists keep related values together, and loops let you process each item without repeating your code.",
      takeaways: [
        "Store and name values with variables",
        "Group data in a list",
        "Repeat an operation with a for loop",
      ],
      question:
        "Which Python structure stores an ordered collection of values?",
      options: ["A list", "A single integer", "A boolean"],
      answerIndex: 0,
      explanation:
        "A list is an ordered collection. It can hold multiple values and preserves their order.",
    },
  },
  {
    id: "linear-algebra",
    title: "Linear Algebra",
    description: "Vectors, matrices, and a new perspective",
    xp: 100,
    status: "completed",
    icon: "matrix",
    prerequisites: ["python-basics"],
    durationMinutes: 10,
    content: {
      introduction:
        "A vector is an ordered set of numbers. A matrix organizes numbers into rows and columns. In machine learning, a data table is often represented as a matrix.",
      takeaways: [
        "Describe data using vectors",
        "Identify the dimensions of a matrix",
        "Connect matrices to datasets",
      ],
      question: "How many entries are in a matrix with 3 rows and 2 columns?",
      options: ["5", "6", "9"],
      answerIndex: 1,
      explanation: "Multiply rows by columns: 3 × 2 = 6 entries.",
    },
  },
  {
    id: "statistics",
    title: "Statistics",
    description: "Turn everyday data into meaningful insights",
    xp: 100,
    status: "completed",
    icon: "chart",
    prerequisites: ["linear-algebra"],
    durationMinutes: 10,
    content: {
      introduction:
        "Statistics helps us describe and interpret data. The mean is the sum of values divided by their count. The median is the middle value after sorting.",
      takeaways: [
        "Calculate the mean of a dataset",
        "Find the median",
        "Recognize the influence of outliers",
      ],
      question: "What is the mean of 2, 4, and 6?",
      options: ["3", "6", "4"],
      answerIndex: 2,
      explanation: "The sum is 12. Dividing by the 3 values gives a mean of 4.",
    },
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    description: "Teach machines to learn from data",
    xp: 120,
    status: "current",
    icon: "brain",
    prerequisites: ["statistics"],
    durationMinutes: 12,
    content: {
      introduction:
        "In supervised learning, a model learns from examples that include both inputs and the correct outputs, called labels. We train on one part of the data and evaluate on unseen data to check how well the model generalizes.",
      takeaways: [
        "Understand inputs, labels, and predictions",
        "Distinguish training from evaluation",
        "Recognize a supervised learning problem",
      ],
      question: "Which is an example of supervised learning?",
      options: [
        "Grouping articles without predefined categories",
        "Predicting house prices from examples with known sale prices",
        "Exploring a dataset without a target",
      ],
      answerIndex: 1,
      explanation:
        "Known sale prices are labels. The model learns the relationship between house features and those labels to predict prices for new houses.",
    },
  },
  {
    id: "databases",
    title: "Databases",
    description: "A home for your data. A foundation for discovery.",
    xp: 120,
    status: "locked",
    icon: "database",
    prerequisites: ["machine-learning"],
    durationMinutes: 10,
    content: {
      introduction:
        "Relational databases store data in tables. SQL lets you request specific columns, filter rows, and connect information across tables.",
      takeaways: [
        "Understand tables, rows, and columns",
        "Recognize a SELECT query",
        "Filter results with WHERE",
      ],
      question: "Which SQL keyword retrieves data from a table?",
      options: ["SELECT", "DELETE", "DROP"],
      answerIndex: 0,
      explanation:
        "SELECT retrieves data. DELETE removes rows, while DROP removes a database object such as a table.",
    },
  },
  {
    id: "deep-learning",
    title: "Deep Learning",
    description: "Explore neural networks and what comes next",
    xp: 150,
    status: "locked",
    icon: "network",
    prerequisites: ["databases"],
    durationMinutes: 15,
    content: {
      introduction:
        "Deep learning uses neural networks with multiple layers. Each layer transforms the information it receives, helping the network learn increasingly complex patterns.",
      takeaways: [
        "Identify layers in a neural network",
        "Understand learned representations",
        "Connect deep learning to pattern recognition",
      ],
      question: "What does “deep” refer to in deep learning?",
      options: [
        "The physical size of the computer",
        "The number of database tables",
        "Multiple layers in a neural network",
      ],
      answerIndex: 2,
      explanation:
        "Deep networks have multiple layers that learn successive representations of the input.",
    },
  },
];

const physicsLessons: Lesson[] = [
  {
    id: "si-base-units",
    title: "SI Base Units & Scientific Notation",
    description: "The 7 fundamental metric quantities, derived units, and scientific notation rules.",
    xp: 100,
    status: "current",
    icon: "math",
    prerequisites: [],
    durationMinutes: 12,
    content: {
      introduction:
        "The SI metric system is anchored by 7 fundamental base quantities. Scientific notation compresses large and small numbers into M × 10^n format.",
      takeaways: [
        "Memorize the 7 SI base quantities",
        "Form derived units through algebraic combinations",
        "Convert to scientific notation by shifting decimal places",
      ],
      question: "Which of the following is an SI base unit rather than a derived unit?",
      options: ["Kilogram (kg)", "Newton (N)", "Joule (J)"],
      answerIndex: 0,
      explanation:
        "The kilogram is one of the 7 fundamental SI base units. Newtons and Joules are derived units (kg·m/s² and N·m).",
    },
  },
  {
    id: "dimensional-scaling",
    title: "Unit Cancellation & Dimensional Scaling",
    description: "The factor-label method, conversion bridges, and scaling rules for area and volume.",
    xp: 110,
    status: "locked",
    icon: "matrix",
    prerequisites: ["si-base-units"],
    durationMinutes: 12,
    content: {
      introduction:
        "Unit cancellation ensures units cancel algebraically. When converting area and volume, the entire conversion factor must be squared or cubed.",
      takeaways: [
        "Multiply by fractions where the old unit is in the denominator",
        "Square the factor for area conversions (cm² to m²)",
        "Cube the factor for volume conversions (cm³ to m³)",
      ],
      question: "How many cm² are in 1 m²?",
      options: ["100 cm²", "1,000 cm²", "10,000 cm²"],
      answerIndex: 2,
      explanation:
        "Because 1 m = 100 cm, squaring gives (100 cm)² = 10,000 cm².",
    },
  },
  {
    id: "water-equivalency",
    title: "Mass, Weight & The Water Bridge",
    description: "Intrinsic invariant mass vs gravitational weight, and micro/macro water equivalencies.",
    xp: 120,
    status: "locked",
    icon: "chart",
    prerequisites: ["dimensional-scaling"],
    durationMinutes: 12,
    content: {
      introduction:
        "Mass is an invariant intrinsic property measured in kg. Weight is the gravitational pull. The water bridge connects volume directly to mass.",
      takeaways: [
        "Micro bridge: 1 cm³ = 1 mL ≈ 1 g of water",
        "Macro bridge: 1 dm³ = 1 L = 1 kg of water",
        "Weight depends on gravity: 1 lb = 4.45 N of force",
      ],
      question: "What is the mass of 1 Liter (1 dm³) of pure water?",
      options: ["1 gram", "1 kilogram", "100 kilograms"],
      answerIndex: 1,
      explanation:
        "Under standard conditions, 1 dm³ = 1 Liter = exactly 1 kilogram of water.",
    },
  },
  {
    id: "vector-components",
    title: "Vector Components & Analytical Addition",
    description: "Decompose vectors into rectangular coordinates, quadrant mapping, and resultant calculation.",
    xp: 120,
    status: "locked",
    icon: "compass",
    prerequisites: ["water-equivalency"],
    durationMinutes: 15,
    content: {
      introduction:
        "A vector requires both magnitude and direction. Resolving into Ax and Ay components allows accurate analytical addition.",
      takeaways: [
        "Resolve horizontal Ax = A cos(θ) and vertical Ay = A sin(θ)",
        "Adjust angles according to the quadrant mapping matrix",
        "Sum components to find the resultant vector magnitude and direction",
      ],
      question: "What are the rectangular components of a 10 N vector at 0° relative to the +x axis?",
      options: ["Ax = 10 N, Ay = 0 N", "Ax = 0 N, Ay = 10 N", "Ax = 7.07 N, Ay = 7.07 N"],
      answerIndex: 0,
      explanation:
        "Ax = 10 cos(0°) = 10 N, and Ay = 10 sin(0°) = 0 N.",
    },
  },
  {
    id: "vector-dot-product",
    title: "Dot Product & Angle Determination",
    description: "Scalar multiplication of vectors, angle between vectors, and the orthogonality criterion.",
    xp: 130,
    status: "locked",
    icon: "matrix",
    prerequisites: ["vector-components"],
    durationMinutes: 15,
    content: {
      introduction:
        "The dot product pairs coordinate projections to return a single scalar number. It reveals the exact angle between two vectors.",
      takeaways: [
        "A · B = AB cos(φ) = AxBx + AyBy + AzBz",
        "If A · B = 0, the vectors are perpendicular (orthogonal)",
        "The dot product output is always a scalar, never a vector",
      ],
      question: "If two non-zero vectors have a dot product of zero, what is the angle between them?",
      options: ["0° (parallel)", "90° (perpendicular)", "180° (anti-parallel)"],
      answerIndex: 1,
      explanation:
        "cos(90°) = 0, so a dot product of zero proves orthogonality.",
    },
  },
  {
    id: "vector-cross-product",
    title: "Cross Product & 3D Space",
    description: "Vector product, 3D Right-Hand Rule, 3D determinants, and anti-commutativity.",
    xp: 140,
    status: "locked",
    icon: "atom",
    prerequisites: ["vector-dot-product"],
    durationMinutes: 18,
    content: {
      introduction:
        "The cross product A × B outputs a vector perpendicular to both inputs. Direction is dictated by the Right-Hand Rule.",
      takeaways: [
        "Cross product yields a vector with magnitude AB sin(θ)",
        "Anti-commutative: A × B = -(B × A)",
        "If A × B = 0, the vectors are parallel",
      ],
      question: "What is the cross product of any vector with itself (A × A)?",
      options: ["The zero vector (0)", "A²", "A unit vector"],
      answerIndex: 0,
      explanation:
        "Since the angle between identical vectors is 0°, sin(0°) = 0, yielding a zero vector.",
    },
  },
  {
    id: "physics-tactical-exam",
    title: "Tactical Blueprint Diagnostic Exam",
    description: "8-part comprehensive diagnostic assessment across vectors and metric engineering mechanics.",
    xp: 180,
    status: "locked",
    icon: "compass",
    prerequisites: ["vector-cross-product"],
    durationMinutes: 25,
    content: {
      introduction:
        "A rigorous multi-topic examination covering metric scaling, water bridges, vector resolution, dot and cross products.",
      takeaways: [
        "Synthesize unit conversions with mechanics problems",
        "Avoid common traps in dimensional scaling and quadrant blindness",
        "Demonstrate mastery of the Tactical Blueprint",
      ],
      question: "If a force of 1 lb acts on an object, how many Newtons is this equivalent to?",
      options: ["1.61 N", "4.45 N", "9.81 N"],
      answerIndex: 1,
      explanation:
        "As established in the Tactical Blueprint, 1 lb = 4.45 N of force.",
    },
  },
];

export const directions: Direction[] = [
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    shortTitle: "AI & ML",
    description: "Build real skills for the future. One step at a time.",
    icon: "brain",
    subjects: [
      {
        id: "ai-foundations",
        title: "Foundations of Artificial Intelligence",
        units: [
          { id: "ai-unit-1", title: "The foundations", lessons: aiLessons },
        ],
      },
    ],
  },
  {
    id: "physics-engineering",
    title: "Physics & Engineering",
    shortTitle: "Physics & Mechanics",
    description: "Master vector mathematics, metric conversions, and mechanics problem-solving.",
    icon: "atom",
    subjects: [
      {
        id: "metric-conversions",
        title: "Metric System & Conversions",
        units: [
          {
            id: "metric-unit-1",
            title: "Units, Dimensions & Scaling",
            lessons: [
              physicsLessons[0],
              physicsLessons[1],
              physicsLessons[2],
            ],
          },
        ],
      },
      {
        id: "vector-mathematics",
        title: "Vector Mathematics: Tactical Blueprint",
        units: [
          {
            id: "vector-unit-1",
            title: "Analytical Vectors & 3D Operations",
            lessons: [
              physicsLessons[3],
              physicsLessons[4],
              physicsLessons[5],
            ],
          },
        ],
      },
      {
        id: "tactical-diagnostics",
        title: "Comprehensive Diagnostics",
        units: [
          {
            id: "diagnostic-unit-1",
            title: "Diagnostic Examination",
            lessons: [
              physicsLessons[6],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "data-science",
    title: "Data Science",
    shortTitle: "Data Science",
    description: "Find the stories hidden in data.",
    icon: "chart",
    subjects: [],
  },
  {
    id: "computer-engineering",
    title: "Computer Engineering",
    shortTitle: "Engineering",
    description: "Understand the systems that power our world.",
    icon: "chip",
    subjects: [],
  },
  {
    id: "programming",
    title: "Programming",
    shortTitle: "Programming",
    description: "Bring your ideas to life, one line at a time.",
    icon: "code",
    subjects: [],
  },
  {
    id: "mathematics",
    title: "Mathematics",
    shortTitle: "Mathematics",
    description: "Learn the language behind every breakthrough.",
    icon: "math",
    subjects: [],
  },
];

export const university: University = {
  id: "turin-tashkent",
  name: "Turin Polytechnic University in Tashkent",
  shortName: "Turin University",
  programs: [
    {
      id: "computer-science",
      universityId: "turin-tashkent",
      title: "Computer Science",
      qualification: "Undergraduate program",
      directions,
    },
  ],
};

export const program = university.programs[0];
export const getDirection = (id: string) =>
  directions.find((direction) => direction.id === id);
export const getDirectionLessons = (direction: Direction): Lesson[] =>
  direction.subjects.flatMap((subject) =>
    subject.units.flatMap((unit) => unit.lessons),
  );
export const allLessons = directions.flatMap(getDirectionLessons);
export const getLesson = (id: string) =>
  allLessons.find((lesson) => lesson.id === id);
export const getLessonDirection = (id: string) =>
  directions.find((direction) =>
    getDirectionLessons(direction).some((lesson) => lesson.id === id),
  );
