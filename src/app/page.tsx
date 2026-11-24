"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Landing, type Submission } from "@/components/Landing";
import { Starfield } from "@/components/Starfield";
import type { Currency } from "@/lib/calculations";
import type { GeoResult } from "@/lib/weather";

export default function Home() {
  const [mode, setMode] = useState<Currency>("USD");
  const [sub, setSub] = useState<Submission | null>(null);
  const [geo, setGeo] = useState<GeoResult | null>(null);

  return (
    <>
      <Starfield />
      <AnimatePresence mode="wait">
        {sub ? (
          <Dashboard
            key={sub.iso}
            iso={sub.iso}
            geo={geo}
            onGeo={setGeo}
            mode={mode}
            onModeChange={setMode}
            onReset={() => setSub(null)}
          />
        ) : (
          <Landing
            key="landing"
            mode={mode}
            onModeChange={setMode}
            onSubmit={(s) => {
              setGeo(s.geo);
              setSub(s);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
