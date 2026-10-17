"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Compass,
  List,
  LockKeyhole,
  Map,
  Navigation,
  RotateCcw,
  Star,
  Tag,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { getDirectionLessons, getLesson } from "@/data/curriculum";
import { getLearningWorld } from "@/data/learning-world";
import {
  useLearningEvents,
  useProgress,
} from "@/stores/progress-provider";
import { getLessonStatus } from "@/stores/progress-store";
import { LessonView } from "@/components/lesson/LessonView";
import { RepeatTasksView } from "@/components/repeat/RepeatTasksView";
import { StorkSpeechBubble } from "@/components/mascot/StorkSpeechBubble";
import {
  playChime,
  getSoundPreference,
  setSoundPreference,
  subscribeSoundPreference,
} from "@/lib/island-audio";
import { LearningPath } from "./LearningPath";
import type { Direction } from "@/types/curriculum";

const WorldCanvas = dynamic(() => import("./WorldCanvas"), {
  ssr: false,
  loading: () => (
    <div className="world-loading">
      <span className="loading-dot" />
      Bringing your campus to life…
    </div>
  ),
});


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
  const unit = direction.subjects[0]?.units[0];
  const data = getLearningWorld(direction.id);
  const currentLessonId = useProgress((s) => s.currentLessonId);
  const completedLessons = useProgress((s) => s.completedLessons);
  const unlockedLessons = useProgress((s) => s.unlockedLessons);
  const startLesson = useProgress((s) => s.startLesson);
  const lessonState = useMemo(
    () => ({ completedLessons, unlockedLessons }),
    [completedLessons, unlockedLessons],
  );
  const events = useLearningEvents();
  const [view, setView] = useState<"world" | "list">("world");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
          setSelectedId(event.nextLessonId ?? event.lessonId);
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
  const selected = getLesson(
    selectedId ?? currentDirectionLesson?.id ?? fallbackLesson?.id ?? "",
  );
  const status = selected ? getLessonStatus(selected, lessonState) : "locked";

  const handleCenterNext = useCallback(() => {
    const nextLesson =
      lessons.find((l) => getLessonStatus(l, lessonState) === "current") ??
      lessons.find((l) => getLessonStatus(l, lessonState) !== "locked") ??
      lessons[0];
    if (nextLesson) {
      setSelectedId(nextLesson.id);
      playChime(soundEnabled, false);
    }
  }, [lessons, lessonState, soundEnabled, setSelectedId]);

  const selectLesson = useCallback(
    (id: string) => {
      playChime(soundEnabled, false);
      setSelectedId(id);
      const lesson = getLesson(id);
      if (
        lesson &&
        getLessonStatus(lesson, lessonState) !== "locked" &&
        startLesson(id)
      )
        setOpenLesson(id);
    },
    [lessonState, startLesson, setSelectedId, setOpenLesson, soundEnabled],
  );
  const openSelected = () => {
    if (selected && startLesson(selected.id)) setOpenLesson(selected.id);
  };
  return (
    <section
      className="learning-world real-world"
      aria-label="Learning journey"
    >
      <div className="world-toolbar">
        <div className="world-heading">
          <div>
            <span className="eyebrow">UNIT 01</span>
            <h2>{unit?.title ?? "Your next chapter"}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="world-repeat-btn"
              onClick={() => setOpenRepeat(true)}
              title="Repeat tasks from previous themes"
              aria-label="Repeat tasks from previous themes"
            >
              <RotateCcw size={14} />
              <span>Repeat</span>
            </button>
            {view === "world" && (
              <>
                <button
                  type="button"
                  className="world-center-btn"
                  onClick={handleCenterNext}
                  title="Center on your next active milestone"
                  aria-label="Center next milestone"
                >
                  <Navigation size={13} />
                  <span>Center next</span>
                </button>
                <button
                  type="button"
                  className={`world-labels-toggle ${showAllLabels ? "active" : ""}`}
                  onClick={() => setShowAllLabels((prev) => !prev)}
                  aria-pressed={showAllLabels}
                  title={showAllLabels ? "Switch to Smart clean labels (unclutter view)" : "Show all lesson labels simultaneously"}
                  aria-label={showAllLabels ? "Switch to Smart clean labels" : "Show all lesson labels"}
                >
                  <Tag size={13} />
                  <span>{showAllLabels ? "All labels" : "Smart labels"}</span>
                </button>
              </>
            )}
            <button
              type="button"
              className={`world-sound-toggle ${soundEnabled ? "active" : ""}`}
              onClick={toggleSound}
              title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
              aria-label={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{soundEnabled ? "Sound on" : "Muted"}</span>
            </button>
            <div
              className="world-view-switch"
              role="group"
              aria-label="Learning path view"
            >
              <button
                aria-pressed={view === "world"}
                onClick={() => setView("world")}
              >
                <Map size={15} />
                World
              </button>
              <button
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <List size={16} />
                <span>Lesson list</span>
              </button>
            </div>
          </div>
        </div>
        <div className="world-subheading">
          <span>
            <BookOpen size={13} />
            {lessons.length} lessons · Your own pace
          </span>
          <span className="world-status-legend">
            <i />
            Completed
            <i />
            Current
            <i />
            Locked
          </span>
        </div>
      </div>
      {data && view === "world" ? (
        <div className="world-stage">
          {mounted ? (
            <WorldCanvas
              key={data.directionId}
              data={data}
              lessons={lessons}
              selectedId={selected?.id ?? null}
              onSelect={selectLesson}
              paused={openLesson !== null}
              showAllLabels={showAllLabels}
            />
          ) : (
            <div className="world-loading">
              <span className="loading-dot" />
              Bringing your campus to life…
            </div>
          )}
          <div className="campus-compass" title="Campus North" aria-hidden="true">
            <Compass size={18} />
          </div>
          <div className="campus-journey-badge" aria-label="Campus progress">
            <span className="journey-badge-label">CAMPUS PROGRESS</span>
            <strong>
              {Math.round(
                (lessons.filter((l) => completedLessons.includes(l.id)).length /
                  Math.max(1, lessons.length)) *
                  100,
              )}
              %
            </strong>
            <div className="journey-badge-dots" aria-hidden="true">
              {lessons.map((l) => (
                <i
                  key={l.id}
                  className={completedLessons.includes(l.id) ? "done" : ""}
                  title={l.title}
                />
              ))}
            </div>
          </div>
          <StorkSpeechBubble
            message={message}
            type="achievement"
            duration={6500}
            onClose={closeMessage}
          />
        </div>
      ) : (
        <div className="world-list-view">
          <LearningPath lessons={lessons} />
        </div>
      )}
      {selected && (
        <div className={`world-detail ${status}`} aria-live="polite">
          <div className="world-detail-icon">
            {status === "locked" ? (
              <LockKeyhole size={23} />
            ) : status === "completed" ? (
              <Check size={23} />
            ) : (
              <Star size={23} />
            )}
          </div>
          <div className="world-detail-copy">
            <span className="eyebrow">
              {status === "current"
                ? "YOUR NEXT STEP"
                : status === "completed"
                  ? "KNOWLEDGE WORTH KEEPING"
                  : "COMING UP ON YOUR PATH"}
            </span>
            <h3>{selected.title}</h3>
            <p>
              {status === "locked"
                ? `Complete ${selected.prerequisites.map((id) => getLesson(id)?.title).join(" and ")} to unlock.`
                : selected.description}
            </p>
          </div>
          <div className="world-detail-action">
            <span>
              <Clock3 size={12} />
              {selected.durationMinutes} min <span>·</span> {selected.xp} XP
            </span>
            {status === "locked" ? (
              <span className="world-locked-note">
                <LockKeyhole size={13} />
                Keep learning to unlock
              </span>
            ) : (
              <button className="button primary" onClick={openSelected}>
                {status === "completed" ? "Review / Retake" : "Start lesson"}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
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
