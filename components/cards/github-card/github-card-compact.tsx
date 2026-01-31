"use client";

import "./github-card-compact.css";
import { Flame } from "lucide-react";
import { MiniActivityStrip } from "./activity-graph";
import type { ContributionsData } from "./types";

/* Semantic class names – styles live in github-card-compact.css */
const classes = {
  root: "github-card-compact__root",
  contributionNumberBlock: "github-card-compact__contribution-number-block",
  contributionNumber: "github-card-compact__contribution-number",
  footer: "github-card-compact__footer",
  contributionLabel: "github-card-compact__contribution-label",
  streakRow: "github-card-compact__streak-row",
  flameIcon: "github-card-compact__flame-icon",
  streakLongest: "github-card-compact__streak-longest",
} as const;

type GithubCardCompactProps = {
  contributions: ContributionsData;
};

export function GithubCardCompact({
  contributions,
}: GithubCardCompactProps) {
  return (
    <div className={classes.root}>
      <div className={classes.contributionNumberBlock}>
        <span className={classes.contributionNumber}>
          {contributions.totalContributions}
        </span>
      </div>

      <footer className={classes.footer}>
        <span className={classes.contributionLabel}>
          contributions · past 6 months
        </span>
        <MiniActivityStrip weeks={contributions.weeks} />
        <div className={classes.streakRow}>
          <Flame className={classes.flameIcon} aria-hidden />
          <span>
            {contributions.currentStreak} day streak
            <span className={classes.streakLongest}>
              {" "}
              · Longest {contributions.longestStreak}
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}
