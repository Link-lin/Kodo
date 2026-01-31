"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, MoreHorizontal, Trash2 } from "lucide-react";
import { useCardDrag } from "@/contexts/card-drag-context";
import type { Card as CardType, CardSize } from "@/lib/card-types";
import { CARD_VARIANTS } from "@/lib/card-types";
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
};

export function BaseCard({
  card,
  onUpdate,
  onRemove,
  children,
  className,
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
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-1">
        <div
          className={cn(
            "text-muted-foreground flex min-w-0 flex-1 items-center gap-1 truncate text-xs font-medium",
            dragHandleProps && "cursor-grab active:cursor-grabbing"
          )}
          {...dragHandleProps}
        >
          {dragHandleProps && (
            <GripVertical className="size-3.5 shrink-0 opacity-50" />
          )}
          <span className="truncate">{config.label}</span>
        </div>
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
                  <DropdownMenuRadioGroup
                    value={card.size}
                    onValueChange={(v) => handleSetSize(v as CardSize)}
                  >
                    {config.sizes.map((size) => (
                      <DropdownMenuRadioItem key={size} value={size}>
                        {SIZE_LABELS[size]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
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
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 px-3 pb-3">{children}</div>
    </Card>
  );
}
