"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  Atom,
  Brain,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  Crosshair,
  Flame,
  FlaskConical,
  Globe2,
  Landmark,
  Layers,
  Leaf,
  List,
  Lock,
  MapPin,
  RotateCcw,
  Sigma,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  directions,
  getDirectionLessons,
  getLesson,
} from "@/data/curriculum";
import { getLearningWorld } from "@/data/learning-world";
import {
  useLearningEvents,
  useProgress,
} from "@/stores/progress-provider";
import {
  getDirectionProgress,
  getLessonStatus,
} from "@/stores/progress-store";
import { LessonView } from "@/components/lesson/LessonView";
import { RepeatTasksView } from "@/components/repeat/RepeatTasksView";
import { StorkSpeechBubble } from "@/components/mascot/StorkSpeechBubble";
import {
  playChime,
  getSoundPreference,
  setSoundPreference,
  subscribeSoundPreference,
} from "@/lib/island-audio";
import { TRACK_THEMES } from "./WorldCanvas";
import { IslandMiniLab } from "./IslandMiniLab";
import type { Direction } from "@/types/curriculum";

function useCountUp(target: number) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 550);
      setVal(Math.round(from + (target - from) * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return val;
}

const WorldCanvas = dynamic(() => import("./WorldCanvas"), {
  ssr: false,
  loading: () => (
    <div className="world-loading">
      <span className="loading-dot" />
      Bringing your island campus to life…
    </div>
  ),
});

const TRACK_ICONS: Record<string, typeof Brain> = {
  "ai-ml": Brain,
  "physics-engineering": Atom,
  mathematics: Sigma,
  "italian-language": Landmark,
};

const STATE_LABEL = {
  completed: "Completed",
  current: "Up next",
  locked: "Locked",
} as const;

function LessonDialog({
  lessonId,
  directionId,
  onClose,
}: {
  lessonId: string;
  directionId: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const lesson = getLesson(lessonId);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = before;
      previousFocus?.focus();
    };
  }, []);
  if (!lesson) return null;
  return (
    <dialog
      ref={ref}
      className="world-lesson-dialog"
      aria-label={`${lesson.title} lesson`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-inner">
        <button
          className="dialog-close icon-button"
          onClick={onClose}
          aria-label="Close lesson"
        >
          <X size={22} />
        </button>
        <LessonView
          lesson={lesson}
          directionId={directionId}
          onReturn={onClose}
        />
      </div>
    </dialog>
  );
}

function RepeatDialog({
  directionId,
  onClose,
}: {
  directionId: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = before;
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="world-lesson-dialog repeat-dialog"
      aria-label="Repeat previous themes"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog-inner"
        style={{
          maxWidth: "880px",
          margin: "0 auto",
          padding: "20px 16px",
        }}
      >
        <button
          className="dialog-close icon-button"
          onClick={onClose}
          aria-label="Close repeat"
        >
          <X size={22} />
        </button>
        <RepeatTasksView
          initialDirectionId={directionId}
          onClose={onClose}
        />
      </div>
    </dialog>
  );
}

