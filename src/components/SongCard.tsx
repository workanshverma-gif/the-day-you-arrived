"use client";

import { Disc3, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BirthContext } from "@/lib/birthday";
import { useAsync } from "@/lib/hooks";
import { getTopSong } from "@/lib/songs";
import { Card, Note, Skeleton } from "./Card";

interface Preview {
  found: boolean;
  artworkUrl?: string;
  previewUrl?: string;
}

/** Billboard credits like "Beyonce Featuring Jay-Z": search on the lead artist only. */
const leadArtist = (artist: string) => artist.split(/\s+(?:featuring|feat\.?|with|&|x|and)\s+/i)[0];

function Vinyl({ size, spinning }: { size: string; spinning: boolean }) {
  return (
    <div
      className="relative rounded-full shadow-[0_10px_40px_-8px_rgba(0,0,0,0.9)]"
      style={{
        width: size,
        height: size,
        background:
          "repeating-radial-gradient(circle at center, #0b0b0e 0 2px, #17171c 2px 3px), conic-gradient(from 30deg, rgba(255,255,255,0.08), transparent 25%, rgba(255,255,255,0.06) 50%, transparent 75%, rgba(255,255,255,0.08))",
        backgroundBlendMode: "screen",
        animation: spinning ? "spin-slow 4s linear infinite" : undefined,
      }}
      aria-hidden
    >
      <div className="absolute left-1/2 top-1/2 flex h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-amber-soft to-amber text-[#2a1b05]">
        <span className="font-serif text-base italic">♪</span>
        <span className="absolute h-1.5 w-1.5 rounded-full bg-[#09090b]" />
      </div>
    </div>
  );
}

/** Album sleeve with the record sliding out of it. */
function Sleeve({ artworkUrl, spinning }: { artworkUrl?: string; spinning: boolean }) {
  return (
    <div className="relative h-40 w-56 shrink-0">
      <div className="absolute left-14 top-0">
        <Vinyl size="10rem" spinning={spinning} />
      </div>
      <div className="absolute left-0 top-0 z-10 h-40 w-40 overflow-hidden rounded-md bg-gradient-to-br from-[#2a2417] to-[#121216] shadow-[0_14px_40px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        {artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artworkUrl} alt="Album artwork" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-4xl italic text-amber/70">♪</div>
        )}
      </div>
    </div>
  );
}

function SongPlayer({ song, artist, chartDate }: { song: string; artist: string; chartDate?: string }) {
  const search = `${song} ${leadArtist(artist)}`;
  const preview = useAsync<Preview>(search, (signal) =>
    fetch(`/api/song-preview?q=${encodeURIComponent(search)}`, { signal }).then((r) => {
      if (!r.ok) throw new Error("preview failed");
      return r.json() as Promise<Preview>;
    }),
  );
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop the clip when the card goes away (new date, "Another day", unmount).
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const data = preview.status === "ok" && preview.data.found ? preview.data : null;

  function toggle() {
    if (!data?.previewUrl) return;
    if (!audioRef.current) {
      const audio = new Audio(data.previewUrl);
      audio.addEventListener("ended", () => setPlaying(false));
      audio.addEventListener("pause", () => setPlaying(false));
      audio.addEventListener("play", () => setPlaying(true));
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }

  const q = encodeURIComponent(`${song} ${artist}`);
  const linkClass =
    "inline-flex items-center justify-center rounded-full border border-white/12 px-4 py-2.5 text-xs text-silver transition hover:border-amber/50 hover:text-amber sm:text-sm";

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col items-center gap-6">
        <Sleeve artworkUrl={data?.artworkUrl} spinning={playing} />
        <div className="min-w-0 text-center">
          <p className="font-serif text-2xl leading-tight">{song}</p>
          <p className="mt-1.5 text-silver">{artist}</p>
          <p className="mt-2 text-xs text-muted">Billboard Hot 100 · week of {chartDate}</p>
        </div>
      </div>

      {preview.status === "loading" && <Skeleton className="h-[46px] w-full rounded-full" aria-label="Looking for a preview" />}
      {data?.previewUrl && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-amber-soft to-amber px-5 py-3 text-sm font-medium text-[#1a1206] shadow-[0_0_36px_-10px_rgba(242,180,90,0.8)] transition hover:brightness-105"
        >
          {playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
          {playing ? "Pause preview" : "Play 30s preview"}
        </button>
      )}

      <div className="flex flex-col gap-2.5">
        <a className={linkClass} href={`https://open.spotify.com/search/${q}`} target="_blank" rel="noopener noreferrer">
          Listen on Spotify
        </a>
        <a className={linkClass} href={`https://music.youtube.com/search?q=${q}`} target="_blank" rel="noopener noreferrer">
          YouTube Music
        </a>
      </div>
    </div>
  );
}

export function SongCard({ ctx }: { ctx: BirthContext }) {
  const state = useAsync(ctx.iso, () => getTopSong(ctx.iso));
  return (
    <Card eyebrow="#1 song on your birthday" icon={Disc3} className="md:col-span-2 lg:col-span-4">
      {state.status === "loading" && <Skeleton className="h-52 w-full" />}
      {state.status === "error" && <Note>Couldn&apos;t load the charts.</Note>}
      {state.status === "ok" && state.data.status === "ok" && (
        <SongPlayer song={state.data.song!} artist={state.data.artist!} chartDate={state.data.chartDate} />
      )}
      {state.status === "ok" && state.data.status !== "ok" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <Sleeve spinning={false} />
          <Note>
            {state.data.status === "before-chart"
              ? "The Billboard Hot 100 launched in August 1958, so there's no official #1 for your day. The music was playing, just not charted."
              : "We couldn't match a chart week to your date."}
          </Note>
        </div>
      )}
    </Card>
  );
}
