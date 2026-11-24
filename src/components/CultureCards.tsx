"use client";

import { motion } from "framer-motion";
import { Coins, Newspaper } from "lucide-react";
import { useState } from "react";
import type { BirthContext } from "@/lib/birthday";
import { getInvestment, getInvestmentOptions, type Asset, type Currency } from "@/lib/calculations";
import { ECON_FIRST, ECON_LAST, getEconomy } from "@/lib/economy";
import { fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { getBirthdayHistory } from "@/lib/wikipedia";
import { Card, Note, Skeleton } from "./Card";
import { ModeToggle } from "./ModeToggle";

export function NewsCard({ ctx }: { ctx: BirthContext }) {
  const state = useAsync(ctx.iso, (signal) => getBirthdayHistory(ctx.month, ctx.day, ctx.year, signal));
  return (
    <Card eyebrow="Breaking news & birthday twin" icon={Newspaper} className="md:col-span-2 lg:col-span-7">
      {state.status === "loading" && (
        <div className="grid gap-8 sm:grid-cols-5" aria-busy="true" aria-label="Loading headlines">
          <div className="space-y-4 sm:col-span-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-5/6" />
          </div>
          <div className="space-y-4 sm:col-span-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </div>
      )}
      {state.status === "error" && <Note>Wikipedia&apos;s archive couldn&apos;t be reached right now.</Note>}
      {state.status === "ok" && (
        <div className="grid gap-8 sm:grid-cols-5">
          <div className="sm:col-span-3">
            <p className="eyebrow mb-4 text-amber/90">{state.data.events.label || "In the news"}</p>
            {state.data.events.items.length === 0 && <Note>No headlines recorded for this date.</Note>}
            <ul className="space-y-4">
              {state.data.events.items.map((e) => (
                <li key={e.text} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                  <span className="mt-0.5 font-serif text-amber">{e.year}</span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
            {!state.data.events.exactYear && state.data.events.items.length > 0 && (
              <p className="mt-4 text-xs text-muted">Nothing was logged for your exact year, so here&apos;s a landmark from the same calendar date.</p>
            )}
          </div>
          <div className="sm:col-span-2 sm:border-l sm:border-white/10 sm:pl-8">
            <p className="eyebrow mb-4 text-amber/90">Birthday twin</p>
            {state.data.births.items.length === 0 && <Note>No famous twin on record.</Note>}
            {state.data.births.items.slice(0, 1).map((b) => (
              <div key={b.text} className="space-y-3">
                {b.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.thumbnail} alt="" loading="lazy" className="h-20 w-20 rounded-full object-cover ring-1 ring-white/15" />
                )}
                <p className="font-serif text-lg leading-snug">{b.text}</p>
                <p className="text-xs text-muted">{state.data.births.exactYear ? `Born the same day, ${b.year}` : `${state.data.births.label}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

interface Row {
  label: string;
  then: number;
  now: number;
}

const PHRASES: Record<Asset, (m: Currency) => string> = {
  gold: () => "gold",
  index: (m) => (m === "USD" ? "the S&P 500" : "the Sensex"),
  aapl: () => "Apple stock",
  btc: () => "Bitcoin",
};

interface ThenNowProps {
  ctx: BirthContext;
  onModeChange: (m: Currency) => void;
}

export function ThenNowCard({ ctx, onModeChange }: ThenNowProps) {
  const [picked, setPicked] = useState<Asset>("gold");
  const then = getEconomy(ctx.year);
  const now = getEconomy(ECON_LAST);
  const cur = ctx.mode;

  // Tabs depend on what traded in the birth year; fall back to gold if the picked asset isn't available.
  const options = getInvestmentOptions(ctx.year, cur);
  const asset = options.some((o) => o.asset === picked) ? picked : "gold";
  const inv = getInvestment(ctx.year, asset, cur);

  let rows: Row[] = [];
  if (then && now) {
    rows =
      cur === "USD"
        ? [
            { label: "Average house", then: then.global.housePrice, now: now.global.housePrice },
            { label: "Gallon of gas", then: then.global.gasGallon, now: now.global.gasGallon },
            { label: "Movie ticket", then: then.global.movieTicket, now: now.global.movieTicket },
          ]
        : [
            { label: "Litre of petrol", then: then.india.petrolPerLitre, now: now.india.petrolPerLitre },
            { label: "Movie ticket", then: then.india.movieTicket, now: now.india.movieTicket },
            { label: "Gold, 10 g (24K)", then: then.india.goldPer10g, now: now.india.goldPer10g },
          ];
  }

  return (
    <Card eyebrow="Then vs. now" icon={Coins} className="md:col-span-2 lg:col-span-5" action={<ModeToggle compact mode={cur} onChange={onModeChange} />}>
      {!then ? (
        <Note>Our price records start in {ECON_FIRST}, so we can&apos;t compare your birth year yet.</Note>
      ) : (
        <div className="space-y-8">
          <div>
            <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-x-6 text-xs text-muted">
              <span />
              <span className="text-right">{ctx.year}</span>
              <span className="text-right">{ECON_LAST}</span>
            </div>
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-6 border-t border-white/[0.07] py-3.5">
                <span className="text-sm text-silver">{r.label}</span>
                <span className="tabular text-right text-muted">{fmtMoney(r.then, cur)}</span>
                <span className="tabular text-right font-serif text-xl">{fmtMoney(r.now, cur)}</span>
              </div>
            ))}
          </div>

          {inv && (
            <div className="rounded-2xl border border-amber/25 bg-gradient-to-br from-amber/15 to-transparent p-6">
              <div role="tablist" aria-label="What if you had invested in" className={`mb-5 flex flex-wrap gap-2 ${options.length < 2 ? "hidden" : ""}`}>
                {options.map((o) => {
                  const active = o.asset === asset;
                  return (
                    <button
                      key={o.asset}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setPicked(o.asset)}
                      className={`rounded-full border px-4 py-1.5 text-xs transition ${active ? "border-amber/70 bg-amber/20 text-amber-soft" : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <motion.div key={`${asset}-${cur}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <p className="text-sm leading-relaxed text-silver">
                  If someone invested <span className="text-foreground">{fmtMoney(inv.invested, cur)}</span> in {PHRASES[asset](cur)} the day you were born, it would be worth
                </p>
                <p className="gold-text mt-1 font-serif text-4xl leading-tight sm:text-5xl">{fmtMoney(inv.value, cur)}</p>
                <p className="mt-2 text-xs text-muted">
                  {inv.multiple >= 10 ? Math.round(inv.multiple).toLocaleString("en-US") : inv.multiple.toFixed(1)}× growth
                  {inv.todayIsEstimate ? ` · ${inv.todayYear} figure is an estimate` : ""}
                  {inv.caveat ? ` · ${inv.caveat}` : ""}
                </p>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
