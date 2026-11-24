"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import type { Currency } from "@/lib/calculations";

const OPTIONS: Array<{ value: Currency; label: string; short: string }> = [
  { value: "USD", label: "Global (USD)", short: "USD" },
  { value: "INR", label: "India (INR)", short: "INR" },
];

export function ModeToggle({ mode, onChange, compact = false }: { mode: Currency; onChange: (m: Currency) => void; compact?: boolean }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label="Currency" className="glass inline-flex rounded-full p-1">
      {OPTIONS.map((o) => {
        const active = o.value === mode;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full font-medium tracking-wide transition-colors ${compact ? "px-3.5 py-1.5 text-xs" : "px-4 py-1.5 text-xs sm:px-5 sm:text-sm"} ${active ? "text-[#1a1206]" : "text-muted hover:text-foreground"}`}
          >
            {active && (
              <motion.span
                layoutId={`pill-${id}`}
                className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-soft to-amber shadow-[0_0_24px_-4px_rgba(242,180,90,0.7)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{compact ? o.short : o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
