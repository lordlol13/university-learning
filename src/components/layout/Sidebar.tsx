"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  GraduationCap,
  House,
  LayoutGrid,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { directions, university } from "@/data/curriculum";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import { StorkAssistant } from "@/components/mascot/StorkAssistant";
import { worldConfig } from "@/data/world-config";
import { CACHE_VERSION } from "@/data/cache-bust-v2";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const navClass = (href: string) =>
    `nav-item ${pathname === href ? "active" : ""}`;
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
              <GraduationCap size={29} />
            </span>
            <span>
              uplift<span className="brand-dot">.</span>
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
        <div className="workspace-label">YOUR LEARNING CAMPUS</div>
        <nav aria-label="Main navigation" suppressHydrationWarning>
          <Link
            href="/dashboard"
            className={navClass("/dashboard")}
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            onClick={onClose}
          >
            <House size={21} />
            Home
          </Link>
          <div className="nav-label">MY DIRECTIONS</div>
          {directions
            .filter((d) => d.id !== "computer-engineering")
            .map((direction) => (
              <Link
                key={direction.id}
                href={`/path/${direction.id}`}
                className={navClass(`/path/${direction.id}`)}
                aria-current={
                  pathname === `/path/${direction.id}` ? "page" : undefined
                }
                onClick={onClose}
              >
                <CurriculumIcon name={direction.icon} size={21} />
                {direction.shortTitle}
                {pathname === `/path/${direction.id}` && (
                  <span className="active-dot" />
                )}
              </Link>
            ))}
          <Link
            href="/courses"
            className={navClass("/courses")}
            aria-current={pathname === "/courses" ? "page" : undefined}
            onClick={onClose}
          >
            <LayoutGrid size={21} />
            All Courses
          </Link>
          <div className="nav-divider" />
          {[
            { href: "/achievements", title: "Achievements", icon: Trophy },
            { href: "/leaderboard", title: "Leaderboard", icon: UsersRound },
            { href: "/profile", title: "Profile", icon: UserRound },
          ].map(({ href, title, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={navClass(href)}
              aria-current={pathname === href ? "page" : undefined}
              onClick={onClose}
            >
              <Icon size={21} />
              {title}
            </Link>
          ))}
        </nav>
        <div className="assistant-card" style={worldConfig.mascot.enabled ? undefined : { padding: "20px 18px", minHeight: "120px" }}>
          {worldConfig.mascot.enabled ? (
            <StorkAssistant />
          ) : (
            <div className="assistant-tip-body">
              <span className="eyebrow" style={{ color: "#699851", fontWeight: 700 }}>STUDENT FOCUS</span>
              <p style={{ marginTop: "8px", fontSize: "19px", lineHeight: 1.3 }}>
                Small steps. <strong style={{ color: "#36792e" }}>Big futures.</strong>
              </p>
              <span style={{ display: "block", marginTop: "8px", fontSize: "12px", color: "var(--muted)" }}>
                Mastering core concepts one lesson at a time.
              </span>
            </div>
          )}
        </div>
        <Link href="/profile" className="university-link" onClick={onClose}>
          <span className="university-icon">
            <GraduationCap size={19} />
          </span>
          <span>
            {university.shortName}
            <small>Student workspace</small>
          </span>
          <ArrowUpRight size={15} />
        </Link>
      </aside>
    </>
  );
}
