import { parseBirthDate, type Currency } from "./calculations";

export interface BirthContext {
  iso: string;
  birth: Date;
  year: number;
  month: number;
  day: number;
  mode: Currency;
}

export function makeContext(iso: string, mode: Currency): BirthContext {
  const birth = parseBirthDate(iso);
  return { iso, birth, year: birth.getFullYear(), month: birth.getMonth() + 1, day: birth.getDate(), mode };
}

export const MIN_DATE = "1950-01-01";
