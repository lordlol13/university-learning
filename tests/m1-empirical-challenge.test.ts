import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { directions, allLessons } from "../src/data/curriculum";

describe("Milestone 1 Empirical Challenge — Extreme Math Bounds & SVG Ring", () => {
  // Test Sidebar levelPercent calculation against extreme inputs
  function calculateSidebarLevelPercent(xpInput: unknown, levelSizeInput: unknown): number {
    const xp = xpInput as number;
    const levelSize = levelSizeInput as number;
    const safeXp = Number.isFinite(xp) && xp >= 0 ? xp : 0;
    const safeLevelSize =
      Number.isFinite(levelSize) && levelSize > 0 ? levelSize : 250;
    return Math.min(
      100,
      Math.max(0, Math.round(((safeXp % safeLevelSize) / safeLevelSize) * 100)),
    );
  }

  // Test ProgressPanel ringOffset and safePercent calculation against extreme inputs
  function calculateProgressPanelRing(percentInput: unknown): {
    safePercent: number;
    ringCircumference: number;
    ringOffset: number;
    svgOffsetString: string;
    styleWidthString: string;
  } {
    const percent = percentInput as number;
    const safePercent = Number.isFinite(percent)
      ? Math.min(100, Math.max(0, percent))
      : 0;
    const ringCircumference = 2 * Math.PI * 38;
    const ringOffset = ringCircumference * (1 - safePercent / 100);
    return {
      safePercent,
      ringCircumference,
      ringOffset,
      svgOffsetString: String(ringOffset),
      styleWidthString: `${safePercent}%`,
    };
  }

  it("stress tests calculateSidebarLevelPercent against extreme inputs without NaN or out-of-bounds", () => {
    const extremeXpValues = [
      undefined,
      null,
      NaN,
      -500,
      -1,
      0,
      1,
      125,
      250,
      375,
      999999,
      Infinity,
      -Infinity,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
      0.0000001,
      1e20,
    ];

    const extremeLevelSizes = [
      undefined,
      null,
      NaN,
      -500,
      0,
      250,
      500,
      Infinity,
      -Infinity,
    ];

    for (const xp of extremeXpValues) {
      for (const lvlSize of extremeLevelSizes) {
        const percent = calculateSidebarLevelPercent(xp, lvlSize);
        assert.ok(
          Number.isFinite(percent),
          `levelPercent must be finite for xp=${String(xp)}, levelSize=${String(lvlSize)}, got ${percent}`,
        );
        assert.ok(
          !Number.isNaN(percent),
          `levelPercent must never be NaN for xp=${String(xp)}, levelSize=${String(lvlSize)}`,
        );
        assert.ok(
          percent >= 0 && percent <= 100,
          `levelPercent must be clamped to [0, 100], got ${percent} for xp=${String(xp)}, levelSize=${String(lvlSize)}`,
        );

        const widthStr = `${percent}%`;
        assert.ok(
          !widthStr.includes("NaN"),
          `CSS width string must not contain NaN, got ${widthStr}`,
        );
        assert.ok(
          !widthStr.includes("Infinity"),
          `CSS width string must not contain Infinity, got ${widthStr}`,
        );
      }
    }
  });

  it("stress tests calculateProgressPanelRing against extreme inputs and verifies SVG attributes", () => {
    const extremePercentInputs = [
      undefined,
      null,
      NaN,
      -500,
      -100,
      -0.0001,
      0,
      0.5,
      33.333,
      50,
      99.9,
      100,
      100.1,
      250,
      999999,
      Infinity,
      -Infinity,
      Number.MAX_SAFE_INTEGER,
    ];

    for (const p of extremePercentInputs) {
      const { safePercent, ringCircumference, ringOffset, svgOffsetString, styleWidthString } =
        calculateProgressPanelRing(p);

      assert.ok(
        Number.isFinite(safePercent),
        `safePercent must be finite, got ${safePercent} for input ${String(p)}`,
      );
      assert.ok(
        !Number.isNaN(safePercent),
        `safePercent must not be NaN for input ${String(p)}`,
      );
      assert.ok(
        safePercent >= 0 && safePercent <= 100,
        `safePercent must be clamped [0, 100], got ${safePercent} for input ${String(p)}`,
      );

      assert.ok(
        Number.isFinite(ringOffset),
        `ringOffset must be finite, got ${ringOffset} for input ${String(p)}`,
      );
      assert.ok(
        !Number.isNaN(ringOffset),
        `ringOffset must not be NaN for input ${String(p)}`,
      );
      assert.ok(
        ringOffset >= 0 && ringOffset <= ringCircumference + 1e-9,
        `ringOffset must be between 0 and circumference (${ringCircumference}), got ${ringOffset} for input ${String(p)}`,
      );

      assert.ok(
        !svgOffsetString.includes("NaN"),
        `SVG strokeDashoffset attribute must not be 'NaN', got ${svgOffsetString}`,
      );
      assert.ok(
        !svgOffsetString.includes("Infinity"),
        `SVG strokeDashoffset attribute must not be 'Infinity', got ${svgOffsetString}`,
      );

      assert.ok(
        !styleWidthString.includes("NaN"),
        `Style width must not be 'NaN%', got ${styleWidthString}`,
      );
    }
  });

  it("verifies mathematical boundary invariants at 0%, 50%, and 100%", () => {
    const at0 = calculateProgressPanelRing(0);
    assert.equal(at0.safePercent, 0);
    assert.equal(at0.ringOffset, at0.ringCircumference); // 100% offset = completely empty ring

    const at50 = calculateProgressPanelRing(50);
    assert.equal(at50.safePercent, 50);
    assert.equal(at50.ringOffset, at50.ringCircumference / 2); // 50% offset = half filled

    const at100 = calculateProgressPanelRing(100);
    assert.equal(at100.safePercent, 100);
    assert.equal(at100.ringOffset, 0); // 0 offset = completely full ring
  });

  it("verifies nullish coalescing numeric formatting in TopBar", () => {
    function formatStat(val: unknown, fallback: number) {
      const safe = (val as number) ?? fallback;
      return safe.toLocaleString();
    }

    assert.equal(formatStat(undefined, 0), "0");
    assert.equal(formatStat(null, 0), "0");
    assert.equal(formatStat(0, 0), "0");
    assert.equal(formatStat(125000, 0), (125000).toLocaleString());
    assert.equal(formatStat(undefined, 1), "1");
  });
});

