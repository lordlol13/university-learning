"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion";
import { X } from "lucide-react";

export type SpeechType =
  "encouragement" | "hint" | "achievement" | "navigation";
export function StorkSpeechBubble({
  message,
  type = "encouragement",
  duration = 6500,
  onClose,
}: {
  message: string | null;
  type?: SpeechType;
  duration?: number;
  onClose: () => void;
}) {
  const reduced = useReducedMotionPreference();
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, Math.max(4000, duration));
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          className={`stork-speech-bubble speech-${type}`}
          initial={{ opacity: 0, y: reduced ? 0 : 7 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -5 }}
          transition={{ duration: 0.2 }}
        >
          <div role="status">
            <span className="eyebrow">YOUR CAMPUS COMPANION</span>
            <p>{message}</p>
          </div>
          <button onClick={onClose} aria-label="Dismiss stork message">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
