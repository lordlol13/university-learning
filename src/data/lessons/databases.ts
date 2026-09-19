import type { LessonContent } from "../../types/lesson-engine";

export const databasesLesson: LessonContent = {
  id: "databases",
  curriculumLessonId: "databases",
  version: 1,
  title: "Databases & SQL for Machine Learning",
  description: "Relational modeling, SQL queries, and data extraction pipelines for AI training sets.",
  estimatedMinutes: 20,
  difficulty: "Intermediate",
  xp: 120,
  prerequisites: ["machine-learning"],
  learningObjectives: [
    "Design relational schemas that prevent data redundancy across entities.",
    "Extract clean feature subsets using SELECT, WHERE, and aggregation functions.",
    "Combine entity tables with observation logs using relational JOIN operations.",
  ],
  sections: [
    {
      id: "understand",
      title: "Relational Architecture for Data Science",
      stage: "Understand",
      blocks: [
        {
          id: "db-intro",
          type: "introduction",
          title: "The Source of Truth",
          paragraphs: [
            "Before training models on clean NumPy tensors or pandas DataFrames, data lives in production databases. Relational databases organize enterprise data into structured tables with defined column schemas.",
            "SQL (Structured Query Language) is the declarative language used to filter, aggregate, and join these tables, transforming raw transactional records into machine learning feature matrices.",
          ],
        },
        {
          id: "db-intuition",
          type: "intuition",
          title: "Tables, Keys, and Normalization",
          paragraphs: [
            "Imagine keeping user profiles and user clicks in the same table. Storing user addresses with every click would create massive redundancy and inconsistency.",
            "Instead, a Primary Key uniquely identifies a record (e.g., `user_id = 42`). A Foreign Key in an `events` table references that primary key, linking events to the user without duplicating their details.",
          ],
        },
      ],
    },
    {
      id: "code-sql",
      title: "SQL Query Construction",
      stage: "Code",
      blocks: [
        {
          id: "sql-code-samples",
          type: "code",
          title: "Extracting Training Features with SQL",
          examples: [
            {
              language: "sql",
              label: "SQL Extraction",
              code: `-- Join users with activity events to build an engagement feature table
SELECT 
    u.user_id,
    u.country,
    COUNT(e.event_id) AS total_events,
    AVG(e.duration_seconds) AS avg_duration,
    MAX(e.created_at) AS last_active
FROM users u
INNER JOIN user_events e ON u.user_id = e.user_id
WHERE e.created_at >= '2026-01-01'
GROUP BY u.user_id, u.country
HAVING COUNT(e.event_id) >= 5
ORDER BY total_events DESC;`,
              highlightLines: [2, 8, 9, 10, 11],
            },
            {
              language: "python",
              label: "Python & SQLite",
              code: `import sqlite3
import pandas as pd

# Connect to database and extract directly into a DataFrame
conn = sqlite3.connect("production.db")
query = """
SELECT user_id, AVG(duration_seconds) AS avg_duration
FROM user_events
GROUP BY user_id;
"""

df_features = pd.read_sql_query(query, conn)
print(df_features.head())`,
              highlightLines: [5, 12],
            },
          ],
        },
      ],
    },
    {
      id: "worked-query",
      title: "Query Logic Breakdown",
      stage: "Apply",
      blocks: [
        {
          id: "worked-sql-aggregation",
          type: "worked-example",
          title: "Filtering and Aggregating User Engagement",
          problem:
            "A dataset of four transactions has values $[100, 250, 50, 400]$. A query filters for purchases greater than $50$ and calculates the average transaction size.",
          steps: [
            {
              title: "Apply the WHERE filter",
              text: "Filter out transactions with value $\\le 50$. This excludes $50$, leaving $[100, 250, 400]$.",
            },
            {
              title: "Count remaining rows",
              text: "The remaining subset contains $N = 3$ eligible records.",
            },
            {
              title: "Compute the AVG aggregate",
              text: "Sum the eligible values: $100 + 250 + 400 = 750$. Divide by $3$: $750 / 3 = 250$.",
            },
          ],
          interpretation:
            "Filtering before aggregation ensures that baseline outliers or test transactions do not bias model features.",
        },
      ],
    },
    {
      id: "practice-section",
      title: "Interactive Practice",
      stage: "Practice",
      blocks: [
        {
          id: "db-practice-block",
          type: "practice",
          problemIds: ["sql-count-filter", "sql-avg-calc"],
        },
      ],
    },
    {
      id: "quiz-section",
      title: "Knowledge Check",
      stage: "Assess",
      blocks: [
        {
          id: "db-quiz-block",
          type: "quiz",
          questionIds: ["primary-key-role", "where-vs-having", "inner-join-behavior"],
        },
      ],
    },
    {
      id: "summary-section",
      title: "Key Takeaways",
      stage: "Reflect",
      blocks: [
        {
          id: "db-summary-block",
          type: "summary",
          title: "Relational Data Foundations",
          takeaways: [
            "Primary keys uniquely identify rows; foreign keys maintain integrity across relationships.",
            "WHERE filters individual rows before grouping; HAVING filters aggregated groups.",
            "INNER JOIN retains only records with matching keys in both participating tables.",
            "Indexes dramatically accelerate query execution for large dataset extractions.",
          ],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "sql-count-filter",
      prompt:
        "Given 6 orders with totals $[30, 75, 120, 45, 150, 210]$, how many rows satisfy `WHERE total > 50`?",
      answer: 4,
      tolerance: 0,
      hint: "Check each number: is it strictly greater than 50? (75, 120, 150, 210)",
      explanation:
        "The 4 values greater than 50 are 75, 120, 150, and 210.",
    },
    {
      id: "sql-avg-calc",
      prompt:
        "For student exam scores $[70, 80, 90, 100]$, what is the exact result of `SELECT AVG(score)`?",
      answer: 85,
      tolerance: 0,
      hint: "Add the 4 scores together and divide by 4: $(70 + 80 + 90 + 100) / 4$.",
      explanation:
        "The sum is 340. $340 / 4 = 85.0$.",
    },
  ],
  quiz: [
    {
      id: "primary-key-role",
      prompt: "What is the primary function of a database Primary Key?",
      options: [
        "To uniquely identify each individual row in a table",
        "To encrypt sensitive student information",
        "To enforce that all numerical values are positive",
      ],
      answerIndex: 0,
      explanation:
        "A Primary Key guarantees uniqueness and prevents duplicate records in relational tables.",
    },
    {
      id: "where-vs-having",
      prompt: "What is the difference between WHERE and HAVING in SQL?",
      options: [
        "WHERE filters rows before aggregation; HAVING filters groups after aggregation",
        "WHERE only works on text; HAVING only works on numbers",
        "HAVING is executed first to filter table columns",
      ],
      answerIndex: 0,
      explanation:
        "WHERE filters rows prior to GROUP BY. HAVING evaluates conditions on aggregated values (e.g. `HAVING COUNT(*) > 5`).",
    },
    {
      id: "inner-join-behavior",
      prompt: "What records does an INNER JOIN return?",
      options: [
        "Only rows where the join condition finds matching keys in both tables",
        "All rows from the left table, padding missing right rows with NULL",
        "The Cartesian product of both tables regardless of keys",
      ],
      answerIndex: 0,
      explanation:
        "An INNER JOIN requires the predicate match on both sides, excluding unreferenced rows.",
    },
  ],
};
