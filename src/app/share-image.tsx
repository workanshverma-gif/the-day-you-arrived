// Shared artwork for the OpenGraph and Twitter cards (1200x630). Satori only supports flexbox layouts.
export const SHARE_SIZE = { width: 1200, height: 630 };
export const SHARE_ALT = "The Day You Arrived: the moon, weather, #1 song and world on the day you were born";

const BG = "#09090b";

export function ShareImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 90px 0 96px",
        background: `radial-gradient(circle at 25% 0%, rgba(242,180,90,0.28), ${BG} 55%)`,
        color: "#ececf1",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 650 }}>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 8, color: "#f2b45a", textTransform: "uppercase" }}>
          Free · No sign-up
        </div>
        <div style={{ display: "flex", fontSize: 92, lineHeight: 1.02, marginTop: 26, color: "#f8d9a0", fontWeight: 700 }}>
          The Day You Arrived
        </div>
        <div style={{ display: "flex", fontSize: 38, lineHeight: 1.3, marginTop: 28, color: "#cfd4de" }}>
          What did the world look like the day you were born?
        </div>
        <div style={{ display: "flex", fontSize: 24, marginTop: 40, color: "#8b8d98" }}>
          Moon · Weather · #1 Song · Prices then vs. now
        </div>
      </div>

      {/* A waning gibbous moon: a dark disc slides over the right edge, clipped to the moon's own circle. */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: 340,
          height: 340,
          borderRadius: 170,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f4f5f8, #8d93a3)',
          boxShadow: '0 0 110px rgba(207,212,222,0.3)',
        }}
      >
        <div style={{ position: 'absolute', left: 78, top: 96, width: 58, height: 58, borderRadius: 29, background: 'rgba(107,112,128,0.35)' }} />
        <div style={{ position: 'absolute', left: 150, top: 205, width: 38, height: 38, borderRadius: 19, background: 'rgba(107,112,128,0.3)' }} />
        <div style={{ position: 'absolute', left: 215, top: -20, width: 340, height: 380, borderRadius: 190, background: '#14141a' }} />
      </div>
    </div>
  );
}
