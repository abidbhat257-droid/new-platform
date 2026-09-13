export const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
export const daysBetween = (a: string, b: string) =>
  Math.round(
    (new Date(`${b}T12:00:00`).getTime() -
      new Date(`${a}T12:00:00`).getTime()) /
      86400000,
  );
export const round = (n: number, d = 0) =>
  Number(Number.isFinite(n) ? n.toFixed(Math.max(0, Math.min(100, d))) : "0");
export const bmi = (kg: number, cm: number) => kg / (cm / 100) ** 2;
export const bmr = (kg: number, cm: number, age: number, sex = "female") =>
  10 * kg + 6.25 * cm - 5 * age + (sex === "female" ? -161 : 5);
export const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(`${s}T12:00:00`),
  );
