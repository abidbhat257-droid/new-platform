export type Category =
  | "Period & Menstrual Cycle"
  | "Ovulation & Fertility"
  | "Pregnancy"
  | "Postpartum & Baby"
  | "Breastfeeding"
  | "Women's Fitness"
  | "Women's Nutrition"
  | "Menopause & Perimenopause"
  | "Beauty, Body & Lifestyle"
  | "Women's Wellness";
export type Field = {
  name: string;
  label: string;
  type: "number" | "date" | "select";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  required?: boolean;
};
export type Result = { label: string; value: string; detail?: string };
export type Calculator = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  description: string;
  keywords: string[];
  fields: Field[];
  calculate: (v: Record<string, string>) => Result[];
  methodology: string;
  faq: { q: string; a: string }[];
  related: string[];
  status: "active";
  tests: string[];
};
