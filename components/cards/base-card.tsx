"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import type { Card as CardType, CardSize } from "@/lib/card-types";
import { CARD_VARIANTS } from "@/lib/card-types";
import { useCardDrag } from "@/contexts/card-drag-context";
import { cn } from "@/lib/utils";

const SIZE_LABELS: Record<CardSize, string> = {
  compact: "Small",
  medium: "Medium",
  expanded: "Large",
};

type BaseCardProps = {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
  children: React.ReactNode;
  className?: string;
  /** Override the default card title (e.g. for custom icon + label) */
  title?: React.ReactNode;
};

export function BaseCard({
  card,
  onUpdate,
  onRemove,
  children,
  className,
  title: customTitle,
}: BaseCardProps) {
  const config = CARD_VARIANTS[card.variant];
  const canResize = config.sizes.length > 1;
  const { dragHandleProps } = useCardDrag();

  const handleSetSize = (size: CardSize) => {
    onUpdate({ size });
  };

  return (
    <Card
      className={cn(
        "group relative flex h-full min-h-0 overflow-hidden py-2 transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Drag handle bar – visible on hover, use this to move the card */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className={cn(
            "absolute left-0 right-0 top-0 z-10 flex h-3.5 items-center justify-center rounded-t-lg bg-muted/0 opacity-0 transition-opacity group-hover:opacity-100",
            "cursor-grab active:cursor-grabbing hover:bg-muted/60"
          )}
          aria-label="Drag to move card"
        >
          <span className="h-0.5 w-6 rounded-full bg-muted-foreground/70" />
        </div>
      )}
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-1">
        <span className="min-w-0 truncate text-xs font-medium">
          {customTitle ?? config.label}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-6 w-6 shrink-0 opacity-60 hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {canResize && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Resize</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {config.sizes.map((size) => (
                    <DropdownMenuItem
                      key={size}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSetSize(size);
                      }}
                    >
                      {SIZE_LABELS[size]}
                      {card.size === size && (
                        <span className="text-muted-foreground ml-auto text-xs">
                          ✓
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                onRemove();
              }}
            >
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-4 pt-0.5">
        {children}
      </div>
    </Card>
  );
}
