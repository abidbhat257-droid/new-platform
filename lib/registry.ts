import { Calculator, Category, Field, Result } from "./types";
import { addDays, bmi, bmr, daysBetween, fmtDate, round } from "./formulas";

export const categories: Category[] = [
  "Period & Menstrual Cycle", "Ovulation & Fertility", "Pregnancy",
  "Postpartum & Baby", "Breastfeeding", "Women's Fitness", "Women's Nutrition",
  "Menopause & Perimenopause", "Beauty, Body & Lifestyle", "Women's Wellness",
];
const faq = [
  { q: "Is this medical advice?", a: "No. This is an educational estimate, not a diagnosis or personalised medical advice. Ask a qualified clinician about your circumstances." },
  { q: "Is my data saved?", a: "No. Calculations run in your browser and the entries are not sent to or stored by HerCalc." },
];
const n = (name: string, label: string, unit: string, min: number, max: number, step?: number): Field =>
  ({ name, label, type: "number", unit, min, max, step, required: true });
const date = (name: string, label: string): Field => ({ name, label, type: "date", required: true });
const select = (name: string, label: string, options: { label: string; value: string }[]): Field =>
  ({ name, label, type: "select", options, required: true });
const value = (v: Record<string, string>, key: string) => Number(v[key]);
const today = () => new Date().toISOString().slice(0, 10);
type Kind = "next-period" | "cycle-day" | "ovulation" | "fertile-window" | "due" | "gestation" |
  "trimester" | "transfer-due" | "pregnancy-bmi" | "pregnancy-calories" | "baby-age" | "postpartum-week" |
  "corrected-age" | "baby-sleep" | "breastfeeding-hydration" | "breastfeeding-calories" | "milk-storage" |
  "bmi" | "bmr" | "tdee" | "deficit" | "ideal-weight" | "body-fat" | "waist-height" | "heart-rate" |
  "training-calories" | "protein" | "fiber" | "iron" | "calcium" | "vitamin-d" | "water" | "macros" |
  "symptoms" | "cycle-variation" | "sleep" | "sleep-debt" | "stress" | "calcium" |
  "cycle-length" | "period-duration" | "conception-date" | "pregnancy-weight-gain" |
  "menopause-hydration" | "skin-hydration" | "lactation-protein";
