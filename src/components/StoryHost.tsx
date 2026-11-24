"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export const STORY_W = 1080;
export const STORY_H = 1920;

export interface StoryJob {
  node: ReactNode;
  filename: string;
}

/**
 * Hands the finished PNG to the person. Desktop gets a normal download. Touch devices get the native
 * share sheet (which has "Save Image" and Instagram), because in-app browsers often ignore downloads.
 */
async function deliver(dataUrl: string, filename: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: "image/png" });
  const touch = window.matchMedia("(pointer: coarse)").matches;

  if (touch && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return; // they closed the sheet
    }
  }

  const url = URL.createObjectURL(blob);
  if (touch) {
    // No share sheet: open the image so it can be long-pressed and saved.
    window.open(url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Renders `children` off-screen at 1080x1920, snapshots it to a PNG, delivers it, then reports back. */
function StoryHost({ job, onDone, onError }: { job: StoryJob; onDone: () => void; onError: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onDone, onError });
  useEffect(() => {
    callbacks.current = { onDone, onError };
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await document.fonts.ready;
        // Two frames so layout and the SVG moons are fully painted before the snapshot.
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const { toPng } = await import("html-to-image");
        const options = { width: STORY_W, height: STORY_H, pixelRatio: 1, cacheBust: true, backgroundColor: "#09090b" };
        const node = stageRef.current;
        if (!node) throw new Error("stage missing");
        // The first pass warms font/image caches (Safari renders blanks without it); the second is the keeper.
        await toPng(node, options);
        const dataUrl = await toPng(node, options);
        if (cancelled) return;
        await deliver(dataUrl, job.filename);
        if (!cancelled) callbacks.current.onDone();
      } catch {
        if (!cancelled) callbacks.current.onError();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [job.filename]);

  return (
    <div aria-hidden style={{ position: "fixed", left: -20000, top: 0, width: STORY_W, height: STORY_H, pointerEvents: "none" }}>
      <div ref={stageRef} style={{ width: STORY_W, height: STORY_H }}>
        {job.node}
      </div>
    </div>
  );
}

export type ExportState = "idle" | "working" | "error";

/** `start(build)` prepares the story, mounts the hidden stage, and exports. Render `host` somewhere in the tree. */
export function useStoryExport() {
  const [job, setJob] = useState<StoryJob | null>(null);
  const [state, setState] = useState<ExportState>("idle");

  const start = useCallback(async (build: () => Promise<StoryJob>) => {
    setState("working");
    try {
      setJob(await build());
    } catch {
      setState("error");
    }
  }, []);

  const host = job ? (
    <StoryHost
      job={job}
      onDone={() => {
        setJob(null);
        setState("idle");
      }}
      onError={() => {
        setJob(null);
        setState("error");
      }}
    />
  ) : null;

  return { state, start, host };
}
