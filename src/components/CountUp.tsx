"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";
import { fmtInt } from "@/lib/format";

export function CountUp({ to, duration = 1.8 }: { to: number; duration?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => controls.stop();
  }, [to, duration]);
  return <span className="tabular">{fmtInt(v)}</span>;
}
