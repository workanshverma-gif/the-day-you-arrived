// Deterministic (seeded) star layers so server and client markup are identical.
export function makeStars(count: number, seed: number, w = 2400, h = 1600): string {
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return Array.from({ length: count }, () => {
    const a = (0.25 + rnd() * 0.6).toFixed(2);
    return `${Math.floor(rnd() * w)}px ${Math.floor(rnd() * h)}px 0 rgba(255,255,255,${a})`;
  }).join(",");
}

const SMALL = makeStars(140, 7);
const MEDIUM = makeStars(50, 21);
const BRIGHT = makeStars(14, 99);

export function Starfield() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute left-1/2 top-[-20%] h-[70vh] w-[90vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(242,180,90,0.10),transparent)]" />
      <div className="absolute bottom-[-30%] right-[-10%] h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(120,130,190,0.08),transparent)]" />
      <div className="absolute left-0 top-0 h-px w-px" style={{ boxShadow: SMALL }} />
      <div className="absolute left-0 top-0 h-[2px] w-[2px] rounded-full" style={{ boxShadow: MEDIUM, animation: "twinkle 5s ease-in-out infinite" }} />
      <div className="absolute left-0 top-0 h-[3px] w-[3px] rounded-full" style={{ boxShadow: BRIGHT, animation: "twinkle 3.5s ease-in-out infinite 1s" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#09090b_100%)]" />
    </div>
  );
}
