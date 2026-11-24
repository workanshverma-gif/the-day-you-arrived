// "Two birthdays" comparison. Pure date math, no network.
import { calendarDays, countFullMoons, countMondays, type Currency } from "./calculations";
import { getInventionBetween } from "./features";

export interface AgeGap {
  years: number;
  months: number;
  days: number;
}

export interface Comparison {
  /** Who was born first, from the point of view of the person using the app ("you"). */
  firstBorn: "you" | "them" | "same";
  gap: AgeGap;
  totalDaysApart: number;
  /** Days both people have been alive at the same time (from the later birth to today). */
  sharedDays: number;
  sharedMondays: number;
  sharedFullMoons: number;
  /** A notable launch that happened between the two births, if any. */
  inventionBetween: { name: string; year: number } | null;
}

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

/** `from` plus whole months, clamping the day to the target month's length (Jan 31 + 1 month = Feb 28/29). */
function addMonthsClamped(from: Date, months: number): Date {
  const total = from.getMonth() + months;
  const y = from.getFullYear() + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  return new Date(y, m, Math.min(from.getDate(), daysInMonth(y, m)));
}

/** Calendar gap "X years, Y months, Z days" between two dates (order-independent). */
export function getAgeGap(a: Date, b: Date): AgeGap {
  const [early, late] = a <= b ? [a, b] : [b, a];
  let months = (late.getFullYear() - early.getFullYear()) * 12 + (late.getMonth() - early.getMonth());
  if (late.getDate() < early.getDate()) months--;
  const anchor = addMonthsClamped(early, months);
  return { years: Math.floor(months / 12), months: months % 12, days: calendarDays(anchor, late) };
}

export function compareBirthdays(you: Date, them: Date, mode: Currency, now: Date = new Date()): Comparison {
  const firstBorn = you.getTime() === them.getTime() ? "same" : you < them ? "you" : "them";
  const [early, late] = you <= them ? [you, them] : [them, you];
  const sharedDays = calendarDays(late, now);
  return {
    firstBorn,
    gap: getAgeGap(early, late),
    totalDaysApart: calendarDays(early, late),
    sharedDays,
    sharedMondays: countMondays(late, now),
    sharedFullMoons: countFullMoons(sharedDays),
    inventionBetween: getInventionBetween(early.getFullYear(), late.getFullYear(), mode),
  };
}

const plural = (n: number, unit: string) => `${n.toLocaleString("en-US")} ${unit}${n === 1 ? "" : "s"}`;

/** "5 years, 3 months, and 12 days"; zero parts are dropped. */
export function describeGap({ years, months, days }: AgeGap): string {
  const parts = [
    years ? plural(years, "year") : "",
    months ? plural(months, "month") : "",
    days ? plural(days, "day") : "",
  ].filter(Boolean);
  if (parts.length === 0) return "0 days";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(" and ");
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}
