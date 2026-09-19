import type { LearningEvent } from "./learning-events";
import { storkAnimations, storkTiming } from "../data/world-config";

export type StorkAnimation = (typeof storkAnimations)[number];
export type ReactionCause =
  | "idle"
  | "navigation"
  | "hover"
  | "click"
  | "achievement"
  | "levelUp"
  | "lessonComplete";
export const reactionPriority: Record<ReactionCause, number> = {
  idle: 0,
  hover: 10,
  navigation: 15,
  click: 20,
  achievement: 30,
  levelUp: 40,
  lessonComplete: 50,
};
interface Reaction {
  animation: StorkAnimation;
  cause: ReactionCause;
  duration: number;
  startedAt: number;
}

/** Frame-driven controller; no React state or wall-clock timers in an animation loop. */
export class StorkController {
  private elapsed = 0;
  private active: Reaction | null = null;
  private queued: Reaction[] = [];
  private cooldowns = new Map<ReactionCause, number>();
  private base: StorkAnimation = "idle";
  /** Explicit commands replace a prior command; event reactions still use request/priority. */
  play(animation: StorkAnimation, duration = 2) {
    this.queued = [];
    this.active =
      animation === "idle"
        ? null
        : { animation, cause: "click", duration, startedAt: this.elapsed };
    this.base = "idle";
  }
  reset() {
    this.active = null;
    this.queued = [];
    this.base = "idle";
    this.cooldowns.clear();
  }
  setBase(animation: "idle" | "walk") {
    this.base = animation;
  }
  get animation(): StorkAnimation {
    return this.active?.animation ?? this.base;
  }
  get cause(): ReactionCause {
    return this.active?.cause ?? "idle";
  }
  get time() {
    return this.active ? this.elapsed - this.active.startedAt : this.elapsed;
  }
  request(animation: StorkAnimation, cause: ReactionCause, duration = 2) {
    const cooldown =
      cause === "hover"
        ? storkTiming.hoverCooldown
        : cause === "click"
          ? storkTiming.clickCooldown
          : 0;
    if (this.elapsed - (this.cooldowns.get(cause) ?? -Infinity) < cooldown)
      return false;
    this.cooldowns.set(cause, this.elapsed);
    const reaction = { animation, cause, duration, startedAt: this.elapsed };
    if (
      !this.active ||
      reactionPriority[cause] > reactionPriority[this.active.cause]
    )
      this.active = reaction;
    else if (
      animation !== this.active.animation &&
      !this.queued.some((r) => r.cause === cause)
    ) {
      this.queued = [...this.queued, reaction]
        .sort((a, b) => reactionPriority[b.cause] - reactionPriority[a.cause])
        .slice(0, storkTiming.maxQueue);
    }
    return true;
  }
  update(delta: number) {
    this.elapsed += Math.min(delta, 0.1);
    if (
      this.active &&
      this.elapsed - this.active.startedAt >= this.active.duration
    ) {
      const next = this.queued.shift();
      this.active = next ? { ...next, startedAt: this.elapsed } : null;
    }
  }
  react(event: LearningEvent) {
    switch (event.type) {
      case "LESSON_COMPLETED":
        this.request("celebrate", "lessonComplete", storkTiming.celebration);
        break;
      case "LEVEL_UP":
        this.request("celebrate", "levelUp", 2.1);
        break;
      case "ACHIEVEMENT_UNLOCKED":
        this.request("celebrate", "achievement", 1.8);
        break;
      case "LESSON_STARTED":
        this.request("point", "click", 1.6);
        break;
      case "XP_GAINED":
        if (this.cause === "idle") this.request("wave", "achievement", 1.5);
        break;
      // Movement owns CURRENT_LESSON_CHANGED so it can finish a reaction before walking.
    }
  }
}