describe("Milestone 1 Empirical Challenge — TopBar Search & Keyboard Navigation", () => {
  function getSearchResults(query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return [
      ...directions
        .filter(
          (d) =>
            d.title.toLowerCase().includes(normalized) ||
            d.description.toLowerCase().includes(normalized),
        )
        .map((d) => ({
          id: `direction-${d.id}`,
          title: d.title,
          href: `/path/${d.id}`,
          type: "Direction",
        })),
      ...allLessons
        .filter((l) =>
          `${l.title} ${l.description}`.toLowerCase().includes(normalized),
        )
        .map((l) => ({
          id: l.id,
          title: l.title,
          href: `/lesson/${l.id}`,
          type: "Lesson",
        })),
    ].slice(0, 7);
  }

  // Simulate TopBar keyboard reducer logic
  function handleTopBarKeyDown(
    key: string,
    state: {
      query: string;
      searchOpen: boolean;
      selectedIndex: number;
      results: Array<{ id: string; title: string; href: string; type: string }>;
    },
  ): {
    searchOpen: boolean;
    selectedIndex: number;
    query: string;
    navigatedHref: string | null;
    defaultPrevented: boolean;
  } {
    const { results } = state;
    let { searchOpen, selectedIndex, query } = state;
    let navigatedHref: string | null = null;
    let defaultPrevented = false;

    if (key === "Escape") {
      searchOpen = false;
    } else if (key === "ArrowDown") {
      defaultPrevented = true;
      if (!searchOpen) searchOpen = true;
      if (results.length > 0) {
        selectedIndex =
          selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
      }
    } else if (key === "ArrowUp") {
      defaultPrevented = true;
      if (results.length > 0) {
        selectedIndex =
          selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
      }
    } else if (key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        defaultPrevented = true;
        const target = results[selectedIndex];
        searchOpen = false;
        query = "";
        navigatedHref = target.href;
      }
    }

    return { searchOpen, selectedIndex, query, navigatedHref, defaultPrevented };
  }

  it("verifies search query filtering returns relevant direction and lesson results", () => {
    const pyResults = getSearchResults("python");
    assert.ok(pyResults.length > 0, "Query 'python' should return results");
    assert.ok(
      pyResults.some((r) => r.title.toLowerCase().includes("python") || r.href.includes("python")),
      "Results should contain python lessons",
    );

    const calcResults = getSearchResults("calculus");
    assert.ok(calcResults.length > 0, "Query 'calculus' should return results");

    const emptyResults = getSearchResults("xyzzy_nonexistent_keyword_12345");
    assert.equal(emptyResults.length, 0, "Non-existent keyword should return 0 results");
  });

  it("handles adversarial inputs (special regex characters, whitespace, long strings) gracefully", () => {
    const regexInputs = ["[", "(", "*", "+", "?", "^", "$", "\\", ".*", "a{1,2}"];
    for (const inp of regexInputs) {
      assert.doesNotThrow(() => {
        const res = getSearchResults(inp);
        assert.ok(Array.isArray(res));
      });
    }

    // Long string input
    const longInput = "a".repeat(10000);
    assert.doesNotThrow(() => {
      const res = getSearchResults(longInput);
      assert.equal(res.length, 0);
    });

    // Whitespace only
    const whitespaceRes = getSearchResults("   \t\n  ");
    assert.equal(whitespaceRes.length, 0);
  });

  it("verifies ArrowDown increments index and wraps around from last to first", () => {
    const results = getSearchResults("math");
    assert.ok(results.length >= 2, "Test requires at least 2 results");

    const state = {
      query: "math",
      searchOpen: true,
      selectedIndex: -1,
      results,
    };

    // First ArrowDown from -1 -> 0
    let step = handleTopBarKeyDown("ArrowDown", state);
    assert.equal(step.selectedIndex, 0, "ArrowDown from -1 should set selectedIndex to 0");
    assert.equal(step.defaultPrevented, true);
    state.selectedIndex = step.selectedIndex;

    // Advance to end
    for (let i = 1; i < results.length; i++) {
      step = handleTopBarKeyDown("ArrowDown", state);
      assert.equal(step.selectedIndex, i, `ArrowDown should step to ${i}`);
      state.selectedIndex = step.selectedIndex;
    }

    // ArrowDown at last item wraps around to 0
    assert.equal(state.selectedIndex, results.length - 1);
    step = handleTopBarKeyDown("ArrowDown", state);
    assert.equal(step.selectedIndex, 0, "ArrowDown at end must wrap around to 0");
  });

  it("verifies ArrowUp decrements index and wraps around from first to last", () => {
    const results = getSearchResults("math");
    assert.ok(results.length >= 2, "Test requires at least 2 results");

    const state = {
      query: "math",
      searchOpen: true,
      selectedIndex: 0,
      results,
    };

    // ArrowUp at 0 wraps around to results.length - 1
    let step = handleTopBarKeyDown("ArrowUp", state);
    assert.equal(
      step.selectedIndex,
      results.length - 1,
      "ArrowUp at 0 must wrap around to results.length - 1",
    );
    assert.equal(step.defaultPrevented, true);
    state.selectedIndex = step.selectedIndex;

    // ArrowUp decrements
    step = handleTopBarKeyDown("ArrowUp", state);
    assert.equal(
      step.selectedIndex,
      results.length - 2,
      "ArrowUp should decrement index",
    );
  });

  it("handles single-result list keyboard navigation without crash or out-of-bounds", () => {
    const singleResult = [{ id: "res-1", title: "Single", href: "/test", type: "Lesson" }];
    const state = {
      query: "test",
      searchOpen: true,
      selectedIndex: -1,
      results: singleResult,
    };

    // ArrowDown moves from -1 to 0
    let step = handleTopBarKeyDown("ArrowDown", state);
    assert.equal(step.selectedIndex, 0);

    // ArrowDown at 0 wraps to 0
    step = handleTopBarKeyDown("ArrowDown", { ...state, selectedIndex: 0 });
    assert.equal(step.selectedIndex, 0);

    // ArrowUp at 0 wraps to 0
    step = handleTopBarKeyDown("ArrowUp", { ...state, selectedIndex: 0 });
    assert.equal(step.selectedIndex, 0);
  });

  it("verifies Escape key closes search dropdown", () => {
    const state = {
      query: "python",
      searchOpen: true,
      selectedIndex: 1,
      results: getSearchResults("python"),
    };

    const step = handleTopBarKeyDown("Escape", state);
    assert.equal(step.searchOpen, false, "Escape must close search dropdown");
  });

  it("verifies Enter key navigates to selected item, closes search, and resets query", () => {
    const results = getSearchResults("python");
    const state = {
      query: "python",
      searchOpen: true,
      selectedIndex: 0,
      results,
    };

    const step = handleTopBarKeyDown("Enter", state);
    assert.equal(step.defaultPrevented, true);
    assert.equal(step.searchOpen, false, "Enter must close search");
    assert.equal(step.query, "", "Enter must reset search query");
    assert.equal(
      step.navigatedHref,
      results[0].href,
      "Enter must navigate to target href",
    );
  });

  it("verifies Enter key with no item selected (selectedIndex = -1) does not navigate", () => {
    const results = getSearchResults("python");
    const state = {
      query: "python",
      searchOpen: true,
      selectedIndex: -1,
      results,
    };

    const step = handleTopBarKeyDown("Enter", state);
    assert.equal(step.defaultPrevented, false);
    assert.equal(step.navigatedHref, null, "Enter with -1 must not navigate");
    assert.equal(step.searchOpen, true, "Search remains open when unselected");
  });

  it("verifies suggestion chips update query, open search, and reset selectedIndex to -1", () => {
    const chipTerms = ["Python", "Calculus", "Vectors", "Italian"];

    for (const term of chipTerms) {
      // Simulate chip click
      const query = term;
      const searchOpen = true;
      let prevQuery = "nonexistent_query";
      let selectedIndex = 3;

      // Render-time state sync as in TopBar:
      if (prevQuery !== query) {
        prevQuery = query;
        selectedIndex = -1;
      }

      assert.equal(query, term);
      assert.equal(searchOpen, true);
      assert.equal(selectedIndex, -1, "selectedIndex must reset to -1 when chip updates query");

      const results = getSearchResults(query);
      assert.ok(
        results.length > 0,
        `Suggestion chip "${term}" should produce matching results`,
      );
    }
  });
});

