import { useId } from "react";

/** phase: 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter (SunCalc convention). */
export function MoonSvg({ phase, size = 200 }: { phase: number; size?: number }) {
  const id = useId();
  const r = 88;
  const c = 100;
  const k = Math.cos(2 * Math.PI * phase);
  const waxing = phase < 0.5;
  const rx = Math.abs(k) * r;
  const limbSweep = waxing ? 1 : 0;
  const termSweep = waxing ? (k > 0 ? 0 : 1) : k > 0 ? 1 : 0;
  const lit = `M${c} ${c - r} A${r} ${r} 0 0 ${limbSweep} ${c} ${c + r} A${rx.toFixed(2)} ${r} 0 0 ${termSweep} ${c} ${c - r} Z`;

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Moon phase on your birth date">
      <defs>
        <radialGradient id={`${id}-surf`} cx="40%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#f4f5f8" />
          <stop offset="60%" stopColor="#c9ced9" />
          <stop offset="100%" stopColor="#8d93a3" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={lit} />
        </clipPath>
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <path d={lit} fill="#cfd4de" opacity="0.4" filter={`url(#${id}-glow)`} />
      <circle cx={c} cy={c} r={r} fill="#14141a" stroke="rgba(255,255,255,0.1)" />
      <path d={lit} fill={`url(#${id}-surf)`} />
      <g clipPath={`url(#${id}-clip)`} fill="#6b7080" opacity="0.28">
        <circle cx="75" cy="78" r="14" />
        <circle cx="118" cy="62" r="8" />
        <circle cx="128" cy="110" r="17" />
        <circle cx="90" cy="130" r="9" />
        <circle cx="60" cy="112" r="6" />
        <circle cx="105" cy="92" r="5" />
      </g>
    </svg>
  );
}
