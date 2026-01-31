"use client";

import { ActivityGraph } from "./activity-graph";
import type { ContributionsData, CommitInfo } from "./types";

type GithubCardExpandedProps = {
  contributions: ContributionsData;
  commits: CommitInfo[];
};

export function GithubCardExpanded({
  contributions,
  commits,
}: GithubCardExpandedProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex shrink-0 items-baseline gap-2 text-sm">
        <span className="font-medium">{contributions.totalContributions}</span>
        <span className="text-muted-foreground">
          contributions in past 6 months
        </span>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <span className="text-muted-foreground text-xs">
          Current streak: {contributions.currentStreak} days · Longest:{" "}
          {contributions.longestStreak}
        </span>
        <div className="min-h-[90px] shrink-0 overflow-x-auto rounded border border-border/50 bg-muted/30 p-2">
          <ActivityGraph weeks={contributions.weeks} />
        </div>
      </div>
      {commits.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-1">
          <span className="text-muted-foreground shrink-0 text-xs font-medium">
            Recent commits
          </span>
          <div className="min-h-[100px] min-w-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-1.5 pr-1">
              {commits.map((c, i) => (
                <a
                  key={i}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded border border-border/50 bg-muted/20 px-2 py-1.5 text-xs transition-colors hover:bg-muted/40"
                >
                  <div className="truncate font-medium text-foreground/90">
                    {c.repo}
                  </div>
                  <div className="line-clamp-2 truncate text-muted-foreground">
                    {c.message || "(no message)"}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
