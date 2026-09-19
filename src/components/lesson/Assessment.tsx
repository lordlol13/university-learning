"use client";
import { useState } from "react";
import { Check, Lightbulb } from "lucide-react";
import type { PracticeProblem, QuizQuestion } from "@/types/lesson-engine";
import { RichText } from "./Math";

export function PracticeProblemCard({
  problem,
  completed,
  onCorrect,
  number,
}: {
  problem: PracticeProblem;
  completed: boolean;
  onCorrect: () => void;
  number: number;
}) {
  const [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null),
    [hint, setHint] = useState(false);
  return (
    <form
      className="assessment-card"
      onSubmit={(e) => {
        e.preventDefault();
        const value = Number(answer.trim());
        const correct =
          answer.trim() !== "" &&
          Number.isFinite(value) &&
          Math.abs(value - problem.answer) <= problem.tolerance;
        setFeedback(correct ? "correct" : "incorrect");
        if (correct) onCorrect();
      }}
    >
      <span className="lesson-kicker">
        PROBLEM {number.toString().padStart(2, "0")}
        {completed ? " · COMPLETED" : ""}
      </span>
      <p>
        <RichText text={problem.prompt} />
      </p>
      <label className="answer-label" htmlFor={`practice-${problem.id}`}>
        Your numerical answer
      </label>
      <div className="numeric-answer">
        <input
          id={`practice-${problem.id}`}
          inputMode="decimal"
          autoComplete="off"
          placeholder="e.g. 2.5"
          value={answer}
          disabled={completed}
          onChange={(e) => {
            setAnswer(e.target.value);
            setFeedback(null);
          }}
        />
        <button
          className="lesson-btn primary"
          disabled={completed || !answer.trim()}
        >
          {completed ? (
            <>
              <Check size={16} /> Solved
            </>
          ) : (
            "Check answer"
          )}
        </button>
      </div>
      <button
        type="button"
        className="hint-button"
        aria-expanded={hint}
        onClick={() => setHint((h) => !h)}
      >
        <Lightbulb size={16} />
        {hint ? "Hide hint" : "A little hint"}
      </button>
      {hint && (
        <p className="assessment-hint">
          <RichText text={problem.hint} />
        </p>
      )}
      {(feedback || completed) && (
        <div
          className={`assessment-feedback ${completed ? "correct" : "incorrect"}`}
          role="status"
        >
          <strong>
            {completed ? "That’s it. Here’s why:" : "Not quite yet."}
          </strong>
          <p>
            <RichText
              text={
                completed
                  ? problem.explanation
                  : "Recalculate the gradient and the update separately. You can use the hint and try again."
              }
            />
          </p>
        </div>
      )}
    </form>
  );
}
export function QuizQuestionCard({
  question,
  completed,
  onCorrect,
  number,
}: {
  question: QuizQuestion;
  completed: boolean;
  onCorrect: () => void;
  number: number;
}) {
  const [selected, setSelected] = useState<number | null>(
      completed ? question.answerIndex : null,
    ),
    [checked, setChecked] = useState(false);
  return (
    <form
      className="assessment-card"
      onSubmit={(e) => {
        e.preventDefault();
        setChecked(true);
        if (selected === question.answerIndex) onCorrect();
      }}
    >
      <fieldset>
        <legend>
          <span className="lesson-kicker">
            QUESTION {number.toString().padStart(2, "0")}
            {completed ? " · COMPLETED" : ""}
          </span>
          <RichText text={question.prompt} />
        </legend>
        <div className="lesson-options">
          {question.options.map((option, index) => (
            <label
              key={option}
              className={`${selected === index ? "selected" : ""} ${completed && index === question.answerIndex ? "correct" : ""}`}
            >
              <input
                type="radio"
                name={question.id}
                value={index}
                checked={selected === index}
                disabled={completed}
                onChange={() => {
                  setSelected(index);
                  setChecked(false);
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        className="lesson-btn primary"
        disabled={selected === null || completed}
      >
        {completed ? (
          <>
            <Check size={16} /> Correct
          </>
        ) : (
          "Check answer"
        )}
      </button>
      {(checked || completed) && (
        <div
          className={`assessment-feedback ${completed ? "correct" : "incorrect"}`}
          role="status"
        >
          <strong>
            {completed ? "You’ve got it." : "Try another approach."}
          </strong>
          <p>
            <RichText
              text={
                completed
                  ? question.explanation
                  : "Think about the update rule and what it does to the distance from the minimum. You can revisit the lab before trying again."
              }
            />
          </p>
        </div>
      )}
    </form>
  );
}
