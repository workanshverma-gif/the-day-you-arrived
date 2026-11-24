"use client";

import { ExternalLink, Fingerprint, Globe, Rocket, Sparkles } from "lucide-react";
import { useMemo } from "react";
import type { BirthContext } from "@/lib/birthday";
import { getEconomy } from "@/lib/economy";
import { getBirthdayRarity, getGeneration, getInventionsAfter, getWaybackLinks, WAYBACK_START } from "@/lib/features";
import { fmtBig } from "@/lib/format";
import { Card, Note } from "./Card";

export function InventionsCard({ ctx }: { ctx: BirthContext }) {
  const items = useMemo(() => getInventionsAfter(ctx.year, ctx.mode), [ctx.year, ctx.mode]);
  return (
    <Card eyebrow="What didn't exist yet" icon={Rocket} className="md:col-span-1 lg:col-span-4">
      {items.length === 0 ? (
        <Note>You arrived after nearly everything on our list. You&apos;re among the newest generation of humans.</Note>
      ) : (
        <ul className="space-y-5">
          {items.map((i) => (
            <li key={i.name} className="flex items-baseline gap-4">
              <span className="w-14 shrink-0 font-serif text-3xl leading-none text-amber-soft">{i.yearsAfter}</span>
              <span className="text-sm leading-snug text-foreground/90">
                {i.yearsAfter === 1 ? "year" : "years"} before {i.name}
                <span className="text-muted"> · {i.year}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function RarityCard({ ctx }: { ctx: BirthContext }) {
  const r = useMemo(() => getBirthdayRarity(ctx.month, ctx.day), [ctx.month, ctx.day]);
  const pct = ((r.rank - 1) / (r.total - 1)) * 100;
  const note =
    ctx.month === 2 && ctx.day === 29
      ? "A leap-day birthday: only about 1 in 1,461 people get one."
      : r.tone === "common"
        ? "One of the busiest days for births all year."
        : r.tone === "rare"
          ? "A quiet day for births, so you're in rarer company."
          : "Right in the middle of the pack.";
  return (
    <Card eyebrow="How rare is your birthday?" icon={Fingerprint} className="md:col-span-1 lg:col-span-4">
      <p className="font-serif text-5xl leading-none text-amber-soft">#{r.rank}</p>
      <p className="mt-3 text-sm text-silver">of {r.total} birthdays, ranked from most to least common</p>
      <div className="mt-6" aria-hidden>
        <div className="relative h-1.5 rounded-full bg-gradient-to-r from-amber/70 via-white/15 to-white/5">
          <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-soft shadow-[0_0_14px_rgba(242,180,90,0.9)]" style={{ left: `${pct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[0.7rem] uppercase tracking-wider text-muted">
          <span>Most common</span>
          <span>Rarest</span>
        </div>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-foreground/90">
        Roughly <span className="font-serif text-lg text-amber-soft">{fmtBig(r.sharingToday, 0)}</span> people alive on Earth share your exact birthday.
      </p>
      <p className="mt-2 text-xs text-muted">{note} Modeled from published birth statistics, so treat the rank as approximate.</p>
    </Card>
  );
}

export function DnaCard({ ctx }: { ctx: BirthContext }) {
  const econ = getEconomy(ctx.year);
  const gen = getGeneration(ctx.year);
  const india = ctx.mode === "INR";
  return (
    <Card eyebrow="Your birth-year DNA" icon={Sparkles} className="md:col-span-2 lg:col-span-4">
      <dl className="space-y-6">
        {econ && (
          <>
            <div>
              <dt className="eyebrow">#1 movie in theatres · {india ? "Bollywood" : "Hollywood"}</dt>
              <dd className="mt-2 font-serif text-2xl leading-snug">{india ? econ.india.bollywood.movie : econ.global.topMovie}</dd>
              {india && <dd className="mt-1 text-sm text-muted">♪ {econ.india.bollywood.song}</dd>}
            </div>
            <div className="border-t border-white/10 pt-6">
              <dt className="eyebrow">In everyone&apos;s pocket</dt>
              <dd className="mt-2 font-serif text-xl leading-snug">{econ.global.pocket}</dd>
              <dd className="mt-1 text-sm text-muted">Tech era: {econ.global.techEra}</dd>
            </div>
          </>
        )}
        <div className={econ ? "border-t border-white/10 pt-6" : ""}>
          <dt className="eyebrow">Your generation</dt>
          <dd className="mt-2 font-serif text-2xl text-amber-soft">{gen.name}</dd>
          <dd className="mt-1 text-sm leading-relaxed text-muted">{gen.line}</dd>
        </div>
      </dl>
    </Card>
  );
}

export function WaybackCard({ ctx }: { ctx: BirthContext }) {
  const links = useMemo(() => getWaybackLinks(ctx.iso), [ctx.iso]);
  const eligible = ctx.iso >= WAYBACK_START;
  return (
    <Card eyebrow="The internet on your birthday" icon={Globe} className="md:col-span-2 lg:col-span-5">
      {eligible ? (
        <div className="space-y-6">
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Step into the Internet Archive and see how these sites looked the day you were born.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {links.map((l) => (
              <a
                key={l.name}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition hover:border-amber/50 hover:bg-amber/[0.06]"
              >
                <span className="font-serif text-lg">{l.name}</span>
                <ExternalLink className="h-4 w-4 text-muted transition group-hover:text-amber" />
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 font-mono text-sm leading-relaxed text-silver/80">
          <p className="text-amber/80">&gt; ERROR 404: web page not found</p>
          <p className="mt-3">You arrived before the public web was archived. The internet barely existed yet.</p>
          <p className="mt-3 text-xs text-muted">(The first snapshots we can link to are from 1996.)</p>
        </div>
      )}
    </Card>
  );
}
