"use client";

import { Flame } from "lucide-react";
import { MiniActivityStrip } from "./activity-graph";
import type { ContributionsData } from "./types";

type GithubCardCompactProps = {
  contributions: ContributionsData;
};

export function GithubCardCompact({
  contributions,
}: GithubCardCompactProps) {
  return (
    <div className="flex p-1 h-full min-h-0 flex-col gap-2">
      <div className="flex min-h-0 flex-1 flex-col justify-start">
        <span
          className="tabular-nums font-bold text-foreground [font-size:clamp(2.5rem,min(12vw,12vh),5rem)] leading-none"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {contributions.totalContributions}
        </span>
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <span className="text-muted-foreground text-xs">
          contributions · past 6 months
        </span>
        <MiniActivityStrip weeks={contributions.weeks} />
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Flame className="size-3.5 shrink-0 text-orange-500" />
          <span>
            {contributions.currentStreak} day streak
            <span className="text-muted-foreground/80">
              {" "}
              · Longest {contributions.longestStreak}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
