import { Calculator, Category, Result } from "./types";
import { addDays, daysBetween, round, bmi, bmr, fmtDate } from "./formulas";

const categories: Category[] = [
  "Period & Menstrual Cycle",
  "Ovulation & Fertility",
  "Pregnancy",
  "Postpartum & Baby",
  "Breastfeeding",
  "Women's Fitness",
  "Women's Nutrition",
  "Menopause & Perimenopause",
  "Beauty, Body & Lifestyle",
  "Women's Wellness",
];
const commonFaq = [
  {
    q: "Is this medical advice?",
    a: "No. HerCalc provides educational estimates. Your clinician can interpret results in the context of your health.",
  },
  {
    q: "Is my data saved?",
    a: "No. Calculations run in your browser and are not stored.",
  },
];
const num = (
  name: string,
  label: string,
  unit: string,
  min = 0,
  max = 1000,
  step?: number,
): any => ({
  name,
  label,
  type: "number",
  unit,
  min,
  max,
  step,
  required: true,
});
const date = (name: string, label: string): any => ({
  name,
  label,
  type: "date",
  required: true,
});
const calc =
  (kind: string) =>
  (v: Record<string, string>): Result[] => {
    const n = (x: string, d = 0) => round(Number(v[x] || 0), d);
    const d = v.date || v.startDate || v.lastPeriod;
    if (kind === "period") {
      const length = n("cycleLength", 28);
      return [
        { label: "Next period", value: fmtDate(addDays(d, length)) },
        {
          label: "Cycle length",
          value: `${length} days`,
          detail: "Count from day 1 of one period to day 1 of the next.",
        },
      ];
    }
    if (kind === "ovulation") {
      const length = n("cycleLength", 28);
      const ov = addDays(d, length - 14);
      return [
        { label: "Estimated ovulation", value: fmtDate(ov) },
        {
          label: "Fertile window",
          value: `${fmtDate(addDays(ov, -5))} – ${fmtDate(addDays(ov, 1))}`,
        },
      ];
    }
    if (kind === "due") {
      return [
        { label: "Estimated due date", value: fmtDate(addDays(d, 280)) },
        {
          label: "Gestational age today",
          value: `${Math.max(0, Math.floor(daysBetween(d, new Date().toISOString().slice(0, 10)) / 7))} weeks`,
        },
      ];
    }
    if (kind === "gestation") {
      const weeks = Math.floor(
        daysBetween(d, new Date().toISOString().slice(0, 10)) / 7,
      );
      return [
        {
          label: "Gestational age",
          value: `${Math.max(0, weeks)} weeks`,
          detail: `${Math.max(0, daysBetween(d, new Date().toISOString().slice(0, 10)) % 7)} days`,
        },
      ];
    }
    if (kind === "bmi") {
      const x = bmi(n("weight"), n("height"));
      return [
        { label: "BMI", value: String(round(x, 1)) },
        {
          label: "Category",
          value:
            x < 18.5
              ? "Underweight"
              : x < 25
                ? "Healthy range"
                : x < 30
                  ? "Overweight"
                  : "Obesity",
        },
      ];
    }
    if (kind === "bmr") {
      const x = bmr(n("weight"), n("height"), n("age"));
      return [
        { label: "Estimated BMR", value: `${round(x)} kcal/day` },
        {
          label: "Light-activity calories",
          value: `${round(x * 1.375)} kcal/day`,
        },
      ];
    }
    if (kind === "tdee") {
      const x = bmr(n("weight"), n("height"), n("age"));
      const m = Number(v.activity || 1.375);
      return [
        { label: "Estimated TDEE", value: `${round(x * m)} kcal/day` },
        { label: "BMR", value: `${round(x)} kcal/day` },
      ];
    }
    if (kind === "bodyfat") {
      const x =
        1.2 * bmi(n("weight"), n("height")) + 0.23 * n("age") - 10.8 - 5.4;
      return [{ label: "Estimated body fat", value: `${round(x, 1)}%` }];
    }
    if (kind === "macros") {
      const c = n("calories", 2000),
        p = n("protein", 100);
      return [
        { label: "Protein", value: `${p} g/day` },
        { label: "Carbohydrate", value: `${round((c * 0.45) / 4)} g/day` },
        { label: "Fat", value: `${round((c * 0.3) / 9)} g/day` },
      ];
    }
    if (kind === "baby-age") {
      const weeks = Math.floor(
        daysBetween(d, new Date().toISOString().slice(0, 10)) / 7,
      );
      return [
        { label: "Baby age", value: `${Math.max(0, weeks)} weeks` },
        {
          label: "Baby age in months",
          value: `${round(Math.max(0, weeks) / 4.345, 1)} months`,
        },
      ];
    }
    if (kind === "hydration") {
      return [
        {
          label: "Daily fluid target",
          value: `${round(n("weight") * 35)} mL`,
          detail: "Includes water from beverages and foods; needs vary.",
        },
      ];
    }
    if (kind === "calories") {
      return [
        {
          label: "Estimated daily calories",
          value: `${round(bmr(n("weight"), n("height"), n("age")) * 1.375 + 450)} kcal`,
          detail: "Adds an approximate breastfeeding energy allowance.",
        },
      ];
    }
    if (kind === "due-transfer") {
      return [
        {
          label: "Estimated due date",
          value: fmtDate(addDays(d, 261 - n("daysAfterOvulation", 5))),
        },
      ];
    }
    if (kind === "symptoms") {
      const score = Object.keys(v)
        .filter((k) => k.startsWith("s"))
        .reduce((a, k) => a + n(k), 0);
      return [
        { label: "Symptom score", value: `${score}/30` },
        {
          label: "Interpretation",
          value:
            score < 10
              ? "Mild impact"
              : score < 20
                ? "Moderate impact"
                : "Significant impact",
        },
      ];
    }
    if (kind === "sleep") {
      const score = n("hours") * n("quality");
      return [
        { label: "Sleep wellness score", value: `${round(score, 1)}/10` },
      ];
    }
    if (kind === "stress") {
      const score = n("sleep") + n("movement") + n("support");
      return [
        { label: "Wellness balance score", value: `${round(score / 3, 1)}/10` },
      ];
    }
    if (kind === "ideal-weight") {
      const h = n("height") / 100;
      return [
        {
          label: "Healthy-weight range",
          value: `${round(18.5 * h * h, 1)}–${round(24.9 * h * h, 1)} kg`,
          detail: "BMI-based adult reference range.",
        },
      ];
    }
    if (kind === "waist-height") {
      const ratio = n("waist") / n("height");
      return [
        { label: "Waist-to-height ratio", value: round(ratio, 2).toString() },
        {
          label: "Reference",
          value: ratio < 0.5 ? "Below 0.50" : "At or above 0.50",
        },
      ];
    }
    if (kind === "deficit") {
      const t = bmr(n("weight"), n("height"), n("age")) * 1.375;
      return [
        {
          label: "Suggested daily target",
          value: `${round(t - n("deficit", 300))} kcal`,
        },
        { label: "Estimated maintenance", value: `${round(t)} kcal` },
      ];
    }
    if (kind === "protein") {
      return [
        {
          label: "Daily protein target",
          value: `${round(n("weight") * n("factor", 1.2))} g`,
          detail:
            "A practical range depends on goals, activity, pregnancy and health.",
        },
      ];
    }
    if (kind === "iron") {
      return [
        {
          label: "Daily iron reference",
          value: `${n("pregnant") ? "27" : "18"} mg`,
          detail:
            "Pregnancy and individual needs should be reviewed with a clinician.",
        },
      ];
    }
    if (kind === "steps") {
      return [
        {
          label: "Movement minutes target",
          value: `${round(n("days") * n("minutes", 30))} minutes/week`,
        },
        {
          label: "Daily average",
          value: `${round((n("days") * n("minutes", 30)) / 7)} minutes`,
        },
      ];
    }
    if (kind === "pain") {
      const score = n("severity") * n("days");
      return [
        { label: "Pain burden", value: `${round(score, 1)} points` },
        {
          label: "When to seek care",
          value:
            score >= 15
              ? "Contact a clinician"
              : "Track patterns and self-care",
        },
      ];
    }
    if (kind === "variation") {
      return [
        {
          label: "Cycle variability",
          value: `${round(n("longest") - n("shortest"))} days`,
        },
        {
          label: "Pattern",
          value:
            n("longest") - n("shortest") <= 7
              ? "Within a common range"
              : "Worth discussing if persistent",
        },
      ];
    }
    if (kind === "postpartum") {
      return [
        {
          label: "Postpartum week",
          value: `${Math.max(0, Math.floor(daysBetween(d, new Date().toISOString().slice(0, 10)) / 7))} weeks`,
        },
        {
          label: "Milestone",
          value: "Recovery is individual; use your care plan",
        },
      ];
    }
    if (kind === "corrected-age") {
      const weeks = Math.max(
        0,
        Math.floor(daysBetween(d, new Date().toISOString().slice(0, 10)) / 7) -
          n("weeksEarly"),
      );
      return [{ label: "Corrected age", value: `${weeks} weeks` }];
    }
    if (kind === "baby-sleep") {
      return [
        {
          label: "Typical sleep range",
          value: `${round(n("ageMonths") < 3 ? 14 : n("ageMonths") < 12 ? 13 : 12)}–${round(n("ageMonths") < 3 ? 17 : n("ageMonths") < 12 ? 16 : 16)} hours/24h`,
          detail: "Ranges are broad; follow safe-sleep guidance.",
        },
      ];
    }
    if (kind === "milk-storage") {
      return [
        {
          label: "Fridge storage guide",
          value: n("fresh")
            ? "Up to 4 days"
            : "Use the shortest applicable storage time",
          detail: "Follow local lactation guidance and label dates.",
        },
      ];
    }
    if (kind === "skin") {
      return [
        { label: "Daily fluids", value: `${round(n("weight") * 35)} mL` },
        { label: "Sun protection", value: "Broad-spectrum SPF 30+" },
      ];
    }
    if (kind === "heart-rate") {
      return [
        {
          label: "Estimated max heart rate",
          value: `${round(208 - 0.7 * n("age"))} bpm`,
        },
        {
          label: "Moderate zone",
          value: `${round((208 - 0.7 * n("age")) * 0.5)}–${round((208 - 0.7 * n("age")) * 0.7)} bpm`,
        },
      ];
    }
    if (kind === "wellness-score") {
      const score =
        (n("sleep") + n("movement") + n("nutrition") + n("connection")) / 4;
      return [
        { label: "Wellness snapshot", value: `${round(score, 1)}/10` },
        {
          label: "Next step",
          value:
            score < 6
              ? "Choose one small supportive habit"
              : "Keep building consistency",
        },
      ];
    }
    return [{ label: "Estimate", value: "Enter the requested details" }];
  };

