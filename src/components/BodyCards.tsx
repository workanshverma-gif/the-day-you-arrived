"use client";

import { motion } from "framer-motion";
import { Download, Footprints, HeartPulse, Loader2, Users } from "lucide-react";
import { useMemo } from "react";
import type { BirthContext } from "@/lib/birthday";
import {
  getLifeNumbers,
  getLifeStats,
  getNextDayMilestone,
  getNextSecondMilestone,
  getPopulationStats,
} from "@/lib/calculations";
import { fmtBig, fmtDate, fmtInt } from "@/lib/format";
import { useNowMs } from "@/lib/hooks";
import { Card, itemVariants, Note } from "./Card";
import { CountUp } from "./CountUp";
import type { ExportState } from "./StoryHost";

interface HeroProps {
  ctx: BirthContext;
  onSave: () => void;
  saveState: ExportState;
}

export function HeroCard({ ctx, onSave, saveState }: HeroProps) {
  const days = useMemo(() => getLifeStats(ctx.birth).daysLived, [ctx.birth]);
  const weekday = ctx.birth.toLocaleDateString("en-US", { weekday: "long" });
  return (
    <motion.section variants={itemVariants} className="glass relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-10 sm:py-16 lg:col-span-12">
      <div aria-hidden className="absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(242,180,90,0.16),transparent)]" />
      <p className="eyebrow relative">Day zero</p>
      <p className="relative mt-5 font-serif text-xl text-silver sm:text-2xl">You have been on Earth for</p>
      <p className="gold-text relative my-2 font-serif text-6xl font-light leading-none sm:text-8xl lg:text-9xl">
        <CountUp to={days} />
      </p>
      <p className="relative font-serif text-xl text-silver sm:text-2xl">days</p>
      <p className="relative mt-8 text-sm text-muted sm:text-base">
        You arrived on a <span className="font-serif text-lg text-amber-soft sm:text-xl">{weekday}</span>, {fmtDate(ctx.birth)}
      </p>
      <div className="relative mt-9">
        <button
          type="button"
          onClick={onSave}
          disabled={saveState === "working"}
          className="inline-flex items-center gap-2.5 rounded-full border border-amber/40 bg-amber/10 px-6 py-3 text-sm text-amber-soft transition hover:border-amber/70 hover:bg-amber/20 disabled:opacity-70"
        >
          {saveState === "working" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {saveState === "working" ? "Rendering your card…" : "Save Story Card"}
        </button>
        {saveState === "error" && (
          <p role="alert" className="mt-3 text-xs text-red-300/90">
            Couldn&apos;t create the image. Please try again.
          </p>
        )}
      </div>
    </motion.section>
  );
}

function Counter({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="tabular mt-2 font-serif text-3xl leading-none sm:text-4xl">{value}</p>
      <p className="mt-2 text-xs text-muted">{sub}</p>
    </div>
  );
}

export function BodyCard({ ctx }: { ctx: BirthContext }) {
  const nowMs = useNowMs(250);
  const s = nowMs ? getLifeStats(ctx.birth, new Date(nowMs)) : null;
  const years = (days: number) => (days / 365.25).toFixed(1);
  return (
    <Card eyebrow="Your body since day one" icon={HeartPulse} className="md:col-span-1 lg:col-span-6">
      <div className="grid gap-8">
        <Counter label="Heartbeats" value={s ? fmtInt(s.heartbeats) : "—"} sub="at about 72 beats a minute, ticking right now" />
        <Counter label="Breaths" value={s ? fmtInt(s.breaths) : "—"} sub="at about 16 breaths a minute" />
        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-7">
          <div>
            <p className="font-serif text-2xl">{s ? years(s.sleepDays) : "—"}</p>
            <p className="mt-1 text-xs text-muted">years asleep</p>
          </div>
          <div>
            <p className="font-serif text-2xl">{s ? years(s.dreamDays) : "—"}</p>
            <p className="mt-1 text-xs text-muted">years dreaming</p>
          </div>
          <div>
            <p className="font-serif text-2xl">{s ? fmtInt(s.skinCycles) : "—"}</p>
            <p className="mt-1 text-xs text-muted">skin renewals</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function LifeNumbersCard({ ctx }: { ctx: BirthContext }) {
  const n = useMemo(() => getLifeNumbers(ctx.birth), [ctx.birth]);
  const laps =
    n.walkedKm === 0
      ? "Walking starts counting at age 2"
      : n.walkedLaps < 0.1
        ? "a small slice of the way around Earth"
        : `about ${n.walkedLaps.toFixed(1)} ${n.walkedLaps.toFixed(1) === "1.0" ? "lap" : "laps"} around the Earth`;
  return (
    <Card eyebrow="Life in numbers" icon={Footprints} className="md:col-span-1 lg:col-span-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-9">
        <Counter label="Mondays survived" value={fmtInt(n.mondays)} sub="and counting, sadly" />
        <Counter label="Sunrises" value={fmtInt(n.sunrises)} sub="seen, or happily slept through" />
        <Counter label="Full moons" value={fmtInt(n.fullMoons)} sub="since the night you arrived" />
        <Counter label="Distance walked" value={`${fmtInt(n.walkedKm)} km`} sub={`${laps} (at ~4 km a day)`} />
      </div>
    </Card>
  );
}

export function HumanityCard({ ctx }: { ctx: BirthContext }) {
  const pop = useMemo(() => getPopulationStats(ctx.birth), [ctx.birth]);
  const day = useMemo(() => getNextDayMilestone(ctx.birth), [ctx.birth]);
  const sec = useMemo(() => getNextSecondMilestone(ctx.birth), [ctx.birth]);
  const arrived = pop ? pop.populationToday - pop.populationAtBirth : 0;

  return (
    <Card eyebrow="Humanity & milestones" icon={Users} className="md:col-span-2 lg:col-span-7">
      <div className="space-y-9">
        {pop ? (
          <div>
            <p className="font-serif text-2xl leading-snug sm:text-3xl">
              <span className="gold-text">{arrived >= 1e6 ? fmtBig(arrived, 2) : "Fewer than a million"}</span> new people have arrived since you were born
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              When you arrived, there were {fmtBig(pop.populationAtBirth, 2)} people on Earth. Today there are {fmtBig(pop.populationToday, 2)}. That means you are older than
              roughly {fmtBig(pop.youngerThanYou, 2)} people alive right now.
            </p>
          </div>
        ) : (
          <Note>Population records begin in 1950, so we can&apos;t compare your birth year.</Note>
        )}

        <div className="grid gap-5 border-t border-white/10 pt-8 sm:grid-cols-2">
          {[day, sec].map((m) => (
            <div key={m.label} className="rounded-2xl bg-white/[0.03] p-5">
              <p className="eyebrow">{m.label}</p>
              <p className="mt-2 font-serif text-xl leading-snug text-amber-soft">{fmtDate(m.date, m.n >= 1e9)}</p>
              <p className="mt-1.5 text-xs text-muted">in {fmtInt(m.daysRemaining)} days</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
