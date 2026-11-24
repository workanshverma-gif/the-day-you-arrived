"use client";

import { Loader2, MapPin } from "lucide-react";
import { useId, useState } from "react";
import { useAsync, useDebounced } from "@/lib/hooks";
import { searchCities, type GeoResult } from "@/lib/weather";

interface Props {
  value: string;
  onValueChange: (v: string) => void;
  selected: GeoResult | null;
  onSelect: (g: GeoResult | null) => void;
  placeholder?: string;
  compact?: boolean;
}

export function CityInput({ value, onValueChange, selected, onSelect, placeholder = "Birth city (optional)", compact }: Props) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const query = value.trim();
  // Debounce keystrokes; skip the request once a suggestion has been chosen.
  const debounced = useDebounced(query, 350);
  const key = !selected && debounced.length >= 2 && debounced === query ? debounced : null;
  const state = useAsync(key, (signal) => searchCities(debounced, signal));
  const results = state.status === "ok" ? state.data : [];
  const showList = open && !selected && query.length >= 2 && (state.status === "ok" || state.status === "error");

  return (
    <div className="relative">
      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-amber/80" strokeWidth={1.5} />
      <input
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
          if (selected) onSelect(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-label="Birth city"
        className={`w-full rounded-2xl border border-white/10 bg-black/30 pl-11 pr-10 text-foreground outline-none transition placeholder:text-muted/70 focus:border-amber/50 focus:ring-2 focus:ring-amber/20 ${compact ? "py-2.5 text-sm" : "py-3.5"}`}
      />
      {state.status === "loading" && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />}
      {showList && (
        <ul id={listId} role="listbox" className="glass absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-[#101013]/95 py-1 shadow-2xl">
          {results.length === 0 && <li className="px-4 py-3 text-sm text-muted">{state.status === "error" ? "Search is unavailable right now." : "No matching cities."}</li>}
          {results.map((r) => (
            <li key={r.id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(r);
                  onValueChange(r.label);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-foreground/90 transition hover:bg-white/5"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
