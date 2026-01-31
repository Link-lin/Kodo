"use client";

import * as React from "react";
import { BaseCard } from "./base-card";
import type { Card as CardType } from "@/lib/card-types";
import { cn } from "@/lib/utils";

type ImageContent = {
  imageUrl?: string;
  caption?: string;
};

export function ImageCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const content = (card.content as ImageContent) ?? {};
  const { imageUrl = "", caption = "" } = content;

  const updateContent = (u: Partial<ImageContent>) => {
    onUpdate({ content: { ...content, ...u } });
  };

  const showCaption = card.size === "expanded";

  return (
    <BaseCard card={card} onUpdate={onUpdate} onRemove={onRemove}>
      <div className="flex h-full flex-col gap-2">
        <div
          className={cn(
            "relative flex-1 min-h-0 overflow-hidden rounded-md bg-muted",
            card.size === "compact" && "aspect-square",
            card.size === "medium" && "aspect-video",
            card.size === "expanded" && "min-h-32 flex-1"
          )}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={caption || "Image"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs p-2">
              No image
            </div>
          )}
        </div>
        <input
          value={imageUrl}
          onChange={(e) => updateContent({ imageUrl: e.target.value })}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Image URL"
        />
        {showCaption && (
          <input
            value={caption}
            onChange={(e) => updateContent({ caption: e.target.value })}
            className="w-full bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Caption"
          />
        )}
      </div>
    </BaseCard>
  );
}
