"use client";

import * as React from "react";
import Link from "next/link";
import { useApiKeys } from "@/hooks/use-api-keys";
import { useSiteState } from "@/hooks/use-site-state";
import { getBackgroundClass } from "@/lib/backgrounds";
import { BACKGROUND_PRESETS } from "@/lib/backgrounds";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { keys, updateKeys } = useApiKeys();
  const { state, setBackground } = useSiteState();

  return (
    <div
      className={cn(
        "min-h-screen transition-colors",
        getBackgroundClass(state.background)
      )}
    >
      <div className="mx-auto max-w-2xl space-y-8 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" title="Back">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">API Keys</h2>
          <p className="text-muted-foreground text-sm">
            Store your API keys locally in the browser. They are never sent to
            our servers.
          </p>
          <div className="space-y-4 rounded-lg border bg-card p-4">
            <div className="space-y-2">
              <label
                htmlFor="githubUsername"
                className="text-sm font-medium"
              >
                GitHub username
              </label>
              <input
                id="githubUsername"
                type="text"
                value={keys.githubUsername}
                onChange={(e) => updateKeys({ githubUsername: e.target.value })}
                placeholder="your-username"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="github" className="text-sm font-medium">
                GitHub token
              </label>
              <input
                id="github"
                type="password"
                value={keys.github}
                onChange={(e) => updateKeys({ github: e.target.value })}
                placeholder="ghp_..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                autoComplete="off"
              />
              <p className="text-muted-foreground text-xs">
                Required for contributions. Create at{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  github.com/settings/tokens
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="lastfm" className="text-sm font-medium">
                Last.fm API key
              </label>
              <input
                id="lastfm"
                type="password"
                value={keys.lastfm}
                onChange={(e) => updateKeys({ lastfm: e.target.value })}
                placeholder="..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="news" className="text-sm font-medium">
                News API key
              </label>
              <input
                id="news"
                type="password"
                value={keys.news}
                onChange={(e) => updateKeys({ news: e.target.value })}
                placeholder="..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                autoComplete="off"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Background</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {BACKGROUND_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setBackground(preset.id)}
                className={cn(
                  "h-14 rounded-md border-2 transition-colors",
                  getBackgroundClass(preset.id),
                  state.background === preset.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/30"
                )}
                title={preset.label}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
