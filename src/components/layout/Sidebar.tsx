"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  House,
  LayoutGrid,
  RotateCcw,
  Sparkles,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  directions,
  getDirectionLessons,
  getLessonDirection,
  university,
} from "@/data/curriculum";
import { learner, levelSize } from "@/data/demo";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import { CACHE_VERSION } from "@/data/cache-bust-v2";
import { useProgress } from "@/stores/progress-provider";
import { getDirectionProgress } from "@/stores/progress-store";

const SUBJECT_THEME_MAP: Record<string, string> = {
  "ai-ml": "subject-ai",
  "physics-engineering": "subject-physics",
  mathematics: "subject-math",
  "italian-language": "subject-italian",
  "data-science": "subject-math",
  programming: "subject-ai",
};

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const completedLessons = useProgress((s) => s.completedLessons);
  const xp = useProgress((s) => s.xp);
  const level = useProgress((s) => s.level);
  const safeXp = Number.isFinite(xp) && xp >= 0 ? xp : 0;
  const safeLevelSize =
    Number.isFinite(levelSize) && levelSize > 0 ? levelSize : 250;
  const levelPercent = Math.min(
    100,
    Math.max(0, Math.round(((safeXp % safeLevelSize) / safeLevelSize) * 100)),
  );

  const activeDirectionId = pathname.startsWith("/path/")
    ? pathname.split("/")[2]
    : pathname.startsWith("/lesson/")
      ? getLessonDirection(pathname.split("/")[2])?.id
      : undefined;

  const navClass = (href: string) =>
    `nav-item ${pathname === href ? "active" : ""}`;

  const activeDirections = directions.filter(
    (d) => d.id !== "computer-engineering" && getDirectionLessons(d).length > 0,
  );

  return (
    <>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside
        id="main-navigation"
        className={`sidebar ${open ? "is-open" : ""}`}
        data-version={CACHE_VERSION}
        suppressHydrationWarning
      >
        <div className="brand-row">
          <Link
            href="/dashboard"
            className="brand"
            onClick={onClose}
            aria-label="Uplift home"
          >
            <span className="brand-mark">
              <GraduationCap size={20} />
            </span>
            <span className="brand-copy">
              <span className="brand-text">
                Uplift<span className="brand-dot">.</span>
              </span>
              <small className="brand-subtext">CAMPUS</small>
            </span>
          </Link>
          <button
            className="icon-button close-menu"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav
          className="sidebar-nav"
          aria-label="Main navigation"
          suppressHydrationWarning
        >
          <div className="nav-label">OVERVIEW</div>
          <Link
            href="/dashboard"
            className={navClass("/dashboard")}
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            onClick={onClose}
          >
            <span className="nav-icon">
              <House size={19} />
            </span>
            <span className="nav-label-text">Dashboard</span>
          </Link>

          <Link
            href="/courses"
            className={navClass("/courses")}
            aria-current={pathname === "/courses" ? "page" : undefined}
            onClick={onClose}
          >
            <span className="nav-icon">
              <LayoutGrid size={19} />
            </span>
            <span className="nav-label-text">All Courses</span>
            <span className="nav-badge">{activeDirections.length}</span>
          </Link>

          <Link
            href="/repeat"
            className={navClass("/repeat")}
            aria-current={pathname === "/repeat" ? "page" : undefined}
            onClick={onClose}
          >
            <span className="nav-icon">
              <RotateCcw size={19} />
            </span>
            <span className="nav-label-text">Practice & Repeat</span>
          </Link>

          <div className="nav-label">3D ISLAND PATHS</div>

          {activeDirections.map((direction) => {
            const progress = getDirectionProgress(direction.id, {
              completedLessons,
            });
            const subjectClass =
              SUBJECT_THEME_MAP[direction.id] ?? "subject-ai";
            const isActive =
              pathname === `/path/${direction.id}` ||
              direction.id === activeDirectionId;
            return (
              <Link
                key={direction.id}
                href={`/path/${direction.id}`}
                className={`nav-item nav-direction-item ${subjectClass} ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={onClose}
              >
                <span className="nav-icon subject-nav-icon">
                  <CurriculumIcon name={direction.icon} size={18} />
                </span>
                <span className="nav-label-text">{direction.shortTitle}</span>
                <span className="nav-progress-pill">
                  {progress.completed}/{progress.total}
                </span>
              </Link>
            );
          })}

          <div className="nav-divider" />
          <div className="nav-label">COMMUNITY & YOU</div>

          {[
            { href: "/achievements", title: "Achievements", icon: Trophy },
            { href: "/leaderboard", title: "Leaderboard", icon: UsersRound },
            { href: "/profile", title: "My Profile", icon: UserRound },
          ].map(({ href, title, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={navClass(href)}
              aria-current={pathname === href ? "page" : undefined}
              onClick={onClose}
            >
              <span className="nav-icon">
                <Icon size={19} />
              </span>
              <span className="nav-label-text">{title}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-level-box">
            <div className="sidebar-level-top">
              <span className="sidebar-level-badge">
                <Sparkles size={13} />
                Level {level ?? 1}
              </span>
              <span className="sidebar-level-xp">{(xp ?? 0).toLocaleString()} XP</span>
            </div>
            <div
              className="sidebar-level-track"
              role="progressbar"
              aria-valuenow={levelPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Level progress"
            >
              <span style={{ width: `${levelPercent}%` }} />
            </div>
          </div>

          <Link
            href="/profile"
            className="sidebar-user-card"
            onClick={onClose}
          >
            <span className="avatar sidebar-avatar">{learner.initials}</span>
            <div className="sidebar-user-meta">
              <strong>{learner.name}</strong>
              <small>{university.shortName}</small>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
