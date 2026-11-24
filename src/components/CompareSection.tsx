"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Download, Heart, Hourglass, Loader2, Moon, Orbit, Scale, Users } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { BirthContext } from "@/lib/birthday";
import { MIN_DATE } from "@/lib/birthday";
import { getLifeStats, getMoonAtBirth, parseBirthDate } from "@/lib/calculations";
import { compareBirthdays, describeGap, type Comparison } from "@/lib/compare";
import { fmtDate, fmtInt } from "@/lib/format";
import { useNowMs, useToday } from "@/lib/hooks";
import { Card, containerVariants } from "./Card";
import { MoonSvg } from "./MoonSvg";
import { CompareStory, type CompareStoryData } from "./StoryCards";
import { useStoryExport } from "./StoryHost";

interface Person {
  youName: string;
  name: string;
  iso: string;
  /** Bumps on every submit so re-comparing the same date still replays the reveal. */
  run: number;
}

const BIG = "font-serif text-4xl leading-none sm:text-5xl";
const FIELD =
  "w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-foreground outline-none transition placeholder:text-muted/70 focus:border-amber/50 focus:ring-2 focus:ring-amber/20";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className={`tabular ${BIG} text-amber-soft`}>{value}</p>
      <p className="mt-2 text-xs leading-snug text-muted">{label}</p>
    </div>
  );
}

function MoonColumn({ title, date, iso }: { title: string; date: Date; iso: string }) {
  const moon = useMemo(() => getMoonAtBirth(parseBirthDate(iso)), [iso]);
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      <MoonSvg phase={moon.phase} size={112} />
      <div className="min-w-0">
        <p className="font-serif text-lg leading-tight sm:text-xl">{moon.phaseName}</p>
        <p className="mt-1 text-xs text-silver">{moon.illuminationPct}% illuminated</p>
        <p className="eyebrow mt-3 break-words">{title}</p>
        <p className="mt-1 text-xs text-muted">{fmtDate(date)}</p>
      </div>
    </div>
  );
}

interface ResultsProps {
  ctx: BirthContext;
  person: Person;
  them: Date;
  cmp: Comparison;
}

function Results({ ctx, person, them, cmp }: ResultsProps) {
  const nowMs = useNowMs(250);
  const heartbeats = nowMs
    ? getLifeStats(ctx.birth, new Date(nowMs)).heartbeats + getLifeStats(them, new Date(nowMs)).heartbeats
    : null;

  const youLabel = person.youName || "You";
  const name = person.name || "Them";
  const subject = person.name || "They";
  const sameDay = cmp.firstBorn === "same";

  let arrival: string;
  if (sameDay) {
    arrival = "Same day, same moon, same stars overhead. Neither of you gets to be the older one.";
  } else {
    const first = cmp.firstBorn === "you" ? youLabel : subject;
    const second = cmp.firstBorn === "you" ? (person.name || "they") : (person.youName || "you");
    arrival = cmp.inventionBetween
      ? `${first} arrived first. By the time ${second} showed up, the world had ${cmp.inventionBetween.name} (${cmp.inventionBetween.year}).`
      : `${first} arrived first, with a ${fmtInt(cmp.totalDaysApart)}-day head start. The world looked much the same when ${second} showed up.`;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-10">
      <Card eyebrow="Exact age gap" icon={Scale} className="md:col-span-2 lg:col-span-7">
        {sameDay ? (
          <p className="font-serif text-3xl leading-snug sm:text-4xl">
            <span className="gold-text">Birthday twins.</span> You were born on exactly the same day.
          </p>
        ) : (
          <>
            <p className="font-serif text-3xl leading-snug sm:text-4xl">
              Born <span className="gold-text">{describeGap(cmp.gap)}</span> apart
            </p>
            <p className="mt-4 text-sm text-muted">That&apos;s {fmtInt(cmp.totalDaysApart)} days in total.</p>
          </>
        )}
      </Card>

      <Card eyebrow="Days shared on Earth" icon={Orbit} className="md:col-span-2 lg:col-span-5">
        <p className={`tabular ${BIG} gold-text`}>{fmtInt(cmp.sharedDays)}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">days you&apos;ve both been alive at the same time, about {(cmp.sharedDays / 365.25).toFixed(1)} years.</p>
      </Card>

      <Card eyebrow="Mondays & full moons shared" icon={CalendarDays} className="md:col-span-1 lg:col-span-5">
        <div className="grid grid-cols-2 gap-6">
          <Stat value={fmtInt(cmp.sharedMondays)} label="Mondays you've both survived" />
          <Stat value={fmtInt(cmp.sharedFullMoons)} label="full moons you've both seen" />
        </div>
      </Card>

      <Card eyebrow="The moon on each of your days" icon={Moon} className="md:col-span-1 lg:col-span-7">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <MoonColumn title={youLabel} date={ctx.birth} iso={ctx.iso} />
          <MoonColumn title={name} date={them} iso={person.iso} />
        </div>
      </Card>

      <Card eyebrow="Combined heartbeats" icon={Heart} className="md:col-span-1 lg:col-span-6">
        <p className={`tabular ${BIG} break-words`}>{heartbeats === null ? "—" : fmtInt(heartbeats)}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          beats between the two of you since you each arrived. Still ticking, at about 144 a minute together.
        </p>
      </Card>

      <Card eyebrow="Who arrived first" icon={Hourglass} className="md:col-span-1 lg:col-span-6">
        <p className="font-serif text-2xl leading-snug sm:text-3xl">{arrival}</p>
      </Card>
    </motion.div>
  );
}

