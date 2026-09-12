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
