"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Shuffle,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";
import {
  getAllRepeatTasks,
  getRepeatThemes,
  savePracticeSession,
  validateRepeatAnswer,
  type PracticeSession,
  type RepeatTask,
} from "@/lib/repeat-tasks";
import { RichText } from "@/components/lesson/Math";
import { useProgress } from "@/stores/progress-provider";

export function RepeatTasksView({
  initialThemeId,
  initialDirectionId,
  onClose,
}: {
  initialThemeId?: string;
  initialDirectionId?: string;
  onClose?: () => void;
}) {
  const state = useProgress((s) => s);
  const [filterMode, setFilterMode] = useState<"completed" | "all">(
    initialThemeId
      ? "all"
      : state.completedLessons && state.completedLessons.length > 0
        ? "completed"
        : "all",
  );

  const completedThemes = useMemo(
    () =>
      getRepeatThemes(
        Array.isArray(state.completedLessons)
          ? state.completedLessons.filter(
              (id): id is string =>
                typeof id === "string" && id.trim().length > 0,
            )
          : [],
      ),
    [state.completedLessons],
  );
  const allThemes = useMemo(() => getRepeatThemes(), []);

  const safeCompletedLessons = useMemo(() => {
    return Array.isArray(state.completedLessons)
      ? state.completedLessons.filter(
          (id): id is string => typeof id === "string" && id.trim().length > 0,
        )
      : [];
  }, [state.completedLessons]);

  const availableTasks = useMemo(() => {
    if (filterMode === "completed") {
      return getAllRepeatTasks(safeCompletedLessons);
    }
    return getAllRepeatTasks();
  }, [filterMode, safeCompletedLessons]);

  const currentThemes = useMemo(() => {
    return filterMode === "completed" ? completedThemes : allThemes;
  }, [filterMode, completedThemes, allThemes]);

  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    initialThemeId ?? "all",
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // User input states for active task
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [numericInput, setNumericInput] = useState<string>("");
  const [isChecked, setIsChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [locallySolved, setLocallySolved] = useState<Set<string>>(new Set());
  const [earnedXp, setEarnedXp] = useState(0);

  // Practice session state
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, boolean>>({});
  const [sessionXpEarned, setSessionXpEarned] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [currentSessionSummary, setCurrentSessionSummary] = useState<PracticeSession | null>(null);

  const solvedTasks = useMemo(() => {
    if (!mounted) return locallySolved;
    try {
      const stored = localStorage.getItem("uplift_solved_repeat_tasks");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const set = new Set<string>(
            parsed.filter(
              (id): id is string =>
                typeof id === "string" && id.trim().length > 0,
            ),
          );
          locallySolved.forEach((id) => set.add(id));
          return set;
        }
      }
    } catch {}
    return locallySolved;
  }, [mounted, locallySolved]);

  // Filter tasks based on theme and direction
  const activeTasks = useMemo(() => {
    let list = availableTasks;
    if (selectedThemeId !== "all") {
      list = list.filter((t) => t.themeId === selectedThemeId);
    } else if (initialDirectionId) {
      list = list.filter((t) => t.directionId === initialDirectionId);
    }
    return list;
  }, [availableTasks, selectedThemeId, initialDirectionId]);

  const safeCurrentIndex = Math.min(
    currentIndex,
    Math.max(0, activeTasks.length - 1),
  );
  const currentTask: RepeatTask | undefined = activeTasks[safeCurrentIndex];

  const resetTaskInput = () => {
    setSelectedOption(null);
    setNumericInput("");
    setIsChecked(false);
    setShowHint(false);
  };

  const handleFilterModeChange = (mode: "completed" | "all") => {
    setFilterMode(mode);
    setSelectedThemeId("all");
    setCurrentIndex(0);
    resetTaskInput();
    setIsSessionComplete(false);
  };

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    setCurrentIndex(0);
    resetTaskInput();
    setIsSessionComplete(false);
  };

  const handleShuffle = () => {
    setCurrentIndex((prev) => (prev + 1) % (activeTasks.length || 1));
    resetTaskInput();
    setIsSessionComplete(false);
  };

  const handleCheckAnswer = useCallback(() => {
    if (!currentTask || isChecked) return;
    setIsChecked(true);

    const isCorrect = validateRepeatAnswer(
      currentTask,
      currentTask.kind === "quiz" ? selectedOption : numericInput,
    );

    setSessionAnswers((prev) => ({ ...prev, [currentTask.id]: isCorrect }));

    if (isCorrect && !solvedTasks.has(currentTask.id)) {
      setLocallySolved((prev) => {
        const next = new Set(prev).add(currentTask.id);
        try {
          const stored = localStorage.getItem("uplift_solved_repeat_tasks");
          let parsed: unknown = [];
          if (stored) {
            try {
              parsed = JSON.parse(stored);
            } catch {
              parsed = [];
            }
          }
          const set = Array.isArray(parsed)
            ? new Set<string>(
                parsed.filter(
                  (id): id is string =>
                    typeof id === "string" && id.trim().length > 0,
                ),
              )
            : new Set<string>();
          set.add(currentTask.id);
          localStorage.setItem(
            "uplift_solved_repeat_tasks",
            JSON.stringify(Array.from(set)),
          );
        } catch {}
        return next;
      });
      setEarnedXp((prev) => prev + 15);
      setSessionXpEarned((prev) => prev + 15);
      if (state.addXP) {
        state.addXP(15);
      }
    }
  }, [currentTask, isChecked, selectedOption, numericInput, solvedTasks, state]);

  const handleTryAgain = useCallback(() => {
    setIsChecked(false);
    if (currentTask?.kind === "quiz") {
      setSelectedOption(null);
    }
    // Note: numericInput is intentionally retained on practice questions so learners can fix typos
  }, [currentTask]);

  const handleCompleteSession = useCallback(() => {
    const totalQuestions = activeTasks.length;
    const correctCount = activeTasks.filter(
      (t) => sessionAnswers[t.id] === true,
    ).length;
    const scorePercent =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    const selectedTheme = currentThemes.find((t) => t.id === selectedThemeId);
    const themeTitle =
      selectedThemeId === "all"
        ? filterMode === "completed"
          ? "Completed Units"
          : "All Units"
        : selectedTheme?.title ?? selectedThemeId;

    const session: PracticeSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      completedAt: new Date().toISOString(),
      totalQuestions,
      correctCount,
      scorePercent,
      xpEarned: sessionXpEarned,
      themeId: selectedThemeId,
      themeTitle,
      directionId: currentTask?.directionId,
    };

    savePracticeSession(session);
    if (state.unlockAchievement) {
      state.unlockAchievement("practice-champion");
    }
    setCurrentSessionSummary(session);
    setIsSessionComplete(true);
  }, [
    activeTasks,
    sessionAnswers,
    sessionXpEarned,
    selectedThemeId,
    currentThemes,
    filterMode,
    currentTask,
    state,
  ]);

  const handleRestartSession = useCallback(() => {
    setSessionAnswers({});
    setSessionXpEarned(0);
    setCurrentIndex(0);
    resetTaskInput();
    setIsSessionComplete(false);
    setCurrentSessionSummary(null);
  }, []);

  const handleReviewQuestions = useCallback(() => {
    setCurrentIndex(0);
    resetTaskInput();
    setIsSessionComplete(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < activeTasks.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetTaskInput();
    }
  }, [currentIndex, activeTasks.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetTaskInput();
    }
  }, [currentIndex]);

  // Keyboard navigation for accessible quick practice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (
        e.key >= "1" &&
        e.key <= "4" &&
        currentTask?.kind === "quiz" &&
        !isChecked
      ) {
        const idx = parseInt(e.key, 10) - 1;
        if (currentTask.options && idx < currentTask.options.length) {
          setSelectedOption(idx);
        }
      } else if (
        ["a", "b", "c", "d"].includes(e.key.toLowerCase()) &&
        currentTask?.kind === "quiz" &&
        !isChecked
      ) {
        const idx = e.key.toLowerCase().charCodeAt(0) - 97;
        if (currentTask.options && idx < currentTask.options.length) {
          setSelectedOption(idx);
        }
      } else if (e.key === "Enter") {
        if (!isChecked) {
          if (
            (currentTask?.kind === "quiz" && selectedOption !== null) ||
            (currentTask?.kind === "practice" && numericInput.trim())
          ) {
            handleCheckAnswer();
          }
        } else if (currentIndex < activeTasks.length - 1) {
          handleNext();
        } else {
          handleCompleteSession();
        }
      } else if (e.key === "ArrowRight" && isChecked) {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isChecked,
    currentTask,
    selectedOption,
    numericInput,
    handleCheckAnswer,
    handleNext,
    handlePrev,
    currentIndex,
    activeTasks.length,
    handleCompleteSession,
  ]);

  const isCurrentCorrect = useMemo(() => {
    if (!isChecked || !currentTask) return false;
    return validateRepeatAnswer(
      currentTask,
      currentTask.kind === "quiz" ? selectedOption : numericInput,
    );
  }, [isChecked, currentTask, selectedOption, numericInput]);

  return (
    <div className="repeat-container">
      {/* Header Bar */}
      <div className="repeat-header">
        <div className="repeat-title-group">
          <span className="repeat-badge">
            <RotateCcw size={14} /> REPEAT & REINFORCE
          </span>
          <h2>Solve tasks from previous themes</h2>
          <p>
            Reinforce your memory and deepen mastery by tackling practice
            problems from previously completed themes.
          </p>
        </div>

        <div className="repeat-actions">
          {earnedXp > 0 && (
            <div className="repeat-xp-pill" title="Review XP earned this session">
              <Star size={14} fill="#eab308" color="#eab308" />
              <span>+{earnedXp} Review XP</span>
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="icon-button close-repeat-btn"
              aria-label="Close repeat modal"
              title="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Theme Filter Selector */}
      <div className="repeat-theme-selector">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <span className="selector-label">Choose Theme:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                filterMode === "completed"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
              onClick={() => handleFilterModeChange("completed")}
            >
              Completed Units ({completedThemes.length})
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                filterMode === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
              onClick={() => handleFilterModeChange("all")}
            >
              All Themes ({allThemes.length})
            </button>
          </div>
        </div>

        <div className="theme-chips-scroll">
          <button
            className={`theme-chip ${selectedThemeId === "all" ? "active" : ""}`}
            onClick={() => handleSelectTheme("all")}
          >
            {filterMode === "completed" ? "All Completed" : "All Themes"} (
            {availableTasks.length})
          </button>
          {currentThemes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-chip ${selectedThemeId === theme.id ? "active" : ""}`}
              onClick={() => handleSelectTheme(theme.id)}
            >
              <span>{theme.title}</span>
              <small>({theme.tasksCount})</small>
            </button>
          ))}
        </div>
      </div>

      {/* Main Task Area */}
      {isSessionComplete && currentSessionSummary ? (
        <div className="repeat-task-card session-summary-card">
          <div className="flex flex-col items-center text-center py-6 px-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
              <Trophy size={32} />
            </div>
            <span className="repeat-badge mb-2">
              <Sparkles size={13} /> PRACTICE SESSION COMPLETE
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {currentSessionSummary.scorePercent >= 80
                ? "Exceptional Mastery!"
                : currentSessionSummary.scorePercent >= 50
                  ? "Great Practice Session!"
                  : "Good Effort! Keep Practicing!"}
            </h2>
            <p className="text-slate-600 max-w-md text-sm mb-6">
              {currentSessionSummary.scorePercent >= 80
                ? "You answered almost every question correctly. Excellent grasp of the concepts!"
                : currentSessionSummary.scorePercent >= 50
                  ? "You're building solid confidence and retaining key knowledge from your units."
                  : "Reviewing previous units is the best way to master tricky concepts. Try reviewing the explanations below!"}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-lg mb-8 text-left">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Accuracy
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  {currentSessionSummary.scorePercent}%
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Correct
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {currentSessionSummary.correctCount} /{" "}
                  {currentSessionSummary.totalQuestions}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 col-span-2 sm:col-span-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  XP Earned
                </span>
                <span className="text-2xl font-bold text-amber-500 flex items-center gap-1">
                  <Star size={18} fill="#eab308" color="#eab308" />+
                  {currentSessionSummary.xpEarned}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                className="button primary"
                onClick={handleRestartSession}
              >
                <RotateCcw size={16} /> Restart Practice
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={handleReviewQuestions}
              >
                Review Questions
              </button>
              {onClose && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={onClose}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      ) : currentTask ? (
        <div className="repeat-task-card">
          {/* Card Top Info */}
          <div className="task-card-header">
            <div className="task-theme-info">
              <span className="task-direction">{currentTask.directionTitle}</span>
              <span className="task-dot">·</span>
              <strong className="task-theme">{currentTask.themeTitle}</strong>
            </div>

            <div className="task-progress-indicator">
              <span>
                Task {currentIndex + 1} of {activeTasks.length}
              </span>
              {solvedTasks.has(currentTask.id) && (
                <span className="solved-badge">
                  <Check size={12} strokeWidth={3} /> Solved
                </span>
              )}
            </div>
          </div>

          {/* Task Question Prompt */}
          <div className="task-prompt-box">
            <span className="task-kind-pill">
              {currentTask.kind === "quiz" ? "QUIZ QUESTION" : "NUMERICAL PRACTICE"}
            </span>
            <div className="task-prompt-text">
              <RichText text={currentTask.prompt} />
            </div>
          </div>

          {/* Answer Area */}
          <div className="task-input-section">
            {currentTask.kind === "quiz" && currentTask.options ? (
              <div className="quiz-options-grid">
                {currentTask.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  let optionClass = "repeat-quiz-option";
                  if (isSelected) optionClass += " selected";
                  if (isChecked) {
                    if (idx === currentTask.answerIndex) {
                      optionClass += " correct";
                    } else if (isSelected) {
                      optionClass += " incorrect";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isChecked}
                      className={optionClass}
                      onClick={() => setSelectedOption(idx)}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="option-text">
                        <RichText text={option} />
                      </span>
                      {isChecked && idx === currentTask.answerIndex && (
                        <Check size={18} className="option-icon-check" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="practice-numeric-input-group">
                <label htmlFor="numeric-answer-field">
                  Enter your numerical answer:
                </label>
                <div className="numeric-input-row">
                  <input
                    id="numeric-answer-field"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 4.5"
                    disabled={isChecked}
                    value={numericInput}
                    onChange={(e) => setNumericInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCheckAnswer();
                    }}
                  />
                  <button
                    className="button primary"
                    disabled={isChecked || !numericInput.trim()}
                    onClick={handleCheckAnswer}
                  >
                    Check
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hint Section */}
          {currentTask.hint && (
            <div className="task-hint-wrapper">
              <button
                type="button"
                className="hint-toggle-btn"
                onClick={() => setShowHint(!showHint)}
              >
                <Lightbulb size={15} />
                <span>{showHint ? "Hide hint" : "A little hint"}</span>
              </button>
              {showHint && (
                <div className="hint-content-box">
                  <RichText text={currentTask.hint} />
                </div>
              )}
            </div>
          )}

          {/* Feedback & Explanation Card */}
          {isChecked && (
            <div
              className={`task-feedback-card ${isCurrentCorrect ? "correct" : "incorrect"}`}
              role="status"
              aria-live="polite"
            >
              <div className="feedback-status-row">
                {isCurrentCorrect ? (
                  <>
                    <CircleCheck size={20} className="feedback-icon" />
                    <strong>That’s right! +15 Review XP</strong>
                  </>
                ) : (
                  <>
                    <HelpCircle size={20} className="feedback-icon" />
                    <strong>Not quite right yet.</strong>
                  </>
                )}
              </div>
              <div className="feedback-explanation">
                <p>
                  <strong>Explanation: </strong>
                  <RichText text={currentTask.explanation} />
                </p>
              </div>
            </div>
          )}

          {/* Bottom Card Controls */}
          <div className="task-card-footer">
            <div className="footer-left">
              <button
                className="button secondary"
                disabled={currentIndex === 0}
                onClick={handlePrev}
              >
                <ArrowLeft size={16} /> Previous
              </button>
              <button
                className="button secondary"
                onClick={handleShuffle}
                title="Jump to another task"
              >
                <Shuffle size={15} /> Shuffle
              </button>
            </div>

            <div className="footer-right">
              {!isChecked ? (
                <button
                  className="button primary"
                  disabled={
                    currentTask.kind === "quiz"
                      ? selectedOption === null
                      : !numericInput.trim()
                  }
                  onClick={handleCheckAnswer}
                >
                  Check answer
                </button>
              ) : (
                <>
                  {!isCurrentCorrect && (
                    <button
                      type="button"
                      className="button secondary"
                      onClick={handleTryAgain}
                      title="Try answering this task again"
                    >
                      <RotateCcw size={15} /> Try Again
                    </button>
                  )}
                  {currentIndex < activeTasks.length - 1 ? (
                    <button className="button primary" onClick={handleNext}>
                      Next task <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      className="button primary"
                      onClick={handleCompleteSession}
                    >
                      <CircleCheck size={16} /> Finish Session
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="repeat-empty-state">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <RotateCcw size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {filterMode === "completed"
              ? "No completed units yet"
              : "No repeat tasks found for this selection"}
          </h3>
          <p className="max-w-md text-sm text-slate-600 text-center">
            {filterMode === "completed"
              ? "As you complete lessons across campus tracks, their review questions will automatically appear here to reinforce your knowledge. You can also explore all themes right now."
              : "No questions match your current filter. Switch to all themes to see available tasks."}
          </p>
          <button
            type="button"
            className="button primary"
            onClick={() => handleFilterModeChange("all")}
          >
            Browse All Themes
          </button>
        </div>
      )}
    </div>
  );
}
