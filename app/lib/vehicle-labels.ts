import type { FuelCode } from "./types";

export const FUEL_LABELS: Record<FuelCode, string> = {
  X: "Regular gasoline",
  Z: "Premium gasoline",
  E: "Ethanol (E85)",
  D: "Diesel",
  N: "Natural gas",
};

export function fuelLabel(code: string): string {
  return (FUEL_LABELS as Record<string, string>)[code] || code;
}

const TRANS_BASE: Record<string, string> = {
  A: "Automatic",
  AM: "Automated manual",
  AS: "Auto (select shift)",
  AV: "CVT",
  M: "Manual",
};

export function transLabel(t: string): string {
  if (!t) return t;
  const gears = (String(t).match(/\d+/) || [""])[0];
  const prefix = String(t).replace(/\d+/g, "");
  const base = TRANS_BASE[prefix] || prefix;
  return gears ? `${base} ${gears}-spd` : base;
}

export function carImage(cls: string): string {
  const c = String(cls).toLowerCase();
  if (c.includes("pickup")) return "/img/car-pickup.svg";
  if (c.includes("sport utility")) return "/img/car-suv.svg";
  if (c.includes("van")) return "/img/car-van.svg";
  return "/img/car-sedan.svg";
}
