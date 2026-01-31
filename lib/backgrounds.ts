export type BackgroundPreset = {
  id: string;
  label: string;
  className: string;
  thumbnail?: string;
};

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: "default", label: "Default", className: "bg-zinc-100 dark:bg-zinc-950" },
  { id: "slate", label: "Slate", className: "bg-slate-100 dark:bg-slate-950" },
  { id: "stone", label: "Stone", className: "bg-stone-100 dark:bg-stone-950" },
  { id: "indigo", label: "Indigo", className: "bg-indigo-50 dark:bg-indigo-950" },
  {
    id: "gradient-warm",
    label: "Warm gradient",
    className:
      "bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 dark:from-amber-950/50 dark:via-orange-950/30 dark:to-rose-950/50",
  },
  {
    id: "gradient-cool",
    label: "Cool gradient",
    className:
      "bg-gradient-to-br from-sky-100 via-indigo-50 to-violet-100 dark:from-sky-950/50 dark:via-indigo-950/30 dark:to-violet-950/50",
  },
  {
    id: "gradient-sunset",
    label: "Sunset",
    className:
      "bg-gradient-to-br from-orange-200 via-pink-200 to-purple-300 dark:from-orange-950/60 dark:via-pink-950/40 dark:to-purple-950/60",
  },
  {
    id: "dots",
    label: "Dots",
    className:
      "bg-zinc-100 dark:bg-zinc-950 bg-[radial-gradient(circle_at_1px_1px,_rgb(0_0_0_/_0.08)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_rgb(255_255_255_/_0.06)_1px,_transparent_0)] bg-[size:24px_24px]",
  },
  {
    id: "grid",
    label: "Grid",
    className:
      "bg-zinc-100 dark:bg-zinc-950 bg-[linear-gradient(to_right,rgb(0_0_0_/_0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_0_0_/_0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgb(255_255_255_/_0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255_/_0.03)_1px,transparent_1px)] bg-[size:32px_32px]",
  },
];

export function getBackgroundClass(id: string): string {
  const preset = BACKGROUND_PRESETS.find((p) => p.id === id);
  return preset?.className ?? BACKGROUND_PRESETS[0].className;
}
