"use client";

import * as React from "react";
import { BaseCard } from "./base-card";
import { Newspaper } from "lucide-react";
import type { Card as CardType } from "@/lib/card-types";

type Article = { title: string; url?: string; source?: string };

type NewsContent = { topic?: string; source?: string };

function useNews(topic: string): {
  articles: Article[];
  loading: boolean;
  error: string | null;
} {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!topic) {
      setLoading(false);
      setArticles([]);
      return;
    }
    const key = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!key) {
      setError("Add NEXT_PUBLIC_NEWS_API_KEY to .env.local");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(
      `https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(topic)}&apiKey=${key}&pageSize=10`
    )
      .then((r) => r.json())
      .then((data) => {
        const raw = data?.articles ?? [];
        setArticles(
          raw.map((a: { title?: string; url?: string; source?: { name?: string } }) => ({
            title: a.title ?? "",
            url: a.url,
            source: a.source?.name,
          }))
        );
      })
      .catch(() => setError("Failed to fetch"))
      .finally(() => setLoading(false));
  }, [topic]);

  return { articles, loading, error };
}

export function NewsCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const content = (card.content as NewsContent) ?? {};
  const topic = content.topic ?? "technology";
  const { articles, loading, error } = useNews(topic);
  const limit = card.size === "compact" ? 1 : card.size === "medium" ? 3 : 10;
  const display = articles.slice(0, limit);

  const updateContent = (u: Partial<NewsContent>) => {
    onUpdate({ content: { ...content, ...u } });
  };

  return (
    <BaseCard card={card} onUpdate={onUpdate} onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <input
          value={topic}
          onChange={(e) => updateContent({ topic: e.target.value })}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
          placeholder="Topic (e.g. technology)"
        />
        {loading && (
          <div className="text-muted-foreground text-sm">Loading...</div>
        )}
        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}
        {!loading && !error && (
          <div className="flex flex-col gap-1">
            {display.length === 0 && (
              <div className="text-muted-foreground text-sm">No articles found</div>
            )}
            {display.map((a, i) => (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-sm hover:underline"
              >
                <Newspaper className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="truncate">{a.title || "Untitled"}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </BaseCard>
  );
}
