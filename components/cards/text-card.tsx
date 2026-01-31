"use client";

import * as React from "react";
import { BaseCard } from "./base-card";
import type { Card as CardType } from "@/lib/card-types";
import { cn } from "@/lib/utils";

type TextCardProps = {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
};

type TextContent = {
  title?: string;
  text?: string;
};

export function TextCard({ card, onUpdate, onRemove }: TextCardProps) {
  const content = card.content as TextContent;
  const title = content.title ?? "";
  const text = content.text ?? "";

  const updateContent = (updates: Partial<TextContent>) => {
    onUpdate({ content: { ...content, ...updates } });
  };

  return (
    <BaseCard card={card} onUpdate={onUpdate} onRemove={onRemove}>
      {card.size === "compact" && (
        <input
          value={title || "Untitled"}
          onChange={(e) => updateContent({ title: e.target.value })}
          className="w-full truncate bg-transparent font-semibold outline-none placeholder:text-muted-foreground"
          placeholder="Title"
        />
      )}
      {(card.size === "medium" || card.size === "expanded") && (
        <>
          <input
            value={title}
            onChange={(e) => updateContent({ title: e.target.value })}
            className="w-full bg-transparent font-semibold outline-none placeholder:text-muted-foreground"
            placeholder="Title"
          />
          <textarea
            value={text}
            onChange={(e) => updateContent({ text: e.target.value })}
            className={cn(
              "w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground",
              card.size === "medium" && "line-clamp-4",
              card.size === "expanded" && "min-h-24 flex-1"
            )}
            placeholder="Write your bio or text..."
            rows={card.size === "medium" ? 4 : 8}
          />
        </>
      )}
    </BaseCard>
  );
}
