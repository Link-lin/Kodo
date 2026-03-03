import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN ?? process.env.NEXT_PUBLIC_GITHUB_TOKEN;

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json(
      { error: "Username required" },
      { status: 400 }
    );
  }

  const clientToken = request.headers.get("X-GitHub-Token");
  const token = clientToken || GITHUB_TOKEN;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 6);

  const query = `query($user: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $user) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }`;

  try {
    const [graphqlRes, eventsRes] = await Promise.all([
      fetch("https://api.github.com/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          variables: {
            user: username,
            from: from.toISOString(),
            to: to.toISOString(),
          }
        }),
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=100`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      ),
    ]);

    const graphqlData = await graphqlRes.json();
    let eventsData: unknown = [];
    let commitsError: string | null = null;
    try {
      const rawEvents = await eventsRes.json();
      if (eventsRes.ok && Array.isArray(rawEvents)) {
        eventsData = rawEvents;
      } else if (!eventsRes.ok && typeof rawEvents === "object" && rawEvents !== null && "message" in rawEvents) {
        commitsError = String((rawEvents as { message?: unknown }).message) || "Events request failed";
      }
    } catch {
      // events response not JSON or failed to parse
      commitsError = "Could not load events";
    }

    const rateLimitMsg =
      "Add GITHUB_TOKEN to .env.local (create at github.com/settings/tokens), then restart the dev server.";

    if (graphqlData.errors) {
      const msg = graphqlData.errors[0]?.message ?? "GraphQL error";
      const isRateLimit = /rate limit/i.test(msg);
      return NextResponse.json(
        { error: isRateLimit ? `${msg} ${rateLimitMsg}` : msg },
        { status: graphqlRes.ok ? 200 : graphqlRes.status }
      );
    }

    if (!graphqlRes.ok) {
      const msg = graphqlData.message ?? "GitHub API error.";
      const isRateLimit = /rate limit/i.test(msg);
      return NextResponse.json(
        {
          error: isRateLimit
            ? `API rate limit exceeded. ${rateLimitMsg}`
            : `${msg} ${rateLimitMsg}`,
        },
        { status: graphqlRes.status }
      );
    }

    const user = graphqlData?.data?.user;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cal = user?.contributionsCollection?.contributionCalendar;
    const weeks = cal?.weeks ?? [];
    const totalContributions = cal?.totalContributions ?? 0;

    const commits: Array<{
      repo: string;
      message: string;
      sha: string;
      url: string;
    }> = [];
    const headOnlyPushes: Array<{ repo: string; head: string }> = [];

    if (Array.isArray(eventsData)) {
      for (const e of eventsData) {
        if (e.type !== "PushEvent") continue;
        const repo = e.repo?.name ?? "";
        const payload = e.payload as {
          commits?: Array<{ sha?: string; message?: string }>;
          head?: string;
          ref?: string;
        } | undefined;
        if (!payload) continue;

        if (Array.isArray(payload.commits) && payload.commits.length > 0) {
          for (const c of payload.commits) {
            if (commits.length >= 15) break;
            commits.push({
              repo,
              message: (c.message ?? "").split("\n")[0] ?? "(no message)",
              sha: c.sha ?? "",
              url: `https://github.com/${repo}/commit/${c.sha}`,
            });
          }
        } else if (payload.head && repo) {
          headOnlyPushes.push({ repo, head: payload.head });
        }
      }
    }

    // Fetch commit messages for PushEvents that omitted payload.commits (max 5 extra requests)
    const maxHeadFetches = 5;
    const toFetch = headOnlyPushes.slice(0, maxHeadFetches);
    const eventHeaders = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const headCommitResults = await Promise.all(
      toFetch.map(async ({ repo, head }) => {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${repo}/commits/${head}`,
            { headers: eventHeaders }
          );
          if (!res.ok) return { repo, head, message: null };
          const data = (await res.json()) as {
            commit?: { message?: string | null };
          };
          const raw = data.commit?.message;
          const message = raw ? String(raw).split("\n")[0].trim() || "Push" : "Push";
          return { repo, head, message };
        } catch {
          return { repo, head, message: null };
        }
      })
    );

    for (const { repo, head, message } of headCommitResults) {
      if (commits.length >= 15) break;
      commits.push({
        repo,
        message: message ?? "Push",
        sha: head,
        url: `https://github.com/${repo}/commit/${head}`,
      });
    }

    const allDays = weeks.flatMap(
      (w: {
        contributionDays?: Array<{
          date: string;
          contributionCount: number;
          color: string;
        }>;
      }) => w.contributionDays ?? []
    );
    const { currentStreak, longestStreak } = computeStreaks(allDays);

    return NextResponse.json({
      contributions: {
        totalContributions,
        weeks,
        currentStreak,
        longestStreak,
      },
      commits,
      ...(commitsError && { commitsError }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch GitHub data",
      },
      { status: 500 }
    );
  }
}

function computeStreaks(
  days: Array<{ date: string; contributionCount: number }>
): { currentStreak: number; longestStreak: number } {
  const sorted = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const today = new Date().toISOString().slice(0, 10);
  let current = 0;
  let longest = 0;
  let run = 0;
  let prevDate: string | null = null;

  for (const d of sorted) {
    if (d.contributionCount === 0) {
      if (prevDate && run > 0) {
        const prev = new Date(prevDate).getTime();
        const curr = new Date(d.date).getTime();
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diffDays > 1) {
          longest = Math.max(longest, run);
          if (prevDate <= today) current = 0;
          run = 0;
        }
      }
      prevDate = d.date;
      continue;
    }
    if (!prevDate) {
      run = 1;
    } else {
      const prev = new Date(prevDate).getTime();
      const curr = new Date(d.date).getTime();
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) run++;
      else run = 1;
    }
    prevDate = d.date;
    longest = Math.max(longest, run);
    if (d.date <= today) current = run;
  }
  return { currentStreak: current, longestStreak: longest };
}
