import { describe, it, expect } from "vitest";
import { calculators } from "./registry";
describe("registry", () => {
  it("contains a broad active catalog", () => {
    expect(calculators.length).toBe(300);
    expect(new Set(calculators.map((c) => c.slug)).size).toBe(300);
  });
  it("has complete metadata", () =>
    calculators.forEach((c) => {
      expect(c.title).toBeTruthy();
      expect(c.fields.length).toBeGreaterThan(0);
      expect(
        c.calculate({ date: "2025-01-01", cycleLength: "28", value: "1" })
          .length,
      ).toBeGreaterThan(0);
    }));
});
