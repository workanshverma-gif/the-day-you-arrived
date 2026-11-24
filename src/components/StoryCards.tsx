// Off-screen 1080x1920 cards that get snapshotted to PNG. Solid colors only (no background-clip text):
// those rasterize more reliably across browsers.
import type { ReactNode } from "react";
import type { BirthStoryData } from "@/lib/story";
import { fmtInt } from "@/lib/format";
import { MoonSvg } from "./MoonSvg";
import { makeStars } from "./Starfield";

const STARS = makeStars(90, 5, 1080, 1920);
const AMBER = "#f2b45a";
const AMBER_SOFT = "#f8d9a0";
const SILVER = "#cfd4de";
const MUTED = "#8b8d98";

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-[1920px] w-[1080px] flex-col items-center overflow-hidden bg-[#09090b] px-[96px] pb-[80px] pt-[84px] text-[#ececf1]">
      <div className="absolute left-[-120px] top-[-260px] h-[900px] w-[1320px] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(242,180,90,0.22), transparent)" }} />
      <div className="absolute bottom-[-360px] right-[-300px] h-[900px] w-[900px] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(120,130,190,0.14), transparent)" }} />
      <div className="absolute left-0 top-0 h-[2px] w-[2px]" style={{ boxShadow: STARS }} />
      <div className="relative flex h-full w-full flex-col items-center">{children}</div>
    </div>
  );
}

function Footer() {
  return (
    <p className="mt-[34px] font-serif text-[42px] italic" style={{ color: "rgba(207,212,222,0.6)" }}>
      The Day You Arrived
    </p>
  );
}

function Panel({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div className="w-full rounded-[40px] px-[48px] py-[32px]" style={{ border: "2px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.045)" }}>
      <p className="text-[24px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>
        {eyebrow}
      </p>
      {children}
    </div>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-[40px] px-[32px] py-[28px] text-center" style={{ border: "2px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.045)" }}>
      <p className="font-serif text-[88px] leading-none" style={{ color: AMBER }}>
        {value}
      </p>
      <p className="mt-[12px] text-[22px] uppercase tracking-[0.24em]" style={{ color: MUTED }}>
        {label}
      </p>
    </div>
  );
}

export function BirthStory({ data }: { data: BirthStoryData }) {
  return (
    <Frame>
      <p className="text-[30px] uppercase tracking-[0.42em]" style={{ color: AMBER }}>
        The day I arrived
      </p>
      <p className="mt-[26px] text-center font-serif text-[68px] leading-[1.1]" style={{ color: AMBER_SOFT }}>
        {data.weekday}
      </p>
      <p className="mt-[6px] text-center font-serif text-[52px]" style={{ color: SILVER }}>
        {data.dateLabel}
      </p>

      <p className="mt-[40px] font-serif text-[44px]" style={{ color: SILVER }}>
        I have been on Earth for
      </p>
      <p className="font-serif text-[215px] font-light leading-[1.02]" style={{ color: AMBER, textShadow: "0 0 80px rgba(242,180,90,0.35)" }}>
        {fmtInt(data.days)}
      </p>
      <p className="font-serif text-[52px]" style={{ color: SILVER }}>
        days
      </p>

      <div className="mt-[34px] flex flex-col items-center">
        <MoonSvg phase={data.moon.phase} size={250} />
        <p className="mt-[8px] font-serif text-[46px]">{data.moon.name}</p>
        <p className="text-[26px]" style={{ color: MUTED }}>
          {data.moon.pct}% illuminated the night I arrived
        </p>
      </div>

      <div className="flex-1" />

      <div className="flex w-full flex-col gap-[22px] pt-[28px]">
        {data.weather && (
          <Panel eyebrow={`Weather in ${data.weather.city}`}>
            <p className="mt-[10px] font-serif text-[48px] leading-[1.15]">
              {data.weather.emoji} {data.weather.label}, {data.weather.maxC}°C
            </p>
          </Panel>
        )}
        {data.song && (
          <Panel eyebrow="#1 song on my birthday">
            <p className="mt-[10px] font-serif text-[48px] leading-[1.15]">{data.song.title}</p>
            <p className="mt-[2px] text-[32px]" style={{ color: SILVER }}>
              {data.song.artist}
            </p>
          </Panel>
        )}
        <div className="flex gap-[22px]">
          <BigStat value={fmtInt(data.mondays)} label="Mondays survived" />
          <BigStat value={`#${data.rank}`} label={`Birthday rank of ${data.rankTotal}`} />
        </div>
      </div>

      <Footer />
    </Frame>
  );
}

export interface CompareStoryData {
  youName: string;
  themName: string;
  sameDay: boolean;
  gapText: string;
  totalDaysApart: number;
  sharedDays: number;
  you: { dateLabel: string; moon: { phase: number; name: string; pct: number } };
  them: { dateLabel: string; moon: { phase: number; name: string; pct: number } };
}

function MoonColumn({ name, side }: { name: string; side: CompareStoryData["you"] }) {
  return (
    <div className="flex w-[420px] flex-col items-center text-center">
      <MoonSvg phase={side.moon.phase} size={330} />
      <p className="mt-[26px] font-serif text-[56px] leading-[1.1]" style={{ color: AMBER_SOFT }}>
        {name}
      </p>
      <p className="mt-[8px] text-[30px]" style={{ color: SILVER }}>
        {side.dateLabel}
      </p>
      <p className="mt-[6px] text-[28px]" style={{ color: MUTED }}>
        {side.moon.name} · {side.moon.pct}%
      </p>
    </div>
  );
}

export function CompareStory({ data }: { data: CompareStoryData }) {
  const long = data.youName.length + data.themName.length > 22;
  return (
    <Frame>
      <p className="text-[30px] uppercase tracking-[0.42em]" style={{ color: AMBER }}>
        Two birthdays
      </p>
      <p className={`mt-[44px] text-center font-serif leading-[1.1] ${long ? "text-[84px]" : "text-[112px]"}`}>
        {data.youName} <span style={{ color: AMBER }}>&amp;</span> {data.themName}
      </p>

      {data.sameDay ? (
        <p className="mt-[56px] text-center font-serif text-[88px] leading-[1.1]" style={{ color: AMBER }}>
          Birthday twins
        </p>
      ) : (
        <>
          <p className="mt-[56px] font-serif text-[46px]" style={{ color: SILVER }}>
            Born
          </p>
          <p className="mt-[8px] text-center font-serif text-[86px] leading-[1.08]" style={{ color: AMBER, textWrap: "balance" }}>
            {data.gapText}
          </p>
          <p className="mt-[16px] font-serif text-[46px]" style={{ color: SILVER }}>
            apart, {fmtInt(data.totalDaysApart)} days in all
          </p>
        </>
      )}

      <div className="mt-[72px] flex w-full justify-between">
        <MoonColumn name={data.youName} side={data.you} />
        <MoonColumn name={data.themName} side={data.them} />
      </div>

      <div className="flex-1" />

      <div className="flex w-full flex-col items-center rounded-[44px] px-[40px] py-[52px] text-center" style={{ border: "2px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.045)" }}>
        <p className="text-[26px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>
          Days shared on Earth
        </p>
        <p className="mt-[16px] font-serif text-[170px] font-light leading-none" style={{ color: AMBER, textShadow: "0 0 70px rgba(242,180,90,0.3)" }}>
          {fmtInt(data.sharedDays)}
        </p>
      </div>

      <Footer />
    </Frame>
  );
}
