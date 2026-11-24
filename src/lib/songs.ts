export interface SongMatch {
  status: "ok" | "before-chart" | "unknown";
  song?: string;
  artist?: string;
  /** Chart date of the matching week. */
  chartDate?: string;
}

interface ChartRow {
  date: string;
  song: string;
  artist: string;
}

export const CHART_START = "1958-08-04";

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** The Hot 100 #1 for the chart week containing `iso` (loaded lazily; the file is ~260 KB). */
export async function getTopSong(iso: string): Promise<SongMatch> {
  if (iso < CHART_START) return { status: "before-chart" };
  const rows = (await import("@/data/top-songs.json")).default as ChartRow[];
  // First chart dated on or after the birthday (charts are dated at the end of their week).
  let lo = 0;
  let hi = rows.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].date < iso) lo = mid + 1;
    else hi = mid;
  }
  const row = rows[lo];
  if (!row || row.date > addDays(iso, 6)) return { status: "unknown" };
  return { status: "ok", song: row.song, artist: row.artist, chartDate: row.date };
}
