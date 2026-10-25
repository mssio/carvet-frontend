import { describe, expect, it } from "vitest";
import {
  annualCo2Tonnes, annualCost, co2Band, compareDeltas, cumulative, fmt, fmtSigned,
  formatMoney, hashParam, pickPreset, toNumber, vehicleName,
} from "./carvet";
import { stats } from "./data";

const presets = stats.presets.predict;
const byId = (id: string) => presets.find((p) => p.id === id)!.record;
const rav4 = byId("rav4");
const civic = byId("civic");
const f150 = byId("f150");

describe("carvet helpers", () => {
  it("computes annual cost and CO2", () => {
    expect(annualCost(8.5, 20000, 1.65)).toBe(2805);
    expect(annualCost(8.5, null, 1.65)).toBeNull();
    expect(annualCo2Tonnes(199, 20000)).toBe(3.98);
  });
  it("parses numbers", () => {
    expect(toNumber("12")).toBe(12);
    expect(toNumber(" ")).toBeNull();
    expect(toNumber("-1")).toBeNull();
    expect(toNumber("abc")).toBeNull();
  });
  it("bands CO2", () => {
    expect(co2Band(99).key).toBe("low");
    expect(co2Band(100).key).toBe("moderate");
    expect(co2Band(165).key).toBe("moderate");
    expect(co2Band(165.1).key).toBe("elevated");
    expect(co2Band(225).key).toBe("elevated");
    expect(co2Band(226)).toEqual({ key: "severe", label: "Severe" });
  });
  it("formats", () => {
    expect(fmt(1234.5, 1)).toBe("1,234.5");
    expect(fmt(2805)).toBe("2,805");
    expect(fmt(null)).toBe("—");
    expect(fmt(NaN)).toBe("—");
    expect(fmtSigned(-3)).toBe("−3");
    expect(fmtSigned(2.5, 1)).toBe("+2.5");
    expect(fmtSigned(0)).toBe("0");
    expect(formatMoney(2805)).toBe("$2,805");
    expect(formatMoney(null)).toBe("—");
    expect(formatMoney(annualCost(8.5, toNumber(""), 1.65))).toBe("—");
  });
  it("reads hash params", () => {
    expect(hashParam("#preset=f150&km=15000", "km")).toBe("15000");
    expect(hashParam("#preset=f150", "km")).toBeNull();
    expect(hashParam("#x=%E0%A4%A", "x")).toBeNull();
  });
  it("picks presets", () => {
    expect(pickPreset(presets, "#preset=civic").id).toBe("civic");
    expect(pickPreset(presets, "#preset=nope").id).toBe("rav4");
  });
  it("compares deltas", () => {
    expect(compareDeltas(civic, f150, 20000, 1.65)).toMatchObject({
      co2Diff: -122, co2Pct: -43, fuelPct: -43, costDiff: -1716,
      costDiffTotal: -8580, co2AvoidedT: 2.44, co2AvoidedTotalT: 12.2,
    });
  });
  it("builds cumulative series", () => {
    expect(cumulative(civic, 20000, 1.65, 2)).toEqual([
      { year: 1, km: 20000, cost: 2277, co2T: 3.24 },
      { year: 2, km: 40000, cost: 4554, co2T: 6.48 },
    ]);
    expect(cumulative(civic, null, 1.65)).toEqual([]);
  });
  it("names vehicles", () => {
    expect(vehicleName(rav4)).toBe("2024 Toyota RAV4 AWD");
  });
});