export function LearningWorld({ direction }: { direction: Direction }) {
  const lessons = getDirectionLessons(direction);
  const data = getLearningWorld(direction.id);
  const currentLessonId = useProgress((s) => s.currentLessonId);
  const completedLessons = useProgress((s) => s.completedLessons);
  const unlockedLessons = useProgress((s) => s.unlockedLessons);
  const xp = useProgress((s) => s.xp);
  const animatedXp = useCountUp(xp);
  const streak = useProgress((s) => s.streak);
  const startLesson = useProgress((s) => s.startLesson);
  const lessonState = useMemo(
    () => ({ completedLessons, unlockedLessons }),
    [completedLessons, unlockedLessons],
  );
  const events = useLearningEvents();
  const [listOpen, setListOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [asideCollapsed, setAsideCollapsed] = useState(false);
  const [overviewMode, setOverviewMode] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyNonce, setFlyNonce] = useState(0);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [openRepeat, setOpenRepeat] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const closeLesson = useCallback(() => setOpenLesson(null), [setOpenLesson]);
  const closeMessage = useCallback(() => setMessage(null), [setMessage]);

  const soundEnabled = useSyncExternalStore(
    subscribeSoundPreference,
    getSoundPreference,
    () => true,
  );

  const toggleSound = useCallback(() => {
    const next = !getSoundPreference();
    setSoundPreference(next);
    playChime(next, false);
  }, []);

  useEffect(
    () =>
      events.subscribe((event) => {
        if (event.type === "LESSON_COMPLETED") {
          playChime(soundEnabled, true);
          setOpenLesson(null);
          setOverviewMode(false);
          setSelectedId(event.nextLessonId ?? event.lessonId);
          setFlyNonce((n) => n + 1);
          setMessage(
            `Great job! ${getLesson(event.lessonId)?.title} complete. +${getLesson(event.lessonId)?.xp} XP`,
          );
        }
      }),
    [events, soundEnabled],
  );

  const currentDirectionLesson = lessons.find(
    (l) => l.id === currentLessonId,
  );
  const fallbackLesson =
    lessons.find((l) => getLessonStatus(l, lessonState) === "current") ??
    lessons.find((l) => getLessonStatus(l, lessonState) !== "locked") ??
    lessons[0];
  const selected =
    getLesson(
      selectedId ?? currentDirectionLesson?.id ?? fallbackLesson?.id ?? "",
    ) ?? lessons[0];
  const selectedIndex = Math.max(
    0,
    lessons.findIndex((l) => l.id === selected?.id),
  );
  const status = selected ? getLessonStatus(selected, lessonState) : "locked";
  const progress = getDirectionProgress(direction.id, { completedLessons });
  const theme = TRACK_THEMES[direction.id] ?? TRACK_THEMES["ai-ml"];
  const ActiveTrackIcon = TRACK_ICONS[direction.id] ?? Brain;

  const earnedTrackXp = useMemo(
    () =>
      lessons
        .filter((l) => completedLessons.includes(l.id))
        .reduce((acc, l) => acc + l.xp, 0),
    [lessons, completedLessons],
  );
  const totalTrackXp = useMemo(
    () => lessons.reduce((acc, l) => acc + l.xp, 0),
    [lessons],
  );

  const selectByIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(lessons.length - 1, index));
      const targetLesson = lessons[clamped];
      if (targetLesson) {
        setOverviewMode(false);
        setSelectedId(targetLesson.id);
        setFlyNonce((n) => n + 1);
        playChime(soundEnabled, false);
      }
    },
    [lessons, soundEnabled, setSelectedId, setFlyNonce],
  );

  const openSelected = useCallback(() => {
    if (selected && status !== "locked" && startLesson(selected.id)) {
      playChime(soundEnabled, false);
      setOpenLesson(selected.id);
    }
  }, [selected, status, startLesson, soundEnabled]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openLesson || openRepeat) return;
      if (e.key === "ArrowRight") selectByIndex(selectedIndex + 1);
      if (e.key === "ArrowLeft") selectByIndex(selectedIndex - 1);
      if (e.key === "Enter" && document.activeElement === document.body) {
        openSelected();
      }
      if (e.key === "Escape") {
        if (listOpen) {
          setListOpen(false);
        } else if (labOpen) {
          setLabOpen(false);
        } else {
          setOverviewMode((prev) => !prev);
          setFlyNonce((n) => n + 1);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    openLesson,
    openRepeat,
    listOpen,
    labOpen,
    selectByIndex,
    selectedIndex,
    openSelected,
  ]);

  const handleCenterNext = useCallback(() => {
    const nextLesson =
      lessons.find((l) => getLessonStatus(l, lessonState) === "current") ??
      lessons.find((l) => getLessonStatus(l, lessonState) !== "locked") ??
      lessons[0];
    if (nextLesson) {
      setOverviewMode(false);
      setSelectedId(nextLesson.id);
      setFlyNonce((n) => n + 1);
      playChime(soundEnabled, false);
    }
  }, [lessons, lessonState, soundEnabled, setSelectedId, setFlyNonce]);

  const handleToggleOverview = useCallback(() => {
    setOverviewMode((prev) => !prev);
    setFlyNonce((n) => n + 1);
    playChime(soundEnabled, false);
  }, [soundEnabled]);

  const selectLesson = useCallback(
    (id: string) => {
      playChime(soundEnabled, false);
      setOverviewMode(false);
      if (id === selected?.id) {
        const lesson = getLesson(id);
        if (
          lesson &&
          getLessonStatus(lesson, lessonState) !== "locked" &&
          startLesson(id)
        ) {
          setOpenLesson(id);
        }
        return;
      }
      setSelectedId(id);
      setFlyNonce((n) => n + 1);
    },
    [
      selected?.id,
      lessonState,
      startLesson,
      setSelectedId,
      setFlyNonce,
      setOpenLesson,
      soundEnabled,
    ],
  );

  const vars = {
    "--track": theme.color,
    "--track-2": theme.accent,
  } as CSSProperties;

  return (
    <section
      className="uplift-island-viewport"
      style={vars}
      aria-label="Learning journey"
    >
      {/* Full-bleed 3D Island Canvas */}
      <div
        className={`uplift-canvas-layer ${listOpen ? "uplift-canvas-blurred" : ""}`}
      >
        {data && mounted ? (
          <WorldCanvas
            key={data.directionId}
            data={data}
            lessons={lessons}
            selectedId={selected?.id ?? null}
            onSelect={selectLesson}
            paused={openLesson !== null || openRepeat}
            showAllLabels={showAllLabels}
            flyNonce={flyNonce}
            overviewMode={overviewMode}
          />
        ) : (
          <div className="world-loading">
            <span className="loading-dot" />
            Bringing your island campus to life…
          </div>
        )}
      </div>

      {/* Top Glassmorphic Track Switcher & Stats Bar */}
      <header className="uplift-glass uplift-hud-topbar">
        <Link
          href="/"
          className="uplift-brand"
          title="Back to Campus Dashboard"
        >
          Uplift<span className="uplift-brand-dot">.</span>
        </Link>

        <nav className="uplift-track-nav" aria-label="Campus learning islands">
          {directions.map((d) => {
            const Icon = TRACK_ICONS[d.id] ?? Brain;
            const dTheme = TRACK_THEMES[d.id] ?? TRACK_THEMES["ai-ml"];
            const dProg = getDirectionProgress(d.id, { completedLessons });
            const isCurrent = d.id === direction.id;
            return (
              <Link
                key={d.id}
                href={`/path/${d.id}`}
                onClick={() => playChime(soundEnabled, false)}
                style={
                  {
                    "--track": dTheme.color,
                    "--track-2": dTheme.accent,
                  } as CSSProperties
                }
                className={`uplift-track-pill ${isCurrent ? "active" : ""}`}
                aria-current={isCurrent ? "page" : undefined}
              >
                <Icon size={17} />
                <div className="uplift-track-pill-body">
                  <div className="uplift-track-pill-title">
                    {dTheme.short}{" "}
                    <span className="uplift-track-pill-count">
                      {dProg.completed}/{dProg.total}
                    </span>
                  </div>
                  <div className="uplift-track-pill-dots" aria-hidden="true">
                    {Array.from({ length: dProg.total }, (_, i) => (
                      <span
                        key={i}
                        className={`uplift-pill-dot ${
                          i < dProg.completed
                            ? isCurrent
                              ? "done-active"
                              : "done"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="uplift-hud-stats">
          <button
            type="button"
            className="uplift-hud-btn"
            onClick={() => setOpenRepeat(true)}
            title="Practice & repeat previous themes"
          >
            <RotateCcw size={14} />
            <span>Repeat</span>
          </button>
          <span className="uplift-hud-btn uplift-stat-badge">
            <Flame size={14} className="uplift-icon-flame" /> {streak} day
            streak
          </span>
          <span className="uplift-hud-btn uplift-stat-badge">
            <Star size={14} className="uplift-icon-gold" />{" "}
            <strong className="uplift-xp-num">
              {animatedXp.toLocaleString()}
            </strong>{" "}
            XP
          </span>
          <button
            type="button"
            className="uplift-hud-btn uplift-icon-only"
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            title={soundEnabled ? "Sound on" : "Sound muted"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </header>

      {/* Left Floating Track Overview Card */}
      <aside
        className={`uplift-glass uplift-hud-aside ${asideCollapsed ? "is-collapsed" : ""}`}
      >
        <div className="uplift-aside-toprow">
          <span className="uplift-biome-badge">
            <Globe2 size={12} /> {theme.biome}
          </span>
          <button
            type="button"
            className="uplift-aside-toggle"
            onClick={() => setAsideCollapsed((prev) => !prev)}
            aria-label={
              asideCollapsed ? "Expand track overview" : "Collapse track overview"
            }
            title={asideCollapsed ? "Expand card" : "Minimize card"}
          >
            {asideCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>

        {!asideCollapsed && (
          <>
            <div className="uplift-aside-main">
              <div className="uplift-aside-copy">
                <h1>{direction.title}</h1>
                <p>{direction.description}</p>
              </div>
              <div
                className="uplift-progress-ring"
                aria-label={`${progress.percent}% complete`}
              >
                <svg viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="rgba(15, 23, 42, 0.08)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="var(--track)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress.percent / 100) * 94.2} 94.2`}
                  />
                </svg>
                <span>{progress.percent}%</span>
              </div>
            </div>

            <div className="uplift-aside-summary">
              <span>
                <strong>{progress.completed}</strong>/{progress.total} milestones
              </span>
              <span className="uplift-summary-dot">·</span>
              <span>
                <strong>{earnedTrackXp}</strong>/{totalTrackXp} XP earned
              </span>
            </div>
          </>
        )}

        <div className="uplift-aside-actions">
          <button
            type="button"
            className="uplift-hud-btn"
            onClick={handleCenterNext}
            title="Focus up-next milestone"
          >
            <Crosshair size={14} /> Next
          </button>
          <button
            type="button"
            className="uplift-hud-btn"
            data-on={overviewMode}
            onClick={handleToggleOverview}
            title="Toggle panoramic island camera"
          >
            <Compass size={14} /> Overview
          </button>
          <button
            type="button"
            className="uplift-hud-btn"
            data-on={showAllLabels}
            onClick={() => {
              setShowAllLabels((prev) => !prev);
              playChime(soundEnabled, false);
            }}
            title="Expand or collapse all 3D milestone pins"
          >
            <MapPin size={14} /> Pins
          </button>
          <button
            type="button"
            className="uplift-hud-btn"
            data-on={labOpen}
            onClick={() => {
              setLabOpen((prev) => !prev);
              setListOpen(false);
              playChime(soundEnabled, false);
            }}
            title="Open interactive island mini-lab sandbox"
          >
            <FlaskConical size={14} /> Lab
          </button>
          <button
            type="button"
            className="uplift-hud-btn"
            data-on={listOpen}
            onClick={() => {
              setListOpen((prev) => !prev);
              setLabOpen(false);
              playChime(soundEnabled, false);
            }}
            title="Open path milestone list"
          >
            <List size={14} /> {listOpen ? "World" : "List"}
          </button>
        </div>
      </aside>

      {/* Interactive Island Mini-Lab Sandbox Drawer */}
      {labOpen && (
        <IslandMiniLab
          key={direction.id}
          directionId={direction.id}
          onClose={() => setLabOpen(false)}
        />
      )}

      {/* Centered Glassmorphic Path List Modal */}
      {listOpen && (
        <div
          className="uplift-glass-strong uplift-list-modal"
          role="dialog"
          aria-label={`${direction.title} path milestones`}
        >
          <div className="uplift-list-header">
            <h2>{direction.title} path</h2>
            <button
              type="button"
              className="uplift-hud-btn uplift-icon-only"
              onClick={() => setListOpen(false)}
              aria-label="Close list"
            >
              <X size={15} />
            </button>
          </div>
          <div className="uplift-list-items">
            {lessons.map((lesson, i) => {
              const s = getLessonStatus(lesson, lessonState);
              const isSelected = lesson.id === selected?.id;
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => {
                    selectByIndex(i);
                    setListOpen(false);
                  }}
                  className={`uplift-list-row ${isSelected ? "selected" : ""}`}
                >
                  <span className={`uplift-list-num ${s}`}>
                    {s === "locked" ? (
                      <Lock size={14} />
                    ) : s === "completed" ? (
                      <Check size={14} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="uplift-list-row-title">{lesson.title}</span>
                  <span className="uplift-list-row-status">
                    {STATE_LABEL[s]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ambient Bottom-Left Scene Caption & Bottom-Right Interactive Compass Rose */}
      <div className="uplift-scene-caption" aria-hidden="true">
        <span className="uplift-live-dot" />
        <span>A small island. An expansive mind.</span>
        <Leaf size={13} />
      </div>

      <button
        type="button"
        className={`uplift-compass-rose ${overviewMode ? "is-overview" : ""}`}
        onClick={handleToggleOverview}
        aria-label={
          overviewMode
            ? "Return camera to selected milestone"
            : "Zoom camera to full island overview"
        }
        title={
          overviewMode
            ? "Focus selected milestone (Esc)"
            : "Panoramic island overview (Esc)"
        }
      >
        <span className="uplift-compass-n">N</span>
        <Compass size={20} strokeWidth={1.75} />
      </button>

      {/* Bottom Floating Milestone Inspector Dock */}
      {selected && (
        <section
          className="uplift-glass uplift-hud-dock"
          aria-live="polite"
        >
          <div className="uplift-dock-top">
            <span className="uplift-dock-step">
              Milestone {selectedIndex + 1} of {lessons.length}
            </span>
            <span className={`uplift-dock-badge ${status}`}>
              {STATE_LABEL[status]}
            </span>

            {/* Interactive 1-Click Milestone Scrubber */}
            <div
              className="uplift-dock-stepper"
              role="tablist"
              aria-label="Milestone steps"
            >
              {lessons.map((lesson, i) => {
                const s = getLessonStatus(lesson, lessonState);
                const isSel = i === selectedIndex;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    role="tab"
                    aria-selected={isSel}
                    aria-label={`Milestone ${i + 1}: ${lesson.title} (${STATE_LABEL[s]})`}
                    title={`${i + 1}. ${lesson.title} (${STATE_LABEL[s]})`}
                    onClick={() => selectByIndex(i)}
                    className={`uplift-step-node ${s} ${isSel ? "is-selected" : ""}`}
                  >
                    {s === "completed" ? (
                      <Check size={11} strokeWidth={3} />
                    ) : s === "locked" ? (
                      <Lock size={10} />
                    ) : (
                      i + 1
                    )}
                  </button>
                );
              })}
            </div>

            <div className="uplift-dock-arrows">
              <button
                type="button"
                className="uplift-hud-btn uplift-icon-only"
                onClick={() => selectByIndex(selectedIndex - 1)}
                disabled={selectedIndex <= 0}
                aria-label="Previous milestone"
                title="Previous milestone (←)"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="uplift-hud-btn uplift-icon-only"
                onClick={() => selectByIndex(selectedIndex + 1)}
                disabled={selectedIndex >= lessons.length - 1}
                aria-label="Next milestone"
                title="Next milestone (→)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="uplift-dock-main">
            <div className="uplift-dock-icon">
              <ActiveTrackIcon size={26} />
            </div>
            <div className="uplift-dock-copy">
              <h3>{selected.title}</h3>
              <p>
                {status === "locked"
                  ? `Complete ${selected.prerequisites
                      .map((id) => getLesson(id)?.title)
                      .filter(Boolean)
                      .join(" and ")} to unlock.`
                  : selected.description}
              </p>
              <div className="uplift-dock-meta">
                <span>
                  <Clock size={12} /> {selected.durationMinutes} min
                </span>
                <span className="uplift-dock-xp">
                  <Sparkles size={12} /> +{selected.xp} XP
                </span>
                <button
                  type="button"
                  className="uplift-dock-lab uplift-dock-lab-btn"
                  onClick={() => {
                    setLabOpen((prev) => !prev);
                    setListOpen(false);
                    playChime(soundEnabled, false);
                  }}
                  title="Open quick interactive Mini-Lab sandbox"
                >
                  <Layers size={12} /> Interactive Lab & Quiz
                </button>
                <span className="uplift-kbd-hint" aria-hidden="true">
                  ← → Navigate · Enter Start
                </span>
              </div>
            </div>
            <button
              type="button"
              className="uplift-cta"
              disabled={status === "locked"}
              onClick={openSelected}
            >
              {status === "locked" ? (
                <>
                  <Lock size={16} /> Locked
                </>
              ) : status === "completed" ? (
                "Review Lesson"
              ) : (
                "Start Lesson"
              )}
            </button>
          </div>
        </section>
      )}

      <StorkSpeechBubble
        message={message}
        type="achievement"
        duration={6500}
        onClose={closeMessage}
      />

      {openLesson && (
        <LessonDialog
          key={openLesson}
          lessonId={openLesson}
          directionId={direction.id}
          onClose={closeLesson}
        />
      )}
      {openRepeat && (
        <RepeatDialog
          directionId={direction.id}
          onClose={() => setOpenRepeat(false)}
        />
      )}
    </section>
  );
}

