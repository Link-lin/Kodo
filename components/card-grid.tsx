"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Card as CardType } from "@/lib/card-types";
import {
  GRID_SPAN,
  GRID_COLS,
  findPositionForMove,
  deltaToGridOffset,
} from "@/lib/card-types";
import { CardRenderer } from "./cards";
import { CardDragProvider } from "@/contexts/card-drag-context";
import { cn } from "@/lib/utils";

type CardGridProps = {
  cards: CardType[];
  onUpdateCard: (id: string, updates: Partial<CardType>) => void;
  onRemoveCard: (id: string) => void;
  gridRef?: React.RefObject<HTMLDivElement | null>;
};

function DraggableCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
  });

  return (
    <CardDragProvider
      value={{
        dragHandleProps: { ...attributes, ...listeners },
        isDragging,
      }}
    >
      <div
        ref={setNodeRef}
        className={cn("h-full min-h-0", isDragging && "opacity-30")}
      >
        <CardRenderer card={card} onUpdate={onUpdate} onRemove={onRemove} />
      </div>
    </CardDragProvider>
  );
}

export function CardGrid({
  cards,
  onUpdateCard,
  onRemoveCard,
  gridRef,
}: CardGridProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = React.useState<{
    col: number;
    row: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeCard = React.useMemo(
    () => (activeId ? cards.find((c) => c.id === activeId) : null),
    [activeId, cards]
  );

  const handleDragStart = React.useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      setActiveId(id);
      const card = cards.find((c) => c.id === id);
      if (card) {
        setPreviewPosition(card.position);
      }
    },
    [cards]
  );

  const handleDragMove = React.useCallback(
    (event: DragMoveEvent) => {
      const { active, delta } = event;
      const card = cards.find((c) => c.id === active.id);
      if (!card) return;

      const offset = deltaToGridOffset(delta.x, delta.y);
      const span = GRID_SPAN[card.size];
      const preferred = {
        col: Math.max(0, Math.min(card.position.col + offset.col, GRID_COLS - span.col)),
        row: Math.max(0, card.position.row + offset.row),
      };
      const newPosition = findPositionForMove(
        cards,
        card.id,
        card.size,
        preferred
      );
      setPreviewPosition(newPosition);
    },
    [cards]
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      setActiveId(null);
      setPreviewPosition(null);
      if (delta.x === 0 && delta.y === 0) return;

      const card = cards.find((c) => c.id === active.id);
      if (!card) return;

      const offset = deltaToGridOffset(delta.x, delta.y);
      const preferred = {
        col: Math.max(0, card.position.col + offset.col),
        row: Math.max(0, card.position.row + offset.row),
      };

      const span = GRID_SPAN[card.size];
      const newCol = Math.min(preferred.col, GRID_COLS - span.col);
      const newPosition = findPositionForMove(
        cards,
        card.id,
        card.size,
        { col: newCol, row: preferred.row }
      );

      if (
        newPosition.col !== card.position.col ||
        newPosition.row !== card.position.row
      ) {
        onUpdateCard(card.id, { position: newPosition });
      }
    },
    [cards, onUpdateCard]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={gridRef}
        className={cn(
          "relative grid w-full auto-rows-[100px] grid-cols-12 gap-3 p-4",
          "min-h-[calc(100vh-2rem)]"
        )}
      >
        {cards.map((card) => {
          const span = GRID_SPAN[card.size];
          return (
            <div
              key={card.id}
              className="min-w-0"
              style={{
                gridColumn: `${card.position.col + 1} / span ${span.col}`,
                gridRow: `${card.position.row + 1} / span ${span.row}`,
              }}
            >
              <DraggableCard
                card={card}
                onUpdate={(u) => onUpdateCard(card.id, u)}
                onRemove={() => onRemoveCard(card.id)}
              />
            </div>
          );
        })}

        {/* Drop placeholder - shows where the card will land */}
        {activeId && activeCard && previewPosition && (
          <div
            className="pointer-events-none z-10 min-w-0 rounded-xl border-2 border-dashed border-primary/60 bg-primary/5"
            style={{
              gridColumn: `${previewPosition.col + 1} / span ${GRID_SPAN[activeCard.size].col}`,
              gridRow: `${previewPosition.row + 1} / span ${GRID_SPAN[activeCard.size].row}`,
            }}
          />
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div className="w-48 min-h-[100px] min-w-0 rounded-xl border bg-card py-2 shadow-lg">
            <CardRenderer
              card={activeCard}
              onUpdate={() => {}}
              onRemove={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
