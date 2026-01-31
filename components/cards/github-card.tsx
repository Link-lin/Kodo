"use client";

import * as React from "react";
import { BaseCard } from "./base-card";
import { Github } from "lucide-react";
import type { Card as CardType } from "@/lib/card-types";

type Event = { type: string; repo?: { name?: string }; payload?: { action?: string } };

type GithubContent = { username?: string };

function useGitHubActivity(username: string): {
  events: Event[];
  loading: boolean;
  error: string | null;
} {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!username) {
      setLoading(false);
      setEvents([]);
      return;
    }
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    setLoading(true);
    setError(null);
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=15`, {
      headers,
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then(setEvents)
      .catch(() => setError("Failed to fetch (token may be required)"))
      .finally(() => setLoading(false));
  }, [username]);

  return { events, loading, error };
}

function formatEvent(e: Event): string {
  const repo = e.repo?.name ?? "";
  const action = e.payload?.action ?? "";
  switch (e.type) {
    case "PushEvent":
      return `Pushed to ${repo}`;
    case "CreateEvent":
      return `Created in ${repo}`;
    case "WatchEvent":
      return `Starred ${repo}`;
    case "ForkEvent":
      return `Forked ${repo}`;
    case "IssuesEvent":
      return `${action} issue in ${repo}`;
    default:
      return `${e.type} ${repo}`.trim();
  }
}

export function GithubCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const content = (card.content as GithubContent) ?? {};
  const username = content.username ?? "";
  const { events, loading, error } = useGitHubActivity(username);
  const limit = card.size === "compact" ? 1 : card.size === "medium" ? 3 : 10;
  const display = events.slice(0, limit);

  const updateContent = (u: Partial<GithubContent>) => {
    onUpdate({ content: { ...content, ...u } });
  };

  return (
    <BaseCard card={card} onUpdate={onUpdate} onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <input
          value={username}
          onChange={(e) => updateContent({ username: e.target.value })}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
          placeholder="GitHub username"
        />
        {loading && (
          <div className="text-muted-foreground text-sm">Loading...</div>
        )}
        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}
        {!loading && !error && (
          <div className="flex flex-col gap-1">
            {display.length === 0 && username && (
              <div className="text-muted-foreground text-sm">No recent activity</div>
            )}
            {display.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Github className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{formatEvent(e)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseCard>
  );
}
