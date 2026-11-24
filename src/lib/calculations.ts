// Pure calculation helpers. Nothing here touches the network or the DOM.
import * as SunCalc from "suncalc";
import populationData from "@/data/population.json";
import { ECON_LAST, getEconomy, type EconomyYear } from "./economy";

export const HEARTBEATS_PER_MIN = 72;
export const BREATHS_PER_MIN = 16;
export const SKIN_CYCLE_DAYS = 28;

const MS_SECOND = 1000;
const MS_MINUTE = 60 * MS_SECOND;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;
const MS_YEAR = 365.25 * MS_DAY;

export type Currency = "USD" | "INR";

const population = populationData as Record<string, number>;

/** Parse "YYYY-MM-DD" as local midnight of that calendar day. */
export function parseBirthDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // Year < 100 is mapped to 19xx by the Date constructor; force the real year.
  date.setFullYear(y);
  return date;
}

// ---------- Time lived ----------

export interface LifeStats {
  daysLived: number;
  hoursLived: number;
  secondsLived: number;
  ageYears: number;
  heartbeats: number;
  breaths: number;
  heartbeatsPerSecond: number;
  breathsPerSecond: number;
  /** Days spent asleep (1/3 of life). */
  sleepDays: number;
  /** Days spent in REM sleep (~20% of sleep). */
  dreamDays: number;
  skinCycles: number;
}

/** Totals at `now`. Call again each tick to animate; use the *PerSecond rates for smooth counters. */
export function getLifeStats(birth: Date, now: Date = new Date()): LifeStats {
  const ms = Math.max(0, now.getTime() - birth.getTime());
  const minutes = ms / MS_MINUTE;
  const daysExact = ms / MS_DAY;
  const sleepDays = daysExact / 3;
  return {
    daysLived: Math.floor(daysExact),
    hoursLived: Math.floor(ms / MS_HOUR),
    secondsLived: Math.floor(ms / MS_SECOND),
    ageYears: ms / MS_YEAR,
    heartbeats: Math.floor(minutes * HEARTBEATS_PER_MIN),
    breaths: Math.floor(minutes * BREATHS_PER_MIN),
    heartbeatsPerSecond: HEARTBEATS_PER_MIN / 60,
    breathsPerSecond: BREATHS_PER_MIN / 60,
    sleepDays,
    dreamDays: sleepDays * 0.2,
    skinCycles: daysExact / SKIN_CYCLE_DAYS,
  };
}

// ---------- Moon ----------

export interface MoonInfo {
  /** 0-100 */
  illuminationPct: number;
  /** 0 = new moon, 0.5 = full moon, back to 1 = new moon. */
  phase: number;
  phaseName: string;
  emoji: string;
}

const MOON_PHASES: Array<{ max: number; name: string; emoji: string }> = [
  { max: 0.03, name: "New Moon", emoji: "🌑" },
  { max: 0.22, name: "Waxing Crescent", emoji: "🌒" },
  { max: 0.28, name: "First Quarter", emoji: "🌓" },
  { max: 0.47, name: "Waxing Gibbous", emoji: "🌔" },
  { max: 0.53, name: "Full Moon", emoji: "🌕" },
  { max: 0.72, name: "Waning Gibbous", emoji: "🌖" },
  { max: 0.78, name: "Last Quarter", emoji: "🌗" },
  { max: 0.97, name: "Waning Crescent", emoji: "🌘" },
  { max: 1.01, name: "New Moon", emoji: "🌑" },
];

export function getMoonAtBirth(birth: Date): MoonInfo {
  // Sample at local noon so the phase represents the day, not its first instant.
  const noon = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate(), 12);
  const { fraction, phase } = SunCalc.getMoonIllumination(noon);
  const bucket = MOON_PHASES.find((p) => phase < p.max) ?? MOON_PHASES[0];
  return { illuminationPct: Math.round(fraction * 100), phase, phaseName: bucket.name, emoji: bucket.emoji };
}

// ---------- Milestones ----------

export interface Milestone {
  label: string;
  date: Date;
  msRemaining: number;
  daysRemaining: number;
  /** e.g. 10000 for "10,000th day". */
  n: number;
}

/** Next multiple of 10,000 days (10,000th, 20,000th, ...) strictly after `now`. */
export function getNextDayMilestone(birth: Date, now: Date = new Date()): Milestone {
  const daysLived = (now.getTime() - birth.getTime()) / MS_DAY;
  const n = (Math.floor(daysLived / 10_000) + 1) * 10_000;
  // Calendar arithmetic (not ms) so the result lands on the right local date across DST changes.
  const date = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate() + n);
  return {
    label: `${n.toLocaleString("en-US")}th day alive`,
    date,
    msRemaining: date.getTime() - now.getTime(),
    daysRemaining: Math.ceil((date.getTime() - now.getTime()) / MS_DAY),
    n,
  };
}

