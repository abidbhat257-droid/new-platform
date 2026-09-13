import { describe, expect, it } from "vitest";
import { validateFields } from "./validation";
import type { Field } from "./types";

const fields: Field[] = [
  {
    name: "age",
    label: "Age",
    type: "number",
    min: 18,
    max: 90,
    required: true,
  },
  {
    name: "stage",
    label: "Stage",
    type: "select",
    required: true,
    options: [{ label: "Adult", value: "adult" }],
  },
  { name: "date", label: "Date", type: "date", required: true },
];

describe("field validation", () => {
  it("rejects missing, out-of-range, malformed, and invalid select values", () => {
    expect(validateFields(fields, {})).toContain("age");
    expect(
      validateFields(fields, { age: "17", stage: "adult", date: "2025-01-01" }),
    ).toContain("age");
    expect(
      validateFields(fields, {
        age: "30",
        stage: "unknown",
        date: "2025-01-01",
      }),
    ).toContain("stage");
    expect(
      validateFields(fields, { age: "30", stage: "adult", date: "not-a-date" }),
    ).toContain("date");
  });

  it("accepts valid values", () => {
    expect(
      validateFields(fields, { age: "30", stage: "adult", date: "2025-01-01" }),
    ).toBeNull();
  });
});
