"use client";

import "./github-card.css";
import { ActivityGraph, getDisplayedTotal } from "./activity-graph";
import { Flame } from "lucide-react";
import type { ContributionsData } from "./types";

const ACTIVITY_LEGEND_LEVELS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

type GithubCardMediumProps = {
  contributions: ContributionsData;
};

export function GithubCardMedium({
  contributions,
}: GithubCardMediumProps) {
  const displayedTotal = getDisplayedTotal(contributions.weeks);
  return (
    <div className="github-card github-card--medium">
      <section className="github-card-medium__metric" aria-label="Contribution summary">
        <span className="github-card-medium__value" aria-hidden>
          {displayedTotal}
        </span>
        <div className="github-card-medium__metric-label">
          <span className="github-card-medium__metric-title">Contributions</span>
          <span className="github-card-medium__metric-context">
            {contributions.periodLabel ?? "Past 6 months"}
          </span>
        </div>
      </section>

      <div className="github-card-medium__streaks" role="group" aria-label="Contribution streaks">
        <div className="github-card-medium__streak github-card-medium__streak--current">
          <Flame className="github-card__flame-icon" aria-hidden />
          <span>
            <strong className="github-card__streak-value">{contributions.currentStreak}</strong> day streak
          </span>
        </div>
        <span className="github-card-medium__streak-divider" aria-hidden />
        <div className="github-card-medium__streak github-card-medium__streak--longest">
          <span>Longest</span>
          <strong className="github-card__streak-value">{contributions.longestStreak}</strong>
        </div>
      </div>

      <section className="github-card-medium__activity" aria-label="Contribution activity">
        <div className="github-card__graph-container github-card__graph-container--medium">
          <ActivityGraph weeks={contributions.weeks} size="medium" />
        </div>
        <div className="github-card-medium__legend" aria-hidden>
          <span className="github-card-medium__legend-text">Less</span>
          <div className="github-card-medium__legend-swatches">
            {ACTIVITY_LEGEND_LEVELS.map((color, i) => (
              <span
                key={i}
                className="github-card-medium__legend-swatch"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="github-card-medium__legend-text">More</span>
        </div>
      </section>
    </div>
  );
}
