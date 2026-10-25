import type { Co2BandKey, VehicleRecord } from "./types";

export function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function annualCost(l100: number | null, km: number | null, price: number | null): number | null {
  if (l100 == null || km == null || price == null) return null;
  return Math.round(((l100 * km) / 100) * price * 100) / 100;
}

export function annualCo2Tonnes(gkm: number | null, km: number | null): number | null {
  if (gkm == null || km == null) return null;
  return Math.round((gkm * km) / 1e6 * 1000) / 1000;
}

export function co2Band(gkm: number): { key: Co2BandKey; label: string } {
  if (gkm < 100) return { key: "low", label: "Low" };
  if (gkm <= 165) return { key: "moderate", label: "Moderate" };
  if (gkm <= 225) return { key: "elevated", label: "Elevated" };
  return { key: "severe", label: "Severe" };
}

export function fmt(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return Number(n).toLocaleString("en-CA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtSigned(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const s = fmt(Math.abs(n), digits);
  return n > 0 ? "+" + s : n < 0 ? "−" + s : s;
}

export function formatMoney(n: number | null): string {
  return n === null || !Number.isFinite(n) ? "—" : "$" + fmt(n);
}

export function hashParam(hash: string, key: string): string | null {
  const parts = String(hash || "").replace(/^#/, "").split("&");
  for (const part of parts) {
    const kv = part.split("=");
    if (kv[0] === key && kv.length > 1) {
      try {
        return decodeURIComponent(kv.slice(1).join("="));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function pickPreset<T extends { id: string }>(list: T[], hash: string): T {
  const id = hashParam(hash, "preset");
  return list.find((p) => p.id === id) ?? list[0];
}

export function compareDeltas(
  a: VehicleRecord,
  b: VehicleRecord,
  km: number | null,
  price: number | null,
  years = 5,
) {
  const costA = annualCost(a.comb, km, price);
  const costB = annualCost(b.comb, km, price);
  const costDiff = costA == null || costB == null ? null : costA - costB;
  const avoided = km == null ? null : Math.round(((b.co2 - a.co2) * km) / 1e6 * 1000) / 1000;
  return {
    co2Diff: a.co2 - b.co2,
    co2Pct: Math.round(((a.co2 - b.co2) / b.co2) * 1000) / 10,
    fuelDiff: a.comb - b.comb,
    fuelPct: Math.round(((a.comb - b.comb) / b.comb) * 1000) / 10,
    costDiff,
    costDiffTotal: costDiff == null ? null : costDiff * years,
    co2AvoidedT: avoided,
    co2AvoidedTotalT: avoided == null ? null : avoided * years,
  };
}

export function cumulative(
  rec: VehicleRecord,
  km: number | null,
  price: number | null,
  years = 5,
): { year: number; km: number; cost: number; co2T: number }[] {
  const cost = annualCost(rec.comb, km, price);
  const co2 = annualCo2Tonnes(rec.co2, km);
  if (km == null || cost == null || co2 == null) return [];
  const out = [];
  for (let y = 1; y <= years; y++) out.push({ year: y, km: km * y, cost: cost * y, co2T: co2 * y });
  return out;
}

export function vehicleName(r: Pick<VehicleRecord, "year" | "make" | "model">): string {
  return `${r.year} ${r.make} ${r.model}`;
}
