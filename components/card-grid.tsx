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
import { motion, LayoutGroup } from "framer-motion";
import type { Card as CardType } from "@/lib/card-types";
import {
  GRID_SPAN,
  GRID_COLS,
  findPositionForMove,
  deltaToGridOffset,
  deltaToGridOffsetFromRect,
} from "@/lib/card-types";
import { CardRenderer } from "./cards/index";
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
  const [activeCard, setActiveCard] = React.useState<CardType | null>(null);
  const [accumulatedDelta, setAccumulatedDelta] = React.useState({
    x: 0,
    y: 0,
  });
  const [gridRect, setGridRect] = React.useState<DOMRect | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = React.useCallback(
    (event: DragStartEvent) => {
      const card = cards.find((c) => c.id === event.active.id);
      setActiveCard(card ?? null);
      setAccumulatedDelta({ x: 0, y: 0 });
      setGridRect(gridRef?.current?.getBoundingClientRect() ?? null);
    },
    [cards, gridRef]
  );

  const handleDragMove = React.useCallback((event: DragMoveEvent) => {
    // dnd-kit passes total delta from drag start, not incremental
    setAccumulatedDelta({ x: event.delta.x, y: event.delta.y });
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const card = cards.find((c) => c.id === active.id);
      const rect = gridRect ?? gridRef?.current?.getBoundingClientRect();

      setActiveCard(null);
      setAccumulatedDelta({ x: 0, y: 0 });
      setGridRect(null);

      if (delta.x === 0 && delta.y === 0) return;
      if (!card) return;

      const offset =
        rect != null
          ? deltaToGridOffsetFromRect(rect, delta.x, delta.y)
          : deltaToGridOffset(delta.x, delta.y);
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
    [cards, onUpdateCard, gridRect, gridRef]
  );

  const projectedPosition = React.useMemo(() => {
    if (!activeCard) return null;
    const rect = gridRect ?? gridRef?.current?.getBoundingClientRect();
    const offset =
      rect != null
        ? deltaToGridOffsetFromRect(rect, accumulatedDelta.x, accumulatedDelta.y)
        : deltaToGridOffset(accumulatedDelta.x, accumulatedDelta.y);
    const preferred = {
      col: Math.max(0, activeCard.position.col + offset.col),
      row: Math.max(0, activeCard.position.row + offset.row),
    };
    const span = GRID_SPAN[activeCard.size];
    const newCol = Math.min(preferred.col, GRID_COLS - span.col);
    return findPositionForMove(cards, activeCard.id, activeCard.size, {
      col: newCol,
      row: preferred.row,
    });
  }, [activeCard, accumulatedDelta.x, accumulatedDelta.y, cards, gridRect, gridRef]);

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
          "relative grid w-full grid-cols-12 gap-3 p-4",
          "auto-rows-[calc((100%-164px)/12)]",
          "min-h-[calc(100vh-2rem)]"
        )}
      >
        <LayoutGroup>
          {cards.map((card) => {
            const span = GRID_SPAN[card.size];
            const isBeingDragged = activeCard?.id === card.id;
            return (
              <motion.div
                key={card.id}
                layout
                layoutId={card.id}
                transition={{
                  layout: { duration: 0.3, ease: "easeOut" },
                }}
                className="min-w-0"
                style={{
                  gridColumn: `${card.position.col + 1} / span ${span.col}`,
                  gridRow: `${card.position.row + 1} / span ${span.row}`,
                  opacity: isBeingDragged ? 0.3 : 1,
                }}
              >
                <DraggableCard
                  card={card}
                  onUpdate={(u) => onUpdateCard(card.id, u)}
                  onRemove={() => onRemoveCard(card.id)}
                />
              </motion.div>
            );
          })}
        </LayoutGroup>
        {activeCard && projectedPosition && (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none z-10 min-h-0 min-w-0 rounded-xl",
              "border-2 border-dashed border-primary/50 bg-primary/5",
              "transition-all duration-200 ease-out"
            )}
            style={{
              gridColumn: `${projectedPosition.col + 1} / span ${GRID_SPAN[activeCard.size].col}`,
              gridRow: `${projectedPosition.row + 1} / span ${GRID_SPAN[activeCard.size].row}`,
            }}
          />
        )}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div className="w-64 min-h-[140px] min-w-0 rounded-xl border bg-card py-2 shadow-lg">
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
