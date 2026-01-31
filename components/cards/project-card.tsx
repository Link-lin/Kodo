"use client";

import * as React from "react";
import { BaseCard } from "./base-card";
import { ExternalLink } from "lucide-react";
import type { Card as CardType } from "@/lib/card-types";
import { cn } from "@/lib/utils";

type ProjectContent = {
  title?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  techStack?: string[];
};

export function ProjectCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const content = (card.content as ProjectContent) ?? {};
  const {
    title = "",
    description = "",
    imageUrl = "",
    link = "",
    techStack = [],
  } = content;

  const updateContent = (u: Partial<ProjectContent>) => {
    onUpdate({ content: { ...content, ...u } });
  };

  const showImage = card.size !== "compact" || imageUrl;
  const showDescription = card.size === "medium" || card.size === "expanded";
  const showTech = card.size === "expanded";

  return (
    <BaseCard card={card} onUpdate={onUpdate} onRemove={onRemove}>
      <div className="flex h-full flex-col gap-2">
        {(showImage || card.size === "compact") && (
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-md bg-muted",
              card.size === "compact" && "aspect-square",
              card.size === "medium" && "aspect-video",
              card.size === "expanded" && "aspect-video"
            )}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title || "Project"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>
        )}
        <input
          value={title}
          onChange={(e) => updateContent({ title: e.target.value })}
          className="w-full bg-transparent font-semibold outline-none placeholder:text-muted-foreground"
          placeholder="Project title"
        />
        {(card.size === "medium" || card.size === "expanded") && (
          <input
            value={imageUrl}
            onChange={(e) => updateContent({ imageUrl: e.target.value })}
            className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Image URL"
          />
        )}
        {showDescription && (
          <textarea
            value={description}
            onChange={(e) => updateContent({ description: e.target.value })}
            className={cn(
              "w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground",
              card.size === "medium" && "line-clamp-3",
              card.size === "expanded" && "min-h-16 flex-1"
            )}
            placeholder="Description"
          />
        )}
        {showTech && (
          <input
            value={techStack.join(", ")}
            onChange={(e) =>
              updateContent({
                techStack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Tech stack (comma separated)"
          />
        )}
        {(card.size === "medium" || card.size === "expanded") && (
          <div className="mt-auto flex items-center gap-2">
            <input
              value={link}
              onChange={(e) => updateContent({ link: e.target.value })}
              className="flex-1 bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Project URL"
            />
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </BaseCard>
  );
}