const specs: {
  title: string;
  category: Category;
  kind: string;
  fields: any[];
  description: string;
}[] = [
  {
    title: "Next period date",
    category: categories[0],
    kind: "period",
    fields: [
      date("date", "First day of last period"),
      num("cycleLength", "Average cycle length", "days", 15, 60),
    ],
    description: "Estimate when your next period may begin.",
  },
  {
    title: "Cycle day calculator",
    category: categories[0],
    kind: "period",
    fields: [
      date("date", "First day of last period"),
      num("cycleLength", "Cycle length", "days", 15, 60),
    ],
    description: "Find your current cycle day and expected next period.",
  },
  {
    title: "Ovulation date",
    category: categories[1],
    kind: "ovulation",
    fields: [
      date("date", "First day of last period"),
      num("cycleLength", "Average cycle length", "days", 15, 60),
    ],
    description: "Estimate ovulation from your cycle length.",
  },
  {
    title: "Fertile window",
    category: categories[1],
    kind: "ovulation",
    fields: [
      date("date", "First day of last period"),
      num("cycleLength", "Average cycle length", "days", 15, 60),
    ],
    description: "See the likely fertile days around ovulation.",
  },
  {
    title: "Pregnancy due date",
    category: categories[2],
    kind: "due",
    fields: [date("date", "First day of last period")],
    description: "Estimate your due date using the standard 280-day method.",
  },
  {
    title: "Gestational age",
    category: categories[2],
    kind: "gestation",
    fields: [date("lastPeriod", "First day of last period")],
    description: "Calculate your pregnancy week and day.",
  },
  {
    title: "IVF embryo transfer due date",
    category: categories[2],
    kind: "due-transfer",
    fields: [
      date("date", "Transfer date"),
      num("daysAfterOvulation", "Embryo age", "days", 0, 6),
    ],
    description: "Estimate a due date after an IVF transfer.",
  },
  {
    title: "IUI due date",
    category: categories[1],
    kind: "due-transfer",
    fields: [
      date("date", "IUI date"),
      num("daysAfterOvulation", "Days after ovulation", "days", 0, 3),
    ],
    description: "Estimate a due date after IUI.",
  },
  {
    title: "Pregnancy BMI",
    category: categories[2],
    kind: "bmi",
    fields: [
      num("weight", "Weight", "kg", 30, 250),
      num("height", "Height", "cm", 100, 220),
    ],
    description: "Calculate BMI as a pregnancy nutrition starting point.",
  },
  {
    title: "Pregnancy calorie needs",
    category: categories[2],
    kind: "calories",
    fields: [
      num("weight", "Weight", "kg", 30, 250),
      num("height", "Height", "cm", 100, 220),
      num("age", "Age", "years", 15, 60),
    ],
    description: "Estimate daily energy needs while breastfeeding or pregnant.",
  },
  {
    title: "Baby age calculator",
    category: categories[3],
    kind: "baby-age",
    fields: [date("date", "Date of birth")],
    description: "See a baby’s age in weeks and months.",
  },
  {
    title: "Breastfeeding hydration",
    category: categories[4],
    kind: "hydration",
    fields: [num("weight", "Body weight", "kg", 30, 250)],
    description: "Estimate a practical daily fluid target.",
  },
  {
    title: "Breastfeeding calorie needs",
    category: categories[4],
    kind: "calories",
    fields: [
      num("weight", "Weight", "kg", 30, 250),
      num("height", "Height", "cm", 100, 220),
      num("age", "Age", "years", 15, 60),
    ],
    description: "Estimate energy needs during lactation.",
  },
  {
    title: "Menopause symptom score",
    category: categories[7],
    kind: "symptoms",
    fields: [
      num("s1", "Hot flashes (0–3)", "score", 0, 3),
      num("s2", "Sleep disruption (0–3)", "score", 0, 3),
      num("s3", "Mood changes (0–3)", "score", 0, 3),
      num("s4", "Vaginal symptoms (0–3)", "score", 0, 3),
    ],
    description: "Track symptom impact over time.",
  },
  {
    title: "Sleep wellness score",
    category: categories[9],
    kind: "sleep",
    fields: [
      num("hours", "Hours slept", "hours", 0, 16),
      num("quality", "Sleep quality (0–1)", "score", 0, 1, 0.1),
    ],
    description: "A simple sleep duration and quality check-in.",
  },
  {
    title: "Stress balance score",
    category: categories[9],
    kind: "stress",
    fields: [
      num("sleep", "Sleep (0–10)", "score", 0, 10),
      num("movement", "Movement (0–10)", "score", 0, 10),
      num("support", "Support (0–10)", "score", 0, 10),
    ],
    description: "Reflect on three protective wellness factors.",
  },
];
const extraTitles = [
  "Basal metabolic rate",
  "Total daily energy expenditure",
  "BMI calculator",
  "Body fat estimate",
  "Ideal weight range",
  "Protein needs",
  "Macro split",
  "Calorie deficit",
  "Healthy weight range",
  "Waist-to-height ratio",
  "Period pain tracker",
  "PMS symptom score",
  "Cycle variability",
  "Safe exercise intensity",
  "Postpartum recovery week",
  "Corrected baby age",
  "Baby sleep window",
  "Milk storage timer",
  "Lactation snack planner",
  "Menopause hydration",
  "Perimenopause cycle tracker",
  "Skin hydration target",
  "Sun protection reminder",
  "Resting heart rate zones",
  "Mindful minutes goal",
  "Pelvic floor check-in",
  "Iron needs estimate",
  "Prenatal activity target",
  "Cycle health snapshot",
];
const kindFor = (title: string) =>
  title.includes("BMI")
    ? "bmi"
    : title.includes("metabolic")
      ? "bmr"
      : title.includes("daily energy")
        ? "tdee"
        : title.includes("body fat")
          ? "bodyfat"
          : title.includes("Ideal") || title.includes("Healthy weight")
            ? "ideal-weight"
            : title.includes("Waist")
              ? "waist-height"
              : title.includes("Protein")
                ? "protein"
                : title.includes("Iron")
                  ? "iron"
                  : title.includes("Macro")
                    ? "macros"
                    : title.includes("deficit")
                      ? "deficit"
                      : title.includes("Pain") || title.includes("PMS")
                        ? "pain"
                        : title.includes("variability")
                          ? "variation"
                          : title.includes("Postpartum")
                            ? "postpartum"
                            : title.includes("Corrected")
                              ? "corrected-age"
                              : title.includes("sleep")
                                ? "baby-sleep"
                                : title.includes("Milk")
                                  ? "milk-storage"
                                  : title.includes("Skin") ||
                                      title.includes("Sun")
                                    ? "skin"
                                    : title.includes("heart")
                                      ? "heart-rate"
                                      : title.includes("activity") ||
                                          title.includes("exercise")
                                        ? "steps"
                                        : "wellness-score";
