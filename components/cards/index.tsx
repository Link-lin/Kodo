"use client";

import type { Card as CardType, CardVariant } from "@/lib/card-types";
import { TextCard } from "./text-card";
import { LinksCard } from "./links-card";
import { ProjectCard } from "./project-card";
import { ImageCard } from "./image-card";
import { NotesCard } from "./notes-card";
import { MusicCard } from "./music-card";
import { GithubCard } from "./github-card";
import { NewsCard } from "./news-card";
import { StockCard } from "./stock-card";

const CARD_COMPONENTS: Record<
  CardVariant,
  React.ComponentType<{
    card: CardType;
    onUpdate: (updates: Partial<CardType>) => void;
    onRemove: () => void;
  }>
> = {
  text: TextCard,
  links: LinksCard,
  project: ProjectCard,
  image: ImageCard,
  notes: NotesCard,
  music: MusicCard,
  github: GithubCard,
  news: NewsCard,
  stock: StockCard,
};

export function CardRenderer({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const Component = CARD_COMPONENTS[card.variant];
  if (!Component) return null;
  return <Component card={card} onUpdate={onUpdate} onRemove={onRemove} />;
}
