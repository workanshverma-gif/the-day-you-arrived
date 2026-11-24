"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useState } from "react";
import { MIN_DATE } from "@/lib/birthday";
import type { Currency } from "@/lib/calculations";
import { useToday } from "@/lib/hooks";
import { searchCities, type GeoResult } from "@/lib/weather";
import { CityInput } from "./CityInput";
import { ModeToggle } from "./ModeToggle";

export interface Submission {
  iso: string;
  geo: GeoResult | null;
}

interface Props {
  mode: Currency;
  onModeChange: (m: Currency) => void;
  onSubmit: (s: Submission) => void;
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Landing({ mode, onModeChange, onSubmit }: Props) {
  const today = useToday();
  const [date, setDate] = useState("");
  const [cityText, setCityText] = useState("");
  const [geo, setGeo] = useState<GeoResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || date.length !== 10) return setError("Pick the date you were born.");
    if (date < MIN_DATE) return setError("We can travel back as far as January 1, 1950.");
    if (today && date > today) return setError("That day hasn't happened yet. Pick a date up to today.");
    setError("");
    let chosen = geo;
    // Typed a city but didn't pick a suggestion: use the best match instead of ignoring it.
    if (!chosen && cityText.trim().length >= 2) {
      setBusy(true);
      try {
        chosen = (await searchCities(cityText))[0] ?? null;
      } catch {
        chosen = null;
      }
      setBusy(false);
    }
    onSubmit({ iso: date, geo: chosen });
  }

  return (
    <motion.main
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)", transition: { duration: 0.5 } }}
      className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center"
    >
      <motion.div {...rise(0.1)} className="mb-10 sm:mb-14">
        <ModeToggle mode={mode} onChange={onModeChange} />
      </motion.div>

      <motion.p {...rise(0.25)} className="eyebrow mb-6 text-amber/90">The Day You Arrived</motion.p>
      <motion.h1 {...rise(0.4)} className="font-serif text-[2.6rem] font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
        What did the world look like the <span className="gold-text italic">day you arrived?</span>
      </motion.h1>
      <motion.p {...rise(0.6)} className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
        The moon, the weather, the number-one song, and what it cost to live the year you were born.
      </motion.p>

      <motion.form {...rise(0.8)} onSubmit={handleSubmit} noValidate className="glass mt-12 w-full max-w-md space-y-3 rounded-3xl p-5 text-left sm:p-6">
        <label className="block">
          <span className="eyebrow mb-2 block">Date of birth</span>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-amber/80" strokeWidth={1.5} />
            <input
              type="date"
              value={date}
              min={MIN_DATE}
              max={today || undefined}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
              aria-invalid={!!error}
              className="w-full rounded-2xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-4 text-foreground outline-none transition focus:border-amber/50 focus:ring-2 focus:ring-amber/20"
            />
          </div>
        </label>

        <div>
          <span className="eyebrow mb-2 block">Birth city</span>
          <CityInput value={cityText} onValueChange={setCityText} selected={geo} onSelect={setGeo} />
        </div>

        {error && <p role="alert" className="text-sm text-red-300/90">{error}</p>}

        <motion.button
          type="submit"
          disabled={busy}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-b from-amber-soft to-amber px-6 py-4 font-medium text-[#1a1206] shadow-[0_0_50px_-8px_rgba(242,180,90,0.75)] transition-shadow hover:shadow-[0_0_70px_-6px_rgba(242,180,90,0.95)] disabled:opacity-70"
        >
          <span className="font-serif text-lg tracking-wide">{busy ? "Finding your city…" : "Travel Back"}</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </motion.form>

      <motion.p {...rise(1)} className="mt-8 text-xs text-muted/70">
        Free. No account. Nothing you enter leaves your browser except public lookups.
      </motion.p>
    </motion.main>
  );
}
