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
};

export type CommitInfo = {
  repo: string;
  message: string;
  sha: string;
  url: string;
};
