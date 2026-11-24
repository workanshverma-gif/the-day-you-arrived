"use client";

import { CloudSun, Moon as MoonIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { BirthContext } from "@/lib/birthday";
import { getMoonAtBirth } from "@/lib/calculations";
import { cToF } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { getBirthWeather, type GeoResult } from "@/lib/weather";
import { Card, Note, Skeleton } from "./Card";
import { CityInput } from "./CityInput";
import { MoonSvg } from "./MoonSvg";

export function MoonCard({ ctx }: { ctx: BirthContext }) {
  const moon = useMemo(() => getMoonAtBirth(ctx.birth), [ctx.birth]);
  return (
    <Card eyebrow="The moon that night" icon={MoonIcon} className="md:col-span-1 lg:col-span-4">
      <div className="flex flex-col items-center gap-5 text-center">
        <MoonSvg phase={moon.phase} size={176} />
        <div>
          <p className="font-serif text-3xl leading-tight">{moon.phaseName}</p>
          <p className="mt-1 text-sm text-silver">
            <span className="tabular">{moon.illuminationPct}%</span> illuminated
          </p>
        </div>
      </div>
    </Card>
  );
}

interface WeatherProps {
  ctx: BirthContext;
  geo: GeoResult | null;
  onGeo: (g: GeoResult | null) => void;
}

export function WeatherCard({ ctx, geo, onGeo }: WeatherProps) {
  const [text, setText] = useState("");
  const key = geo ? `${geo.latitude},${geo.longitude},${ctx.iso}` : null;
  const state = useAsync(key, (signal) => getBirthWeather(geo!.latitude, geo!.longitude, ctx.iso, signal));

  return (
    <Card eyebrow="Weather that day" icon={CloudSun} className="md:col-span-1 lg:col-span-4">
      {!geo && (
        <div className="space-y-4">
          <p className="font-serif text-2xl leading-snug text-silver">Was it raining? Sunny? Snowing?</p>
          <Note>Add the city you were born in and we&apos;ll look up the weather on your day.</Note>
          <CityInput compact value={text} onValueChange={setText} selected={geo} onSelect={onGeo} placeholder="Add your birth city" />
        </div>
      )}
      {geo && state.status === "loading" && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading weather">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <Skeleton className="h-9 w-2/3" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      {geo && state.status === "error" && <Note>The weather archive couldn&apos;t be reached. Try again in a moment.</Note>}
      {geo && state.status === "ok" && (
        <div className="space-y-4">
          {state.data.status === "ok" ? (
            <>
              <div className="flex items-center gap-4">
                <span className="text-5xl" aria-hidden>{state.data.emoji}</span>
                <p className="font-serif text-3xl leading-tight">{state.data.label}</p>
              </div>
              <p className="text-silver">
                <span className="tabular text-2xl text-foreground">{Math.round(state.data.tempMaxC ?? 0)}°C</span>
                {ctx.mode === "USD" && <span className="text-muted"> ({cToF(state.data.tempMaxC ?? 0)}°F)</span>}
                <span className="text-muted"> high · </span>
                <span className="tabular">{Math.round(state.data.tempMinC ?? 0)}°C</span>
                <span className="text-muted"> low</span>
              </p>
              {!!state.data.precipitationMm && <Note>{state.data.precipitationMm.toFixed(1)} mm of precipitation fell.</Note>}
            </>
          ) : (
            <Note>{state.data.message}</Note>
          )}
          <button type="button" onClick={() => { onGeo(null); setText(""); }} className="text-left text-xs text-muted underline-offset-4 transition hover:text-amber hover:underline">
            {geo.label} · change city
          </button>
        </div>
      )}
    </Card>
  );
}

