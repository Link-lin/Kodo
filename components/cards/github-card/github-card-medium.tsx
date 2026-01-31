"use client";

import { ActivityGraph } from "./activity-graph";
import type { ContributionsData } from "./types";

type GithubCardMediumProps = {
  contributions: ContributionsData;
};

export function GithubCardMedium({
  contributions,
}: GithubCardMediumProps) {
  return (
    <>
      <div className="flex items-baseline gap-2 text-sm">
        <span className="font-medium">{contributions.totalContributions}</span>
        <span className="text-muted-foreground">
          contributions in past 6 months
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">
          Current streak: {contributions.currentStreak} days · Longest:{" "}
          {contributions.longestStreak}
        </span>
        <div className="min-h-[90px] overflow-x-auto rounded border border-border/50 bg-muted/30 p-2">
          <ActivityGraph weeks={contributions.weeks} />
        </div>
      </div>
    </>
  );
}
