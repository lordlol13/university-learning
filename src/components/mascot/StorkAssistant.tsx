"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion";
import { storkTiming, worldConfig } from "@/data/world-config";
import { GraduationCap, MessageCircle, X } from "lucide-react";
import { getLesson } from "@/data/curriculum";
import { achievementCatalog, levelSize } from "@/data/demo";
import { useLearningEvents, useProgress } from "@/stores/progress-provider";
import { useSmallScreen } from "@/hooks/use-small-screen";
import { StorkSpeechBubble, type SpeechType } from "./StorkSpeechBubble";
import { useStorkController } from "./StorkAnimationController";
import { noticeStorkCursor, reactToStorkTap } from "./StorkInteraction";

const AssistantCanvas = dynamic(() => import("./AssistantCanvas"), {
  ssr: false,
});
export function StorkAssistant({ mobile = false }: { mobile?: boolean }) {
  const small = useSmallScreen(),
    reduced = useReducedMotionPreference();
  const enabled = worldConfig.mascot.enabled && mobile === small;
  const [expanded, setExpanded] = useState(false);
  const [speech, setSpeech] = useState<{
    message: string;
    type: SpeechType;
  } | null>(null);
  const closeSpeech = useCallback(() => setSpeech(null), []);
  const controller = useStorkController(enabled && (!mobile || expanded));
  const gaze = useRef({ x: 0, y: 0 }),
    clickIndex = useRef(0);
  const lastMessage = useRef({ time: 0, priority: 0 });
  const state = useProgress((s) => s),
    events = useLearningEvents();
  useEffect(
    () =>
      events.subscribe((event) => {
        if (!enabled || (mobile && !expanded)) return;
        let message = "",
          priority = 0;
        if (event.type === "LESSON_COMPLETED") {
          message = event.nextLessonId
            ? `Great job! Next stop: ${getLesson(event.nextLessonId)?.title}.`
            : "You did it! Every lesson on this path is complete.";
          priority = 50;
        }
        if (event.type === "LEVEL_UP") {
          message = `Hello, Level ${event.level}! Look how far you’ve come.`;
          priority = 40;
        }
        if (event.type === "ACHIEVEMENT_UNLOCKED") {
          message = `You earned ${achievementCatalog.find((item) => item.id === event.achievementId)?.title ?? "a new badge"}!`;
          priority = 30;
        }
        if (
          message &&
          (Date.now() - lastMessage.current.time > storkTiming.speechCooldown ||
            priority > lastMessage.current.priority)
        ) {
          lastMessage.current = { time: Date.now(), priority };
          setSpeech({ message, type: "achievement" });
        }
      }),
    [events, enabled, mobile, expanded],
  );
  const interact = () => {
    reactToStorkTap(controller);
    const current = state.currentLessonId
      ? getLesson(state.currentLessonId)
      : undefined;
    const messages = [
      current
        ? `Ready to continue? Your next lesson is ${current.title}.`
        : "You’re doing great! Explore your courses to find your next chapter.",
      `Only ${state.level * levelSize - state.xp} XP until Level ${state.level + 1}.`,
      `You’ve completed ${state.completedLessons.length} lessons. Small steps, big futures!`,
    ];
    const message = messages[clickIndex.current++ % messages.length];
    setSpeech({ message, type: "hint" });
    lastMessage.current = { time: Date.now(), priority: 20 };
  };
  if (!enabled) return null;
  if (mobile && !expanded)
    return (
      <button
        className="mobile-stork-control"
        onClick={() => setExpanded(true)}
        aria-label="Open stork assistant"
        aria-expanded={false}
      >
        <GraduationCap size={22} />
        <span>Your companion</span>
      </button>
    );
  return (
    <div className={`stork-assistant ${mobile ? "mobile-expanded" : ""}`}>
      {mobile && (
        <button
          className="assistant-collapse"
          onClick={() => {
            setExpanded(false);
            closeSpeech();
          }}
          aria-label="Close stork assistant"
        >
          <X size={18} />
        </button>
      )}
      <StorkSpeechBubble
        message={speech?.message ?? null}
        type={speech?.type}
        duration={8000}
        onClose={closeSpeech}
      />
      <button
        className="assistant-stage"
        aria-label="Talk to your stork companion"
        onClick={interact}
        onPointerEnter={() => noticeStorkCursor(controller)}
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          gaze.current.x =
            ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
          gaze.current.y =
            ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
        }}
        onPointerLeave={() => {
          gaze.current = { x: 0, y: 0 };
        }}
      >
        <AssistantCanvas
          controller={controller}
          gaze={gaze}
          reducedMotion={reduced}
        />
        <span className="assistant-chat-icon">
          <MessageCircle size={14} />
        </span>
      </button>
      <div className="assistant-caption">
        <strong>Small steps. Big futures.</strong>
        <span>Your campus companion</span>
      </div>
    </div>
  );
}
