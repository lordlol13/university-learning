"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Code,
  GraduationCap,
  PenLine,
  Play,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import type {
  LessonActivity,
  LessonBlock,
  LessonContent,
} from "@/types/lesson-engine";
import { useProgress, useProgressReady } from "@/stores/progress-provider";
import { emptyActivity, lessonCompletion } from "@/lib/lesson-progress";
import { MathFormula, RichText } from "./Math";
import { FormulaBreakdown } from "./FormulaBreakdown";
import {
  GradientDescentAlgorithm,
  GradientDescentGraph,
  GradientDescentProvider,
} from "./GradientDescentLab";
import { CodeExample } from "./CodeExample";
import { PracticeProblemCard, QuizQuestionCard } from "./Assessment";

const empty = emptyActivity();
function ObservedBlock({
  id,
  viewed,
  onView,
  children,
}: {
  id: string;
  viewed: boolean;
  onView: (id: string) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (viewed || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onView(id);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [id, viewed, onView]);
  return (
    <div ref={ref} className="lesson-block" data-block={id}>
      {children}
    </div>
  );
}
interface BlockProps {
  block: LessonBlock;
  lesson: LessonContent;
  activity: LessonActivity;
  record: (kind: keyof LessonActivity, id: string) => void;
}
/** Exhaustive discriminated renderer: adding a schema type requires an implementation. */
function ContentBlock({ block, lesson, activity, record }: BlockProps) {
  const completed = activity.completed.includes(block.id);
  switch (block.type) {
    case "introduction":
    case "intuition":
    case "theory":
      return (
        <div className={`lesson-prose ${block.type}`}>
          <h3>{block.title}</h3>
          {block.paragraphs.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
        </div>
      );
    case "formula":
      return (
        <div className="formula-card">
          <h3>{block.title}</h3>
          <MathFormula latex={block.latex} display />
          <p>
            <RichText text={block.explanation} />
          </p>
        </div>
      );
    case "formula-breakdown":
      return (
        <>
          <h3>{block.title}</h3>
          <FormulaBreakdown block={block} />
        </>
      );
    case "interactive-graph":
      return (
        <GradientDescentGraph
          completed={completed}
          onComplete={() => record("completed", block.id)}
        />
      );
    case "algorithm-visualizer":
      return (
        <>
          <h3>{block.title}</h3>
          <p className="lesson-caption">
            These controls explore the same state as the graph above, one
            operation at a time.
          </p>
          <GradientDescentAlgorithm
            completed={completed}
            onComplete={() => record("completed", block.id)}
          />
        </>
      );
    case "code":
      return (
        <>
          <h3>{block.title}</h3>
          <CodeExample examples={block.examples} />
        </>
      );
    case "worked-example":
      return (
        <div className="worked-example">
          <h3>{block.title}</h3>
          <p>
            <RichText text={block.problem} />
          </p>
          <ol>
            {block.steps.map((step, i) => (
              <li key={step.title}>
                <span className="worked-number">{i + 1}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>
                    <RichText text={step.text} />
                  </p>
                  {step.latex && <MathFormula latex={step.latex} display />}
                </div>
              </li>
            ))}
          </ol>
          <div className="lesson-insight">
            <Sparkles size={20} />
            <p>
              <RichText text={block.interpretation} />
            </p>
          </div>
        </div>
      );
    case "practice":
      return (
        <>
          {block.problemIds.map((id, i) => {
            const problem = lesson.practiceProblems.find((p) => p.id === id);
            if (!problem) throw new Error(`Unknown practice problem ${id}`);
            return (
              <PracticeProblemCard
                key={id}
                problem={problem}
                number={i + 1}
                completed={activity.practice.includes(id)}
                onCorrect={() => {
                  record("practice", id);
                  if (
                    block.problemIds.every(
                      (p) => p === id || activity.practice.includes(p),
                    )
                  )
                    record("completed", block.id);
                }}
              />
            );
          })}
        </>
      );
    case "quiz":
      return (
        <>
          {block.questionIds.map((id, i) => {
            const question = lesson.quiz.find((q) => q.id === id);
            if (!question) throw new Error(`Unknown quiz question ${id}`);
            return (
              <QuizQuestionCard
                key={id}
                question={question}
                number={i + 1}
                completed={activity.quiz.includes(id)}
                onCorrect={() => {
                  record("quiz", id);
                  if (
                    block.questionIds.every(
                      (q) => q === id || activity.quiz.includes(q),
                    )
                  )
                    record("completed", block.id);
                }}
              />
            );
          })}
        </>
      );
    case "summary":
      return (
        <div className="summary-block">
          <span className="summary-icon">
            <GraduationCap size={32} />
          </span>
          <h3>{block.title}</h3>
          <ul>
            {block.takeaways.map((item, i) => (
              <li key={i}>
                <Check size={19} />
                <span>
                  <RichText text={item} />
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="#lesson-section"
            onClick={() =>
              document
                .querySelector<HTMLButtonElement>('[data-section="practice"]')
                ?.click()
            }
            className="lesson-btn"
          >
            Revisit practice <ArrowRight size={16} />
          </Link>
        </div>
      );
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}
function SimulationScope({
  blocks,
  children,
}: {
  blocks: LessonBlock[];
  children: ReactNode;
}) {
  // Group shared simulation IDs at the section boundary. Additional visualizations can
  // register their own provider here without changing the content renderer.
  const simulation = blocks.find(
    (b) => b.type === "interactive-graph" || b.type === "algorithm-visualizer",
  );
  return simulation &&
    (simulation.type === "interactive-graph" ||
      simulation.type === "algorithm-visualizer") ? (
    <GradientDescentProvider
      key={simulation.simulationId}
      {...simulation.parameters}
    >
      {children}
    </GradientDescentProvider>
  ) : (
    children
  );
}
type StageKind = "quiz" | "video" | "code" | "practice" | "lesson";

function getSectionStageKind(section: LessonContent["sections"][number]): {
  kind: StageKind;
  label: string;
} {
  const stage = (section.stage || "").toLowerCase();
  const title = (section.title || "").toLowerCase();
  const types = section.blocks.map((b) => b.type);

  // 1. Test / Quiz / Assess -> question mark
  if (
    types.includes("quiz") ||
    stage.includes("assess") ||
    stage.includes("test") ||
    stage.includes("quiz") ||
    title.includes("quiz") ||
    title.includes("test") ||
    title.includes("тест") ||
    title.includes("проверк")
  ) {
    return { kind: "quiz", label: "Quiz / Test" };
  }

  // 2. Video / Interactive simulation / Visualizer -> play triangle
  if (
    types.includes("interactive-graph") ||
    types.includes("algorithm-visualizer") ||
    stage.includes("visualize") ||
    stage.includes("experiment") ||
    title.includes("visualiz") ||
    title.includes("simulat") ||
    title.includes("видео")
  ) {
    return { kind: "video", label: "Interactive / Video" };
  }

  // 3. Code / Implementation -> code icon
  if (
    types.includes("code") ||
    stage.includes("code") ||
    stage.includes("implement") ||
    title.includes("code") ||
    title.includes("код")
  ) {
    return { kind: "code", label: "Code" };
  }

  // 4. Practice / Applied problems -> practice icon
  if (
    types.includes("practice") ||
    types.includes("worked-example") ||
    stage.includes("practice") ||
    stage.includes("apply") ||
    title.includes("practice") ||
    title.includes("практик")
  ) {
    return { kind: "practice", label: "Practice" };
  }

  // 5. Default: Lesson / Theory -> empty circle
  return { kind: "lesson", label: "Lesson" };
}

export function LessonRenderer({
  lesson,
  directionId,
  onReturn,
}: {
  lesson: LessonContent;
  directionId: string;
  onReturn?: () => void;
}) {
  const [sectionIndex, setSectionIndex] = useState(0),
    [finished, setFinished] = useState(false),
    [completionError, setCompletionError] = useState(false);
  const key = `${lesson.id}:v${lesson.version}`;
  const ready = useProgressReady(),
    activity = useProgress((s) => s.lessonActivities?.[key] ?? empty),
    recordActivity = useProgress((s) => s.recordLessonActivity);
  const alreadyCompleted = useProgress((s) =>
    s.completedLessons.includes(lesson.curriculumLessonId),
  );
  const startLesson = useProgress((s) => s.startLesson),
    completeLesson = useProgress((s) => s.completeLesson);
  const record = useCallback(
    (kind: keyof LessonActivity, id: string) => {
      if (ready) recordActivity(key, kind, id);
    },
    [key, ready, recordActivity],
  );
  const onView = useCallback((id: string) => record("viewed", id), [record]);
  const section = lesson.sections[sectionIndex],
    progress = lessonCompletion(lesson, activity);
  const sectionDone = (index: number) =>
    lesson.sections[index].blocks.every((b) =>
      activity.completed.includes(b.id),
    );
  const goto = (index: number) => {
    setSectionIndex(index);
    window.requestAnimationFrame(() =>
      document
        .getElementById("lesson-section")
        ?.scrollIntoView({ block: "start" }),
    );
  };
  const readingBlocks = section.blocks.filter(
    (b) =>
      ![
        "interactive-graph",
        "algorithm-visualizer",
        "practice",
        "quiz",
      ].includes(b.type),
  );
  const sectionPracticeProblems = section.blocks.flatMap((b) =>
    b.type === "practice" ? b.problemIds : [],
  );
  const sectionQuizQuestions = section.blocks.flatMap((b) =>
    b.type === "quiz" ? b.questionIds : [],
  );
  const completedPracticeCount = sectionPracticeProblems.filter((id) =>
    activity.practice.includes(id),
  ).length;
  const completedQuizCount = sectionQuizQuestions.filter((id) =>
    activity.quiz.includes(id),
  ).length;
  const allRead = readingBlocks.every((b) => activity.viewed.includes(b.id));
  const acknowledge = () => {
    readingBlocks.forEach((b) => record("completed", b.id));
    if (sectionIndex < lesson.sections.length - 1) goto(sectionIndex + 1);
  };
  const finish = () => {
    if (!progress.complete) return;
    if (alreadyCompleted) {
      setFinished(true);
      return;
    }
    if (
      startLesson(lesson.curriculumLessonId) &&
      completeLesson(lesson.curriculumLessonId)
    )
      setFinished(true);
    else setCompletionError(true);
  };
  const back = onReturn ? (
    <button className="back-link" onClick={onReturn}>
      <ArrowLeft size={15} />
      Back to your path
    </button>
  ) : (
    <Link href={`/path/${directionId}`} className="back-link">
      <ArrowLeft size={15} />
      Back to your path
    </Link>
  );
  if (finished)
    return (
      <div className="lesson-engine lesson-finished">
        <div className="lesson-finished-card">
          <span className="summary-icon">
            <GraduationCap size={44} />
          </span>
          <span className="lesson-kicker">
            UNDERSTOOD. EXPLORED. PUT INTO PRACTICE.
          </span>
          <h1>A new idea, made yours.</h1>
          <p>
            You completed {lesson.title}. Your lesson progress is saved and your
            course path is up to date.
          </p>
          <span className="lesson-reward">
            <Star size={20} />
            {lesson.xp} XP · earned once
          </span>
          {back}
        </div>
      </div>
    );
  return (
    <div className="lesson-engine">
      {/* Sleek Minimalist Sticky Top Navigation Bar */}
      <header className="task-minimal-topbar">
        <div className="task-topbar-left">
          {/* Minimalist Step Tracker Bar */}
          <div
            className="minimal-step-nav"
            role="tablist"
            aria-label="Lesson step progress"
          >
            {lesson.sections.map((s, i) => {
              const isDone = sectionDone(i);
              const isActive = i === sectionIndex;
              const stageInfo = getSectionStageKind(s);
              const statusLabel = isDone
                ? "Completed"
                : isActive
                  ? "Current step"
                  : "Upcoming step";
              return (
                <div key={s.id} className="minimal-step-item">
                  {i > 0 && (
                    <div
                      className={`minimal-step-line ${sectionDone(i - 1) ? "done" : ""}`}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    role="tab"
                    data-section={s.id}
                    data-kind={stageInfo.kind}
                    aria-selected={isActive}
                    aria-label={`Step ${i + 1}: ${s.title} (${stageInfo.label}, ${statusLabel})`}
                    className={`minimal-step-btn ${isDone ? "done" : isActive ? "active" : "pending"} kind-${stageInfo.kind}`}
                    onClick={() => goto(i)}
                    title={`Step ${i + 1}: ${s.title} · ${stageInfo.label} (${statusLabel})`}
                  >
                    {isDone ? (
                      <Check size={16} strokeWidth={3} className="step-icon-check" />
                    ) : stageInfo.kind === "quiz" ? (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="step-icon-question"
                      >
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
                      </svg>
                    ) : stageInfo.kind === "video" ? (
                      <Play
                        size={14}
                        fill="currentColor"
                        strokeWidth={0}
                        style={{ marginLeft: 2.5 }}
                        className="step-icon-play"
                        aria-hidden="true"
                      />
                    ) : stageInfo.kind === "code" ? (
                      <Code size={16} strokeWidth={2.4} className="step-icon-code" aria-hidden="true" />
                    ) : stageInfo.kind === "practice" ? (
                      <PenLine size={15} strokeWidth={2.2} className="step-icon-practice" aria-hidden="true" />
                    ) : (
                      <span
                        className={`step-icon-empty ${isActive ? "step-active-dot" : ""}`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <span className="minimal-step-counter">
            Step {sectionIndex + 1}/{lesson.sections.length} · {section.stage}
          </span>

          <div className="task-topbar-divider" aria-hidden="true" />

          {/* Minimalist Lesson Info Chips */}
          <div className="minimal-lesson-info">
            <h1 className="minimal-lesson-title">{lesson.title}</h1>
            <div className="minimal-meta-chips">
              <span className="minimal-chip">
                <Clock3 size={11} />
                {lesson.estimatedMinutes}m
              </span>
              <span className="minimal-chip">
                <BookOpen size={11} />
                {lesson.difficulty}
              </span>
              <span className="minimal-chip xp">
                <Star size={11} />
                +{lesson.xp} XP{alreadyCompleted ? " · earned" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="task-topbar-right">
          <div className="task-progress-pill">
            <span className="task-progress-value">{progress.percent}%</span>
            {ready && (
              <span className="task-save-indicator" title="Progress saved on this device">
                <span className="live-dot" />
                Saved
              </span>
            )}
          </div>

          {onReturn ? (
            <button
              onClick={onReturn}
              className="task-close-btn"
              aria-label="Exit lesson"
              title="Exit lesson (Esc)"
            >
              <X size={17} />
              <span>Exit</span>
            </button>
          ) : (
            <Link
              href={`/path/${directionId}`}
              className="task-close-btn"
              aria-label="Exit lesson"
              title="Back to path"
            >
              <X size={17} />
              <span>Exit</span>
            </Link>
          )}
        </div>
      </header>

      <div className="engine-layout">
        <div className="lesson-main" id="lesson-section" tabIndex={-1}>

          <div className="section-heading">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <span className="lesson-kicker">
                {String(sectionIndex + 1).padStart(2, "0")} /{" "}
                {String(lesson.sections.length).padStart(2, "0")} ·{" "}
                {section.stage.toUpperCase()}
              </span>
              {sectionPracticeProblems.length > 0 ? (
                <span className="lesson-kicker" style={{ color: completedPracticeCount === sectionPracticeProblems.length ? "#2b803d" : "#956c16" }}>
                  {completedPracticeCount === sectionPracticeProblems.length
                    ? "✓ ALL PROBLEMS SOLVED"
                    : `${completedPracticeCount} / ${sectionPracticeProblems.length} SOLVED`}
                </span>
              ) : sectionQuizQuestions.length > 0 ? (
                <span className="lesson-kicker" style={{ color: completedQuizCount === sectionQuizQuestions.length ? "#2b803d" : "#956c16" }}>
                  {completedQuizCount === sectionQuizQuestions.length
                    ? "✓ ALL QUESTIONS ANSWERED"
                    : `${completedQuizCount} / ${sectionQuizQuestions.length} ANSWERED`}
                </span>
              ) : null}
            </div>
            <h2>{section.title}</h2>
            {sectionIndex === 0 && (
              <p>
                Before the equations, let’s give the idea somewhere to land.
              </p>
            )}
          </div>
          {sectionIndex === 0 && (
            <div className="learning-objectives">
              <span className="lesson-kicker">
                BY THE END, YOU’LL BE ABLE TO
              </span>
              {lesson.learningObjectives.map((o, i) => (
                <p key={i}>
                  <span>{i + 1}</span>
                  <RichText text={o} />
                </p>
              ))}
            </div>
          )}
          <SimulationScope key={section.id} blocks={section.blocks}>
            {section.blocks.map((block) => (
              <ObservedBlock
                key={block.id}
                id={block.id}
                viewed={activity.viewed.includes(block.id)}
                onView={onView}
              >
                <ContentBlock
                  block={block}
                  lesson={lesson}
                  activity={activity}
                  record={record}
                />
              </ObservedBlock>
            ))}
          </SimulationScope>
          <div className="section-footer">
            <button
              className="lesson-btn subtle"
              disabled={sectionIndex === 0}
              onClick={() => goto(sectionIndex - 1)}
            >
              <ArrowLeft size={16} /> Previous
            </button>
            {readingBlocks.length > 0 && !sectionDone(sectionIndex) ? (
              <button
                className="lesson-btn primary"
                disabled={!ready || !allRead}
                onClick={acknowledge}
              >
                {allRead
                  ? "I understand this section"
                  : "Read the blocks above"}
                <Check size={16} />
              </button>
            ) : sectionIndex < lesson.sections.length - 1 ? (
              <button
                className="lesson-btn primary"
                disabled={!sectionDone(sectionIndex)}
                onClick={() => goto(sectionIndex + 1)}
              >
                {sectionDone(sectionIndex)
                  ? "Continue"
                  : sectionPracticeProblems.length > 0
                    ? `Solve problems (${completedPracticeCount}/${sectionPracticeProblems.length})`
                    : sectionQuizQuestions.length > 0
                      ? `Answer questions (${completedQuizCount}/${sectionQuizQuestions.length})`
                      : "Complete section activity"}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="lesson-btn primary"
                disabled={!progress.complete}
                onClick={finish}
              >
                {alreadyCompleted ? "Finish review" : "Complete lesson"}
                <Check size={16} />
              </button>
            )}
          </div>
          {sectionIndex === lesson.sections.length - 1 &&
            !progress.complete && (
              <div className="completion-requirements">
                <p>Finish the remaining activities to complete this lesson:</p>
                {lesson.sections.map((s, i) =>
                  !sectionDone(i) ? (
                    <button
                      className="lesson-btn"
                      key={s.id}
                      onClick={() => goto(i)}
                    >
                      {s.title}
                      <ArrowRight size={15} />
                    </button>
                  ) : null,
                )}
              </div>
            )}
          {completionError && (
            <p role="alert">
              Your course prerequisites have changed. Return to the path to
              check your next available lesson.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
