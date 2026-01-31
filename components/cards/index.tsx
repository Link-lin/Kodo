"use client";

import type { Card as CardType, CardVariant } from "@/lib/card-types";
import { GithubCard } from "./github-card/index";

const CARD_COMPONENTS: Record<
  CardVariant,
  React.ComponentType<{
    card: CardType;
    onUpdate: (updates: Partial<CardType>) => void;
    onRemove: () => void;
  }>
> = {
  github: GithubCard,
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
