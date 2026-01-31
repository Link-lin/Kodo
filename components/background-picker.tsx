"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { BACKGROUND_PRESETS, getBackgroundClass } from "@/lib/backgrounds";
import { cn } from "@/lib/utils";

type BackgroundPickerProps = {
  value: string;
  onChange: (id: string) => void;
};

export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed right-4 top-4 z-50 rounded-full bg-background/80 shadow backdrop-blur-sm"
          title="Change background"
        >
          <Palette className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="mb-2 text-sm font-medium">Background</div>
        <div className="grid grid-cols-3 gap-2">
          {BACKGROUND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onChange(preset.id);
                setOpen(false);
              }}
              className={cn(
                "h-12 rounded-md border-2 transition-colors",
                getBackgroundClass(preset.id),
                value === preset.id
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
              title={preset.label}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
