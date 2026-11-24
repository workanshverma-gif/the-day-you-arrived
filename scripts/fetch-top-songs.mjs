// Fetches the Billboard Hot 100 archive and keeps only the weekly #1 song.
import { writeFile, unlink, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const URL_ALL = "https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/all.json";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src", "data", "top-songs.json");
const raw = path.join(os.tmpdir(), "billboard-all.json");

const res = await fetch(URL_ALL);
if (!res.ok) throw new Error(`Download failed: ${res.status}`);
await writeFile(raw, Buffer.from(await res.arrayBuffer()));
try {
  const { readFile } = await import("node:fs/promises");
  const charts = JSON.parse(await readFile(raw, "utf8"));
  const songs = [];
  for (const chart of charts) {
    if (!chart.date || chart.date < "1958-01-01") continue;
    const top = chart.data?.find((s) => s.this_week === 1);
    if (top) songs.push({ date: chart.date, song: top.song, artist: top.artist });
  }
  songs.sort((a, b) => a.date.localeCompare(b.date));
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(songs));
  console.log(`Wrote ${songs.length} weekly #1s (${songs[0].date} → ${songs.at(-1).date})`);
} finally {
  await unlink(raw).catch(() => {});
}
