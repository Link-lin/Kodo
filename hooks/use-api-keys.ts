"use client";

import { useState, useEffect, useCallback } from "react";

export type ApiKeys = {
  github: string;
  githubUsername: string;
  lastfm: string;
  news: string;
};

const STORAGE_KEY = "kodo-api-keys";

const DEFAULT_KEYS: ApiKeys = {
  github: "",
  githubUsername: "",
  lastfm: "",
  news: "",
};

function loadKeys(): ApiKeys {
  if (typeof window === "undefined") return DEFAULT_KEYS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_KEYS;
    const parsed = JSON.parse(raw) as Partial<ApiKeys>;
    return {
      github: parsed.github ?? "",
      githubUsername: parsed.githubUsername ?? "",
      lastfm: parsed.lastfm ?? "",
      news: parsed.news ?? "",
    };
  } catch {
    return DEFAULT_KEYS;
  }
}

function saveKeys(keys: ApiKeys): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>(DEFAULT_KEYS);

  useEffect(() => {
    setKeys(loadKeys());
  }, []);

  const updateKeys = useCallback((updates: Partial<ApiKeys>) => {
    setKeys((prev) => {
      const next = { ...prev, ...updates };
      saveKeys(next);
      return next;
    });
  }, []);

  return { keys, updateKeys };
}
