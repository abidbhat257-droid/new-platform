import { describe, it, expect } from "vitest";
import { addDays, bmi, bmr } from "./formulas";
describe("formula helpers", () => {
  it("adds calendar days", () =>
    expect(addDays("2025-01-01", 28)).toBe("2025-01-29"));
  it("calculates BMI", () => expect(bmi(70, 170)).toBeCloseTo(24.22, 1));
  it("calculates female BMR", () => expect(bmr(60, 165, 30)).toBe(1320.25));
});
