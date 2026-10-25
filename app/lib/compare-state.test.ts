import { describe, expect, it } from "vitest";
import { compareAddState } from "./compare-state";
import { stats } from "./data";

const mk = (model: string) => ({ ...stats.presets.predict[0].record, model });

describe("compareAddState", () => {
  it("disables without a current car", () => {
    expect(compareAddState([], null)).toEqual({ disabled: true, note: null });
  });
  it("allows a new car", () => {
    expect(compareAddState([mk("a")], mk("b"))).toEqual({ disabled: false, note: null });
  });
  it("blocks duplicates", () => {
    const a = mk("a");
    expect(compareAddState([a], a)).toEqual({
      disabled: true,
      note: "This car is already added — pick a different model or version.",
    });
  });
  it("blocks a fifth car, taking priority over duplicate", () => {
    const sel = [mk("a"), mk("b"), mk("c"), mk("d")];
    const full = { disabled: true, note: "You can compare up to 4 cars. Remove one to add another." };
    expect(compareAddState(sel, mk("e"))).toEqual(full);
    expect(compareAddState(sel, sel[0])).toEqual(full);
  });
  it("shows the full-list note even with an incomplete selection (mockup parity)", () => {
    const sel = [mk("a"), mk("b"), mk("c"), mk("d")];
    expect(compareAddState(sel, null)).toEqual({
      disabled: true,
      note: "You can compare up to 4 cars. Remove one to add another.",
    });
  });
});
