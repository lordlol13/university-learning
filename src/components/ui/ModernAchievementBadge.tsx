"use client";

import type { Achievement } from "@/types/curriculum";

export type BadgeSize = "sm" | "md" | "lg" | "xl";

function GettingStartedEmblem({ earned }: { earned: boolean }) {
  if (!earned) return null;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="badge-emblem-svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sprout-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="leaf-grad-main" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="45%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="leaf-grad-side" x1="10%" y1="20%" x2="90%" y2="80%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="soil-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <filter id="sprout-sparkle-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Aura background glow */}
      <circle cx="32" cy="32" r="28" fill="url(#sprout-glow)" />

      {/* Soil base mound */}
      <path
        d="M17 48C20 44 26 42 32 42C38 42 44 44 47 48C43 51 37 52 32 52C27 52 21 51 17 48Z"
        fill="url(#soil-grad)"
        stroke="#10b981"
        strokeWidth="1.5"
      />
      <circle cx="27" cy="47" r="1.5" fill="#6ee7b7" />
      <circle cx="36" cy="46" r="1.2" fill="#6ee7b7" />

      {/* Main stem */}
      <path
        d="M32 44V26"
        stroke="#15803d"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 44V26"
        stroke="#86efac"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Right larger leaf */}
      <path
        d="M32 28C32 28 42 27 48 19C49 27 41 33 32 33"
        fill="url(#leaf-grad-main)"
        stroke="#14532d"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M33 29C37 27 42 23 45 20"
        stroke="#dcfce7"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Left upper leaf */}
      <path
        d="M32 23C32 23 23 21 17 14C15 22 22 28 32 27"
        fill="url(#leaf-grad-side)"
        stroke="#166534"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M31 24C27 22 23 18 19 15"
        stroke="#fef9c3"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Floating golden growth sparkles */}
      <g filter="url(#sprout-sparkle-glow)">
        <path
          d="M32 8L33.5 12L37.5 13.5L33.5 15L32 19L30.5 15L26.5 13.5L30.5 12L32 8Z"
          fill="#fde047"
        />
        <circle cx="46" cy="12" r="1.8" fill="#fef08a" />
        <circle cx="16" cy="27" r="1.5" fill="#fde047" />
        <circle cx="49" cy="35" r="1.2" fill="#a7f3d0" />
      </g>
    </svg>
  );
}

function SevenDayStreakEmblem({ earned }: { earned: boolean }) {
  if (!earned) return null;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="badge-emblem-svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="streak-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#a855f7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="outer-flame-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="40%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="mid-flame-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="45%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="core-flame-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
        <filter id="flame-sparkle-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Vibrant aura glow */}
      <circle cx="32" cy="32" r="28" fill="url(#streak-glow)" />

      {/* Outer vibrant purple/magenta flame */}
      <path
        d="M32 8C35 15 42 20 44 28C46 36 41 46 33 52C42 49 48 39 46 29C44 21 38 15 32 8Z"
        fill="url(#outer-flame-grad)"
        opacity="0.9"
      />
      <path
        d="M32 8C27 15 19 23 18 32C17 42 23 50 32 54C22 50 14 39 16 28C18 19 25 14 32 8Z"
        fill="url(#outer-flame-grad)"
        opacity="0.9"
      />

      {/* Main energetic mid-flame */}
      <path
        d="M32 14C37 20 43 25 43 35C43 44 37 51 32 53C27 51 21 44 21 35C21 24 28 19 32 14Z"
        fill="url(#mid-flame-grad)"
      />

      {/* Internal leaping secondary flare */}
      <path
        d="M34 22C37 27 40 31 39 38C39 44 35 48 32 50C29 48 26 44 26 39C26 33 30 29 34 22Z"
        fill="url(#core-flame-grad)"
      />

      {/* Streak badge "7" crest motif in core */}
      <g filter="url(#flame-sparkle-glow)">
        <path
          d="M27 31H37L31 45H28L33.5 34H27V31Z"
          fill="#ffffff"
          opacity="0.95"
        />
        {/* Sparks */}
        <circle cx="17" cy="18" r="1.5" fill="#fde047" />
        <circle cx="46" cy="16" r="1.8" fill="#f43f5e" />
        <circle cx="48" cy="28" r="1.2" fill="#fbbf24" />
        <circle cx="15" cy="38" r="1.2" fill="#e879f9" />
      </g>
    </svg>
  );
}

