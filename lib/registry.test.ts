import { describe, expect, it } from "vitest";
import { calculators, categories } from "./registry";

describe("curated calculator registry", () => {
  it("has unique identities and a real, multi-category catalog", () => {
    expect(calculators.length).toBeGreaterThanOrEqual(45);
    for (const key of ["id", "slug", "title"] as const) {
      const values = calculators.map((calculator) => calculator[key]);
      expect(new Set(values).size).toBe(values.length);
    }
    expect(new Set(calculators.map((calculator) => calculator.category)).size).toBe(10);
  });

  it("has complete metadata and contextual relations", () => {
    const ids = new Set(calculators.map((calculator) => calculator.id));
    calculators.forEach((calculator) => {
      expect(categories).toContain(calculator.category);
      expect(calculator.fields.length).toBeGreaterThan(0);
      expect(calculator.methodology).toBeTruthy();
      expect(calculator.faq.length).toBeGreaterThan(0);
      expect(calculator.related.length).toBeGreaterThan(0);
      calculator.related.forEach((id) => expect(ids).toContain(id));
    });
  });

  it("returns results for representative known vectors", () => {
    const bmi = calculators.find((calculator) => calculator.id === "bmi");
    expect(bmi?.calculate({ weight: "70", height: "170" })[0].value).toBe("24.2");
    const due = calculators.find((calculator) => calculator.id === "pregnancy-due-date");
    expect(due?.calculate({ lastPeriod: "2025-01-01" })[0].value).toContain("Oct");
  });
});
