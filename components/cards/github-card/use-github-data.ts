"use client";

import * as React from "react";
import type { ContributionsData, CommitInfo } from "./types";

export function useGitHubData(
  username: string,
  githubToken: string
): {
  contributions: ContributionsData | null;
  commits: CommitInfo[];
  loading: boolean;
  error: string | null;
} {
  const [contributions, setContributions] =
    React.useState<ContributionsData | null>(null);
  const [commits, setCommits] = React.useState<CommitInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!username) {
      setLoading(false);
      setContributions(null);
      setCommits([]);
      return;
    }

    setLoading(true);
    setError(null);

    const headers: HeadersInit = githubToken
      ? { "X-GitHub-Token": githubToken }
      : {};

    fetch(`/api/github?username=${encodeURIComponent(username)}`, { headers })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? `Request failed (${r.status})`);
        if (data.error) throw new Error(data.error);
        return data;
      })
      .then((data) => {
        setContributions(data.contributions);
        setCommits(data.commits ?? []);
      })
      .catch((err) =>
        setError(
          err?.message ?? "Failed to fetch. Add GitHub token in Settings."
        )
      )
      .finally(() => setLoading(false));
  }, [username, githubToken]);

  return { contributions, commits, loading, error };
}
