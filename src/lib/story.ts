// Gathers everything the Story cards show. Local math plus (optionally) the weather lookup; the song is a local file.
import type { BirthContext } from "./birthday";
import { getLifeNumbers, getLifeStats, getMoonAtBirth } from "./calculations";
import { getBirthdayRarity } from "./features";
import { fmtDate } from "./format";
import { getTopSong } from "./songs";
import { getBirthWeather, type GeoResult } from "./weather";

export interface BirthStoryData {
  weekday: string;
  dateLabel: string;
  days: number;
  moon: { phase: number; name: string; pct: number };
  weather: { emoji: string; label: string; maxC: number; minC: number; city: string } | null;
  song: { title: string; artist: string } | null;
  mondays: number;
  rank: number;
  rankTotal: number;
}

export async function buildBirthStory(ctx: BirthContext, geo: GeoResult | null): Promise<BirthStoryData> {
  const [song, weather] = await Promise.all([
    getTopSong(ctx.iso).catch(() => null),
    geo ? getBirthWeather(geo.latitude, geo.longitude, ctx.iso).catch(() => null) : Promise.resolve(null),
  ]);
  const moon = getMoonAtBirth(ctx.birth);
  const rarity = getBirthdayRarity(ctx.month, ctx.day);
  return {
    weekday: ctx.birth.toLocaleDateString("en-US", { weekday: "long" }),
    dateLabel: fmtDate(ctx.birth),
    days: getLifeStats(ctx.birth).daysLived,
    moon: { phase: moon.phase, name: moon.phaseName, pct: moon.illuminationPct },
    weather:
      geo && weather?.status === "ok"
        ? { emoji: weather.emoji ?? "", label: weather.label ?? "", maxC: Math.round(weather.tempMaxC ?? 0), minC: Math.round(weather.tempMinC ?? 0), city: geo.name }
        : null,
    song: song?.status === "ok" ? { title: song.song ?? "", artist: song.artist ?? "" } : null,
    mondays: getLifeNumbers(ctx.birth).mondays,
    rank: rarity.rank,
    rankTotal: rarity.total,
  };
}