function ThreeLessonsEmblem({ earned }: { earned: boolean }) {
  if (!earned) return null;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="badge-emblem-svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="book-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="book-cover-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="page-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="page-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <filter id="star-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Aura background glow */}
      <circle cx="32" cy="32" r="28" fill="url(#book-glow)" />

      {/* Book base cover */}
      <path
        d="M12 43C18 41 26 42 32 45C38 42 46 41 52 43V47C46 45 38 46 32 49C26 46 18 45 12 47V43Z"
        fill="url(#book-cover-grad)"
        stroke="#1d4ed8"
        strokeWidth="1.2"
      />

      {/* Left pages block */}
      <path
        d="M13 25C19 23 26 24 32 27V45C26 42 19 41 13 43V25Z"
        fill="url(#page-grad-left)"
        stroke="#38bdf8"
        strokeWidth="1"
      />
      {/* Left lines */}
      <line x1="17" y1="28" x2="28" y2="30" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="17" y1="33" x2="28" y2="35" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="17" y1="38" x2="25" y2="40" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />

      {/* Right pages block */}
      <path
        d="M51 25C45 23 38 24 32 27V45C38 42 45 41 51 43V25Z"
        fill="url(#page-grad-right)"
        stroke="#38bdf8"
        strokeWidth="1"
      />
      {/* Right lines */}
      <line x1="36" y1="30" x2="47" y2="28" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="36" y1="35" x2="47" y2="33" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="36" y1="40" x2="44" y2="38" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />

      {/* Central ribbon bookmark */}
      <path
        d="M32 27V42L34.5 40L37 42V31"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="0.8"
      />

      {/* Three floating stars representing the 3 completed lessons */}
      <g filter="url(#star-glow)">
        {/* Star 1 (Center, highest) */}
        <path
          d="M32 7L33.8 11.5L38.5 12.2L35 15.2L36 19.8L32 17.4L28 19.8L29 15.2L25.5 12.2L30.2 11.5L32 7Z"
          fill="#fbbf24"
          stroke="#fef08a"
          strokeWidth="0.8"
        />
        {/* Star 2 (Left) */}
        <path
          d="M20 14L21.2 17.2L24.5 17.6L22 19.8L22.8 23L20 21.3L17.2 23L18 19.8L15.5 17.6L18.8 17.2L20 14Z"
          fill="#fde047"
          stroke="#fff"
          strokeWidth="0.6"
        />
        {/* Star 3 (Right) */}
        <path
          d="M44 14L45.2 17.2L48.5 17.6L46 19.8L46.8 23L44 21.3L41.2 23L42 19.8L39.5 17.6L42.8 17.2L44 14Z"
          fill="#fde047"
          stroke="#fff"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );
}

