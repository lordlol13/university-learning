"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  LockKeyhole,
  PartyPopper,
  Star,
} from "lucide-react";
import { getLesson } from "@/data/curriculum";
import { useProgress } from "@/stores/progress-provider";
import { getLessonStatus } from "@/stores/progress-store";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import type { Lesson } from "@/types/curriculum";
import { LessonRenderer } from "./LessonRenderer";
import { getLessonContent } from "@/data/lessons";

export function LessonView({
  lesson,
  directionId,
  onReturn,
}: {
  lesson: Lesson;
  directionId: string;
  onReturn?: () => void;
}) {
  const state = useProgress((s) => s);
  const status = getLessonStatus(lesson, state);
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const correct = answer === lesson.content.answerIndex;
  const finish = () => {
    if (!correct) return;
    if (status === "completed") {
      setFinished(true);
      return;
    }
    if (state.startLesson(lesson.id) && state.completeLesson(lesson.id)) {
      setAwarded(true);
      setFinished(true);
    }
  };
  if (status === "locked")
    return (
      <div className="standard-page">
        <Link href={`/path/${directionId}`} className="back-link">
          <ArrowLeft size={16} />
          Back to your path
        </Link>
        <div className="panel-card empty-state">
          <span className="empty-icon">
            <LockKeyhole size={34} />
          </span>
          <h1>A little further along your path.</h1>
          <p>
            Complete{" "}
            {lesson.prerequisites
              .map((id) => getLesson(id)?.title)
              .join(" and ")}{" "}
            to unlock {lesson.title}.
          </p>
          <Link href={`/path/${directionId}`} className="button primary">
            Continue your journey
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  const interactiveContent = getLessonContent(lesson.id);
  if (interactiveContent)
    return (
      <LessonRenderer
        lesson={interactiveContent}
        directionId={directionId}
        onReturn={onReturn}
      />
    );
  if (finished)
    return (
      <div className="standard-page">
        <section className="panel-card completion-card">
          <span className="completion-icon">
            <PartyPopper size={44} />
          </span>
          <span className="eyebrow">ONE STEP FURTHER</span>
          <h1>{awarded ? "Look at you grow!" : "Looking sharp!"}</h1>
          <p>
            {lesson.title}{" "}
            {awarded
              ? "is complete. Your next lesson is ready when you are."
              : "reviewed. Keeping your foundations strong looks good on you."}
          </p>
          {awarded && (
            <span className="reward">
              <Star size={23} fill="currentColor" />+{lesson.xp} XP
            </span>
          )}
          {onReturn ? (
            <button className="button primary" onClick={onReturn}>
              Back to your path
              <ArrowRight size={17} />
            </button>
          ) : (
            <Link href={`/path/${directionId}`} className="button primary">
              Back to your path
              <ArrowRight size={17} />
            </Link>
          )}
        </section>
      </div>
    );
  return (
    <div className="standard-page lesson-page">
      {onReturn ? (
        <button onClick={onReturn} className="back-link">
          <ArrowLeft size={16} />
          Back to your path
        </button>
      ) : (
        <Link href={`/path/${directionId}`} className="back-link">
          <ArrowLeft size={16} />
          Back to your path
        </Link>
      )}
      <div className="lesson-page-heading">
        <span className="lesson-page-icon">
          <CurriculumIcon name={lesson.icon} size={35} />
        </span>
        <div>
          <span className="eyebrow">
            {status === "completed"
              ? "LESSON REVIEW"
              : "LET’S LEARN SOMETHING NEW"}
          </span>
          <h1>{lesson.title}</h1>
        </div>
      </div>
      <div className="lesson-page-meta">
        <span>
          <Clock3 size={15} />
          {lesson.durationMinutes} min
        </span>
        <span>
          <Star size={15} />
          {lesson.xp} XP
          {status === "completed" ? " · already earned" : " reward"}
        </span>
        <span>Introductory demo</span>
      </div>
      <section className="panel-card lesson-content">
        <h2>The big idea</h2>
        <p>{lesson.content.introduction}</p>
        <h3>What you’ll take away</h3>
        <ul>
          {lesson.content.takeaways.map((item) => (
            <li key={item}>
              <CircleCheck size={18} />
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="panel-card quiz-card">
        {onReturn && status === "current" && (
          <details className="lesson-demo-controls">
            <summary>Try the progress demo</summary>
            <p>
              Simulate this lesson’s completion to see XP, unlocking, and your
              companion’s journey. This updates your local demo progress.
            </p>
            <button
              className="button secondary"
              onClick={() => {
                if (state.startLesson(lesson.id))
                  state.completeLesson(lesson.id);
              }}
            >
              Simulate completion · +{lesson.xp} XP
              <Check size={16} />
            </button>
          </details>
        )}
        <span className="eyebrow">CHECK YOUR UNDERSTANDING</span>
        <fieldset>
          <legend>{lesson.content.question}</legend>
          <div className="answer-options">
            {lesson.content.options.map((option, index) => (
              <label
                key={option}
                className={`answer-option ${answer === index ? "selected" : ""} ${checked && answer === index ? (correct ? "correct" : "incorrect") : ""}`}
              >
                <input
                  type="radio"
                  name={`answer-${lesson.id}`}
                  checked={answer === index}
                  onChange={() => {
                    setAnswer(index);
                    setChecked(false);
                  }}
                  disabled={checked && correct}
                />
                <span>{String.fromCharCode(65 + index)}</span>
                {option}
                {checked && correct && answer === index && <Check size={18} />}
              </label>
            ))}
          </div>
        </fieldset>
        {checked && (
          <div
            className={`answer-feedback ${correct ? "correct" : "incorrect"}`}
            role="status"
          >
            <strong>
              {correct ? "That’s right!" : "Not quite. Give it another try."}
            </strong>
            <p>
              {correct
                ? lesson.content.explanation
                : "Think back to the big idea above, then choose a different answer."}
            </p>
          </div>
        )}
        <div className="quiz-footer">
          <span>Take your time. This is how you learn.</span>
          {checked && correct ? (
            <button className="button primary" onClick={finish}>
              {status === "completed" ? "Finish review" : "Complete lesson"}
              <Check size={17} />
            </button>
          ) : (
            <button
              className="button primary"
              disabled={answer === null}
              onClick={() => setChecked(true)}
            >
              Check answer
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
