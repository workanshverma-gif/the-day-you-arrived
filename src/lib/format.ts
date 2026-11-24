import type { Currency } from "./calculations";

export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export function fmtMoney(value: number, currency: Currency): string {
  const digits = value < 100 ? 2 : 0;
  return currency === "USD"
    ? value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: value < 100 ? 2 : 0, maximumFractionDigits: digits })
    : value.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: value < 100 ? 1 : 0 });
}

/** 29_300_000_000 -> "29.3 billion"; smaller values get "million". */
export function fmtBig(n: number, digits = 1): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(digits)} trillion`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(digits)} billion`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(digits)} million`;
  return fmtInt(n);
}

export function fmtDate(d: Date, withTime = false): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export const cToF = (c: number) => Math.round((c * 9) / 5 + 32);