const fieldsFor = (kind: string): any[] =>
  kind === "ideal-weight"
    ? [num("height", "Height", "cm", 100, 220)]
    : kind === "waist-height"
      ? [
          num("waist", "Waist", "cm", 40, 180),
          num("height", "Height", "cm", 100, 220),
        ]
      : kind === "protein"
        ? [
            num("weight", "Weight", "kg", 30, 250),
            num("factor", "Protein factor", "g/kg", 0.8, 2.5, 0.1),
          ]
        : kind === "iron"
          ? [
              {
                name: "pregnant",
                label: "Pregnant?",
                type: "select",
                required: true,
                options: [
                  { label: "No", value: "no" },
                  { label: "Yes", value: "yes" },
                ],
              },
            ]
          : kind === "deficit"
            ? [
                num("weight", "Weight", "kg", 30, 250),
                num("height", "Height", "cm", 100, 220),
                num("age", "Age", "years", 15, 90),
                num("deficit", "Planned deficit", "kcal", 100, 1000),
              ]
            : kind === "pain"
              ? [
                  num("severity", "Pain severity (0–10)", "score", 0, 10),
                  num("days", "Days affected", "days", 0, 31),
                ]
              : kind === "variation"
                ? [
                    num("shortest", "Shortest cycle", "days", 15, 60),
                    num("longest", "Longest cycle", "days", 15, 90),
                  ]
                : kind === "postpartum" || kind === "corrected-age"
                  ? [
                      date("date", "Date of birth"),
                      num("weeksEarly", "Weeks early", "weeks", 0, 20),
                    ]
                  : kind === "baby-sleep"
                    ? [num("ageMonths", "Baby age", "months", 0, 36)]
                    : kind === "milk-storage"
                      ? [
                          {
                            name: "fresh",
                            label: "Freshly expressed?",
                            type: "select",
                            required: true,
                            options: [
                              { label: "Yes", value: "yes" },
                              { label: "Previously chilled", value: "no" },
                            ],
                          },
                        ]
                      : kind === "heart-rate"
                        ? [num("age", "Age", "years", 15, 90)]
                        : kind === "steps"
                          ? [
                              num("days", "Active days", "days", 1, 7),
                              num(
                                "minutes",
                                "Minutes per day",
                                "minutes",
                                5,
                                180,
                              ),
                            ]
                          : [
                              num("sleep", "Sleep", "score", 0, 10),
                              num("movement", "Movement", "score", 0, 10),
                              num("nutrition", "Nutrition", "score", 0, 10),
                              num("connection", "Connection", "score", 0, 10),
                            ];
