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
        `https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=30`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      ),
    ]);

    const graphqlData = await graphqlRes.json();
    const eventsData = await eventsRes.json();

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
    if (Array.isArray(eventsData)) {
      for (const e of eventsData) {
        if (e.type !== "PushEvent" || !e.payload?.commits) continue;
        const repo = e.repo?.name ?? "";
        for (const c of e.payload.commits) {
          if (commits.length >= 15) break;
          commits.push({
            repo,
            message: (c.message ?? "").split("\n")[0] ?? "(no message)",
            sha: c.sha,
            url: `https://github.com/${repo}/commit/${c.sha}`,
          });
        }
      }
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
