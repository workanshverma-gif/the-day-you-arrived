"use client";

import { motion } from "framer-motion";
import { RotateCcw, Users } from "lucide-react";
import { useMemo } from "react";
import { makeContext } from "@/lib/birthday";
import { buildBirthStory } from "@/lib/story";
import type { Currency } from "@/lib/calculations";
import type { GeoResult } from "@/lib/weather";
import { BodyCard, HeroCard, HumanityCard, LifeNumbersCard } from "./BodyCards";
import { containerVariants } from "./Card";
import { CompareSection } from "./CompareSection";
import { NewsCard, ThenNowCard } from "./CultureCards";
import { DnaCard, InventionsCard, RarityCard, WaybackCard } from "./ExtraCards";
import { SongCard } from "./SongCard";
import { BirthStory } from "./StoryCards";
import { useStoryExport } from "./StoryHost";
import { MoonCard, WeatherCard } from "./SkyCards";

interface Props {
  iso: string;
  geo: GeoResult | null;
  onGeo: (g: GeoResult | null) => void;
  mode: Currency;
  onModeChange: (m: Currency) => void;
  onReset: () => void;
}

export function Dashboard({ iso, geo, onGeo, mode, onModeChange, onReset }: Props) {
  const ctx = useMemo(() => makeContext(iso, mode), [iso, mode]);

  const story = useStoryExport();
  const saveStory = () =>
    story.start(async () => ({
      node: <BirthStory data={await buildBirthStory(ctx, geo)} />,
      filename: `day-you-arrived-${iso}.png`,
    }));

  function goToCompare() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("compare")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    // Let the scroll settle, then drop the cursor in the date field.
    setTimeout(() => document.getElementById("compare-date")?.focus({ preventScroll: true }), reduce ? 0 : 700);
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-8">
      <header className="sticky top-0 z-20 -mx-4 mb-10 flex items-center justify-between gap-3 bg-gradient-to-b from-[#09090b] via-[#09090b]/80 to-transparent px-4 py-5 sm:-mx-8 sm:px-8">
        <p className="whitespace-nowrap font-serif text-base italic text-silver sm:text-lg">The Day You Arrived</p>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={goToCompare}
            aria-label="Compare with someone"
            className="glass flex h-10 min-w-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 text-xs text-silver transition hover:text-amber min-[480px]:px-4 sm:text-sm"
          >
            <Users className="h-4 w-4" />
            <span className="hidden min-[480px]:inline">Compare</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Try another day"
            className="glass flex h-10 min-w-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 text-xs text-silver transition hover:text-amber min-[480px]:px-4 sm:text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden min-[480px]:inline">Another day</span>
          </button>
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 md:gap-y-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12">
        <HeroCard ctx={ctx} onSave={saveStory} saveState={story.state} />
        <MoonCard ctx={ctx} />
        <WeatherCard ctx={ctx} geo={geo} onGeo={onGeo} />
        <SongCard ctx={ctx} />
        <NewsCard ctx={ctx} />
        <ThenNowCard ctx={ctx} onModeChange={onModeChange} />
        <DnaCard ctx={ctx} />
        <InventionsCard ctx={ctx} />
        <RarityCard ctx={ctx} />
        <BodyCard ctx={ctx} />
        <LifeNumbersCard ctx={ctx} />
        <HumanityCard ctx={ctx} />
        <WaybackCard ctx={ctx} />
      </motion.div>

      <CompareSection key={iso} ctx={ctx} />
      {story.host}
    </motion.main>
  );
}