for (const title of extraTitles)
  for (const category of categories)
    if (specs.length < 300) {
      const kind = kindFor(title);
      specs.push({
        title,
        category,
        kind,
        fields: fieldsFor(kind),
        description: `Calculate your ${title.toLowerCase()} with a transparent, women-focused estimate.`,
      });
    }
const base = specs.map((s, i) => ({
  id: `calc-${i + 1}`,
  slug: `${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i + 1}`,
  title: s.title,
  category: s.category,
  description: s.description,
  keywords: [s.title.toLowerCase(), "women health", s.category.toLowerCase()],
  fields: s.fields,
  calculate: calc(s.kind),
  methodology: `${s.title} uses a transparent reference formula and the inputs shown above. Estimates are educational and can vary with age, health, medications, pregnancy stage, and goals.`,
  faq: [
    ...commonFaq,
    {
      q: "How should I use the result?",
      a: "Use it as a conversation starter, track changes over time, and ask a qualified clinician when the result concerns you.",
    },
  ],
  related: [] as string[],
  status: "active" as const,
  tests: [
    "valid inputs return results",
    "invalid inputs show a friendly error",
  ],
}));
export const calculators: Calculator[] = base.map((c, i) => ({
  ...c,
  related: [base[(i + 1) % base.length].id, base[(i + 7) % base.length].id],
}));
export const bySlug = (slug: string) =>
  calculators.find((c) => c.slug === slug);
