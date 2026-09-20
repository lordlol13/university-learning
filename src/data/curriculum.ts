import type { Direction, Lesson, University } from "../types/curriculum";
import { CACHE_VERSION } from "./cache-bust-v2";

export const CURRICULUM_VERSION = CACHE_VERSION;

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

const mathLessons: Lesson[] = [
  {
    id: "calc-derivatives",
    title: "Calculus: Rates of Change & Derivatives",
    description: "Geometric tangent lines, difference quotients, power rule, and physical velocity.",
    xp: 120,
    status: "current",
    icon: "math",
    prerequisites: [],
    durationMinutes: 12,
    content: {
      introduction:
        "Calculus begins with the question of instantaneous rate of change. The derivative f'(x) represents the slope of the tangent line at any point.",
      takeaways: [
        "Interpret the derivative as the limit of difference quotients",
        "Apply standard differentiation rules including the power rule",
        "Connect derivatives to physical velocity and acceleration",
      ],
      question: "What is the derivative of f(x) = x^3 with respect to x?",
      options: ["3x^2", "x^2", "3x"],
      answerIndex: 0,
      explanation:
        "By the power rule, d/dx(x^n) = n*x^(n-1). For x^3, n=3, so the derivative is 3x^2.",
    },
  },
  {
    id: "calc-integrals",
    title: "Calculus: Integrals & Accumulation",
    description: "Riemann sums, antiderivatives, and the Fundamental Theorem of Calculus.",
    xp: 120,
    status: "locked",
    icon: "math",
    prerequisites: ["calc-derivatives"],
    durationMinutes: 12,
    content: {
      introduction:
        "Integration calculates cumulative area under curves. The Fundamental Theorem of Calculus establishes that integration and differentiation are inverse operations.",
      takeaways: [
        "Approximate continuous accumulation via Riemann sums",
        "Compute definite integrals using antiderivatives",
        "Apply the Fundamental Theorem of Calculus",
      ],
      question: "What is the definite integral of 2x dx from x = 0 to x = 3?",
      options: ["6", "9", "12"],
      answerIndex: 1,
      explanation:
        "The antiderivative of 2x is x^2. Evaluating [x^2] from 0 to 3 gives 3^2 - 0^2 = 9.",
    },
  },
  {
    id: "discrete-logic",
    title: "Discrete Mathematics: Boolean Logic & Sets",
    description: "Truth tables, propositional logic, conditional implications, and De Morgan's laws.",
    xp: 110,
    status: "locked",
    icon: "matrix",
    prerequisites: ["calc-integrals"],
    durationMinutes: 10,
    content: {
      introduction:
        "Discrete mathematics powers digital computing. Boolean logic formalizes statements using AND, OR, and NOT operations.",
      takeaways: [
        "Construct truth tables for composite propositions",
        "Apply De Morgan's laws to simplify boolean expressions",
        "Analyze implications and logical equivalences",
      ],
      question: "According to De Morgan's laws, what is NOT (A AND B) equivalent to?",
      options: ["(NOT A) OR (NOT B)", "(NOT A) AND (NOT B)", "NOT A AND B"],
      answerIndex: 0,
      explanation:
        "De Morgan's law states that !(A && B) is logically equivalent to (!A || !B).",
    },
  },
  {
    id: "linear-systems",
    title: "Linear Systems & Matrix Transformations",
    description: "Systems of linear equations, Gaussian elimination, determinants, and linear transformations.",
    xp: 130,
    status: "locked",
    icon: "matrix",
    prerequisites: ["discrete-logic"],
    durationMinutes: 14,
    content: {
      introduction:
        "Matrix equations Ax = b represent simultaneous linear constraints. Gaussian elimination transforms the augmented matrix into row-echelon form to find solutions.",
      takeaways: [
        "Represent systems of linear equations in matrix form Ax = b",
        "Perform elementary row operations using Gaussian elimination",
        "Interpret invertibility via the matrix determinant",
      ],
      question: "If det(A) = 0 for an n x n matrix A, what does this indicate?",
      options: [
        "The matrix has full rank and unique solutions",
        "The matrix is singular and does not possess an inverse",
        "The matrix has only positive eigenvalues",
      ],
      answerIndex: 1,
      explanation:
        "A zero determinant signifies that matrix A is non-invertible (singular), meaning rows/columns are linearly dependent.",
    },
  },
];

