export type FuelCode = "X" | "Z" | "E" | "D" | "N";

export interface VehicleRecord {
  year: number;
  make: string;
  model: string;
  cls: string;
  engine: number;
  cyl: number;
  trans: string;
  fuel: FuelCode;
  city: number;
  hwy: number;
  comb: number;
  co2: number;
}

export type VehicleSpec = Pick<
  VehicleRecord,
  "year" | "make" | "cls" | "engine" | "cyl" | "trans" | "fuel"
>;

export interface Preset {
  id: string;
  label: string;
  icon?: string;
  record: VehicleRecord;
}

export interface Histogram {
  edges: number[];
  counts: number[];
}

export interface GroupStat {
  key: string | number;
  n: number;
  co2: number;
  fuel?: number;
  label?: string;
  share?: number;
  lowSample?: boolean;
}

export interface Stats {
  generated: string;
  source: string;
  kpis: {
    records: number;
    years: { min: number; max: number; count: number };
    makes: number;
    models: number;
    classes: number;
    transmissions: number;
    fuels: number;
    co2: { mean: number; median: number; sd: number; min: number; max: number };
    fuel: { mean: number; median: number; sd: number; min: number; max: number };
  };
  quality: {
    duplicates: number;
    missingCore: number;
    co2RatingMissing: number;
    smogRatingMissing: number;
  };
  domains: {
    makes: string[];
    classes: string[];
    transmissions: string[];
    cylinders: number[];
    fuels: { code: FuelCode; label: string }[];
    engine: { min: number; max: number };
    years: number[];
  };
  hist: { co2: Histogram; fuel: Histogram };
  yearly: { year: number; n: number; co2: number; engine: number }[];
  byClass: GroupStat[];
  byFuel: GroupStat[];
  byCylinders: GroupStat[];
  corr: { labels: string[]; matrix: number[][] };
  fuelVsCo2: { overall: number; byFuel: Record<string, number> };
  scatter: { r: number; slope: number; intercept: number; points: [number, number][] };
  rareMakes: { key: string; n: number }[];
  presets: { predict: Preset[]; compare: unknown[] };
}

export interface Prediction {
  co2: number;
  comb: number;
  city: number;
  hwy: number;
  label: string;
  source: "preset" | "model";
}

export interface CsvRow {
  "Model year": number | null;
  Make: string;
  Model: string;
  "Vehicle class": string;
  "Engine size (L)": number | null;
  Cylinders: number | null;
  Transmission: string;
  "Fuel type": string;
  "City (L/100 km)": number | null;
  "Highway (L/100 km)": number | null;
  "Combined (L/100 km)": number | null;
  "Combined (mpg)": number | null;
  "CO2 emissions (g/km)": number | null;
  "CO2 rating": number | null;
  "Smog rating": number | null;
}

export type Co2BandKey = "low" | "moderate" | "elevated" | "severe";
