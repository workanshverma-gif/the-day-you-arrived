// Wikipedia "On this day" feed (free, no API key).

export interface HistoryItem {
  text: string;
  year: number;
  thumbnail?: string;
  url?: string;
}

export interface HistorySection {
  items: HistoryItem[];
  /** True when items are from the user's birth year; false when they are the same calendar date in another year. */
  exactYear: boolean;
  /** e.g. "In 1994" or "On this day in 1969", ready to show above the items. */
  label: string;
}

export interface BirthdayHistory {
  events: HistorySection;
  births: HistorySection;
}

interface WikiPage {
  titles?: { normalized?: string };
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
}
interface WikiEntry {
  text: string;
  year: number;
  pages?: WikiPage[];
}

const MAX_EXACT = 4;

function toItem(e: WikiEntry): HistoryItem {
  const page = e.pages?.find((p) => p.thumbnail) ?? e.pages?.[0];
  return {
    text: e.text,
    year: e.year,
    thumbnail: page?.thumbnail?.source,
    url: page?.content_urls?.desktop?.page,
  };
}

/** Entries linked to more articles are, in practice, the more notable ones. */
function notability(e: WikiEntry): number {
  return e.pages?.length ?? 0;
}

function pickSection(entries: WikiEntry[], birthYear: number, kind: "events" | "births"): HistorySection {
  const exact = entries.filter((e) => e.year === birthYear).sort((a, b) => notability(b) - notability(a));
  if (exact.length > 0) {
    return {
      items: exact.slice(0, MAX_EXACT).map(toItem),
      exactYear: true,
      label: kind === "events" ? `In ${birthYear}` : `Born in ${birthYear}`,
    };
  }
  // Fallback: among the five most notable entries on this calendar date, the one closest to the birth year.
  const best = [...entries]
    .sort((a, b) => notability(b) - notability(a))
    .slice(0, 5)
    .sort((a, b) => Math.abs(a.year - birthYear) - Math.abs(b.year - birthYear))[0];
  if (!best) return { items: [], exactYear: false, label: "" };
  return {
    items: [toItem(best)],
    exactYear: false,
    label: kind === "events" ? `On this day in ${best.year}` : `Also born on this day in ${best.year}`,
  };
}

/**
 * @param month 1-12
 * @param day 1-31
 * @param birthYear the user's birth year
 */
export async function getBirthdayHistory(
  month: number,
  day: number,
  birthYear: number,
  signal?: AbortSignal,
): Promise<BirthdayHistory> {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${mm}/${dd}`, { signal });
  if (!res.ok) throw new Error(`Wikipedia request failed (${res.status})`);
  const data = (await res.json()) as { events?: WikiEntry[]; births?: WikiEntry[] };
  return {
    events: pickSection(data.events ?? [], birthYear, "events"),
    births: pickSection(data.births ?? [], birthYear, "births"),
  };
}
