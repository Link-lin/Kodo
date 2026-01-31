"use client";

import * as React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useSiteState } from "@/hooks/use-site-state";
import { CardGrid } from "@/components/card-grid";
import { BackgroundPicker } from "@/components/background-picker";
import { getBackgroundClass } from "@/lib/backgrounds";
import {
  createCard,
  findPositionForNewCard,
  pixelToGridPosition,
  CARD_VARIANTS,
  type CardVariant,
} from "@/lib/card-types";
import { cn } from "@/lib/utils";

export default function Home() {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const lastContextMenuRef = React.useRef<{ clientX: number; clientY: number } | null>(null);
  const {
    state,
    hydrated,
    addCard,
    updateCard,
    removeCard,
    setBackground,
  } = useSiteState();

  const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
    lastContextMenuRef.current = { clientX: e.clientX, clientY: e.clientY };
  }, []);

  const handleAddCard = React.useCallback(
    (variant: CardVariant) => {
      const config = CARD_VARIANTS[variant];
      const size = config.sizes[0];
      let position = { col: 0, row: state.cards.length };

      if (lastContextMenuRef.current && gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const preferred = pixelToGridPosition(
          lastContextMenuRef.current.clientX,
          lastContextMenuRef.current.clientY,
          rect
        );
        position = findPositionForNewCard(state.cards, size, preferred);
      }

      const card = createCard(variant, position);
      addCard(card);
    },
    [state.cards, addCard]
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors",
        getBackgroundClass(state.background)
      )}
    >
      <BackgroundPicker value={state.background} onChange={setBackground} />

      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="min-h-screen w-full"
            onContextMenu={handleContextMenu}
          >
            <CardGrid
              gridRef={gridRef}
              cards={state.cards}
              onUpdateCard={updateCard}
              onRemoveCard={removeCard}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {(Object.keys(CARD_VARIANTS) as CardVariant[]).map((variant) => (
            <ContextMenuItem
              key={variant}
              onSelect={() => handleAddCard(variant)}
            >
              {CARD_VARIANTS[variant].label}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