type Spec = [string, string, string, Category, Kind, string, Field[], string[]];
const specs: Spec[] = [
  ["next-period","Next Period Calculator","period-next","Period & Menstrual Cycle","next-period","Estimate the first day of your next period from the last period and usual cycle length.",[date("lastPeriod","First day of last period"),n("cycleLength","Usual cycle length","days",15,60)],["cycle-day","cycle-variation"]],
  ["cycle-day","Cycle Day Calculator","cycle-day","Period & Menstrual Cycle","cycle-day","Find the estimated day of your current menstrual cycle.",[date("lastPeriod","First day of last period"),n("cycleLength","Usual cycle length","days",15,60)],["next-period","ovulation-date"]],
  ["cycle-length","Cycle Length Calculator","cycle-length","Period & Menstrual Cycle","cycle-length","Calculate the number of days between two period starts.",[date("start","Earlier period start"),date("end","Later period start")],["cycle-variation","next-period"]],
  ["period-duration","Period Duration Calculator","period-duration","Period & Menstrual Cycle","period-duration","Record the length of a period and compare it with a typical reference.",[n("days","Bleeding days","days",1,15)],["cycle-variation","pms-score"]],
  ["cycle-variation","Cycle Variability Calculator","cycle-variability","Period & Menstrual Cycle","cycle-variation","Measure the difference between your shortest and longest recent cycles.",[n("shortest","Shortest cycle","days",15,60),n("longest","Longest cycle","days",15,90)],["cycle-length","next-period"]],
  ["pms-score","PMS Symptom Score","pms-symptom-score","Period & Menstrual Cycle","symptoms","Add symptom ratings to track premenstrual impact over time.",[n("mood","Mood impact (0-3)","score",0,3),n("pain","Pain impact (0-3)","score",0,3),n("sleep","Sleep impact (0-3)","score",0,3),n("daily","Daily-life impact (0-3)","score",0,3)],["cycle-day","menopause-score"]],
  ["ovulation-date","Ovulation Calculator","ovulation-date","Ovulation & Fertility","ovulation","Estimate ovulation using the common luteal-phase approximation.",[date("lastPeriod","First day of last period"),n("cycleLength","Usual cycle length","days",15,60)],["fertile-window","cycle-day","next-period"]],
  ["fertile-window","Fertile Window Calculator","fertile-window","Ovulation & Fertility","fertile-window","Estimate the days when conception is more likely around ovulation.",[date("lastPeriod","First day of last period"),n("cycleLength","Usual cycle length","days",15,60)],["ovulation-date","cycle-day"]],
  ["conception-date","Conception Date Calculator","conception-date","Ovulation & Fertility","conception-date","Estimate conception timing from an estimated due date.",[date("dueDate","Estimated due date")],["pregnancy-due-date","gestational-age"]],
  ["fertility-cycle-day","Fertility Window By Cycle Length","fertility-cycle-day","Ovulation & Fertility","fertile-window","View an estimated fertile interval for a selected cycle length.",[n("cycleLength","Cycle length","days",15,60)],["ovulation-date","fertile-window"]],
  ["pregnancy-due-date","Pregnancy Due Date Calculator","pregnancy-due-date","Pregnancy","due","Estimate a due date using 280 days from the first day of the last menstrual period.",[date("lastPeriod","First day of last period")],["gestational-age","trimester","pregnancy-week"]],
  ["gestational-age","Gestational Age Calculator","gestational-age","Pregnancy","gestation","Estimate pregnancy weeks and days from the last menstrual period.",[date("lastPeriod","First day of last period")],["pregnancy-due-date","trimester"]],
  ["pregnancy-week","Pregnancy Week Calculator","pregnancy-week","Pregnancy","gestation","Show the estimated current pregnancy week and day.",[date("lastPeriod","First day of last period")],["gestational-age","trimester"]],
  ["trimester","Trimester Calculator","trimester","Pregnancy","trimester","Identify the estimated trimester from a last menstrual period date.",[date("lastPeriod","First day of last period")],["gestational-age","pregnancy-week"]],
  ["ivf-due-date","IVF Embryo Transfer Due Date","ivf-due-date","Pregnancy","transfer-due","Estimate a due date after an embryo transfer, accounting for embryo age.",[date("transferDate","Transfer date"),n("embryoAge","Embryo age","days",0,6)],["pregnancy-due-date","gestational-age"]],
  ["iui-due-date","IUI Due Date Calculator","iui-due-date","Pregnancy","transfer-due","Estimate a due date after an intrauterine insemination date.",[date("iuiDate","IUI date")],["pregnancy-due-date","gestational-age"]],
  ["pregnancy-bmi","Pregnancy BMI Reference","pregnancy-bmi","Pregnancy","pregnancy-bmi","Calculate pre-pregnancy BMI as context for discussing pregnancy weight guidance.",[n("weight","Pre-pregnancy weight","kg",30,250),n("height","Height","cm",100,220)],["pregnancy-weight-gain","bmi"]],
  ["pregnancy-weight-gain","Pregnancy Weight Gain Guidance","pregnancy-weight-gain","Pregnancy","pregnancy-weight-gain","Show BMI-based Institute of Medicine reference ranges for singleton pregnancy.",[n("bmi","Pre-pregnancy BMI","kg/m²",12,60)],["pregnancy-bmi","pregnancy-calories"]],
  ["pregnancy-calories","Pregnancy Calorie Estimate","pregnancy-calories","Pregnancy","pregnancy-calories","Estimate energy needs with explicit trimester additions rather than a universal lactation allowance.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,60),select("trimester","Trimester",[{"label":"First","value":"1"},{"label":"Second","value":"2"},{"label":"Third","value":"3"}])],["breastfeeding-calories","pregnancy-bmi"]],
  ["baby-age","Baby Age Calculator","baby-age","Postpartum & Baby","baby-age","Calculate a baby's age in days, weeks and approximate months.",[date("birthDate","Date of birth")],["corrected-age","postpartum-week","baby-sleep"]],
  ["postpartum-week","Postpartum Week Calculator","postpartum-week","Postpartum & Baby","postpartum-week","Estimate weeks since birth for planning conversations with your care team.",[date("birthDate","Date of birth")],["baby-age","corrected-age"]],
  ["corrected-age","Corrected Baby Age","corrected-baby-age","Postpartum & Baby","corrected-age","Estimate corrected age for a baby born early using weeks before 40 weeks.",[date("birthDate","Date of birth"),n("weeksEarly","Weeks early","weeks",0,20)],["baby-age","postpartum-week"]],
  ["baby-sleep","Baby Sleep Estimate","baby-sleep","Postpartum & Baby","baby-sleep","Show broad 24-hour sleep ranges by baby age; not a sleep prescription.",[n("ageMonths","Baby age","months",0,36)],["baby-age","postpartum-week"]],
  ["breastfeeding-hydration","Breastfeeding Hydration Estimate","breastfeeding-hydration","Breastfeeding","breastfeeding-hydration","Estimate a starting fluid target from body weight; thirst and clinical advice take priority.",[n("weight","Body weight","kg",30,250)],["breastfeeding-calories","lactation-protein"]],
  ["breastfeeding-calories","Breastfeeding Calorie Estimate","breastfeeding-calories","Breastfeeding","breastfeeding-calories","Estimate lactation energy needs with an explicit feeding stage and conservative allowance.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,60),select("feeding","Feeding stage",[{"label":"Exclusive breastfeeding (0-6 months)","value":"exclusive"},{"label":"Partial breastfeeding","value":"partial"}])],["breastfeeding-hydration","lactation-protein","pregnancy-calories"]],
  ["lactation-protein","Lactation Protein Needs","lactation-protein","Breastfeeding","protein","Estimate a protein target using body weight and a lactation reference factor.",[n("weight","Body weight","kg",30,250)],["breastfeeding-calories","breastfeeding-hydration"]],
  ["milk-storage","Breast Milk Storage Guidance","milk-storage","Breastfeeding","milk-storage","Show conservative refrigerator storage guidance based on whether milk is fresh or chilled.",[select("state","Milk state",[{"label":"Freshly expressed","value":"fresh"},{"label":"Previously chilled","value":"chilled"}])],["breastfeeding-calories","breastfeeding-hydration"]],
  ["bmi","Women's BMI Calculator","bmi","Women's Fitness","bmi","Calculate adult BMI from metric height and weight as a screening reference.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220)],["healthy-weight","body-fat","waist-height"]],
  ["bmr","Basal Metabolic Rate","bmr","Women's Fitness","bmr","Estimate resting energy expenditure with the Mifflin-St Jeor equation.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,90)],["tdee","maintenance-calories"]],
  ["tdee","Total Daily Energy Expenditure","tdee","Women's Fitness","tdee","Estimate daily energy expenditure from BMR and an activity multiplier.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,90),select("activity","Activity level",[{"label":"Sedentary","value":"1.2"},{"label":"Light","value":"1.375"},{"label":"Moderate","value":"1.55"},{"label":"Very active","value":"1.725"}])],["bmr","maintenance-calories","calorie-deficit"]],
  ["maintenance-calories","Maintenance Calories","maintenance-calories","Women's Fitness","tdee","Estimate maintenance calories using an activity multiplier.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,90),select("activity","Activity level",[{"label":"Sedentary","value":"1.2"},{"label":"Light","value":"1.375"},{"label":"Moderate","value":"1.55"},{"label":"Very active","value":"1.725"}])],["tdee","calorie-deficit"]],
  ["calorie-deficit","Calorie Deficit Estimate","calorie-deficit","Women's Fitness","deficit","Subtract a user-selected deficit from estimated maintenance calories.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,90),n("deficit","Deficit","kcal/day",100,750)],["maintenance-calories","bmr"]],
  ["healthy-weight","Healthy Weight Range","healthy-weight","Women's Fitness","ideal-weight","Show the adult BMI 18.5-24.9 weight range for a given height.",[n("height","Height","cm",100,220)],["bmi","waist-height"]],
  ["body-fat","Body Fat Estimate","body-fat","Women's Fitness","body-fat","Estimate body-fat percentage with the Deurenberg BMI-and-age equation for adult women.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",18,80)],["bmi","lean-mass"]],
  ["lean-mass","Lean Body Mass Estimate","lean-mass","Women's Fitness","body-fat","Estimate lean body mass from weight and estimated body-fat percentage.",[n("weight","Weight","kg",30,250),n("bodyFat","Body fat","%",5,70)],["body-fat","bmi"]],
  ["waist-height","Waist-to-Height Ratio","waist-height","Women's Fitness","waist-height","Calculate waist circumference divided by height as a screening reference.",[n("waist","Waist circumference","cm",40,180),n("height","Height","cm",100,220)],["bmi","healthy-weight"]],
  ["heart-rate","Heart Rate Zones","heart-rate","Women's Fitness","heart-rate","Estimate age-based maximum heart rate and broad training zones.",[n("age","Age","years",15,90)],["training-calories","bmr"]],
  ["training-calories","Training Calorie Estimate","training-calories","Women's Fitness","training-calories","Estimate exercise calories from body weight, duration and MET intensity.",[n("weight","Weight","kg",30,250),n("minutes","Duration","minutes",5,300),n("met","Intensity (MET)","MET",2,12,0.5)],["heart-rate","tdee"]],
  ["protein","Daily Protein Needs","protein","Women's Nutrition","protein","Estimate protein intake from body weight and a selected activity factor.",[n("weight","Weight","kg",30,250),n("factor","Protein factor","g/kg",0.8,2.2,0.1)],["lactation-protein","macro-split"]],
  ["fiber","Daily Fiber Needs","fiber","Women's Nutrition","fiber","Estimate an adult fiber reference using age and sex-specific guidance.",[n("age","Age","years",15,90)],["water","iron-needs"]],
  ["iron-needs","Iron Needs Reference","iron","Women's Nutrition","iron","Show a reference intake by life stage; it is not a substitute for blood testing.",[select("stage","Life stage",[{"label":"Adult, not pregnant","value":"adult"},{"label":"Pregnancy","value":"pregnant"},{"label":"Breastfeeding","value":"lactating"}])],["fiber","pregnancy-calories"]],
  ["calcium-needs","Calcium Needs Reference","calcium-needs","Women's Nutrition","calcium","Show an age-based calcium reference.",[n("age","Age","years",15,90)],["vitamin-d","iron-needs"]],
  ["vitamin-d","Vitamin D Reference","vitamin-d","Women's Nutrition","vitamin-d","Show a general adult vitamin D reference; individual treatment requires clinical advice.",[n("age","Age","years",15,90)],["calcium-needs","water"]],
  ["water","Water Intake Estimate","water","Women's Nutrition","water","Estimate total daily water from body weight as a starting point.",[n("weight","Weight","kg",30,250)],["fiber","breastfeeding-hydration"]],
  ["macro-split","Macronutrient Split","macro-split","Women's Nutrition","macros","Convert a calorie target into a balanced 45/30/25 carbohydrate, fat and protein estimate.",[n("calories","Calorie target","kcal/day",1000,5000)],["protein","maintenance-calories"]],
  ["menopause-score","Menopause Symptom Score","menopause-symptom-score","Menopause & Perimenopause","symptoms","Track four menopause symptom impacts on a simple 0-3 scale.",[n("hot","Hot flashes (0-3)","score",0,3),n("sleep","Sleep disruption (0-3)","score",0,3),n("mood","Mood changes (0-3)","score",0,3),n("vaginal","Vaginal symptoms (0-3)","score",0,3)],["pms-score","menopause-hydration"]],
  ["menopause-hydration","Menopause Hydration Estimate","menopause-hydration","Menopause & Perimenopause","water","Estimate a weight-based fluid starting point; it does not treat hot flashes.",[n("weight","Weight","kg",30,250)],["water","menopause-score"]],
  ["sleep","Sleep Duration Check","sleep","Women's Wellness","sleep","Compare reported adult sleep duration with the broad 7-9 hour reference.",[n("hours","Average sleep","hours",0,16)],["sleep-debt","stress-score"]],
  ["sleep-debt","Sleep Debt Estimate","sleep-debt","Women's Wellness","sleep-debt","Estimate weekly sleep debt against a chosen 8-hour reference.",[n("hours","Average nightly sleep","hours",0,16),n("nights","Nights measured","nights",1,14)],["sleep","stress-score"]],
  ["stress-score","Stress Check-In","stress-score","Women's Wellness","stress","Average three self-rated factors as a reflection prompt, not a mental-health diagnosis.",[n("sleep","Sleep support (0-10)","score",0,10),n("movement","Movement support (0-10)","score",0,10),n("support","Social support (0-10)","score",0,10)],["sleep","menopause-score"]],
  ["skin-hydration","Skin Hydration Fluid Reference","skin-hydration","Beauty, Body & Lifestyle","water","Estimate a general fluid reference; skin hydration depends on many factors.",[n("weight","Weight","kg",30,250)],["water","bmi"]],
];
function calculate(kind: Kind, v: Record<string, string>): Result[] {
  const x = (k: string) => value(v, k);
  const d = (k: string) => v[k] || "2025-01-01";
  const ageDays = (k: string) => Math.max(0, daysBetween(d(k), today()));
  switch (kind) {
    case "next-period": return [{ label: "Estimated next period", value: fmtDate(addDays(d("lastPeriod"), x("cycleLength"))) }];
    case "period-duration": return [{ label: "Bleeding duration", value: `${x("days")} days` }, { label: "Reference", value: x("days") <= 7 ? "Within a common reference" : "Longer than a common reference; discuss persistent changes" }];
    case "cycle-day": return [{ label: "Estimated cycle day", value: `${Math.min(x("cycleLength"), ageDays("lastPeriod") + 1)}` }];
    case "ovulation": { const ov = addDays(d("lastPeriod"), x("cycleLength") - 14); return [{ label: "Estimated ovulation", value: fmtDate(ov) }]; }
    case "conception-date": return [{ label: "Estimated conception", value: fmtDate(addDays(d("dueDate"), -266)) }];
    case "fertile-window": { const ov = addDays(d("lastPeriod"), x("cycleLength") - 14); return [{ label: "Estimated fertile window", value: `${fmtDate(addDays(ov, -5))} - ${fmtDate(addDays(ov, 1))}` }]; }
    case "cycle-length": return [{ label: "Cycle length", value: `${Math.max(0, daysBetween(d("start"), d("end")))} days` }];
    case "due": return [{ label: "Estimated due date", value: fmtDate(addDays(d("lastPeriod"), 280)) }];
    case "gestation": { const days = ageDays("lastPeriod"); return [{ label: "Gestational age", value: `${Math.floor(days / 7)} weeks ${days % 7} days` }]; }
    case "trimester": { const weeks = Math.floor(ageDays("lastPeriod") / 7); return [{ label: "Estimated trimester", value: weeks < 14 ? "First" : weeks < 28 ? "Second" : "Third" }]; }
    case "transfer-due": return [{ label: "Estimated due date", value: fmtDate(addDays(d("transferDate") || d("iuiDate"), d("transferDate") ? 266 - x("embryoAge") : 266)) }];
    case "pregnancy-bmi": case "bmi": { const z = bmi(x("weight"), x("height")); return [{ label: "BMI", value: round(z, 1).toString() }, { label: "Reference category", value: z < 18.5 ? "Below adult reference" : z < 25 ? "Adult reference range" : z < 30 ? "Above adult reference" : "Higher adult BMI range" }]; }
    case "pregnancy-weight-gain": { const z = x("bmi"); return [{ label: "Singleton pregnancy reference", value: z < 18.5 ? "28–40 lb (12.5–18 kg)" : z < 25 ? "25–35 lb (11.5–16 kg)" : z < 30 ? "15–25 lb (7–11.5 kg)" : "11–20 lb (5–9 kg)" }]; }
    case "pregnancy-calories": { const base = bmr(x("weight"), x("height"), x("age")) * 1.375; const add = ({ "1": 0, "2": 340, "3": 452 } as Record<string, number>)[v.trimester] ?? 0; return [{ label: "Estimated daily energy", value: `${round(base + add)} kcal`, detail: `Includes a ${add} kcal trimester reference addition; discuss personal needs with your prenatal clinician.` }]; }
    case "baby-age": { const days = ageDays("birthDate"); return [{ label: "Age", value: `${days} days` }, { label: "Approximate weeks", value: `${Math.floor(days / 7)}` }, { label: "Approximate months", value: `${round(days / 30.4375, 1)}` }]; }
    case "postpartum-week": return [{ label: "Postpartum age", value: `${Math.floor(ageDays("birthDate") / 7)} weeks` }];
    case "corrected-age": return [{ label: "Corrected age", value: `${Math.max(0, Math.floor(ageDays("birthDate") / 7) - x("weeksEarly"))} weeks` }];
    case "baby-sleep": { const m = x("ageMonths"); return [{ label: "Broad 24-hour range", value: `${m < 3 ? "14-17" : m < 12 ? "12-16" : "11-14"} hours` }]; }
    case "breastfeeding-hydration": case "water": case "menopause-hydration": case "skin-hydration": return [{ label: "Estimated fluid reference", value: `${round(x("weight") * 35)} mL/day`, detail: "Fluid needs vary; thirst, climate, activity and clinician advice matter." }];
    case "breastfeeding-calories": { const allowance = v.feeding === "exclusive" ? 330 : 400; return [{ label: "Estimated daily energy", value: `${round(bmr(x("weight"), x("height"), x("age")) * 1.375 + allowance)} kcal`, detail: `Uses a ${allowance} kcal lactation reference allowance, not a universal value.` }]; }
    case "lactation-protein": return [{ label: "Estimated protein", value: `${round(x("weight") * 1.3)} g/day` }];
    case "milk-storage": return [{ label: "Refrigerator guidance", value: v.state === "fresh" ? "Use within 4 days" : "Use within 4 days of first chilling" }];
    case "bmr": return [{ label: "Estimated BMR", value: `${round(bmr(x("weight"), x("height"), x("age")))} kcal/day` }];
    case "tdee": return [{ label: "Estimated daily expenditure", value: `${round(bmr(x("weight"), x("height"), x("age")) * x("activity"))} kcal/day` }];
    case "deficit": { const t = bmr(x("weight"), x("height"), x("age")) * 1.375; return [{ label: "Estimated maintenance", value: `${round(t)} kcal/day` }, { label: "Illustrative target", value: `${round(Math.max(1200, t - x("deficit")))} kcal/day` }]; }
    case "ideal-weight": return [{ label: "Adult BMI reference range", value: `${round(18.5 * (x("height") / 100) ** 2, 1)}-${round(24.9 * (x("height") / 100) ** 2, 1)} kg` }];
    case "body-fat": return [{ label: "Estimated body fat", value: `${round(1.2 * bmi(x("weight"), x("height")) + 0.23 * x("age") - 10.8 - 5.4, 1)}%` }];
    case "waist-height": { const z = x("waist") / x("height"); return [{ label: "Waist-to-height ratio", value: round(z, 2).toString() }]; }
    case "heart-rate": { const max = 208 - 0.7 * x("age"); return [{ label: "Estimated maximum", value: `${round(max)} bpm` }, { label: "Moderate zone", value: `${round(max * .5)}-${round(max * .7)} bpm` }]; }
    case "training-calories": return [{ label: "Estimated exercise energy", value: `${round(x("met") * 3.5 * x("weight") / 200 * x("minutes"))} kcal` }];
    case "protein": return [{ label: "Estimated protein", value: `${round(x("weight") * x("factor"))} g/day` }];
    case "fiber": return [{ label: "Fiber reference", value: `${x("age") <= 50 ? 25 : 21} g/day` }];
    case "iron": return [{ label: "Iron reference", value: `${v.stage === "pregnant" ? 27 : v.stage === "lactating" ? 9 : 18} mg/day` }];
    case "calcium": return [{ label: "Calcium reference", value: `${x("age") >= 51 ? 1200 : 1000} mg/day` }];
    case "vitamin-d": return [{ label: "Vitamin D reference", value: "600 IU (15 µg)/day" }];
    case "macros": return [{ label: "Carbohydrate", value: `${round(x("calories") * .45 / 4)} g/day` }, { label: "Fat", value: `${round(x("calories") * .30 / 9)} g/day` }, { label: "Protein", value: `${round(x("calories") * .25 / 4)} g/day` }];
    case "symptoms": { const total = Object.values(v).reduce((s, z) => s + Number(z || 0), 0); return [{ label: "Symptom impact", value: `${total}/12` }]; }
    case "cycle-variation": return [{ label: "Cycle variation", value: `${Math.max(0, x("longest") - x("shortest"))} days` }];
    case "sleep": return [{ label: "Sleep reference", value: x("hours") >= 7 && x("hours") <= 9 ? "Within the broad 7-9 hour reference" : "Outside the broad 7-9 hour reference" }];
    case "sleep-debt": return [{ label: "Estimated weekly sleep debt", value: `${round(Math.max(0, 8 - x("hours")) * x("nights"), 1)} hours` }];
    case "stress": return [{ label: "Average support score", value: `${round((x("sleep") + x("movement") + x("support")) / 3, 1)}/10` }];
  }
}
const data: Calculator[] = specs.map(([id, title, slug, category, kind, description, fields, related]) => ({
  id, title, slug, category, description, fields, related, status: "active" as const,
  keywords: [title.toLowerCase(), category.toLowerCase(), "calculator"],
  calculate: (v) => calculate(kind, v),
  methodology: `${title} is a transparent educational estimate based on the inputs shown. It cannot diagnose, predict an individual outcome, or replace professional care. Results can differ with health conditions, medications, age and context.`,
  faq,
  tests: ["valid inputs return a finite, labelled result", "out-of-range inputs are rejected by the form"],
}));
export const calculators = data;
export const bySlug = (slug: string) => calculators.find((c) => c.slug === slug);

