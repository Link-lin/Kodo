"use client";

import * as React from "react";
import { BaseCard } from "./base-card";
import { TrendingUp } from "lucide-react";
import type { Card as CardType } from "@/lib/card-types";

type Quote = { symbol: string; price?: number; change?: number };

type StockContent = { tickers?: string[] };

function useStockQuotes(tickers: string[]): {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
} {
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (tickers.length === 0) {
      setLoading(false);
      setQuotes([]);
      return;
    }
    setLoading(true);
    setError(null);
    // Yahoo Finance quote API (unofficial, may need proxy)
    const symbols = tickers.slice(0, 5).join(",");
    fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbols}?interval=1d&range=1d`
    )
      .then((r) => r.json())
      .then((data) => {
        const result: Quote[] = [];
        const chart = data?.chart?.result;
        if (Array.isArray(chart)) {
          for (let i = 0; i < chart.length; i++) {
            const meta = chart[i]?.meta;
            const symbol = meta?.symbol ?? tickers[i] ?? "?";
            const quote = meta?.regularMarketPrice;
            const previousClose = meta?.previousClose;
            const change = quote != null && previousClose != null
              ? ((quote - previousClose) / previousClose) * 100
              : undefined;
            result.push({ symbol, price: quote, change });
          }
        }
        setQuotes(result);
      })
      .catch(() => {
        setError("Failed to fetch (CORS may block; use API proxy)");
        setQuotes(tickers.map((s) => ({ symbol: s, price: undefined, change: undefined })));
      })
      .finally(() => setLoading(false));
  }, [tickers.join(",")]);

  return { quotes, loading, error };
}

export function StockCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const content = (card.content as StockContent) ?? {};
  const tickers = Array.isArray(content.tickers) ? content.tickers : ["AAPL"];
  const { quotes, loading, error } = useStockQuotes(tickers);
  const limit = card.size === "compact" ? 1 : card.size === "medium" ? 3 : 10;
  const display = quotes.slice(0, limit);

  const updateContent = (u: Partial<StockContent>) => {
    onUpdate({ content: { ...content, ...u } });
  };

  const tickerStr = tickers.join(", ");
  const setTickerStr = (s: string) => {
    updateContent({
      tickers: s
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean),
    });
  };

  return (
    <BaseCard card={card} onUpdate={onUpdate} onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <input
          value={tickerStr}
          onChange={(e) => setTickerStr(e.target.value)}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
          placeholder="Tickers (e.g. AAPL, GOOGL)"
        />
        {loading && (
          <div className="text-muted-foreground text-sm">Loading...</div>
        )}
        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}
        {!loading && (
          <div className="flex flex-col gap-1">
            {display.map((q, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  <span>{q.symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  {q.price != null && (
                    <span>${q.price.toFixed(2)}</span>
                  )}
                  {q.change != null && (
                    <span
                      className={
                        q.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }
                    >
                      {q.change >= 0 ? "+" : ""}
                      {q.change.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseCard>
  );
}
