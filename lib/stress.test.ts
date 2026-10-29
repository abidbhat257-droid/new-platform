import { describe, expect, it } from "vitest";
import { activeCalculators } from "./registry";

describe("calculator registry stress vectors", () => {
  it("returns finite, defined results for every active calculator", () => {
    for (const calculator of activeCalculators) {
      const values: Record<string, string> = {};
      for (const field of calculator.fields) {
        if (field.type === "date") values[field.name] = "2025-06-15";
        else if (field.type === "select") values[field.name] = field.options?.[0]?.value || "";
        else values[field.name] = String(field.min ?? 1);
      }
      let results;
      try {
        results = calculator.calculate(values);
      } catch (error) {
        throw new Error(`${calculator.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
      expect(results?.length, calculator.id).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.value, calculator.id).toBeDefined();
        expect(result.value).not.toMatch(/NaN|Infinity|undefined|Invalid Date/);
      }
    }
  });
});
