import type { NextRequest } from "next/server";

// Proxies the free iTunes Search API so the browser never hits CORS and no key is needed.
interface ITunesTrack {
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
}

const FEAT_SUFFIX = /\s*[(\[]\s*(?:feat|ft|with)\b.*?[)\]]/i;

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 200) {
    return Response.json({ error: "Provide ?q=song artist (2-200 chars)." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=10`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (!res.ok) throw new Error(`iTunes ${res.status}`);
    const { results = [] } = (await res.json()) as { results?: ITunesTrack[] };

    // Accept a hit only if it has a preview and BOTH the title and the artist match the query,
    // so a cover version by someone else is never played in place of the original.
    const wanted = norm(q);
    const wantedWords = new Set(wanted.split(" "));
    const hit = results.find((t) => {
      // "Song (feat. Someone)" is still the same song; remixes and other parentheticals are not.
      const title = norm((t.trackName ?? "").replace(FEAT_SUFFIX, ""));
      const words = norm(t.artistName ?? "").split(" ").filter(Boolean);
      const significant = words.filter((w) => w.length >= 3);
      const artistOk = (significant.length ? significant : words).some((w) => wantedWords.has(w));
      return t.previewUrl && title.length > 1 && wanted.includes(title) && artistOk;
    });

    const body = hit
      ? {
          found: true,
          title: hit.trackName,
          artist: hit.artistName,
          artworkUrl: hit.artworkUrl100?.replace("100x100bb", "600x600bb"),
          previewUrl: hit.previewUrl,
        }
      : { found: false };
    return Response.json(body, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch {
    // Previews are a bonus: report "not found" rather than an error the UI would have to handle.
    return Response.json({ found: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
