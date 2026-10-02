"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Lightbulb, MessageCircle } from "lucide-react";
import type { PracticeProblem, QuizQuestion } from "@/types/lesson-engine";
import { RichText } from "./Math";

function TypewriterText({
  text,
  speed = 25,
  onComplete,
  skipAnimation = false,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  skipAnimation?: boolean;
}) {
  const [phase, setPhase] = useState<"typing" | "showing">(
    skipAnimation ? "showing" : "typing"
  );

  useEffect(() => {
    if (skipAnimation) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setPhase("showing");
      if (onComplete) {
        // brief delay for state propagation
        setTimeout(onComplete, 10);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [skipAnimation, onComplete]);

  if (phase === "typing") {
    return (
      <div className="chat-typing-indicator">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </div>
    );
  }

  return (
    <div className="chat-fade-in">
      <RichText text={text} />
    </div>
  );
}

export function ChatQuizQuestion({
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
  const [textReady, setTextReady] = useState(completed);
  const [selected, setSelected] = useState<number | null>(
    completed ? question.answerIndex : null
  );
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    completed ? "correct" : null
  );

  const handleComplete = useCallback(() => {
    setTextReady(true);
  }, []);

  const handleSelect = (index: number) => {
    if (completed) return;
    setSelected(index);
    const isCorrect = index === question.answerIndex;
    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) onCorrect();
  };

  return (
    <div className="chat-assessment">
      <div className="chat-bubble assistant">
        <span className="lesson-kicker">
          QUESTION {number.toString().padStart(2, "0")}
          {completed ? " · COMPLETED" : ""}
        </span>
        <TypewriterText
          text={question.prompt}
          speed={25}
          onComplete={handleComplete}
          skipAnimation={completed}
        />
      </div>

      {textReady && (
        <div className="chat-options">
          {question.options.map((option, index) => {
            const staggerClass = `chat-stagger-${Math.min(index + 1, 4)}`;
            const isSelected = selected === index;
            const isCorrect = completed && index === question.answerIndex;
            const isIncorrect = isSelected && feedback === "incorrect";

            return (
              <button
                key={option}
                className={`chat-chip chat-fade-in ${staggerClass} ${
                  isSelected ? "selected" : ""
                } ${isCorrect ? "correct" : ""} ${
                  isIncorrect ? "incorrect" : ""
                }`}
                disabled={completed}
                onClick={() => handleSelect(index)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {(feedback || completed) && (
        <div
          className={`chat-bubble feedback ${
            completed || feedback === "correct" ? "correct" : "incorrect"
          } chat-fade-in chat-stagger-1`}
        >
          <strong>
            {completed || feedback === "correct"
              ? "You’ve got it."
              : "Try another approach."}
          </strong>
          <p>
            <RichText
              text={
                completed || feedback === "correct"
                  ? question.explanation
                  : "Think about the update rule and what it does to the distance from the minimum. You can revisit the lab before trying again."
              }
            />
          </p>
        </div>
      )}
    </div>
  );
}

export function ChatPracticeProblem({
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
  const [textReady, setTextReady] = useState(completed);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    completed ? "correct" : null
  );
  const [hint, setHint] = useState(false);

  const handleComplete = useCallback(() => {
    setTextReady(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completed || !answer.trim()) return;

    const value = Number(answer.trim());
    const correct =
      Number.isFinite(value) &&
      Math.abs(value - problem.answer) <= problem.tolerance;

    setFeedback(correct ? "correct" : "incorrect");
    if (correct) onCorrect();
  };

  return (
    <div className="chat-assessment">
      <div className="chat-bubble assistant">
        <span className="lesson-kicker">
          PROBLEM {number.toString().padStart(2, "0")}
          {completed ? " · COMPLETED" : ""}
        </span>
        <TypewriterText
          text={problem.prompt}
          speed={25}
          onComplete={handleComplete}
          skipAnimation={completed}
        />
      </div>

      {textReady && (
        <div className="chat-fade-in chat-stagger-1">
          <button
            type="button"
            className="chat-hint-toggle"
            aria-expanded={hint}
            onClick={() => setHint((h) => !h)}
          >
            <Lightbulb size={16} />
            {hint ? "Hide hint" : "A little hint"}
          </button>

          {hint && (
            <div className="chat-bubble assistant chat-hint-content chat-fade-in">
              <RichText text={problem.hint} />
            </div>
          )}

          <form className="chat-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Your numerical answer..."
              value={answer}
              disabled={completed}
              onChange={(e) => {
                setAnswer(e.target.value);
                setFeedback(null);
              }}
            />
            <button
              type="submit"
              className="lesson-btn primary"
              disabled={completed || !answer.trim()}
            >
              {completed ? (
                <>
                  <Check size={16} /> Solved
                </>
              ) : (
                <MessageCircle size={16} />
              )}
            </button>
          </form>
        </div>
      )}

      {(feedback || completed) && (
        <div
          className={`chat-bubble feedback ${
            completed || feedback === "correct" ? "correct" : "incorrect"
          } chat-fade-in chat-stagger-1`}
        >
          <strong>
            {completed || feedback === "correct"
              ? "That’s it. Here’s why:"
              : "Not quite yet."}
          </strong>
          <p>
            <RichText
              text={
                completed || feedback === "correct"
                  ? problem.explanation
                  : "Recalculate the gradient and the update separately. You can use the hint and try again."
              }
            />
          </p>
        </div>
      )}
    </div>
  );
}
