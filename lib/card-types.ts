/** Generate a UUID, with fallback for environments without crypto.randomUUID */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: generate a UUID-like string
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
  medium: { col: 4, row: 3 },
  expanded: { col: 4, row: 5 },
};

export const GRID_COLS = 12;
/** Fixed size of one grid cell (px). Cards keep the same pixel size regardless of window. */
export const GRID_CELL_SIZE_PX = 100;
/** Gap between grid cells (px). Matches CSS gap. */
export const GRID_GAP_PX = 12;
/** One cell + gap; used for pixel↔grid conversion (drag, drop targets). */
export const GRID_STEP_PX = GRID_CELL_SIZE_PX + GRID_GAP_PX;

/** Pixel dimensions of a card given its size (matches the grid layout). */
export function getCardDimensionsPx(size: CardSize): { width: number; height: number } {
  const span = GRID_SPAN[size];
  return {
    width: span.col * GRID_CELL_SIZE_PX + (span.col - 1) * GRID_GAP_PX,
    height: span.row * GRID_CELL_SIZE_PX + (span.row - 1) * GRID_GAP_PX,
  };
}

/** @deprecated Use GRID_STEP_PX for both axes. */
export const GRID_ROW_HEIGHT = GRID_STEP_PX;
/** @deprecated Use GRID_STEP_PX for both axes. */
export const GRID_CELL_WIDTH = GRID_STEP_PX;

export function createCard(
  variant: CardVariant,
  position: { col: number; row: number }
): Card {
  const config = CARD_VARIANTS[variant];
  const size = config.sizes[0];
  return {
    id: generateId(),
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

const GRID_PADDING_PX = 16;

export function pixelToGridPosition(
  clientX: number,
  clientY: number,
  gridRect: DOMRect
): { col: number; row: number } {
  const x = clientX - gridRect.left - GRID_PADDING_PX;
  const y = clientY - gridRect.top - GRID_PADDING_PX;
  const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / GRID_STEP_PX)));
  const row = Math.max(0, Math.floor(y / GRID_STEP_PX));
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

/** Convert drag delta (pixels) to grid position change using fixed cell size. */
export function deltaToGridOffset(
  deltaX: number,
  deltaY: number
): { col: number; row: number } {
  return {
    col: Math.round(deltaX / GRID_STEP_PX),
    row: Math.round(deltaY / GRID_STEP_PX),
  };
}

/**
 * Same as deltaToGridOffset; grid uses fixed cell size so rect is not needed.
 * Kept for API compatibility with callers that pass gridRect.
 */
export function deltaToGridOffsetFromRect(
  _gridRect: DOMRect,
  deltaX: number,
  deltaY: number
): { col: number; row: number } {
  return deltaToGridOffset(deltaX, deltaY);
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
