import { describe, expect, it } from "vitest";
import { averageFor, by, correlation, histogram, linearLine, mean, sortedNumericKeys } from "./explore-stats";

describe("explore stats", () => {
  it("means", () => {
    expect(mean([1, null, 3])).toBe(2);
    expect(mean([])).toBeNull();
  });
  it("correlates", () => {
    const rows = [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }];
    expect(correlation(rows, "x", "y")).toBeCloseTo(1);
    expect(correlation([{ x: 1, y: null }, { x: 2, y: 3 }], "x", "y")).toBeNull();
  });
  it("fits a line", () => {
    expect(linearLine([{ x: 0, y: 1 }, { x: 2, y: 5 }])).toEqual([{ x: 0, y: 1 }, { x: 2, y: 5 }]);
    expect(linearLine([{ x: 1, y: 1 }])).toEqual([]);
  });
  it("builds histograms", () => {
    expect(histogram([5, 5, 5], 2).counts).toEqual([0, 3]);
    expect(histogram([0, 10], 2)).toEqual({ labels: ["0–5", "5–10"], counts: [1, 1] });
    expect(histogram([null])).toEqual({ labels: [], counts: [] });
  });
  it("groups and averages", () => {
    const rows = [{ k: 2, v: 1 }, { k: 1, v: 3 }, { k: 2, v: 5 }];
    const g = by(rows, "k");
    expect(sortedNumericKeys(g)).toEqual([1, 2]);
    expect(averageFor(g.get(2)!, "v")).toBe(3);
  });
});
