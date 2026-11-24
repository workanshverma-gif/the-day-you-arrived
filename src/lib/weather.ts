// Open-Meteo geocoding + historical weather (free, no API key).

export interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
  label: string;
}

export type WeatherStatus = "ok" | "too-recent" | "too-old" | "unavailable";

export interface BirthWeather {
  status: WeatherStatus;
  date: string;
  label?: string;
  emoji?: string;
  weatherCode?: number;
  tempMaxC?: number;
  tempMinC?: number;
  precipitationMm?: number;
  /** Human-readable explanation when status !== "ok". */
  message?: string;
}

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
/** The archive trails real time by a few days; treat anything newer as unavailable. */
const ARCHIVE_LAG_DAYS = 5;
/** ERA5 reanalysis, which backs the archive, starts in 1940. */
const ARCHIVE_START = "1940-01-01";

const WMO_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: "Clear Skies", emoji: "☀️" },
  1: { label: "Mostly Clear", emoji: "🌤️" },
  2: { label: "Partly Cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy Day", emoji: "🌫️" },
  48: { label: "Frosty Fog", emoji: "🌫️" },
  51: { label: "Light Drizzle", emoji: "🌦️" },
  53: { label: "Drizzly Day", emoji: "🌦️" },
  55: { label: "Heavy Drizzle", emoji: "🌧️" },
  56: { label: "Freezing Drizzle", emoji: "🌧️" },
  57: { label: "Heavy Freezing Drizzle", emoji: "🌧️" },
  61: { label: "Light Rain", emoji: "🌦️" },
  63: { label: "Rainy Day", emoji: "🌧️" },
  65: { label: "Heavy Rain", emoji: "🌧️" },
  66: { label: "Freezing Rain", emoji: "🌧️" },
  67: { label: "Heavy Freezing Rain", emoji: "🌧️" },
  71: { label: "Light Snowfall", emoji: "🌨️" },
  73: { label: "Snowfall", emoji: "❄️" },
  75: { label: "Heavy Snowfall", emoji: "❄️" },
  77: { label: "Snow Grains", emoji: "❄️" },
  80: { label: "Rain Showers", emoji: "🌦️" },
  81: { label: "Heavy Showers", emoji: "🌧️" },
  82: { label: "Violent Downpour", emoji: "⛈️" },
  85: { label: "Snow Showers", emoji: "🌨️" },
  86: { label: "Heavy Snow Showers", emoji: "❄️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  96: { label: "Thunderstorm with Hail", emoji: "⛈️" },
  99: { label: "Severe Thunderstorm with Hail", emoji: "⛈️" },
};

export function describeWeatherCode(code: number): { label: string; emoji: string } {
  return WMO_CODES[code] ?? { label: "Mysterious Skies", emoji: "🌍" };
}

function isoDaysAgo(days: number, now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days));
  return d.toISOString().slice(0, 10);
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const name = query.trim();
  if (name.length < 2) return [];
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(name)}&count=5`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = (await res.json()) as {
    results?: Array<{
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
      admin1?: string;
      timezone?: string;
    }>;
  };
  return (data.results ?? []).map((r) => ({
    ...r,
    label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
  }));
}

/**
 * Weather on a given day (YYYY-MM-DD) at a location. Never throws: failures
 * come back as a status so the UI card can still render something graceful.
 */
export async function getBirthWeather(
  latitude: number,
  longitude: number,
  date: string,
  signal?: AbortSignal,
): Promise<BirthWeather> {
  if (date < ARCHIVE_START) {
    return {
      status: "too-old",
      date,
      message: "Weather records only reach back to 1940, so the sky that day is a mystery.",
    };
  }
  if (date > isoDaysAgo(ARCHIVE_LAG_DAYS)) {
    return {
      status: "too-recent",
      date,
      message: "Weather data takes a few days to arrive. Check back soon for the forecast of your first days.",
    };
  }

  const url =
    `${ARCHIVE_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&start_date=${date}&end_date=${date}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Archive request failed (${res.status})`);
    const data = (await res.json()) as {
      daily?: {
        weather_code?: Array<number | null>;
        temperature_2m_max?: Array<number | null>;
        temperature_2m_min?: Array<number | null>;
        precipitation_sum?: Array<number | null>;
      };
    };
    const code = data.daily?.weather_code?.[0];
    if (code == null) {
      return { status: "unavailable", date, message: "No weather record exists for that place and day." };
    }
    const { label, emoji } = describeWeatherCode(code);
    return {
      status: "ok",
      date,
      label,
      emoji,
      weatherCode: code,
      tempMaxC: data.daily?.temperature_2m_max?.[0] ?? undefined,
      tempMinC: data.daily?.temperature_2m_min?.[0] ?? undefined,
      precipitationMm: data.daily?.precipitation_sum?.[0] ?? undefined,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return { status: "unavailable", date, message: "The weather archive couldn't be reached right now." };
  }
}
