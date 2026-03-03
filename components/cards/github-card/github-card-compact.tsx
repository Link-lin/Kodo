"use client";

import "./github-card.css";
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
    <div className="github-card github-card--compact">
      <div className="github-card__hero-block">
        <span className="github-card__hero-number">
          {contributions.totalContributions}
        </span>
      </div>

      <footer className="github-card__footer">
        <span className="github-card__contribution-label">
          contributions · {contributions.periodLabel ?? "past 6 months"}
        </span>
        <MiniActivityStrip weeks={contributions.weeks} />
        <div className="github-card__streak-row">
          <Flame className="github-card__flame-icon" aria-hidden />
          <span>
            {contributions.currentStreak} day streak
            <span className="github-card__streak-longest">
              {" "}
              · Longest {contributions.longestStreak}
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}
