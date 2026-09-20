"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  List,
  LockKeyhole,
  Map,
  Star,
  X,
} from "lucide-react";
import { getDirectionLessons, getLesson } from "@/data/curriculum";
import { getLearningWorld } from "@/data/learning-world";
import {
  useLearningEvents,
  useProgress,
  useProgressReady,
} from "@/stores/progress-provider";
import { getLessonStatus } from "@/stores/progress-store";
import { LessonView } from "@/components/lesson/LessonView";
import { StorkSpeechBubble } from "@/components/mascot/StorkSpeechBubble";
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

import { IslandNavigator } from "./IslandNavigator";

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

export function LearningWorld({ direction }: { direction: Direction }) {
  const lessons = getDirectionLessons(direction);
  const unit = direction.subjects[0]?.units[0];
  const data = getLearningWorld(direction.id);
  const state = useProgress((s) => s);
  const ready = useProgressReady();
  const events = useLearningEvents();
  const [view, setView] = useState<"world" | "list">("world");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const closeLesson = useCallback(() => setOpenLesson(null), [setOpenLesson]);
  const closeMessage = useCallback(() => setMessage(null), [setMessage]);
  useEffect(
    () =>
      events.subscribe((event) => {
        if (event.type === "LESSON_COMPLETED") {
          setOpenLesson(null);
          setSelectedId(event.nextLessonId ?? event.lessonId);
          setMessage(
            `Great job! ${getLesson(event.lessonId)?.title} complete. +${getLesson(event.lessonId)?.xp} XP`,
          );
        }
      }),
    [events],
  );
  const currentDirectionLesson = lessons.find(
    (l) => l.id === state.currentLessonId,
  );
  const fallbackLesson =
    lessons.find((l) => getLessonStatus(l, state) === "current") ??
    lessons.find((l) => getLessonStatus(l, state) !== "locked") ??
    lessons[0];
  const selected = getLesson(
    selectedId ?? currentDirectionLesson?.id ?? fallbackLesson?.id ?? "",
  );
  const status = selected ? getLessonStatus(selected, state) : "locked";
  const selectLesson = useCallback(
    (id: string) => {
      setSelectedId(id);
      const lesson = getLesson(id);
      if (
        lesson &&
        getLessonStatus(lesson, state) === "current" &&
        state.startLesson(id)
      )
        setOpenLesson(id);
    },
    [state, setSelectedId, setOpenLesson],
  );
  const openSelected = () => {
    if (selected && state.startLesson(selected.id)) setOpenLesson(selected.id);
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
          {ready ? (
            <WorldCanvas
              key={data.directionId}
              data={data}
              lessons={lessons}
              selectedId={selected?.id ?? null}
              onSelect={selectLesson}
              paused={openLesson !== null}
            />
          ) : (
            <div className="world-loading">
              <span className="loading-dot" />
              Getting your campus ready…
            </div>
          )}
          <IslandNavigator currentDirectionId={direction.id} />
          <div className="world-location">
            <span>UPLIFT CAMPUS</span>
            <strong>A little further, every day.</strong>
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
                {status === "completed" ? "Review lesson" : "Start lesson"}
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
    </section>
  );
}