const italianLessons: Lesson[] = [
  {
    id: "italian-greetings",
    title: "Saluti e Presentazioni (Greetings & Introductions)",
    description: "Pronuncia, saluti formali e informali, presentarsi e formule di cortesia.",
    xp: 100,
    status: "current",
    icon: "languages",
    prerequisites: [],
    durationMinutes: 8,
    content: {
      introduction:
        "Benvenuti nel corso d'italiano! In questa prima lezione impariamo i saluti fondamentali ('Ciao', 'Buongiorno', 'Buonasera') e come presentarsi con cortesia.",
      takeaways: [
        "Distinguere tra registro formale ('Lei') e informale ('tu')",
        "Salutare appropriatamente in base all'ora della giornata",
        "Presentarsi usando 'Mi chiamo...' e 'Piacere di conoscerti'",
      ],
      question: "Come si saluta formalmente un professore la mattina?",
      options: ["Ciao!", "Buongiorno, Professore.", "Ci vediamo presto."],
      answerIndex: 1,
      explanation:
        "'Buongiorno' è il saluto formale corretto da rivolgere a un docente o superiore durante la mattinata.",
    },
  },
  {
    id: "italian-numbers-time",
    title: "Numeri, Orari e Calendario (Numbers & Time)",
    description: "I numeri cardinali, chiedere e dire l'orario, giorni della settimana e calendario accademico.",
    xp: 100,
    status: "locked",
    icon: "languages",
    prerequisites: ["italian-greetings"],
    durationMinutes: 10,
    content: {
      introduction:
        "Per organizzare lo studio e seguire le lezioni al Politecnico è essenziale conoscere i numeri e saper chiedere e comprendere gli orari.",
      takeaways: [
        "Contare e utilizzare i numeri cardinali da 0 a 100",
        "Chiedere e comunicare l'ora in italiano ('Che ora è? / Che ore sono?')",
        "Memorizzare i giorni della settimana e i mesi per gli esami",
      ],
      question: "Quale risposta corrisponde correttamente alla domanda: 'A che ora comincia la lezione?'",
      options: ["Comincia alle nove e mezza (09:30).", "Sono le nove di sera.", "Il martedì."],
      answerIndex: 0,
      explanation:
        "Per indicare l'orario di inizio di un evento si usa la preposizione articolata 'alle' seguita dall'ora, ad esempio 'alle nove e mezza'.",
    },
  },
  {
    id: "italian-engineering-terms",
    title: "Italiano per Ingegneri (Technical Vocabulary)",
    description: "Terminologia tecnica essenziale per gli studenti del Politecnico di Torino.",
    xp: 120,
    status: "locked",
    icon: "languages",
    prerequisites: ["italian-numbers-time"],
    durationMinutes: 12,
    content: {
      introduction:
        "Al Politecnico di Torino gli studenti utilizzano vocaboli tecnici specifici per la progettazione, i laboratori e le verifiche d'esame.",
      takeaways: [
        "Padroneggiare i termini di laboratorio ('aula', 'progetto', 'misurazione')",
        "Comprendere le istruzioni per gli esami orali e scritti",
        "Leggere semplici specifiche e consegne ingegneristiche in italiano",
      ],
      question: "Cosa significa il termine italiano 'la verifica' in ambito accademico?",
      options: ["L'orario delle lezioni", "La prova d'esame o controllo", "La biblioteca centrale"],
      answerIndex: 1,
      explanation:
        "In ambito universitario e scolastico 'verifica' indica la prova o test di valutazione delle competenze.",
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
    id: "mathematics",
    title: "Mathematics & Logic",
    shortTitle: "Mathematics",
    description: "Learn the foundational language of calculus, discrete structures, and matrix transformations.",
    icon: "math",
    subjects: [
      {
        id: "calculus-foundations",
        title: "Calculus & Analysis",
        units: [
          {
            id: "calc-unit-1",
            title: "Derivatives & Integrals",
            lessons: [mathLessons[0], mathLessons[1]],
          },
        ],
      },
      {
        id: "discrete-linear",
        title: "Discrete Math & Linear Systems",
        units: [
          {
            id: "discrete-unit-1",
            title: "Logic, Sets & Systems",
            lessons: [mathLessons[2], mathLessons[3]],
          },
        ],
      },
    ],
  },
  {
    id: "italian-language",
    title: "Italian Language & Culture",
    shortTitle: "Italian Language",
    description: "Impara la lingua e la cultura italiana per il percorso accademico al Politecnico di Torino.",
    icon: "languages",
    subjects: [
      {
        id: "italian-foundations",
        title: "Corso d'Italiano per Ingegneri",
        units: [
          {
            id: "italian-unit-1",
            title: "Comunicazione di Base e Vita Universitaria",
            lessons: italianLessons,
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
