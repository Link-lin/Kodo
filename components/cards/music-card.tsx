"use client";

import * as React from "react";
import { BaseCard } from "./base-card";
import { Music } from "lucide-react";
import type { Card as CardType } from "@/lib/card-types";

type Track = { name: string; artist: string; url?: string };

type MusicContent = { username?: string };

function useRecentTracks(username: string): { tracks: Track[]; loading: boolean; error: string | null } {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!username) {
      setLoading(false);
      setTracks([]);
      return;
    }
    const key = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
    if (!key) {
      setError("Add NEXT_PUBLIC_LASTFM_API_KEY to .env.local");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=10`
    )
      .then((r) => r.json())
      .then((data) => {
        const raw = data?.recenttracks?.track ?? [];
        setTracks(
          raw.map((t: { name?: string; artist?: { "#text"?: string }; url?: string }) => ({
            name: t.name ?? "",
            artist: t.artist?.["#text"] ?? "",
            url: t.url,
          }))
        );
      })
      .catch(() => setError("Failed to fetch"))
      .finally(() => setLoading(false));
  }, [username]);

  return { tracks, loading, error };
}

export function MusicCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const content = (card.content as MusicContent) ?? {};
  const username = content.username ?? "";
  const { tracks, loading, error } = useRecentTracks(username);
  const limit = card.size === "compact" ? 1 : card.size === "medium" ? 3 : 10;
  const display = tracks.slice(0, limit);

  const updateContent = (u: Partial<MusicContent>) => {
    onUpdate({ content: { ...content, ...u } });
  };

  return (
    <BaseCard card={card} onUpdate={onUpdate} onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <input
          value={username}
          onChange={(e) => updateContent({ username: e.target.value })}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
          placeholder="Last.fm username"
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
              <div className="text-muted-foreground text-sm">No recent tracks</div>
            )}
            {display.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Music className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.name}</span>
                <span className="text-muted-foreground shrink-0">–</span>
                <span className="truncate text-muted-foreground">{t.artist}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseCard>
  );
}
