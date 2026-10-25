/* oxlint-disable typescript/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadCars, loadCsv, matchesSpec, predict, stats } from "./data";

vi.mock("papaparse", () => ({ default: { parse: vi.fn() } }));

const parse = vi.mocked((await import("papaparse")).default.parse) as unknown as ReturnType<typeof vi.fn>;
const rav4 = stats.presets.predict.find((p) => p.id === "rav4")!.record;
const spec = { year: rav4.year, make: rav4.make, cls: rav4.cls, engine: rav4.engine, cyl: rav4.cyl, trans: rav4.trans, fuel: rav4.fuel };

beforeEach(() => {
  parse.mockReset();
});

describe("predict / matchesSpec", () => {
  it("returns the preset prediction", async () => {
    await expect(predict(spec)).resolves.toEqual({
      co2: 199, comb: 8.5, city: 9.5, hwy: 7.2, label: "2024 Toyota RAV4 AWD", source: "preset",
    });
  });
  it("returns null when nothing matches", async () => {
    await expect(predict({ ...spec, engine: 2.6 })).resolves.toBeNull();
  });
  it("compares engine at 0.1 L", () => {
    expect(matchesSpec(rav4, { ...spec, engine: 2.50000001 })).toBe(true);
  });
});

describe("loadCsv", () => {
  it("rejects when the download fails", async () => {
    parse.mockImplementation((_url: string, cfg: any) => cfg.error(new Error("Failed to fetch")));
    await expect(loadCsv()).rejects.toThrow(/Failed to fetch/);
  });
  it("maps non-Error failures to a readable message", async () => {
    parse.mockImplementation((_url: string, cfg: any) => cfg.error({ type: "error" }));
    await expect(loadCsv()).rejects.toThrow(/Network error loading/);
  });
  it("coerces and trims rows", async () => {
    parse.mockImplementation((_url: string, cfg: any) =>
      cfg.complete({
        data: [{ "Model year": "2024", Make: " Toyota ", "CO2 emissions (g/km)": "", "Combined (L/100 km)": "-1.5" }],
        errors: [],
      }),
    );
    const rows = await loadCsv();
    expect(rows).toHaveLength(1);
    expect(rows[0]["Model year"]).toBe(2024);
    expect(rows[0].Make).toBe("Toyota");
    expect(rows[0]["CO2 emissions (g/km)"]).toBeNull();
    expect(rows[0]["Combined (L/100 km)"]).toBe(-1.5);
  });
  it("rejects on parse errors with no data", async () => {
    parse.mockImplementation((_url: string, cfg: any) => cfg.complete({ data: [], errors: [{ message: "bad" }] }));
    await expect(loadCsv()).rejects.toThrow();
  });
});

describe("loadCars", () => {
  it("loads the car list", async () => {
    const cars = await loadCars();
    expect(cars[0]).toMatchObject({ year: expect.any(Number), make: expect.any(String), co2: expect.any(Number) });
  });
});
