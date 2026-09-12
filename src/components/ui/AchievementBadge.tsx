import { BookOpen, Compass, Flame, LockKeyhole, Sprout } from "lucide-react";
import type { Achievement } from "@/types/curriculum";

const icons = {
  sprout: Sprout,
  flame: Flame,
  book: BookOpen,
  compass: Compass,
};
export function AchievementBadge({
  achievement,
  earned,
}: {
  achievement: Achievement;
  earned: boolean;
}) {
  const Icon = earned ? icons[achievement.icon] : LockKeyhole;
  return (
    <div
      className={`achievement-badge ${earned ? achievement.color : "locked"}`}
      title={`${achievement.title}: ${earned ? "Earned" : achievement.description}`}
    >
      <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
      <span className="sr-only">{earned ? "Earned" : "Locked"}</span>
    </div>
  );
}
