import type { Field } from "./types";

export function validateFields(
  fields: Field[],
  values: Record<string, string>,
  now = new Date(),
): string | null {
  const missing = fields.find((field) => field.required && !values[field.name]);
  if (missing) return `Please enter ${missing.label.toLowerCase()}.`;

  const invalid = fields.find((field) => {
    const value = values[field.name];
    if (field.type === "number") {
      const number = Number(value);
      return (
        !Number.isFinite(number) ||
        (field.min !== undefined && number < field.min) ||
        (field.max !== undefined && number > field.max)
      );
    }
    if (field.type === "date") {
      const time = Date.parse(`${value}T12:00:00`);
      const year = Number.isFinite(time) ? new Date(time).getFullYear() : NaN;
      return (
        !Number.isFinite(time) || year < 1900 || year > now.getFullYear() + 2
      );
    }
    return !field.options?.some((option) => option.value === value);
  });

  return invalid
    ? `Please enter a valid ${invalid.label.toLowerCase()} within the indicated range.`
    : null;
}
