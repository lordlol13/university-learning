"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ProgressPanel } from "./ProgressPanel";
import { StorkAssistant } from "@/components/mascot/StorkAssistant";
import { worldConfig } from "@/data/world-config";
import { useSmallScreen } from "@/hooks/use-small-screen";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const small = useSmallScreen();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const previousFocus = useRef<HTMLElement | null>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const sidebar = document.getElementById("main-navigation");
    const focusables = () =>
      Array.from(
        sidebar?.querySelectorAll<HTMLElement>("a, button") ?? [],
      ).filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
      if (event.key === "Tab") {
        const elements = focusables();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus.current && document.contains(previousFocus.current)) {
        previousFocus.current.focus();
      }
    };
  }, [menuOpen, closeMenu]);
  if (pathname === "/mascot-playground") return <>{children}</>;
  const isIslandRoute = pathname.startsWith("/path/");
  const isFullWidthRoute = pathname.startsWith("/lesson/") || isIslandRoute;
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Sidebar open={menuOpen} onClose={closeMenu} />
        <div
          className={`app-body ${isIslandRoute ? "island-route-body" : ""}`}
        >
          {!isIslandRoute && (
            <TopBar onMenuClick={() => setMenuOpen((p) => !p)} menuOpen={menuOpen} />
          )}
          <div
            className={`content-grid ${isFullWidthRoute ? "lesson-content-grid" : ""} ${isIslandRoute ? "island-content-grid" : ""}`}
            inert={menuOpen ? true : undefined}
          >
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            {!isFullWidthRoute && <ProgressPanel />}
          </div>
          {!isIslandRoute && (
            <footer className="app-footer" inert={menuOpen ? true : undefined}>
              <span>© {new Date().getFullYear()} Uplift</span>
              <span>Your potential. Your pace.</span>
              <span>
                Learn <span className="footer-dot">·</span> Grow{" "}
                <span className="footer-dot">·</span> Belong
              </span>
            </footer>
          )}
          {worldConfig.mascot.enabled && <StorkAssistant mobile={small} />}
        </div>
      </div>
    </MotionConfig>
  );
}
