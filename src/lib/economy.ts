import economyData from "@/data/economy.json";

export interface EconomyYear {
  global: {
    housePrice: number;
    gasGallon: number;
    movieTicket: number;
    goldPerOz: number;
    topMovie: string;
    techEra: string;
    /** Short nostalgic "in everyone's pocket" line. */
    pocket: string;
    sp500: number;
    aapl: number | null;
    btc: number | null;
  };
  india: {
    goldPer10g: number;
    petrolPerLitre: number;
    movieTicket: number;
    sensex: number | null;
    /** Rupees per US dollar, annual average. */
    usdInr: number;
    bollywood: { movie: string; song: string };
  };
  estimated?: boolean;
}

const data = economyData as unknown as Record<string, EconomyYear>;
const years = Object.keys(data).map(Number);
export const ECON_FIRST = Math.min(...years);
export const ECON_LAST = Math.max(...years);

export function getEconomy(year: number): EconomyYear | null {
  return data[String(year)] ?? null;
}
