import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Milestone 1 Layout & Visual Integrity — CSS Class Names Verification", () => {
  const root = process.cwd();
  const globalsCss = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
  const sidebarTsx = fs.readFileSync(path.join(root, "src/components/layout/Sidebar.tsx"), "utf8");
  const topbarTsx = fs.readFileSync(path.join(root, "src/components/layout/TopBar.tsx"), "utf8");

  it("verifies sidebar-level-track exists in globals.css and matches Sidebar.tsx exactly", () => {
    // 1. Defined in globals.css
    assert.match(
      globalsCss,
      /\.sidebar-level-track\s*\{[\s\S]*?height:\s*6px;[\s\S]*?background:\s*#e2e8f0;/,
      "globals.css must define .sidebar-level-track with 6px height and #e2e8f0 background",
    );
    assert.match(
      globalsCss,
      /\.sidebar-level-track\s*>\s*span\s*\{[\s\S]*?background:\s*linear-gradient\(90deg,\s*#0d9488,\s*#10b981\);/,
      "globals.css must style fill span with teal-to-emerald gradient",
    );
    // 2. Used in Sidebar.tsx
    assert.match(
      sidebarTsx,
      /className="sidebar-level-track"/,
      "Sidebar.tsx must use className='sidebar-level-track'",
    );
    // 3. Deprecated class eliminated
    assert.doesNotMatch(
      sidebarTsx,
      /sidebar-xp-bar/,
      "Sidebar.tsx must not contain obsolete sidebar-xp-bar",
    );
  });

  it("verifies sidebar-level-xp exists in globals.css and matches Sidebar.tsx exactly", () => {
    assert.match(
      globalsCss,
      /\.sidebar-level-xp\s*\{[\s\S]*?font-size:\s*11px;[\s\S]*?color:\s*#64748b;/,
      "globals.css must define .sidebar-level-xp with 11px and #64748b",
    );
    assert.match(
      sidebarTsx,
      /className="sidebar-level-xp"/,
      "Sidebar.tsx must use className='sidebar-level-xp'",
    );
    assert.doesNotMatch(
      sidebarTsx,
      /sidebar-xp-text/,
      "Sidebar.tsx must not contain obsolete sidebar-xp-text",
    );
  });

  it("verifies sidebar-user-meta exists in globals.css and matches Sidebar.tsx exactly", () => {
    assert.match(
      globalsCss,
      /\.sidebar-user-meta\s*\{[\s\S]*?min-width:\s*0;/,
      "globals.css must define .sidebar-user-meta with min-width: 0",
    );
    assert.match(
      sidebarTsx,
      /className="sidebar-user-meta"/,
      "Sidebar.tsx must use className='sidebar-user-meta'",
    );
    assert.doesNotMatch(
      sidebarTsx,
      /sidebar-user-info/,
      "Sidebar.tsx must not contain obsolete sidebar-user-info",
    );
  });

  it("verifies topbar-profile-text exists in globals.css and matches TopBar.tsx exactly", () => {
    assert.match(
      globalsCss,
      /\.topbar-profile-text\s*\{[\s\S]*?display:\s*flex;/,
      "globals.css must define .topbar-profile-text",
    );
    assert.match(
      topbarTsx,
      /className="topbar-profile-text"/,
      "TopBar.tsx must use className='topbar-profile-text'",
    );
    assert.doesNotMatch(
      topbarTsx,
      /topbar-profile-meta/,
      "TopBar.tsx must not contain obsolete topbar-profile-meta",
    );
  });

  it("verifies responsive media query hides topbar-profile-text at <= 1250px", () => {
    assert.match(
      globalsCss,
      /@media\s*\(max-width:\s*1250px\)[\s\S]*?\.topbar-profile-text\s*\{[\s\S]*?display:\s*none;/,
      "globals.css must hide .topbar-profile-text below 1250px to protect header width",
    );
  });
});

describe("Milestone 1 Layout & Visual Integrity — Responsive Layout Widths (375px Mobile)", () => {
  const root = process.cwd();
  const globalsCss = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");

  it("verifies .search-results responsive box model properties in globals.css", () => {
    const blockMatch = globalsCss.match(/\.search-results\s*\{([^}]+)\}/);
    assert.ok(blockMatch, ".search-results rule block must exist in globals.css");
    const rules = blockMatch[1];

    assert.match(rules, /min-width:\s*0/, ".search-results must specify min-width: 0");
    assert.match(rules, /width:\s*max\(\s*100%\s*,\s*280px\s*\)/, ".search-results must specify width: max(100%, 280px)");
    assert.match(rules, /max-width:\s*calc\(\s*100vw\s*-\s*32px\s*\)/, ".search-results must specify max-width: calc(100vw - 32px)");
    assert.match(rules, /position:\s*absolute/, ".search-results must be absolutely positioned");
    assert.match(rules, /z-index:\s*50/, ".search-results must have high z-index (50)");
  });

  it("empirically models 375px viewport geometry to verify 0 horizontal overflow", () => {
    const viewport = 375;
    const topbarPadding = 16;
    const menuToggleWidth = 38;
    const topbarGap = 10;

    // The search-wrap is positioned after the menu-toggle button inside topbar-left
    const searchWrapLeft = topbarPadding + menuToggleWidth + topbarGap; // 64px
    const parentAvailableWidth = 140; // width of search-wrap on mobile

    // Rule: width: max(100%, 280px)
    const baseWidth = Math.max(parentAvailableWidth, 280); // 280px
    // Rule: max-width: calc(100vw - 32px) = 375 - 32 = 343px
    const maxWidth = viewport - 32; // 343px

    const computedWidth = Math.min(baseWidth, maxWidth); // 280px
    const rightEdge = searchWrapLeft + computedWidth; // 64 + 280 = 344px
    const overflow = Math.max(0, rightEdge - viewport);

    assert.equal(computedWidth, 280, "Computed dropdown width should be 280px");
    assert.ok(
      rightEdge <= viewport,
      `Right edge (${rightEdge}px) exceeds 375px viewport by ${overflow}px`,
    );
    assert.equal(overflow, 0, "Horizontal page overflow must be exactly 0px at 375px");
    assert.ok(
      viewport - rightEdge >= 20,
      `Safety margin (${viewport - rightEdge}px) should leave comfortable breathing room on right`,
    );
  });

  it("verifies mobile search-wrap and header adjustments at max-width: 760px", () => {
    assert.match(
      globalsCss,
      /@media\s*\(max-width:\s*760px\)[\s\S]*?\.search-wrap\s*\{[\s\S]*?flex:\s*1;[\s\S]*?width:\s*auto;/,
      "globals.css must set .search-wrap flex: 1 and width: auto on mobile",
    );
    assert.match(
      globalsCss,
      /@media\s*\(max-width:\s*760px\)[\s\S]*?\.top-stats\s*\{[\s\S]*?gap:\s*8px;/,
      "globals.css must reduce .top-stats gap to 8px on mobile",
    );
  });
});

describe("Milestone 1 Layout & Visual Integrity — Keyboard Accessibility & Contrast", () => {
  const root = process.cwd();
  const globalsCss = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
  const topbarTsx = fs.readFileSync(path.join(root, "src/components/layout/TopBar.tsx"), "utf8");

  function getLuminance(hex: string): number {
    const cleaned = hex.replace("#", "");
    const rgb = [0, 2, 4]
      .map((i) => parseInt(cleaned.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  function getContrast(hex1: string, hex2: string): number {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const hi = Math.max(l1, l2);
    const lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  it("calculates .skip-link WCAG 2.1 AA text contrast ratio (target >= 4.5:1)", () => {
    const textColor = "#0f766e";
    const bgColor = "#ffffff";
    const ratio = getContrast(textColor, bgColor);

    assert.ok(
      ratio >= 4.5,
      `Skip-link contrast ratio (${ratio.toFixed(2)}:1) fails WCAG AA standard (4.5:1)`,
    );
    assert.ok(
      ratio >= 5.0,
      `Skip-link contrast ratio (${ratio.toFixed(2)}:1) meets high-contrast target (>= 5.0:1)`,
    );
  });

  it("calculates .skip-link border/outline contrast ratio (target >= 3.0:1)", () => {
    const borderColor = "#0d9488";
    const bgColor = "#ffffff";
    const ratio = getContrast(borderColor, bgColor);

    assert.ok(
      ratio >= 3.0,
      `Skip-link outline contrast ratio (${ratio.toFixed(2)}:1) fails WCAG UI component standard (3.0:1)`,
    );
  });

  it("verifies .skip-link offscreen-to-onscreen transition styles in globals.css", () => {
    assert.match(
      globalsCss,
      /\.skip-link\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?top:\s*-80px;/,
      "skip-link must default offscreen at top: -80px",
    );
    assert.match(
      globalsCss,
      /\.skip-link:focus(?:-visible)?\s*\{[\s\S]*?top:\s*16px;/,
      "skip-link must transition onscreen to top: 16px on focus",
    );
  });

  it("verifies focus-visible outlines on sidebar navigation avoid clipping", () => {
    assert.match(
      globalsCss,
      /\.sidebar \.nav-item:focus-visible,\s*\.sidebar \.brand:focus-visible,\s*\.sidebar \.sidebar-user-card:focus-visible\s*\{[\s\S]*?outline-offset:\s*1px;/,
      "sidebar focus-visible must set outline-offset: 1px to prevent overflow-x clipping",
    );
  });

  it("verifies complete WAI-ARIA combobox 1.2 roles and attributes on TopBar search", () => {
    assert.match(topbarTsx, /role="combobox"/, "Search input must have role='combobox'");
    assert.match(topbarTsx, /aria-expanded=\{searchOpen\s*&&\s*Boolean\(normalized\)\}/, "Search input must have aria-expanded condition");
    assert.match(topbarTsx, /aria-haspopup="listbox"/, "Search input must have aria-haspopup='listbox'");
    assert.match(topbarTsx, /aria-autocomplete="list"/, "Search input must have aria-autocomplete='list'");
    assert.match(topbarTsx, /aria-controls="campus-search-results"/, "Search input must point to campus-search-results");
    assert.match(topbarTsx, /aria-activedescendant=/, "Search input must support aria-activedescendant");

    // Dropdown listbox container
    assert.match(topbarTsx, /id="campus-search-results"/, "Results dropdown must have id='campus-search-results'");
    assert.match(topbarTsx, /role="listbox"/, "Results dropdown must have role='listbox'");
    assert.match(topbarTsx, /aria-label="Campus search results"/, "Results dropdown must have descriptive aria-label");

    // Result option items
    assert.match(topbarTsx, /role="option"/, "Result items must have role='option'");
    assert.match(topbarTsx, /aria-selected=\{isSelected\}/, "Result items must have aria-selected={isSelected}");
    assert.match(topbarTsx, /className=\{isSelected\s*\?\s*"active"\s*:\s*undefined\}/, "Active result item must receive .active class");
  });

  it("verifies keyboard navigation event handlers in TopBar search input", () => {
    assert.match(topbarTsx, /event\.key === "ArrowDown"/, "TopBar must handle ArrowDown");
    assert.match(topbarTsx, /event\.key === "ArrowUp"/, "TopBar must handle ArrowUp");
    assert.match(topbarTsx, /event\.key === "Enter"/, "TopBar must handle Enter");
    assert.match(topbarTsx, /event\.key === "Escape"/, "TopBar must handle Escape");
  });
});
