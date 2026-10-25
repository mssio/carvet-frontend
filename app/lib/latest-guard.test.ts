import { expect, it } from "vitest";
import { createLatestGuard } from "./latest-guard";

it("only the newest id is latest", () => {
  const g = createLatestGuard();
  const a = g.next();
  const b = g.next();
  expect(g.isLatest(a)).toBe(false);
  expect(g.isLatest(b)).toBe(true);
});
