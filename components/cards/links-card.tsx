"use client";

import * as React from "react";
import { BaseCard } from "./base-card";
import { Plus, ExternalLink } from "lucide-react";
import type { Card as CardType } from "@/lib/card-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkItem = { label: string; url: string };

type LinksContent = {
  links?: LinkItem[];
};

export function LinksCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const content = (card.content as LinksContent) ?? {};
  const links: LinkItem[] = Array.isArray(content.links) ? content.links : [{ label: "", url: "" }];

  const limit =
    card.size === "compact" ? 2 : card.size === "medium" ? 5 : links.length + 5;
  const displayLinks = links.slice(0, limit);

  const updateLink = (i: number, u: Partial<LinkItem>) => {
    const next = [...links];
    next[i] = { ...next[i], ...u };
    onUpdate({ content: { ...content, links: next } });
  };

  const addLink = () => {
    onUpdate({
      content: { ...content, links: [...links, { label: "", url: "" }] },
    });
  };

  return (
    <BaseCard card={card} onUpdate={onUpdate} onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        {displayLinks.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={link.label}
              onChange={(e) => updateLink(i, { label: e.target.value })}
              className="flex-1 truncate bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Label"
            />
            <input
              value={link.url}
              onChange={(e) => updateLink(i, { url: e.target.value })}
              className="flex-1 truncate bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground"
              placeholder="URL"
            />
            {link.url && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        ))}
        {card.size !== "compact" && (
          <Button
            variant="ghost"
            size="xs"
            onClick={addLink}
            className="w-fit self-start"
          >
            <Plus className="size-3" />
            Add link
          </Button>
        )}
      </div>
    </BaseCard>
  );
}
