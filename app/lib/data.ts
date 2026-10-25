import statsJson from "../data/stats.json";
import type { CsvRow, Prediction, Stats, VehicleRecord, VehicleSpec } from "./types";
import { vehicleName } from "./carvet";

export const stats = statsJson as unknown as Stats;

export const CSV_URL = "https://sait-r2.mss.io/carvet/mockup/combined-output.csv";

export async function loadCars(): Promise<VehicleRecord[]> {
  const mod = await import("../data/cars.json");
  return mod.default as VehicleRecord[];
}

const NUMERIC_COLUMNS = new Set([
  "Model year",
  "Engine size (L)",
  "Cylinders",
  "City (L/100 km)",
  "Highway (L/100 km)",
  "Combined (L/100 km)",
  "Combined (mpg)",
  "CO2 emissions (g/km)",
  "CO2 rating",
  "Smog rating",
]);

function coerceRow(raw: Record<string, unknown>): CsvRow {
  const out: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(raw)) {
    const text = value === null || value === undefined ? "" : String(value).trim();
    if (NUMERIC_COLUMNS.has(key)) {
      const n = text === "" ? NaN : Number(text);
      out[key] = Number.isFinite(n) ? n : null;
    } else {
      out[key] = text;
    }
  }
  return out as unknown as CsvRow;
}

export async function loadCsv(url: string = CSV_URL): Promise<CsvRow[]> {
  // Loaded on demand so PapaParse stays out of the shared chunk every page preloads.
  const { default: Papa } = await import("papaparse");
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length && !results.data.length) {
          reject(new Error(`Failed to parse CSV: ${results.errors[0]?.message ?? "unknown error"}`));
          return;
        }
        resolve(results.data.map(coerceRow));
      },
      // Network/CORS failures arrive as a ProgressEvent, not an Error.
      error: (err) => reject(err instanceof Error ? err : new Error(`Network error loading ${url}`)),
    });
  });
}

export function matchesSpec(r: VehicleRecord, spec: VehicleSpec): boolean {
  return (
    r.year === spec.year &&
    r.make === spec.make &&
    r.cls === spec.cls &&
    Math.round(r.engine * 10) === Math.round(spec.engine * 10) &&
    r.cyl === spec.cyl &&
    r.trans === spec.trans &&
    r.fuel === spec.fuel
  );
}

export function predict(spec: VehicleSpec): Promise<Prediction | null> {
  // Phase 2: replace body with a call to the prediction API; keep the signature.
  const hit = stats.presets.predict.map((p) => p.record).find((r) => matchesSpec(r, spec));
  return Promise.resolve(
    hit
      ? { co2: hit.co2, comb: hit.comb, city: hit.city, hwy: hit.hwy, label: vehicleName(hit), source: "preset" }
      : null,
  );
}
