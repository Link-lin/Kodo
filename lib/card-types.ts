export type CardSize = "compact" | "medium" | "expanded";

export type CardVariant = "github";

export type Card = {
  id: string;
  variant: CardVariant;
  size: CardSize;
  position: { col: number; row: number };
  content: Record<string, unknown>;
};

export type SiteState = {
  cards: Card[];
  background: string;
};

export const CARD_VARIANTS: Record<
  CardVariant,
  { label: string; sizes: CardSize[]; defaultContent: Record<string, unknown> }
> = {
  github: {
    label: "GitHub Activity",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: {},
  },
};

export const GRID_SPAN: Record<CardSize, { col: number; row: number }> = {
  compact: { col: 2, row: 2 },
  medium: { col: 4, row: 2},
  expanded: { col: 3, row: 2 },
};

export const GRID_COLS = 12;
/** Row height (px) + gap; matches CSS auto-rows-[140px] + gap-3 */
export const GRID_ROW_HEIGHT = 152; // 140 + 12
/** Default column step for fallback when grid rect is unavailable */
export const GRID_CELL_WIDTH = 110;

export function createCard(
  variant: CardVariant,
  position: { col: number; row: number }
): Card {
  const config = CARD_VARIANTS[variant];
  const size = config.sizes[0];
  return {
    id: crypto.randomUUID(),
    variant,
    size,
    position,
    content: { ...config.defaultContent },
  };
}

export function cycleCardSize(card: Card): CardSize {
  const config = CARD_VARIANTS[card.variant];
  const idx = config.sizes.indexOf(card.size);
  const nextIdx = (idx + 1) % config.sizes.length;
  return config.sizes[nextIdx];
}

function overlaps(
  col: number,
  row: number,
  sc: number,
  sr: number,
  cards: Card[]
): boolean {
  for (const c of cards) {
    const s = GRID_SPAN[c.size];
    const c1 = c.position.col;
    const r1 = c.position.row;
    if (
      col < c1 + s.col &&
      col + sc > c1 &&
      row < r1 + s.row &&
      row + sr > r1
    ) {
      return true;
    }
  }
  return false;
}

export function pixelToGridPosition(
  clientX: number,
  clientY: number,
  gridRect: DOMRect
): { col: number; row: number } {
  const x = clientX - gridRect.left - 16;
  const y = clientY - gridRect.top - 16;
  const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / GRID_CELL_WIDTH)));
  const row = Math.max(0, Math.floor(y / GRID_ROW_HEIGHT));
  return { col, row };
}

export function findPositionForNewCard(
  cards: Card[],
  size: CardSize,
  preferred: { col: number; row: number }
): { col: number; row: number } {
  const span = GRID_SPAN[size];
  if (!overlaps(preferred.col, preferred.row, span.col, span.row, cards)) {
    return preferred;
  }
  for (let row = 0; row < 50; row++) {
    for (let col = 0; col <= GRID_COLS - span.col; col++) {
      if (!overlaps(col, row, span.col, span.row, cards)) {
        return { col, row };
      }
    }
  }
  return { col: 0, row: cards.length };
}

const GRID_PADDING = 16; // p-4
const GRID_GAP = 12; // gap-3

/** Convert drag delta (pixels) to grid position change using fixed constants */
export function deltaToGridOffset(
  deltaX: number,
  deltaY: number
): { col: number; row: number } {
  const col = Math.round(deltaX / GRID_CELL_WIDTH);
  const row = Math.round(deltaY / GRID_ROW_HEIGHT);
  return { col, row };
}

/**
 * Convert drag delta to grid offset using actual grid dimensions (matches CSS:
 * grid-cols-12, gap-3, p-4, square cells via auto-rows same as column width).
 * Use when gridRef is available.
 */
export function deltaToGridOffsetFromRect(
  gridRect: DOMRect,
  deltaX: number,
  deltaY: number
): { col: number; row: number } {
  const contentWidth = gridRect.width - GRID_PADDING * 2;
  const totalGapX = (12 - 1) * GRID_GAP; // 11 gaps for 12 cols
  const cellSize = (contentWidth - totalGapX) / 12;
  const step = cellSize + GRID_GAP; // same for col and row (square cells)
  return {
    col: Math.round(deltaX / step),
    row: Math.round(deltaY / step),
  };
}

/** Find valid position when moving a card (excludes the moving card from overlap check) */
export function findPositionForMove(
  cards: Card[],
  movingId: string,
  size: CardSize,
  preferred: { col: number; row: number }
): { col: number; row: number } {
  const others = cards.filter((c) => c.id !== movingId);
  const span = GRID_SPAN[size];
  const clampedCol = Math.max(0, Math.min(preferred.col, GRID_COLS - span.col));
  if (!overlaps(clampedCol, preferred.row, span.col, span.row, others)) {
    return { col: clampedCol, row: preferred.row };
  }
  for (let row = 0; row < 50; row++) {
    for (let col = 0; col <= GRID_COLS - span.col; col++) {
      if (!overlaps(col, row, span.col, span.row, others)) {
        return { col, row };
      }
    }
  }
  return { col: 0, row: cards.length };
}
