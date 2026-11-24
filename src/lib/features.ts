// Pure helpers behind the "extra" cards: rarity, generations, inventions, Wayback links.
import birthdayRank from "@/data/birthday-rank.json";
import inventionsData from "@/data/inventions.json";
import populationData from "@/data/population.json";
import type { Currency } from "./calculations";

// ---------- Birthday rarity ----------

export interface Rarity {
  /** 1 = most common birthday of the year. */
  rank: number;
  total: number;
  /** People alive today (estimate) who share this exact month and day. */
  sharingToday: number;
  tone: "common" | "typical" | "rare";
}

const ranks = birthdayRank as Record<string, { rank: number; share: number }>;
const population = populationData as Record<string, number>;
const WORLD_TODAY = population[String(Math.max(...Object.keys(population).map(Number)))];

export function getBirthdayRarity(month: number, day: number): Rarity {
  const key = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const entry = ranks[key];
  const total = Object.keys(ranks).length;
  return {
    rank: entry.rank,
    total,
    sharingToday: Math.round(entry.share * WORLD_TODAY),
    tone: entry.rank <= 60 ? "common" : entry.rank > total - 60 ? "rare" : "typical",
  };
}

// ---------- Generations ----------

export interface Generation {
  name: string;
  line: string;
}

export function getGeneration(year: number): Generation {
  if (year <= 1964) return { name: "Baby Boomer", line: "Born into the post-war boom, with the TV, rock 'n' roll and the Space Race for company." };
  if (year <= 1980) return { name: "Gen X", line: "The latchkey generation: mixtapes, MTV, and the last to remember life before the internet." };
  if (year <= 1996) return { name: "Millennial", line: "Grew up as the world went online, from dial-up and Nokia bricks to the first smartphones." };
  if (year <= 2012) return { name: "Gen Z", line: "Digital natives who never knew a world without Google, YouTube and the smartphone." };
  return { name: "Gen Alpha", line: "Born with touchscreens and voice assistants, growing up alongside AI." };
}

// ---------- What didn't exist yet ----------

interface Invention {
  name: string;
  year: number;
  weight: number;
  region?: string;
}

export interface LaterInvention {
  name: string;
  year: number;
  yearsAfter: number;
}

const MAX_INVENTIONS = 6;

/** The most relatable things launched after `birthYear` (India-only entries show in INR mode), oldest first. */
export function getInventionsAfter(birthYear: number, mode: Currency): LaterInvention[] {
  return (inventionsData as Invention[])
    .filter((i) => i.year > birthYear && (!i.region || (i.region === "IN" && mode === "INR")))
    .sort((a, b) => b.weight - a.weight || a.year - b.year)
    .slice(0, MAX_INVENTIONS)
    .sort((a, b) => a.year - b.year)
    .map((i) => ({ name: i.name, year: i.year, yearsAfter: i.year - birthYear }));
}

// ---------- Wayback Machine ----------

export interface WaybackSite {
  name: string;
  host: string;
  /** First date (ISO) the site existed in a form worth visiting. */
  since: string;
}

const WAYBACK_SITES: WaybackSite[] = [
  { name: "Yahoo", host: "yahoo.com", since: "1996-01-01" },
  { name: "BBC News", host: "bbc.co.uk/news", since: "1998-01-01" },
  { name: "Google", host: "google.com", since: "1999-01-01" },
  { name: "YouTube", host: "youtube.com", since: "2006-01-01" },
];

export const WAYBACK_START = "1996-01-01";

/** Links to the Internet Archive's snapshot nearest the birthday, for sites that existed by then. */
export function getWaybackLinks(iso: string): Array<{ name: string; url: string }> {
  const stamp = iso.replaceAll("-", "");
  return WAYBACK_SITES.filter((s) => iso >= s.since).map((s) => ({
    name: s.name,
    url: `https://web.archive.org/web/${stamp}/https://${s.host}/`,
  }));
}

/** The most relatable launch strictly between two birth years (India-only entries show in INR mode). */
export function getInventionBetween(earlyYear: number, lateYear: number, mode: Currency): { name: string; year: number } | null {
  const best = (inventionsData as Invention[])
    .filter((i) => i.year > earlyYear && i.year < lateYear && (!i.region || (i.region === "IN" && mode === "INR")))
    .sort((a, b) => b.weight - a.weight || a.year - b.year)[0];
  return best ? { name: best.name, year: best.year } : null;
}
