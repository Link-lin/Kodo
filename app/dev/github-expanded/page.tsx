"use client";

import { GithubCardExpanded } from "@/components/cards/github-card/github-card-expanded";
import type {
  ContributionsData,
  CommitInfo,
} from "@/components/cards/github-card/types";
import {
  GRID_COLS,
  GRID_CELL_SIZE_PX,
  GRID_GAP_PX,
  GRID_SPAN,
} from "@/lib/card-types";
import { Github } from "lucide-react";

/** Mock contributions for dev/screenshot: 26 weeks, some activity */
function mockContributions(): ContributionsData {
  const weeks: ContributionsData["weeks"] = [];
  const colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
  const start = new Date();
  start.setDate(start.getDate() - 26 * 7);
  let total = 0;

  for (let w = 0; w < 26; w++) {
    const contributionDays = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const count =
        Math.random() > 0.4 ? Math.floor(Math.random() * 8) + 1 : 0;
      total += count;
      contributionDays.push({
        date: date.toISOString().slice(0, 10),
        contributionCount: count,
        color: count
          ? colors[Math.min(4, Math.ceil(count / 2))]
          : colors[0],
      });
    }
    weeks.push({ contributionDays });
  }

  return {
    totalContributions: total,
    weeks,
    currentStreak: 12,
    longestStreak: 28,
    periodLabel: "Past 6 months",
  };
}

/** Mock recent commits for expanded card dev view */
function mockCommits(): CommitInfo[] {
  return [
    {
      repo: "owner/kodo",
      message: "feat: add expanded github card with recent commits section",
      sha: "a1b2c3d4e5f6789012345678",
      url: "https://github.com/owner/kodo/commit/a1b2c3d",
    },
    {
      repo: "owner/kodo",
      message: "fix: ensure activity graph respects size prop in medium layout",
      sha: "b2c3d4e5f67890123456789",
      url: "https://github.com/owner/kodo/commit/b2c3d4e",
    },
    {
      repo: "owner/other-repo",
      message: "chore(deps): bump next to 15.1",
      sha: "c3d4e5f678901234567890",
      url: "https://github.com/owner/other-repo/commit/c3d4e5f",
    },
    {
      repo: "owner/kodo",
      message:
        "refactor: extract GithubCardMediumContent for reuse in expanded card",
      sha: "d4e5f6789012345678901",
      url: "https://github.com/owner/kodo/commit/d4e5f67",
    },
    {
      repo: "owner/kodo",
      message: "style: add commit SHA and header layout in recent commits list",
      sha: "e5f67890123456789012",
      url: "https://github.com/owner/kodo/commit/e5f6789",
    },
  ];
}

export default function DevGithubExpandedPage() {
  const contributions = mockContributions();
  const commits = mockCommits();
  const span = GRID_SPAN.expanded;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div
        className="overflow-hidden rounded-xl"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, ${GRID_CELL_SIZE_PX}px)`,
          gridAutoRows: `${GRID_CELL_SIZE_PX}px`,
          gap: `${GRID_GAP_PX}px`,
          width: "max-content",
        }}
      >
        <div
          className="flex h-full min-h-0 flex-col"
          style={{
            gridColumn: `1 / span ${span.col}`,
            gridRow: `1 / span ${span.row}`,
          }}
        >
          <div className="flex h-full min-h-0 overflow-hidden rounded-xl border bg-card py-2 shadow-sm transition-all duration-300 ease-out hover:shadow-md">
            <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-1">
              <span className="flex min-w-0 items-center gap-1.5 truncate text-xs font-medium">
                <Github className="size-4 shrink-0" />
                Github
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-4 pt-0.5">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
                <GithubCardExpanded
                  contributions={contributions}
                  commits={commits}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
