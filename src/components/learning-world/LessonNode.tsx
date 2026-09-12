"use client";

import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, Play, Star } from "lucide-react";
import { motion } from "motion/react";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import { useProgress } from "@/stores/progress-provider";
import type { Lesson, LessonStatus } from "@/types/curriculum";

export function LessonNode({
  lesson,
  status,
  index,
}: {
  lesson: Lesson;
  status: LessonStatus;
  index: number;
}) {
  const startLesson = useProgress((s) => s.startLesson);
  return (
    <motion.li
      className={`lesson-node ${status}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.035 }}
    >
      <div className="lesson-marker">
        <span className="lesson-number">
          {status === "completed" ? (
            <Check size={15} strokeWidth={3} />
          ) : status === "locked" ? (
            <LockKeyhole size={13} />
          ) : (
            index + 1
          )}
        </span>
      </div>
      <div className="lesson-tile">
        <div className="lesson-icon">
          <CurriculumIcon name={lesson.icon} size={27} />
        </div>
        <div className="lesson-copy">
          {status === "current" && (
            <span className="current-label">YOU’RE HERE</span>
          )}
          <h3>{lesson.title}</h3>
          <p>{lesson.description}</p>
          {status === "current" && (
            <Link
              href={`/lesson/${lesson.id}`}
              className="button primary small"
              onClick={() => startLesson(lesson.id)}
            >
              <Play size={13} fill="currentColor" />
              Start lesson
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
        <div className="lesson-meta">
          <span className="xp-pill">
            <Star size={12} fill="currentColor" />
            {lesson.xp} XP
          </span>
          {status === "completed" ? (
            <Link
              href={`/lesson/${lesson.id}`}
              className="review-link"
              onClick={() => startLesson(lesson.id)}
              aria-label={`Review ${lesson.title}`}
            >
              Review
              <ArrowRight size={12} />
            </Link>
          ) : status === "locked" ? (
            <span className="locked-label">Locked</span>
          ) : (
            <span className="duration-label">{lesson.durationMinutes} min</span>
          )}
        </div>
      </div>
    </motion.li>
  );
}
