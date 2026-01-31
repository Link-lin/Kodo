export type CardSize = "compact" | "medium" | "expanded";

export type CardVariant =
  | "text"
  | "links"
  | "project"
  | "image"
  | "notes"
  | "music"
  | "github"
  | "news"
  | "stock";

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
  text: {
    label: "Text / Bio",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: { title: "", text: "" },
  },
  links: {
    label: "Links / Social",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: { links: [{ label: "", url: "" }] },
  },
  project: {
    label: "Project",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: {
      title: "",
      description: "",
      imageUrl: "",
      link: "",
      techStack: [] as string[],
    },
  },
  image: {
    label: "Image",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: { imageUrl: "", caption: "" },
  },
  notes: {
    label: "Notes",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: { text: "" },
  },
  music: {
    label: "Music (Recently Played)",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: { username: "" },
  },
  github: {
    label: "GitHub Activity",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: { username: "" },
  },
  news: {
    label: "News Feed",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: { topic: "", source: "" },
  },
  stock: {
    label: "Stock Feed",
    sizes: ["compact", "medium", "expanded"],
    defaultContent: { tickers: ["AAPL"] },
  },
};

export const GRID_SPAN: Record<CardSize, { col: number; row: number }> = {
  compact: { col: 1, row: 1 },
  medium: { col: 2, row: 1 },
  expanded: { col: 2, row: 2 },
};

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

export const GRID_COLS = 12;
export const GRID_CELL_WIDTH = 100; // approximate for col computation
export const GRID_ROW_HEIGHT = 112; // 100px + 12px gap

export function pixelToGridPosition(
  clientX: number,
  clientY: number,
  gridRect: DOMRect
): { col: number; row: number } {
  const x = clientX - gridRect.left - 16; // account for padding
  const y = clientY - gridRect.top - 16;
  const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / GRID_CELL_WIDTH)));
  const row = Math.max(0, Math.floor(y / GRID_ROW_HEIGHT));
  return { col, row };
}

export function findNextGridPosition(cards: Card[], size: CardSize): { col: number; row: number } {
  const span = GRID_SPAN[size];
  for (let row = 0; row < 50; row++) {
    for (let col = 0; col <= GRID_COLS - span.col; col++) {
      if (!overlaps(col, row, span.col, span.row, cards)) {
        return { col, row };
      }
    }
  }
  return { col: 0, row: cards.length };
}

export function findPositionForNewCard(
  cards: Card[],
  size: CardSize,
  preferred?: { col: number; row: number }
): { col: number; row: number } {
  const span = GRID_SPAN[size];
  const col = preferred
    ? Math.max(0, Math.min(preferred.col, GRID_COLS - span.col))
    : 0;
  const row = preferred?.row ?? 0;
  if (!overlaps(col, row, span.col, span.row, cards)) {
    return { col, row };
  }
  return findNextGridPosition(cards, size);
}

/** Convert drag delta (pixels) to grid position change */
export function deltaToGridOffset(
  deltaX: number,
  deltaY: number
): { col: number; row: number } {
  const col = Math.round(deltaX / GRID_CELL_WIDTH);
  const row = Math.round(deltaY / GRID_ROW_HEIGHT);
  return { col, row };
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
  const col = Math.max(0, Math.min(preferred.col, GRID_COLS - span.col));
  const row = Math.max(0, preferred.row);
  if (!overlaps(col, row, span.col, span.row, others)) {
    return { col, row };
  }
  return findNextGridPosition(others, size);
}