function AiExplorerEmblem({ earned }: { earned: boolean }) {
  if (!earned) return null;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="badge-emblem-svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ai-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gold-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="gold-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <filter id="ai-core-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Aura background glow */}
      <circle cx="32" cy="32" r="28" fill="url(#ai-glow)" />

      {/* Astrolabe orbital ring */}
      <circle
        cx="32"
        cy="32"
        r="23"
        stroke="url(#gold-ring-grad)"
        strokeWidth="2"
        strokeDasharray="4 2"
      />
      <circle
        cx="32"
        cy="32"
        r="18"
        stroke="#fef08a"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Compass tick marks */}
      <line x1="32" y1="7" x2="32" y2="11" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="53" x2="32" y2="57" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="32" x2="11" y2="32" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
      <line x1="53" y1="32" x2="57" y2="32" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />

      {/* Neural network constellation traces */}
      <path
        d="M20 22L32 32L44 22M20 42L32 32L44 42"
        stroke="#38bdf8"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        opacity="0.8"
      />
      <circle cx="20" cy="22" r="2.2" fill="#38bdf8" />
      <circle cx="44" cy="22" r="2.2" fill="#38bdf8" />
      <circle cx="20" cy="42" r="2.2" fill="#38bdf8" />
      <circle cx="44" cy="42" r="2.2" fill="#38bdf8" />

      {/* 8-pointed golden compass star */}
      {/* Diagonal smaller rays */}
      <polygon
        points="32,23 35,29 41,32 35,35 32,41 29,35 23,32 29,29"
        fill="#fef08a"
        opacity="0.9"
      />
      {/* Cardinal main faceted rays */}
      <polygon
        points="32,10 35.5,28.5 54,32 35.5,35.5 32,54 28.5,35.5 10,32 28.5,28.5"
        fill="url(#gold-star-grad)"
        stroke="#78350f"
        strokeWidth="0.8"
      />

      {/* Radiant sapphire/gold core jewel */}
      <g filter="url(#ai-core-glow)">
        <circle cx="32" cy="32" r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="30.8" cy="30.8" r="1.2" fill="#ffffff" />
      </g>
    </svg>
  );
}

function LockedEmblem() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="badge-emblem-svg locked"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="locked-shield" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="metal-shackle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="metal-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Frosted subtle shield */}
      <rect
        x="10"
        y="10"
        width="44"
        height="44"
        rx="14"
        fill="url(#locked-shield)"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />

      {/* Padlock shackle */}
      <path
        d="M24 28V23C24 18.58 27.58 15 32 15C36.42 15 40 18.58 40 23V28"
        stroke="url(#metal-shackle)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Padlock body */}
      <rect
        x="20"
        y="27"
        width="24"
        height="20"
        rx="5"
        fill="url(#metal-body)"
        stroke="#334155"
        strokeWidth="1.2"
      />

      {/* Shimmer rim on body */}
      <path
        d="M23 29H41"
        stroke="#e2e8f0"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Keyhole */}
      <circle cx="32" cy="35" r="2.5" fill="#1e293b" />
      <polygon points="30.8,35.5 33.2,35.5 33.8,41 30.2,41" fill="#1e293b" />
    </svg>
  );
}

function VersatileFallbackEmblem({ earned }: { earned: boolean }) {
  if (!earned) return null;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="badge-emblem-svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="22" fill="#10b981" opacity="0.2" />
      <polygon
        points="32,12 37,25 50,26 40,35 43,48 32,41 21,48 24,35 14,26 27,25"
        fill="url(#gold-star-grad)"
        stroke="#d97706"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function AchievementBadge({
  achievement,
  earned,
  size = "md",
}: {
  achievement: Achievement;
  earned: boolean;
  size?: BadgeSize;
}) {
  const renderIcon = () => {
    if (!earned) return <LockedEmblem />;

    switch (achievement.icon) {
      case "sprout":
        return <GettingStartedEmblem earned={earned} />;
      case "flame":
        return <SevenDayStreakEmblem earned={earned} />;
      case "book":
        return <ThreeLessonsEmblem earned={earned} />;
      case "compass":
        return <AiExplorerEmblem earned={earned} />;
      default:
        return <VersatileFallbackEmblem earned={earned} />;
    }
  };

  return (
    <div
      className={`achievement-badge size-${size} ${earned ? achievement.color : "locked"}`}
      title={`${achievement.title}: ${earned ? "Earned" : achievement.description}`}
      role="img"
      aria-label={`${achievement.title} (${earned ? "Unlocked" : "Locked"})`}
    >
      <div className="badge-glow-layer" aria-hidden="true" />
      <div className="badge-inner-emblem">{renderIcon()}</div>
      <span className="sr-only">{earned ? "Earned" : "Locked"}</span>
    </div>
  );
}
