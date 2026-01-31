"use client";

import * as React from "react";
import { BaseCard } from "../base-card";
import { Github } from "lucide-react";
import { useApiKeys } from "@/hooks/use-api-keys";
import { useGitHubData } from "./use-github-data";
import { GithubCardCompact } from "./github-card-compact";
import { GithubCardMedium } from "./github-card-medium";
import { GithubCardExpanded } from "./github-card-expanded";
import type { Card as CardType } from "@/lib/card-types";

export function GithubCard({
  card,
  onUpdate,
  onRemove,
}: {
  card: CardType;
  onUpdate: (updates: Partial<CardType>) => void;
  onRemove: () => void;
}) {
  const { keys } = useApiKeys();
  const username = keys.githubUsername;
  const { contributions, commits, loading, error } = useGitHubData(
    username,
    keys.github
  );

  const ghTitle = (
    <span className="flex items-center gap-1.5">
      <Github className="size-4 shrink-0" />
      Github
    </span>
  );

  const renderContent = () => {
    if (!username) {
      return (
        <div className="text-muted-foreground text-sm">
          Set your GitHub username in Settings
        </div>
      );
    }
    if (loading) {
      return <div className="text-muted-foreground text-sm">Loading...</div>;
    }
    if (error) {
      return <div className="text-destructive text-sm">{error}</div>;
    }
    if (!contributions) return null;

    switch (card.size) {
      case "compact":
        return <GithubCardCompact contributions={contributions} />;
      case "medium":
        return <GithubCardMedium contributions={contributions} />;
      case "expanded":
        return (
          <GithubCardExpanded
            contributions={contributions}
            commits={commits}
          />
        );
      default:
        return <GithubCardCompact contributions={contributions} />;
    }
  };

  return (
    <BaseCard
      card={card}
      onUpdate={onUpdate}
      onRemove={onRemove}
      title={ghTitle}
    >
      <div className="flex flex-col gap-2">{renderContent()}</div>
    </BaseCard>
  );
}
