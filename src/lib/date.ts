// Calendar validation and parsing for the typed DD / MM / YYYY input.

export interface DateParts {
  d: string;
  m: string;
  y: string;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** `month` is 1-12. */
export function daysInMonth(year: number, month: number): number {
  return month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
}

const pad = (n: number, width: number) => String(n).padStart(width, "0");

export type DateCheck = { ok: true; iso: string } | { ok: false; error: string };

function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

/**
 * Checks that the typed parts are a real calendar date inside [min, max] (ISO strings; `max` may be ""
 * before the client knows today's date). Returns an ISO date or a short, friendly error.
 */
export function checkDate({ d, m, y }: DateParts, min: string, max: string): DateCheck {
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);

  if (month < 1 || month > 12) return { ok: false, error: "The month should be between 01 and 12." };
  if (day < 1) return { ok: false, error: "The day should be 01 or higher." };
  const dim = daysInMonth(year, month);
  if (day > dim) return { ok: false, error: `${MONTH_NAMES[month - 1]} ${year} only has ${dim} days.` };

  const iso = `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
  if (min && iso < min) return { ok: false, error: `We can travel back as far as ${longDate(min)}.` };
  if (max && iso > max) return { ok: false, error: "That day hasn't happened yet. Pick a date up to today." };
  return { ok: true, iso };
}

/** Understands "10/12/2005" (DD/MM/YYYY), "10-12-2005", "10.12.2005", "2005-12-10", and "10122005". */
export function parsePastedDate(text: string): DateParts | null {
  const t = text.trim();
  let match = /^(\d{4})[/.\-\s](\d{1,2})[/.\-\s](\d{1,2})$/.exec(t);
  if (match) return { y: match[1], m: pad(Number(match[2]), 2), d: pad(Number(match[3]), 2) };

  match = /^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{4})$/.exec(t);
  if (match) return { d: pad(Number(match[1]), 2), m: pad(Number(match[2]), 2), y: match[3] };

  match = /^(\d{2})(\d{2})(\d{4})$/.exec(t);
  if (match) return { d: match[1], m: match[2], y: match[3] };

  return null;
}
