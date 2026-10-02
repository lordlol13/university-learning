"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  House,
  LayoutGrid,
  RotateCcw,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { directions } from "@/data/curriculum";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
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
              <GraduationCap size={20} />
            </span>
            <span className="brand-text">Uplift</span>
          </Link>
          <button
            className="icon-button close-menu"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav aria-label="Main navigation" suppressHydrationWarning>
          <Link
            href="/dashboard"
            className={navClass("/dashboard")}
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            onClick={onClose}
          >
            <span className="nav-icon"><House size={20} /></span>
            <span className="nav-label-text">Home</span>
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
                <span className="nav-icon">
                  <CurriculumIcon name={direction.icon} size={20} />
                </span>
                <span className="nav-label-text">{direction.shortTitle}</span>
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
            <span className="nav-icon"><LayoutGrid size={20} /></span>
            <span className="nav-label-text">All Courses</span>
          </Link>

          <Link
            href="/repeat"
            className={navClass("/repeat")}
            aria-current={pathname === "/repeat" ? "page" : undefined}
            onClick={onClose}
          >
            <span className="nav-icon"><RotateCcw size={20} /></span>
            <span className="nav-label-text">Repeat</span>
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
              <span className="nav-icon"><Icon size={20} /></span>
              <span className="nav-label-text">{title}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
