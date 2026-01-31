"use client";

import * as React from "react";
import { BaseCard } from "./base-card";
import type { Card as CardType } from "@/lib/card-types";
import { cn } from "@/lib/utils";

type NotesContent = {
  text?: string;
};

export function NotesCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const content = (card.content as NotesContent) ?? {};
  const text = content.text ?? "";

  const updateContent = (u: Partial<NotesContent>) => {
    onUpdate({ content: { ...content, ...u } });
  };

  return (
    <BaseCard card={card} onUpdate={onUpdate} onRemove={onRemove}>
      <textarea
        value={text}
        onChange={(e) => updateContent({ text: e.target.value })}
        className={cn(
          "w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground",
          card.size === "compact" && "line-clamp-1",
          card.size === "medium" && "line-clamp-4 min-h-0",
          card.size === "expanded" && "min-h-24 flex-1"
        )}
        placeholder="Take a note..."
      />
    </BaseCard>
  );
}
