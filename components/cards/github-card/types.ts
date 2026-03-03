export type ContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
};

export type ContributionsData = {
  totalContributions: number;
  weeks: { contributionDays: ContributionDay[] }[];
  currentStreak: number;
  longestStreak: number;
  /** Optional label for the period (e.g. "Past 6 months"). Used by mock; API data omits it. */
  periodLabel?: string;
};

export type CommitInfo = {
  repo: string;
  message: string;
  sha: string;
  url: string;
};
