"use client";

import "./github-card.css";
import { ActivityGraph, getDisplayedTotal } from "./activity-graph";
import type { ContributionsData, CommitInfo } from "./types";

type GithubCardExpandedProps = {
  contributions: ContributionsData;
  commits: CommitInfo[];
};

export function GithubCardExpanded({
  contributions,
  commits,
}: GithubCardExpandedProps) {
  const displayedTotal = getDisplayedTotal(contributions.weeks);
  return (
    <div className="github-card github-card--expanded">
      <div className="github-card__summary-row github-card__summary-row--expanded">
        <span className="github-card__summary-count github-card__summary-count--expanded">{displayedTotal}</span>
        <span className="github-card__contribution-label">
          contributions in {contributions.periodLabel ?? "past 6 months"}
        </span>
      </div>
      <div className="github-card__summary-block">
        <span className="github-card__streak-row">
          Current streak: {contributions.currentStreak} days · Longest:{" "}
          {contributions.longestStreak}
        </span>
        <div className="github-card__graph-container github-card__graph-container--expanded">
          <ActivityGraph weeks={contributions.weeks} />
        </div>
      </div>
      {commits.length > 0 && (
        <div className="github-card__detail-section">
          <span className="github-card__detail-label">
            Recent commits
          </span>
          <div className="github-card__detail">
            <div className="github-card__detail-list">
              {commits.map((c, i) => (
                <a
                  key={i}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-card__commit-link"
                >
                  <div className="github-card__commit-repo">
                    {c.repo}
                  </div>
                  <div className="github-card__commit-message">
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
