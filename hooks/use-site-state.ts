"use client";

import { useState, useEffect, useCallback } from "react";
import type { Card, SiteState } from "@/lib/card-types";

const STORAGE_KEY = "kodo-site-state";

const DEFAULT_STATE: SiteState = {
  cards: [],
  background: "default",
};

function loadState(): SiteState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as SiteState;
    return {
      cards: parsed.cards ?? [],
      background: parsed.background ?? "default",
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: SiteState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useSiteState() {
  const [state, setState] = useState<SiteState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const setCards = useCallback((cards: Card[] | ((prev: Card[]) => Card[])) => {
    setState((s) => ({
      ...s,
      cards: typeof cards === "function" ? cards(s.cards) : cards,
    }));
  }, []);

  const setBackground = useCallback((background: string) => {
    setState((s) => ({ ...s, background }));
  }, []);

  const addCard = useCallback(
    (card: Card) => {
      setState((s) => ({ ...s, cards: [...s.cards, card] }));
    },
    []
  );

  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setState((s) => ({
      ...s,
      cards: s.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const removeCard = useCallback((id: string) => {
    setState((s) => ({ ...s, cards: s.cards.filter((c) => c.id !== id) }));
  }, []);

  return {
    state,
    hydrated,
    setCards,
    setBackground,
    addCard,
    updateCard,
    removeCard,
  };
}