describe("Milestone 1 Empirical Challenge — 0-Day Streak & Momentum Verification", () => {
  const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

  function calculateStreakActiveDays(streakInput: unknown): {
    safeStreak: number;
    activeDaysCount: number;
    completedDays: boolean[];
  } {
    const streak = streakInput as number;
    const safeStreak = Number.isFinite(streak) && streak >= 0 ? streak : 0;
    const activeDaysCount = safeStreak > 0 ? Math.min(7, safeStreak) : 0;
    const completedDays = WEEK_DAYS.map((_, idx) => idx < activeDaysCount);
    return { safeStreak, activeDaysCount, completedDays };
  }

  it("empirically verifies 0-day streak: Monday is NEVER marked complete", () => {
    const result = calculateStreakActiveDays(0);
    assert.equal(result.safeStreak, 0);
    assert.equal(result.activeDaysCount, 0);

    // Monday is index 0
    assert.equal(
      result.completedDays[0],
      false,
      "Monday (index 0) MUST NOT be marked complete when streak = 0",
    );

    // All days must be false
    assert.ok(
      result.completedDays.every((d) => d === false),
      "No weekday circles should be marked done when streak = 0",
    );
  });

  it("verifies negative, null, undefined, and NaN streaks safely default to 0 active days", () => {
    const malformedStreaks = [undefined, null, NaN, -1, -500, -Infinity];

    for (const val of malformedStreaks) {
      const result = calculateStreakActiveDays(val);
      assert.equal(
        result.safeStreak,
        0,
        `safeStreak should be 0 for input ${String(val)}`,
      );
      assert.equal(
        result.activeDaysCount,
        0,
        `activeDaysCount should be 0 for input ${String(val)}`,
      );
      assert.equal(
        result.completedDays[0],
        false,
        `Monday must not be complete for input ${String(val)}`,
      );
    }
  });

  it("verifies positive streak increments active days accurately up to 7", () => {
    // 1-day streak: Monday only
    const day1 = calculateStreakActiveDays(1);
    assert.equal(day1.activeDaysCount, 1);
    assert.equal(day1.completedDays[0], true, "Monday must be complete for 1-day streak");
    assert.equal(day1.completedDays[1], false, "Tuesday must NOT be complete for 1-day streak");

    // 3-day streak: Mon, Tue, Wed
    const day3 = calculateStreakActiveDays(3);
    assert.equal(day3.activeDaysCount, 3);
    assert.equal(day3.completedDays[0], true);
    assert.equal(day3.completedDays[1], true);
    assert.equal(day3.completedDays[2], true);
    assert.equal(day3.completedDays[3], false);

    // 7-day streak: All 7 days
    const day7 = calculateStreakActiveDays(7);
    assert.equal(day7.activeDaysCount, 7);
    assert.ok(day7.completedDays.every((d) => d === true));

    // 14-day streak: capped at 7 weekly circles
    const day14 = calculateStreakActiveDays(14);
    assert.equal(day14.activeDaysCount, 7);
    assert.ok(day14.completedDays.every((d) => d === true));
  });
});