/** Next multiple of 1,000,000,000 seconds alive strictly after `now`. */
export function getNextSecondMilestone(birth: Date, now: Date = new Date()): Milestone {
  const seconds = (now.getTime() - birth.getTime()) / MS_SECOND;
  const n = (Math.floor(seconds / 1e9) + 1) * 1e9;
  const date = new Date(birth.getTime() + n * MS_SECOND);
  const billions = n / 1e9;
  return {
    label: `${billions === 1 ? "1 billionth" : `${billions} billionth`} second alive`,
    date,
    msRemaining: date.getTime() - now.getTime(),
    daysRemaining: Math.ceil((date.getTime() - now.getTime()) / MS_DAY),
    n,
  };
}

// ---------- "What if?" investments ----------

export type Asset = "gold" | "index" | "aapl" | "btc";

export interface InvestmentOption {
  asset: Asset;
  label: string;
}

export interface Investment {
  asset: Asset;
  label: string;
  currency: Currency;
  invested: number;
  birthYear: number;
  todayYear: number;
  value: number;
  multiple: number;
  /** True when today's price is a projection rather than a settled annual average. */
  todayIsEstimate: boolean;
  caveat?: string;
}

const FIRST_ECON_YEAR = 1950;
const LAST_POP_YEAR = Math.max(...Object.keys(population).map(Number));
const FIRST_POP_YEAR = Math.min(...Object.keys(population).map(Number));

/** Price of one unit of the asset in the chosen currency's world, or null if it didn't trade yet. */
function assetPrice(e: EconomyYear, asset: Asset, mode: Currency): number | null {
  const usd = mode === "USD";
  switch (asset) {
    case "gold":
      return usd ? e.global.goldPerOz : e.india.goldPer10g;
    case "index":
      return usd ? e.global.sp500 : e.india.sensex;
    // Dollar assets for an Indian investor: convert at that year's rate, so rupee moves count.
    case "aapl":
      return e.global.aapl == null ? null : usd ? e.global.aapl : e.global.aapl * e.india.usdInr;
    case "btc":
      return e.global.btc == null ? null : usd ? e.global.btc : e.global.btc * e.india.usdInr;
  }
}

const ASSET_LABELS: Record<Asset, (m: Currency) => string> = {
  gold: () => "Gold",
  index: (m) => (m === "USD" ? "S&P 500" : "Sensex"),
  aapl: () => "Apple",
  btc: () => "Bitcoin",
};

/** Which tabs make sense for this birth year (an asset must have existed that year). */
export function getInvestmentOptions(birthYear: number, mode: Currency): InvestmentOption[] {
  const e = getEconomy(birthYear);
  if (!e) return [];
  return (["gold", "index", "aapl", "btc"] as Asset[])
    .filter((a) => assetPrice(e, a, mode) != null)
    .map((asset) => ({ asset, label: ASSET_LABELS[asset](mode) }));
}

/** What $1,000 (USD) or ₹10,000 (INR) put into the asset in the birth year is worth now. Null if not available. */
export function getInvestment(birthYear: number, asset: Asset, mode: Currency, now: Date = new Date()): Investment | null {
  if (birthYear < FIRST_ECON_YEAR) return null;
  const todayYear = Math.min(now.getFullYear(), ECON_LAST);
  const then = getEconomy(birthYear);
  const today = getEconomy(todayYear);
  if (!then || !today) return null;
  const birthPrice = assetPrice(then, asset, mode);
  const todayPrice = assetPrice(today, asset, mode);
  if (birthPrice == null || todayPrice == null) return null;

  const invested = mode === "USD" ? 1000 : 10_000;
  const caveats: Partial<Record<Asset, string>> = {
    index: "Price index only; dividends not included.",
    btc: "Yearly average prices; real entry and exit points vary wildly.",
    aapl: "Split-adjusted yearly average prices; dividends not included.",
  };
  return {
    asset,
    label: ASSET_LABELS[asset](mode),
    currency: mode,
    invested,
    birthYear,
    todayYear,
    value: (invested / birthPrice) * todayPrice,
    multiple: todayPrice / birthPrice,
    todayIsEstimate: !!today.estimated,
    caveat: caveats[asset],
  };
}

// ---------- Life in numbers ----------

