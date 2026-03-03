"use client";

import "./github-card.css";
import { GithubCardMediumContent } from "./github-card-medium";
import type { ContributionsData, CommitInfo } from "./types";

type GithubCardExpandedProps = {
  contributions: ContributionsData;
  commits: CommitInfo[];
  commitsError?: string | null;
};

/** Format commit SHA for display (first 7 chars). */
function shortSha(sha: string): string {
  return sha.length >= 7 ? sha.slice(0, 7) : sha;
}

export function GithubCardExpanded({
  contributions,
  commits,
  commitsError,
}: GithubCardExpandedProps) {
  const showCommitsSection = commits.length > 0 || commitsError;
  return (
    <div className="github-card github-card--expanded">
      <GithubCardMediumContent contributions={contributions} />
      {showCommitsSection && (
        <section
          className="github-card__detail-section"
          aria-label="Recent commits"
        >
          <h3 className="github-card__detail-label">Recent commits</h3>
          <div className="github-card__detail">
            {commits.length > 0 ? (
              <ul className="github-card__detail-list">
                {commits.map((c, i) => (
                  <li key={c.sha ?? i}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="github-card__commit-link"
                    >
                      <div className="github-card__commit-header">
                        <span className="github-card__commit-repo">{c.repo}</span>
                        {c.sha && (
                          <code className="github-card__commit-sha" title={c.sha}>
                            {shortSha(c.sha)}
                          </code>
                        )}
                      </div>
                      <div className="github-card__commit-message">
                        {c.message || "(no message)"}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ) : commitsError ? (
              <p className="github-card__detail-error" role="status">
                {commitsError}
              </p>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