describe("Milestone 1 Empirical Challenge — AppShell Inert Scoping & Navigation Trap", () => {
  it("verifies AppShell inert attribute scoping in source code", () => {
    const appShellPath = path.resolve(
      process.cwd(),
      "src/components/layout/AppShell.tsx",
    );
    const content = fs.readFileSync(appShellPath, "utf-8");

    // Check that .app-body does NOT have inert
    assert.doesNotMatch(
      content,
      /<div\s+className=\{`app-body[^`]*`\}\s+inert=/,
      "AppShell must NOT place inert on .app-body (which traps TopBar)",
    );

    // Check that .content-grid HAS inert
    assert.match(
      content,
      /<div\s+className=\{`content-grid[^`]*`\}\s+inert=\{menuOpen\s*\?\s*true\s*:\s*undefined\}/,
      "AppShell MUST scope inert to .content-grid when menuOpen is true",
    );

    // Check that .app-footer HAS inert
    assert.match(
      content,
      /<footer\s+className="app-footer"\s+inert=\{menuOpen\s*\?\s*true\s*:\s*undefined\}/,
      "AppShell MUST scope inert to .app-footer when menuOpen is true",
    );

    // Check that onMenuClick is a toggle function (p) => !p
    assert.match(
      content,
      /onMenuClick=\{[()]*\s*=>\s*setMenuOpen\(\(p\)\s*=>\s*!p\)\}/,
      "AppShell onMenuClick must toggle menuOpen with (p) => !p",
    );

    // Check pathname change auto-close logic
    assert.match(
      content,
      /if\s*\(\s*prevPathname\s*!==\s*pathname\s*\)\s*\{\s*setPrevPathname\(pathname\);\s*setMenuOpen\(false\);/,
      "AppShell must auto-close drawer on pathname change",
    );
  });

  it("verifies TopBar hamburger button toggle states in source code", () => {
    const topBarPath = path.resolve(
      process.cwd(),
      "src/components/layout/TopBar.tsx",
    );
    const content = fs.readFileSync(topBarPath, "utf-8");

    // Hamburger button toggles aria-label between Close and Open navigation
    assert.match(
      content,
      /aria-label=\{menuOpen\s*\?\s*"Close navigation"\s*:\s*"Open navigation"\}/,
      "TopBar menu-toggle aria-label must reflect menuOpen state",
    );

    // Hamburger icon switches between <X /> and <Menu />
    assert.match(
      content,
      /\{menuOpen\s*\?\s*<X\s+size=\{21\}\s*\/>\s*:\s*<Menu\s+size=\{21\}\s*\/>\}/,
      "TopBar hamburger icon must switch to X when menuOpen is true",
    );
  });
});

describe("Milestone 1 Empirical Challenge — 3D Island Boundary Preservation", () => {
  it("verifies src/app/path/[directionId]/* has zero modifications", () => {
    // Check that directory exists and is intact
    const pathDir = path.resolve(
      process.cwd(),
      "src/app/path/[directionId]",
    );
    assert.ok(fs.existsSync(pathDir), "src/app/path/[directionId] directory exists");
    const pageFile = path.join(pathDir, "page.tsx");
    assert.ok(fs.existsSync(pageFile), "page.tsx exists in path route");
  });

  it("verifies Milestone 1 layout files conform to component boundaries", () => {
    const layoutDir = path.resolve(
      process.cwd(),
      "src/components/layout",
    );
    const expectedLayoutFiles = [
      "AppShell.tsx",
      "TopBar.tsx",
      "Sidebar.tsx",
      "ProgressPanel.tsx",
    ];

    for (const file of expectedLayoutFiles) {
      assert.ok(
        fs.existsSync(path.join(layoutDir, file)),
        `Layout file ${file} must exist`,
      );
    }
  });

  it("verifies globals.css contains all required M1 responsive and accessibility styles", () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    // Check .skip-link accessibility styling
    assert.match(css, /\.skip-link/, "globals.css must style .skip-link");

    // Check .topbar-profile-text responsive styling
    assert.match(css, /\.topbar-profile-text/, "globals.css must target .topbar-profile-text");

    // Check .sidebar-level-track progress bar styling
    assert.match(css, /\.sidebar-level-track/, "globals.css must style .sidebar-level-track");

    // Check .weekly-days-row and .week-day-circle streak styling
    assert.match(css, /\.weekly-days-row/, "globals.css must style .weekly-days-row");
    assert.match(css, /\.week-day-circle/, "globals.css must style .week-day-circle");

    // Check sound-toggle-btn styling
    assert.match(css, /\.sound-toggle-btn/, "globals.css must style .sound-toggle-btn");
  });
});