export interface LifeNumbers {
  mondays: number;
  sunrises: number;
  fullMoons: number;
  walkedKm: number;
  /** Laps around the Earth's equator (40,075 km). */
  walkedLaps: number;
}

const SYNODIC_MONTH_DAYS = 29.530588853;
const EARTH_CIRCUMFERENCE_KM = 40_075;
const WALK_KM_PER_DAY = 4;
const WALK_STARTS_AFTER_DAYS = 730;

/** Calendar-day difference, immune to DST (both dates reduced to UTC midnights of their local Y-M-D). */
export function calendarDays(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.round((b - a) / MS_DAY));
}

/** Mondays on or after `from` up to and including `to`. */
export function countMondays(from: Date, to: Date): number {
  const days = calendarDays(from, to);
  // Days until the first Monday on or after `from` (0 if it is a Monday).
  const firstMonday = (1 - from.getDay() + 7) % 7;
  return days >= firstMonday ? Math.floor((days - firstMonday) / 7) + 1 : 0;
}

/** Full moons in a span of `days` (one per synodic month). */
export function countFullMoons(days: number): number {
  return Math.floor(days / SYNODIC_MONTH_DAYS);
}

export function getLifeNumbers(birth: Date, now: Date = new Date()): LifeNumbers {
  const days = calendarDays(birth, now);
  const walkedKm = Math.max(0, days - WALK_STARTS_AFTER_DAYS) * WALK_KM_PER_DAY;
  return {
    mondays: countMondays(birth, now),
    sunrises: days,
    fullMoons: countFullMoons(days),
    walkedKm,
    walkedLaps: walkedKm / EARTH_CIRCUMFERENCE_KM,
  };
}

// ---------- Population ----------

export interface PopulationStats {
  populationAtBirth: number;
  populationToday: number;
  growthMultiple: number;
  /** Approximate count of people alive today who were born after the user. */
  youngerThanYou: number;
  youngerPct: number;
}

/** Global crude birth rate per 1,000 people, from UN-published values; log-interpolated. */
const BIRTH_RATE_ANCHORS: Array<[number, number]> = [
  [1950, 37], [1960, 35], [1970, 33], [1980, 28], [1990, 25], [2000, 21.4], [2010, 20], [2020, 17.8], [2026, 16.5],
];

function birthRate(year: number): number {
  const pts = BIRTH_RATE_ANCHORS;
  if (year <= pts[0][0]) return pts[0][1];
  if (year >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  const i = pts.findIndex(([y]) => y >= year);
  const [x0, v0] = pts[i - 1];
  const [x1, v1] = pts[i];
  return v0 + ((year - x0) / (x1 - x0)) * (v1 - v0);
}

/** Share of a birth cohort still alive at `age` (rough Weibull curve with ~5% early-childhood loss). */
function survival(age: number): number {
  if (age < 1) return 0.97;
  return 0.95 * Math.exp(-Math.pow(age / 85, 4.5));
}

/**
 * Population then vs now, and an estimate of how many living people are younger than the user.
 * The "younger" figure sums estimated births (population x birth rate) since the birth year,
 * weighted by survival, so treat it as approximate. Null for birth years before 1950.
 */
export function getPopulationStats(birth: Date, now: Date = new Date()): PopulationStats | null {
  const birthYear = birth.getFullYear();
  if (birthYear < FIRST_POP_YEAR) return null;
  const todayYear = Math.min(now.getFullYear(), LAST_POP_YEAR);
  const populationAtBirth = population[String(birthYear)];
  const populationToday = population[String(todayYear)];
  if (!populationAtBirth || !populationToday) return null;

  let younger = 0;
  for (let y = birthYear; y <= todayYear; y++) {
    const pop = population[String(y)];
    let births = (pop * birthRate(y)) / 1000;
    // Birth year: only the part of the year after the user's birthday; current year: only up to today.
    const yearStart = new Date(y, 0, 1).getTime();
    const yearEnd = new Date(y + 1, 0, 1).getTime();
    const from = y === birthYear ? birth.getTime() : yearStart;
    const to = y === now.getFullYear() ? now.getTime() : yearEnd;
    births *= Math.max(0, to - from) / (yearEnd - yearStart);
    younger += births * survival((now.getTime() - (from + to) / 2) / MS_YEAR);
  }
  younger = Math.min(younger, populationToday);

  return {
    populationAtBirth,
    populationToday,
    growthMultiple: populationToday / populationAtBirth,
    youngerThanYou: Math.round(younger),
    youngerPct: (younger / populationToday) * 100,
  };
}