function buildStoryData(ctx: BirthContext, person: Person, them: Date, cmp: Comparison): CompareStoryData {
  const side = (d: Date) => {
    const m = getMoonAtBirth(d);
    return { dateLabel: fmtDate(d), moon: { phase: m.phase, name: m.phaseName, pct: m.illuminationPct } };
  };
  return {
    youName: person.youName || "You",
    themName: person.name || "Them",
    sameDay: cmp.firstBorn === "same",
    gapText: describeGap(cmp.gap),
    totalDaysApart: cmp.totalDaysApart,
    sharedDays: cmp.sharedDays,
    you: side(ctx.birth),
    them: side(them),
  };
}

export function CompareSection({ ctx }: { ctx: BirthContext }) {
  const today = useToday();
  const [youName, setYouName] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [person, setPerson] = useState<Person | null>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const runs = useRef(0);
  const story = useStoryExport();

  const them = useMemo(() => (person ? parseBirthDate(person.iso) : null), [person]);
  const cmp = useMemo(() => (them ? compareBirthdays(ctx.birth, them, ctx.mode) : null), [ctx.birth, ctx.mode, them]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (date.length !== 10) return setError("Pick their birth date.");
    if (date < MIN_DATE) return setError("We can compare dates back to January 1, 1950.");
    if (today && date > today) return setError("That day hasn't happened yet. Pick a date up to today.");
    setError("");
    setPerson({ youName: youName.trim().slice(0, 40), name: name.trim().slice(0, 40), iso: date, run: ++runs.current });
  }

  function reset() {
    setPerson(null);
    setName("");
    setDate("");
    setError("");
    // Wait a frame so the form is back in its place before focusing.
    requestAnimationFrame(() => dateRef.current?.focus({ preventScroll: true }));
  }

  function saveStory() {
    if (!person || !them || !cmp) return;
    void story.start(async () => ({
      node: <CompareStory data={buildStoryData(ctx, person, them, cmp)} />,
      filename: `two-birthdays-${ctx.iso}-${person.iso}.png`,
    }));
  }

  return (
    <motion.section
      id="compare"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mt-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-4 inline-flex items-center gap-2 text-amber/90">
          <Users className="h-3.5 w-3.5" /> Two birthdays
        </p>
        <h2 className="font-serif text-4xl font-light leading-tight sm:text-5xl">
          Compare with <span className="gold-text italic">someone you love</span>
        </h2>
        <p className="mt-4 text-muted">A friend, partner, sibling or parent. See how your two lives overlap.</p>

        <form onSubmit={submit} noValidate className="glass mt-10 grid gap-4 rounded-3xl p-5 text-left sm:grid-cols-2 sm:p-7">
          <label className="block min-w-0">
            <span className="eyebrow mb-2 block">Your name (optional)</span>
            <input value={youName} onChange={(e) => setYouName(e.target.value)} maxLength={40} placeholder="e.g. Alex" autoComplete="off" className={FIELD} />
          </label>
          <label className="block min-w-0">
            <span className="eyebrow mb-2 block">Their name (optional)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Maya" autoComplete="off" className={FIELD} />
          </label>
          <label className="block min-w-0">
            <span className="eyebrow mb-2 block">Their birth date</span>
            <input
              id="compare-date"
              ref={dateRef}
              type="date"
              value={date}
              min={MIN_DATE}
              max={today || undefined}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
              aria-invalid={!!error}
              className={FIELD}
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-b from-amber-soft to-amber px-7 py-3.5 font-serif text-lg tracking-wide text-[#1a1206] shadow-[0_0_40px_-10px_rgba(242,180,90,0.8)] transition hover:brightness-105 active:scale-[0.98]"
            >
              Compare
            </button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-300/90 sm:col-span-2">
              {error}
            </p>
          )}
        </form>
      </div>

      <AnimatePresence mode="wait">
        {person && them && cmp && (
          <motion.div key={person.run} exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }} className="mt-14">
            <Results ctx={ctx} person={person} them={them} cmp={cmp} />
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={saveStory}
                disabled={story.state === "working"}
                className="inline-flex items-center gap-2.5 rounded-full border border-amber/40 bg-amber/10 px-6 py-3 text-sm text-amber-soft transition hover:border-amber/70 hover:bg-amber/20 disabled:opacity-70"
              >
                {story.state === "working" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {story.state === "working" ? "Rendering your card…" : "Save Comparison Story"}
              </button>
              <button type="button" onClick={reset} className="glass rounded-full px-6 py-3 text-sm text-silver transition hover:text-amber">
                Compare someone else
              </button>
            </div>
            {story.state === "error" && (
              <p role="alert" className="mt-3 text-center text-xs text-red-300/90">
                Couldn&apos;t create the image. Please try again.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {story.host}
    </motion.section>
  );
}
