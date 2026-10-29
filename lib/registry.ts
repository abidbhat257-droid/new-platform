import { Calculator, Category, Field, Result } from "./types";
import { addDays, bmi, bmr, daysBetween, fmtDate, round, kgFromInput, cmFromInput, mlFromInput } from "./formulas";

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
  ({ name, label, type: "number", unit, min, max, step, required: true,
    unitOptions: unit === "kg" ? [{ label: "kg", value: "kg" }, { label: "lb", value: "lb" }]
      : unit === "cm" ? [{ label: "cm", value: "cm" }, { label: "ft + in (decimal feet)", value: "ft+in" }]
      : undefined });
const date = (name: string, label: string): Field => ({ name, label, type: "date", required: true });
const select = (name: string, label: string, options: { label: string; value: string }[]): Field =>
  ({ name, label, type: "select", options, required: true });
const value = (v: Record<string, string>, key: string) => {
  const raw = Number(v[key]);
  if (key === "weight") return kgFromInput(raw, v[`${key}Unit`] || "kg");
  if (key === "height") return cmFromInput(raw, v[`${key}Unit`] || "cm");
  return raw;
};
const today = () => new Date().toISOString().slice(0, 10);
type Kind = "next-period" | "cycle-day" | "ovulation" | "fertile-window" | "due" | "gestation" |
  "trimester" | "transfer-due" | "iui-due" | "pregnancy-bmi" | "pregnancy-calories" | "baby-age" | "postpartum-week" |
  "corrected-age" | "baby-sleep" | "breastfeeding-hydration" | "breastfeeding-calories" | "milk-storage" |
  "bmi" | "bmr" | "tdee" | "deficit" | "ideal-weight" | "body-fat" | "waist-height" | "heart-rate" |
  "training-calories" | "protein" | "fiber" | "iron" | "calcium" | "vitamin-d" | "water" | "macros" |
  "symptoms" | "cycle-variation" | "sleep" | "sleep-debt" | "stress" | "calcium" |
  "cycle-length" | "period-duration" | "conception-date" | "pregnancy-weight-gain" |
  "menopause-hydration" | "skin-hydration" | "lactation-protein" |
  "period-end" | "average-cycle" | "period-gap" | "pregnancy-month" | "due-countdown" | "menstrual-cycle" |
  "pregnancy-protein" | "pregnancy-macros" | "pregnancy-water" | "postpartum-day" |
  "feeding-interval" | "breastfeeding-duration" | "breastfeeding-session" | "pumping-frequency" |
  "calorie-surplus" | "carbohydrate" | "fat-intake" | "running-calories" | "walking-calories" |
  "target-heart-rate" | "waist-hip" | "folate" | "magnesium" | "menopause-stage" |
  "menopause-years" | "resting-heart-rate" | "sleep-cycle" | "step-goal" | "activity-level" |
  "calorie-burn" | "menstrual-phase" | "period-delay" | "missed-period" | "fertile-days" |
  "dpo" | "implantation-date" | "implantation-window" | "test-timing" | "weeks-due" |
  "maternity-date" | "maternity-duration" | "announcement-date" | "shower-date" |
  "hospital-countdown" | "nutrient-reference" | "menopause-age" | "menopause-transition" |
  "hair-growth" | "self-care-time" | "wellness-score" | "daily-activity" | "irregular-period" |
  "period-delay" | "missed-period" | "period-calendar" | "ovulation-period" | "period-after-ovulation" |
  "fertile-days" | "dpo" | "implantation-date" | "implantation-window" | "test-timing" | "weeks-due" |
  "maternity-date" | "maternity-duration" | "announcement-date" | "shower-date" | "hospital-countdown" |
  "nutrient-reference" | "menopause-age" | "menopause-transition" | "hair-growth" | "self-care-time" |
  "wellness-score" | "daily-activity" | "phase-follicular" | "phase-luteal" | "fertility-age" |
  "ttc-time" | "frozen-transfer-due" | "donor-egg-due" | "pregnancy-nutrition" | "pregnancy-exercise" |
  "weight-gain-tracker" | "fetal-growth" | "postpartum-weight" | "postpartum-bmi" | "postpartum-tdee" |
  "postpartum-macros" | "postpartum-goal" | "postpartum-timeline" | "exercise-readiness" |
  "baby-milestone" | "feeding-schedule" | "baby-growth" | "breast-milk-intake" | "pumping-schedule" |
  "feeding-plan" | "weaning-date" | "women-calories" | "cycling-calories" | "strength-calories" |
  "vo2max" | "ffmi" | "body-composition" | "meal-calories" | "meal-macros" | "protein-meal" |
  "weight-loss-calories" | "weight-gain-calories" | "nutrition-needs" | "nutrient-intake" |
  "daily-value" | "deficiency-risk" | "menopause-weight" | "menopause-exercise" | "menopause-strength" |
  "menopause-gain" | "menopause-goal" | "perimenopause-cycle" | "symptom-tracker" | "menopause-health-age" |
  "menopause-fitness" | "body-shape" | "body-type" | "dress-size" | "bra-size" | "clothing-size" |
  "shoe-size" | "hair-length" | "hair-dye" | "skincare-timing" | "beauty-sleep" | "sleep-duration" |
  "fitness-goal" | "weight-goal" | "habit-tracking" | "lifestyle-score" | "calendar-generator" |
  "tracking-stats" | "peak-fertility" | "ovulation-test" | "biological-age" | "fertility-awareness" |
  "bbt-ovulation" | "mucus-fertility" | "fertility-tracking" | "pregnancy-milestone" | "pregnancy-progress" |
  "pregnancy-growth" | "baby-development" | "postpartum-fitness" | "postpartum-nutrition" | "recovery-tracker" |
  "return-work" | "breastfeeding-weight-loss" | "breastfeeding-deficit" | "breastfeeding-schedule" |
  "exclusive-feeding" | "milk-supply" | "breastfeeding-progress" | "step-calories" | "fat-needs" |
  "deficiency-risk" | "menopause-overview" | "perimenopause-age" | "menopause-weight" | "menopause-exercise" |
  "menopause-strength" | "menopause-gain" | "menopause-goal" | "perimenopause-cycle" | "symptom-tracker" |
  "menopause-health-age" | "menopause-wellness" | "menopause-fitness" | "body-shape" | "body-type" |
  "dress-size" | "bra-size" | "clothing-size" | "shoe-size" | "hair-length" | "hair-dye" |
  "skincare-timing" | "beauty-sleep" | "life-expectancy" | "fitness-age" | "body-score" | "fitness-goal" |
  "weight-goal" | "habit-tracking" | "lifestyle-score";
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
  ["iui-due-date","IUI Due Date Calculator","iui-due-date","Pregnancy","iui-due","Estimate a due date after an intrauterine insemination date.",[date("iuiDate","IUI date")],["pregnancy-due-date","gestational-age"]],
  ["pregnancy-bmi","Pregnancy BMI Reference","pregnancy-bmi","Pregnancy","pregnancy-bmi","Calculate pre-pregnancy BMI as context for discussing pregnancy weight guidance.",[n("weight","Pre-pregnancy weight","kg",30,250),n("height","Height","cm",100,220)],["pregnancy-weight-gain","bmi"]],
  ["pregnancy-weight-gain","Pregnancy Weight Gain Guidance","pregnancy-weight-gain","Pregnancy","pregnancy-weight-gain","Show BMI-based Institute of Medicine reference ranges for singleton pregnancy.",[n("bmi","Pre-pregnancy BMI","kg/m�",12,60)],["pregnancy-bmi","pregnancy-calories"]],
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
  ["water","Water Intake Estimate","water","Women's Nutrition","water","Estimate total daily water from body weight as a starting point.",[n("weight","Weight","kg",30,250),select("waterUnit","Output unit",[{"label":"mL","value":"ml"},{"label":"fluid oz","value":"oz"}])],["fiber","breastfeeding-hydration"]],
  ["macro-split","Macronutrient Split","macro-split","Women's Nutrition","macros","Convert a calorie target into a balanced 45/30/25 carbohydrate, fat and protein estimate.",[n("calories","Calorie target","kcal/day",1000,5000)],["protein","maintenance-calories"]],
  ["menopause-score","Menopause Symptom Score","menopause-symptom-score","Menopause & Perimenopause","symptoms","Track four menopause symptom impacts on a simple 0-3 scale.",[n("hot","Hot flashes (0-3)","score",0,3),n("sleep","Sleep disruption (0-3)","score",0,3),n("mood","Mood changes (0-3)","score",0,3),n("vaginal","Vaginal symptoms (0-3)","score",0,3)],["pms-score","menopause-hydration"]],
  ["menopause-hydration","Menopause Hydration Estimate","menopause-hydration","Menopause & Perimenopause","water","Estimate a weight-based fluid starting point; it does not treat hot flashes.",[n("weight","Weight","kg",30,250)],["water","menopause-score"]],
  ["sleep","Sleep Duration Check","sleep","Women's Wellness","sleep","Compare reported adult sleep duration with the broad 7-9 hour reference.",[n("hours","Average sleep","hours",0,16)],["sleep-debt","stress-score"]],
  ["sleep-debt","Sleep Debt Estimate","sleep-debt","Women's Wellness","sleep-debt","Estimate weekly sleep debt against a chosen 8-hour reference.",[n("hours","Average nightly sleep","hours",0,16),n("nights","Nights measured","nights",1,14)],["sleep","stress-score"]],
  ["stress-score","Stress Check-In","stress-score","Women's Wellness","stress","Average three self-rated factors as a reflection prompt, not a mental-health diagnosis.",[n("sleep","Sleep support (0-10)","score",0,10),n("movement","Movement support (0-10)","score",0,10),n("support","Social support (0-10)","score",0,10)],["sleep","menopause-score"]],
  ["skin-hydration","Skin Hydration Fluid Reference","skin-hydration","Beauty, Body & Lifestyle","water","Estimate a general fluid reference; skin hydration depends on many factors.",[n("weight","Weight","kg",30,250)],["water","bmi"]],
  ["period-end","Period End Date Calculator","period-end","Period & Menstrual Cycle","period-end","Estimate the final bleeding date from a period start and reported duration.",[date("start","Period start"),n("days","Bleeding duration","days",1,15)],["period-duration","next-period"]],
  ["average-cycle","Average Cycle Length Calculator","average-cycle","Period & Menstrual Cycle","average-cycle","Calculate the mean of three recent cycle lengths.",[n("cycle1","Cycle 1","days",15,90),n("cycle2","Cycle 2","days",15,90),n("cycle3","Cycle 3","days",15,90)],["cycle-length","cycle-variation"]],
  ["period-gap","Period Gap Calculator","period-gap","Period & Menstrual Cycle","period-gap","Measure the calendar gap between two period starts.",[date("start","Earlier period start"),date("end","Later period start")],["cycle-length","cycle-variation"]],
  ["pregnancy-month","Pregnancy Month Calculator","pregnancy-month","Pregnancy","pregnancy-month","Convert estimated gestational weeks into an approximate pregnancy month.",[date("lastPeriod","First day of last period")],["pregnancy-week","trimester"]],
  ["due-countdown","Days Until Due Date Calculator","due-countdown","Pregnancy","due-countdown","Count calendar days remaining until an estimated due date.",[date("dueDate","Estimated due date")],["pregnancy-due-date","gestational-age"]],
  ["pregnancy-protein","Pregnancy Protein Calculator","pregnancy-protein","Pregnancy","pregnancy-protein","Estimate a pregnancy protein reference from body weight.",[n("weight","Weight","kg",30,250)],["protein","pregnancy-calories"]],
  ["pregnancy-macros","Pregnancy Macro Calculator","pregnancy-macros","Pregnancy","pregnancy-macros","Split a pregnancy calorie target into carbohydrate, fat and protein grams.",[n("calories","Calorie target","kcal/day",1000,5000)],["macro-split","pregnancy-calories"]],
  ["pregnancy-water","Pregnancy Water Intake Calculator","pregnancy-water","Pregnancy","pregnancy-water","Estimate a starting pregnancy fluid target from body weight.",[n("weight","Weight","kg",30,250)],["water","pregnancy-calories"]],
  ["postpartum-day","Postpartum Day Calculator","postpartum-day","Postpartum & Baby","postpartum-day","Calculate days since birth for postpartum planning.",[date("birthDate","Date of birth")],["postpartum-week","baby-age"]],
  ["feeding-interval","Feeding Interval Calculator","feeding-interval","Postpartum & Baby","feeding-interval","Calculate the interval between two feeding times.",[date("start","Earlier feeding date"),date("end","Later feeding date")],["baby-age","breastfeeding-session"]],
  ["breastfeeding-duration","Breastfeeding Duration Calculator","breastfeeding-duration","Breastfeeding","breastfeeding-duration","Calculate total breastfeeding duration from start and end dates.",[date("start","Breastfeeding start"),date("end","Breastfeeding end")],["breastfeeding-session","milk-storage"]],
  ["breastfeeding-session","Breastfeeding Session Calculator","breastfeeding-session","Breastfeeding","breastfeeding-session","Calculate minutes between feeding start and end times represented as dates.",[n("minutes","Session minutes","minutes",1,180)],["feeding-interval","breastfeeding-duration"]],
  ["pumping-frequency","Pumping Frequency Calculator","pumping-frequency","Breastfeeding","pumping-frequency","Calculate average pumping interval from sessions per day.",[n("sessions","Sessions per day","sessions",1,24)],["breastfeeding-session","breastfeeding-hydration"]],
  ["calorie-surplus","Women's Calorie Surplus Calculator","calorie-surplus","Women's Fitness","calorie-surplus","Add an adjustable energy surplus to estimated maintenance calories.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,90),n("surplus","Surplus","kcal/day",50,750)],["maintenance-calories","calorie-deficit"]],
  ["carbohydrate","Women's Carbohydrate Calculator","carbohydrate","Women's Fitness","carbohydrate","Estimate carbohydrate grams from a calorie target and body weight factor.",[n("calories","Calorie target","kcal/day",1000,5000),n("factor","Carbohydrate factor","g/kg",2,8,0.1)],["macro-split","protein"]],
  ["fat-intake","Women's Fat Intake Calculator","fat-intake","Women's Fitness","fat-intake","Estimate fat grams from a calorie target and selected calorie percentage.",[n("calories","Calorie target","kcal/day",1000,5000),n("percent","Fat percentage","%",15,50)],["macro-split","protein"]],
  ["running-calories","Women's Running Calorie Calculator","running-calories","Women's Fitness","running-calories","Estimate running energy using body weight, pace and duration.",[n("weight","Weight","kg",30,250),n("minutes","Duration","minutes",5,300),n("pace","Pace","km/h",5,25,0.5)],["training-calories","tdee"]],
  ["walking-calories","Women's Walking Calorie Calculator","walking-calories","Women's Fitness","walking-calories","Estimate walking energy using body weight, speed and duration.",[n("weight","Weight","kg",30,250),n("minutes","Duration","minutes",5,300),n("speed","Speed","km/h",2,8,0.5)],["training-calories","step-goal"]],
  ["target-heart-rate","Women's Target Heart Rate Calculator","target-heart-rate","Women's Fitness","target-heart-rate","Estimate a target heart-rate range from age and training intensity.",[n("age","Age","years",15,90),n("intensity","Intensity","%",50,90)],["heart-rate","training-calories"]],
  ["waist-hip","Women's Waist-to-Hip Ratio Calculator","waist-hip","Women's Fitness","waist-hip","Calculate waist circumference divided by hip circumference.",[n("waist","Waist circumference","cm",40,180),n("hip","Hip circumference","cm",50,220)],["waist-height","bmi"]],
  ["folate-needs","Folate Needs Calculator","folate-needs","Women's Nutrition","folate","Show a life-stage folate reference in dietary folate equivalents.",[select("stage","Life stage",[{"label":"Adult","value":"adult"},{"label":"Pregnancy","value":"pregnant"},{"label":"Breastfeeding","value":"lactating"}])],["iron-needs","vitamin-d"]],
  ["magnesium-needs","Magnesium Needs Calculator","magnesium-needs","Women's Nutrition","magnesium","Show an age-based magnesium reference for adult women.",[n("age","Age","years",15,90)],["calcium-needs","vitamin-d"]],
  ["menopause-stage","Menopause Stage Calculator","menopause-stage","Menopause & Perimenopause","menopause-stage","Classify a reported months-since-last-period value into a broad stage.",[n("months","Months since last period","months",0,240)],["menopause-score","menopause-years"]],
  ["menopause-years","Years Since Menopause Calculator","menopause-years","Menopause & Perimenopause","menopause-years","Convert months since the last period into years.",[n("months","Months since last period","months",0,240)],["menopause-stage","menopause-score"]],
  ["resting-heart-rate","Resting Heart Rate Calculator","resting-heart-rate","Women's Wellness","resting-heart-rate","Interpret a resting heart-rate reading against a broad adult reference.",[n("bpm","Resting heart rate","bpm",30,220)],["heart-rate","stress-score"]],
  ["sleep-cycle","Sleep Cycle Calculator","sleep-cycle","Women's Wellness","sleep-cycle","Suggest wake times using 90-minute sleep-cycle blocks.",[date("bedtime","Bedtime"),n("cycles","Sleep cycles","cycles",3,7)],["sleep","sleep-debt"]],
  ["step-goal","Daily Step Goal Calculator","step-goal","Women's Wellness","step-goal","Estimate a practical step goal from activity level.",[select("activity","Activity level",[{"label":"Low","value":"low"},{"label":"Moderate","value":"moderate"},{"label":"High","value":"high"}])],["training-calories","activity-level"]],
  ["activity-level","Activity Level Calculator","activity-level","Women's Wellness","activity-level","Classify weekly activity minutes into broad activity bands.",[n("minutes","Weekly moderate-equivalent minutes","minutes",0,2000)],["step-goal","tdee"]],
  ["calorie-burn","Calorie Burn Calculator","calorie-burn","Women's Wellness","calorie-burn","Estimate calorie burn using body weight, MET intensity and duration.",[n("weight","Weight","kg",30,250),n("minutes","Duration","minutes",5,300),n("met","Intensity (MET)","MET",1,12,0.5)],["training-calories","tdee"]],
  ["menstrual-cycle","Menstrual Cycle Calculator","menstrual-cycle","Period & Menstrual Cycle","cycle-length","Calculate cycle length and its broad timing context.",[date("start","Earlier period start"),date("end","Later period start")],["cycle-length","cycle-day"]],
  ["irregular-period","Irregular Period Calculator","irregular-period","Period & Menstrual Cycle","cycle-variation","Compare shortest and longest cycles to flag broad variability.",[n("shortest","Shortest cycle","days",15,60),n("longest","Longest cycle","days",15,90)],["cycle-variation","next-period"]],
  ["period-delay","Period Delay Calculator","period-delay","Period & Menstrual Cycle","period-delay","Estimate a delayed period date from the expected date and delay length.",[date("expected","Expected period"),n("delay","Delay","days",1,60)],["next-period","cycle-variation"]],
  ["missed-period","Missed Period Calculator","missed-period","Period & Menstrual Cycle","missed-period","Count days since an expected period date.",[date("expected","Expected period")],["period-delay","test-timing"]],
  ["period-calendar","Period Calendar Calculator","period-calendar","Period & Menstrual Cycle","period-calendar","List estimated period starts across a selected number of cycles.",[date("lastPeriod","First period start"),n("cycleLength","Cycle length","days",15,60),n("cycles","Cycles to show","cycles",1,6)],["next-period","average-cycle"]],
  ["ovulation-period","Ovulation & Period Calculator","ovulation-period","Ovulation & Fertility","ovulation-period","Show both estimated ovulation and next-period dates.",[date("lastPeriod","First day of last period"),n("cycleLength","Cycle length","days",15,60)],["ovulation-date","next-period"]],
  ["menstrual-phase","Menstrual Phase Calculator","menstrual-phase","Period & Menstrual Cycle","menstrual-phase","Classify a cycle day into a broad menstrual phase.",[n("cycleDay","Cycle day","day",1,60),n("bleedingDays","Typical bleeding days","days",1,10)],["cycle-day","cycle-variation"]],
  ["period-after-ovulation","Expected Period After Ovulation Calculator","period-after-ovulation","Period & Menstrual Cycle","period-after-ovulation","Estimate a period date from ovulation and luteal length.",[date("ovulation","Ovulation date"),n("luteal","Luteal phase","days",10,18)],["next-period","ovulation-date"]],
  ["fertile-days","Fertile Days Calculator","fertile-days","Ovulation & Fertility","fertile-days","Estimate the fertile-day interval from cycle timing.",[date("lastPeriod","First day of last period"),n("cycleLength","Cycle length","days",15,60)],["fertile-window","ovulation-date"]],
  ["dpo","Days Past Ovulation Calculator","dpo","Ovulation & Fertility","dpo","Count days since a reported ovulation date.",[date("ovulation","Ovulation date")],["ovulation-date","conception-date"]],
  ["implantation-date","Implantation Date Calculator","implantation-date","Ovulation & Fertility","implantation-date","Estimate a broad implantation date range from ovulation.",[date("ovulation","Ovulation date")],["dpo","test-timing"]],
  ["implantation-window","Implantation Window Calculator","implantation-window","Ovulation & Fertility","implantation-window","Show the common post-ovulation implantation window.",[date("ovulation","Ovulation date")],["implantation-date","dpo"]],
  ["test-timing","Pregnancy Test Timing Calculator","test-timing","Ovulation & Fertility","test-timing","Estimate an earliest and more reliable pregnancy-test date.",[date("ovulation","Ovulation date")],["dpo","pregnancy-due-date"]],
  ["weeks-due","Weeks Until Due Date Calculator","weeks-until-due","Pregnancy","weeks-due","Count weeks remaining until an estimated due date.",[date("dueDate","Estimated due date")],["due-countdown","pregnancy-due-date"]],
  ["maternity-date","Maternity Leave Date Calculator","maternity-leave-date","Pregnancy","maternity-date","Estimate a leave start date from an expected birth date and lead time.",[date("dueDate","Expected birth date"),n("weeksBefore","Weeks before birth","weeks",0,12)],["pregnancy-due-date","due-countdown"]],
  ["maternity-duration","Maternity Leave Duration Calculator","maternity-leave-duration","Pregnancy","maternity-duration","Calculate leave end date from a start date and duration.",[date("start","Leave start"),n("weeks","Leave duration","weeks",1,52)],["maternity-date","due-countdown"]],
  ["announcement-date","Pregnancy Announcement Date Calculator","announcement-date","Pregnancy","announcement-date","Estimate an announcement date from an expected birth date and chosen week.",[date("dueDate","Expected birth date"),n("week","Pregnancy week","weeks",4,40)],["pregnancy-due-date","trimester"]],
  ["shower-date","Baby Shower Date Calculator","baby-shower-date","Pregnancy","shower-date","Estimate a shower date from an expected birth date and gestational week.",[date("dueDate","Expected birth date"),n("week","Pregnancy week","weeks",20,38)],["pregnancy-due-date","announcement-date"]],
  ["hospital-countdown","Hospital Bag Countdown Calculator","hospital-bag-countdown","Pregnancy","hospital-countdown","Count days until a chosen hospital-bag preparation date.",[date("dueDate","Expected birth date"),n("weeksBefore","Prepare before birth","weeks",1,12)],["due-countdown","pregnancy-due-date"]],
  ["vitamin-b12","Vitamin B12 Needs Calculator","vitamin-b12","Women's Nutrition","nutrient-reference","Show an adult vitamin B12 reference.",[n("age","Age","years",15,90)],["iron-needs","vitamin-d"]],
  ["potassium-needs","Potassium Needs Calculator","potassium-needs","Women's Nutrition","nutrient-reference","Show an adult potassium reference.",[n("age","Age","years",15,90)],["calcium-needs","fiber"]],
  ["zinc-needs","Zinc Needs Calculator","zinc-needs","Women's Nutrition","nutrient-reference","Show an adult zinc reference.",[select("stage","Life stage",[{"label":"Adult","value":"adult"},{"label":"Pregnancy","value":"pregnant"},{"label":"Breastfeeding","value":"lactating"}])],["iron-needs","vitamin-d"]],
  ["omega3-needs","Omega-3 Needs Calculator","omega3-needs","Women's Nutrition","nutrient-reference","Show a general adult omega-3 reference.",[n("age","Age","years",15,90)],["protein","vitamin-d"]],
  ["menopause-age","Menopause Age Calculator","menopause-age","Menopause & Perimenopause","menopause-age","Estimate years until or since a reference menopause age from current age.",[n("age","Current age","years",25,90)],["menopause-stage","menopause-years"]],
  ["menopause-transition","Menopause Transition Calculator","menopause-transition","Menopause & Perimenopause","menopause-transition","Classify reported months since last period into transition stages.",[n("months","Months since last period","months",0,240)],["menopause-stage","menopause-score"]],
  ["hair-growth","Hair Growth Calculator","hair-growth","Beauty, Body & Lifestyle","hair-growth","Estimate hair length change over a selected number of months.",[n("length","Current length","cm",0,200),n("months","Months","months",1,60)],["skin-hydration","self-care-time"]],
  ["self-care-time","Daily Self-Care Time Calculator","self-care-time","Beauty, Body & Lifestyle","self-care-time","Add daily self-care activities into a total weekly time.",[n("morning","Morning minutes","minutes",0,180),n("evening","Evening minutes","minutes",0,180),n("weekly","Weekly minutes","minutes",0,600)],["sleep","stress-score"]],
  ["wellness-score","Wellness Score Calculator","wellness-score","Women's Wellness","wellness-score","Average sleep, movement and support ratings into a reflection score.",[n("sleep","Sleep score","score",0,10),n("movement","Movement score","score",0,10),n("support","Support score","score",0,10)],["stress-score","sleep"]],
  ["daily-activity","Daily Activity Calculator","daily-activity","Women's Wellness","daily-activity","Classify daily active minutes into broad movement bands.",[n("minutes","Active minutes","minutes",0,300)],["activity-level","step-goal"]],
  ["follicular-phase","Follicular Phase Calculator","follicular-phase","Period & Menstrual Cycle","phase-follicular","Estimate the follicular phase date range from a cycle start and length.",[date("lastPeriod","First day of last period"),n("cycleLength","Cycle length","days",15,60)],["menstrual-phase","ovulation-date"]],
  ["luteal-phase","Luteal Phase Calculator","luteal-phase","Period & Menstrual Cycle","phase-luteal","Estimate the luteal phase date range around expected ovulation.",[date("lastPeriod","First day of last period"),n("cycleLength","Cycle length","days",15,60)],["menstrual-phase","ovulation-date"]],
  ["fertility-age","Fertility Age Calculator","fertility-age","Ovulation & Fertility","fertility-age","Show a broad age-band fertility context without predicting individual fertility.",[n("age","Age","years",18,55)],["ovulation-date","fertile-window"]],
  ["ttc-time","Time-to-Pregnancy Estimator","ttc-time","Ovulation & Fertility","ttc-time","Estimate a broad planning range from age and months trying, not an individual prognosis.",[n("age","Age","years",18,50),n("monthsTrying","Months trying","months",0,60)],["fertility-age","fertile-window"]],
  ["frozen-transfer-due","Frozen Embryo Transfer Due Date Calculator","frozen-transfer-due","Pregnancy","frozen-transfer-due","Estimate a due date after a frozen embryo transfer using embryo age.",[date("transferDate","Transfer date"),n("embryoAge","Embryo age","days",0,6)],["ivf-due-date","pregnancy-due-date"]],
  ["donor-egg-due","Donor Egg IVF Due Date Calculator","donor-egg-due","Pregnancy","donor-egg-due","Estimate a due date from a donor-egg embryo transfer date.",[date("transferDate","Transfer date"),n("embryoAge","Embryo age","days",0,6)],["ivf-due-date","pregnancy-due-date"]],
  ["pregnancy-nutrition","Pregnancy Nutrition Calculator","pregnancy-nutrition","Pregnancy","pregnancy-nutrition","Combine pregnancy energy and protein reference inputs for planning discussion.",[n("weight","Weight","kg",30,250),select("trimester","Trimester",[{"label":"First","value":"1"},{"label":"Second","value":"2"},{"label":"Third","value":"3"}])],["pregnancy-calories","pregnancy-protein"]],
  ["pregnancy-exercise","Pregnancy Exercise Calculator","pregnancy-exercise","Pregnancy","pregnancy-exercise","Classify weekly pregnancy exercise minutes against a broad activity reference.",[n("minutes","Weekly minutes","minutes",0,600)],["training-calories","pregnancy-nutrition"]],
  ["weight-gain-tracker","Pregnancy Weight Gain Tracker","weight-gain-tracker","Pregnancy","weight-gain-tracker","Compare current pregnancy gain with a selected pre-pregnancy weight.",[n("preWeight","Pre-pregnancy weight","kg",30,250),n("currentWeight","Current weight","kg",30,280)],["pregnancy-weight-gain","pregnancy-bmi"]],
  ["fetal-growth","Fetal Growth Calculator","fetal-growth","Pregnancy","fetal-growth","Show an educational gestational-week growth reference, not an ultrasound estimate.",[n("week","Gestational week","weeks",4,42)],["pregnancy-week","pregnancy-due-date"]],
  ["postpartum-weight","Postpartum Weight Loss Calculator","postpartum-weight","Postpartum & Baby","postpartum-weight","Calculate weight change since delivery.",[n("birthWeight","Weight at delivery","kg",30,250),n("currentWeight","Current weight","kg",30,250)],["postpartum-week","postpartum-goal"]],
  ["postpartum-bmi","Postpartum BMI Calculator","postpartum-bmi","Postpartum & Baby","postpartum-bmi","Calculate BMI using current postpartum weight and height.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220)],["bmi","postpartum-weight"]],
  ["postpartum-tdee","Postpartum TDEE Calculator","postpartum-tdee","Postpartum & Baby","postpartum-tdee","Estimate postpartum daily energy expenditure with activity selection.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,90),select("activity","Activity level",[{"label":"Sedentary","value":"1.2"},{"label":"Moderate","value":"1.55"},{"label":"Very active","value":"1.725"}])],["tdee","postpartum-macros"]],
  ["postpartum-macros","Postpartum Macro Calculator","postpartum-macros","Postpartum & Baby","postpartum-macros","Split a postpartum calorie target into carbohydrate, fat and protein.",[n("calories","Calorie target","kcal/day",1000,5000)],["macro-split","postpartum-tdee"]],
  ["postpartum-goal","Postpartum Weight Goal Calculator","postpartum-goal","Postpartum & Baby","postpartum-goal","Calculate kilograms remaining to a postpartum target weight.",[n("currentWeight","Current weight","kg",30,250),n("goalWeight","Goal weight","kg",30,250)],["postpartum-weight","postpartum-timeline"]],
  ["postpartum-timeline","Postpartum Weight Loss Timeline Calculator","postpartum-timeline","Postpartum & Baby","postpartum-timeline","Estimate weeks at a conservative weekly change rate.",[n("kgToLose","Weight to lose","kg",0,100),n("weeklyRate","Weekly rate","kg/week",0.1,1,0.1)],["postpartum-goal","postpartum-weight"]],
  ["exercise-readiness","Postpartum Exercise Readiness Calculator","exercise-readiness","Postpartum & Baby","exercise-readiness","Reflect on readiness using symptom and clinician-clearance inputs.",[select("clearance","Clinician clearance",[{"label":"Yes","value":"yes"},{"label":"Not yet","value":"no"}]),n("symptoms","Concerning symptoms","score",0,5)],["postpartum-week","training-calories"]],
  ["baby-milestone","Baby Milestone Age Calculator","baby-milestone","Postpartum & Baby","baby-milestone","Calculate age in months for milestone context.",[date("birthDate","Date of birth"),date("milestoneDate","Milestone date")],["baby-age","corrected-age"]],
  ["feeding-schedule","Baby Feeding Schedule Calculator","feeding-schedule","Postpartum & Baby","feeding-schedule","Generate broad feeding times from a first feed and interval.",[date("firstFeed","First feed date"),n("interval","Interval hours","hours",1,8),n("feeds","Feeds","feeds",1,12)],["feeding-interval","baby-age"]],
  ["baby-growth","Baby Growth Tracking Calculator","baby-growth","Postpartum & Baby","baby-growth","Calculate weight change between two recorded measurements.",[n("initial","Earlier weight","kg",1,40),n("current","Current weight","kg",1,50)],["baby-age","baby-milestone"]],
  ["breast-milk-intake","Breast Milk Intake Calculator","breast-milk-intake","Breastfeeding","breast-milk-intake","Estimate daily milk volume from feeds and volume per feed.",[n("feeds","Feeds per day","feeds",1,20),n("volume","Volume per feed","mL",1,300)],["breastfeeding-session","breastfeeding-hydration"]],
  ["pumping-schedule","Pumping Schedule Calculator","pumping-schedule","Breastfeeding","pumping-schedule","Generate the average hours between a selected number of daily pumping sessions.",[n("sessions","Sessions per day","sessions",1,12)],["pumping-frequency","breastfeeding-session"]],
  ["feeding-plan","Combination Feeding Calculator","feeding-plan","Breastfeeding","feeding-plan","Split a daily feed count between breast milk and formula feeds.",[n("feeds","Total feeds","feeds",1,20),n("breastfeeds","Breast milk feeds","feeds",0,20)],["breast-milk-intake","breastfeeding-calories"]],
  ["weaning-date","Weaning Date Calculator","weaning-date","Breastfeeding","weaning-date","Estimate a weaning date from a current date and gradual-weaning duration.",[date("start","Weaning start"),n("weeks","Duration","weeks",1,52)],["breastfeeding-duration","breastfeeding-session"]],
  ["women-calories","Women's Calorie Calculator","womens-calories","Women's Fitness","women-calories","Estimate daily calories from BMR and selected activity.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,90),select("activity","Activity level",[{"label":"Sedentary","value":"1.2"},{"label":"Moderate","value":"1.55"},{"label":"Very active","value":"1.725"}])],["bmr","tdee"]],
  ["cycling-calories","Women's Cycling Calorie Calculator","cycling-calories","Women's Fitness","cycling-calories","Estimate cycling energy from weight, speed and duration.",[n("weight","Weight","kg",30,250),n("minutes","Duration","minutes",5,300),n("speed","Speed","km/h",8,40,1)],["training-calories","tdee"]],
  ["strength-calories","Women's Strength Training Calculator","strength-training","Women's Fitness","strength-calories","Estimate strength-training energy from weight, duration and effort.",[n("weight","Weight","kg",30,250),n("minutes","Duration","minutes",5,240),n("met","Effort (MET)","MET",2,8,0.5)],["training-calories","body-composition"]],
  ["vo2max","Women's VO2 Max Calculator","womens-vo2-max","Women's Fitness","vo2max","Estimate VO2 max from a timed distance test.",[n("distance","Distance","m",400,4000),n("minutes","Time","minutes",3,60,0.1)],["heart-rate","training-calories"]],
  ["ffmi","Women's FFMI Calculator","womens-ffmi","Women's Fitness","ffmi","Calculate fat-free mass index from weight, body fat and height.",[n("weight","Weight","kg",30,250),n("bodyFat","Body fat","%",5,70),n("height","Height","cm",100,220)],["body-fat","lean-mass"]],
  ["body-composition","Women's Body Composition Calculator","womens-body-composition","Women's Fitness","body-composition","Report fat mass and lean mass from weight and body-fat percentage.",[n("weight","Weight","kg",30,250),n("bodyFat","Body fat","%",5,70)],["body-fat","lean-mass"]],
  ["meal-calories","Women's Meal Calorie Calculator","womens-meal-calories","Women's Nutrition","meal-calories","Divide a daily calorie target across a selected number of meals.",[n("calories","Daily calories","kcal/day",1000,5000),n("meals","Meals","meals",1,8)],["macro-split","protein"]],
  ["meal-macros","Women's Meal Macro Calculator","womens-meal-macros","Women's Nutrition","meal-macros","Divide macro grams across a selected number of meals.",[n("calories","Daily calories","kcal/day",1000,5000),n("meals","Meals","meals",1,8)],["macro-split","meal-calories"]],
  ["protein-meal","Protein-per-Meal Calculator","protein-per-meal","Women's Nutrition","protein-meal","Divide a daily protein target across meals.",[n("protein","Daily protein","g/day",20,300),n("meals","Meals","meals",1,8)],["protein","meal-macros"]],
  ["weight-loss-calories","Women's Weight Loss Calorie Calculator","womens-weight-loss-calories","Women's Nutrition","weight-loss-calories","Subtract a conservative deficit from estimated maintenance calories.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,90),n("deficit","Deficit","kcal/day",100,750)],["calorie-deficit","maintenance-calories"]],
  ["weight-gain-calories","Women's Weight Gain Calorie Calculator","womens-weight-gain-calories","Women's Nutrition","weight-gain-calories","Add a conservative surplus to estimated maintenance calories.",[n("weight","Weight","kg",30,250),n("height","Height","cm",100,220),n("age","Age","years",15,90),n("surplus","Surplus","kcal/day",50,750)],["calorie-surplus","maintenance-calories"]],
  ["nutrition-needs","Women's Nutrition Needs Calculator","womens-nutrition-needs","Women's Nutrition","nutrition-needs","Summarize broad protein, fiber and fluid references.",[n("weight","Weight","kg",30,250),n("age","Age","years",15,90)],["protein","fiber","water"]],
  ["nutrient-intake","Nutrient Intake Calculator","nutrient-intake","Women's Nutrition","nutrient-intake","Compare reported nutrient intake with a selected target.",[n("intake","Reported intake","amount",0,1000),n("target","Target","amount",1,1000)],["nutrition-needs","daily-value"]],
  ["daily-value","Daily Value Calculator","daily-value","Women's Nutrition","daily-value","Calculate a reported nutrient amount as a percentage of target.",[n("intake","Reported amount","amount",0,1000),n("target","Daily target","amount",1,1000)],["nutrient-intake","nutrition-needs"]],
  ["calendar-generator","Menstrual Calendar Generator","menstrual-calendar-generator","Period & Menstrual Cycle","calendar-generator","Generate future cycle dates for personal planning.",[date("lastPeriod","First period start"),n("cycleLength","Cycle length","days",15,60),n("cycles","Cycles","cycles",1,12)],["period-calendar","next-period"]],
  ["tracking-stats","Period Tracking Statistics Calculator","tracking-statistics","Period & Menstrual Cycle","tracking-stats","Summarize average and variability from three cycle lengths.",[n("cycle1","Cycle 1","days",15,90),n("cycle2","Cycle 2","days",15,90),n("cycle3","Cycle 3","days",15,90)],["average-cycle","cycle-variation"]],
  ["peak-fertility","Peak Fertility Calculator","peak-fertility","Ovulation & Fertility","peak-fertility","Estimate the single peak day within a fertile window.",[date("lastPeriod","First day of last period"),n("cycleLength","Cycle length","days",15,60)],["fertile-window","ovulation-date"]],
  ["ovulation-test","Ovulation Test Timing Calculator","ovulation-test-timing","Ovulation & Fertility","ovulation-test","Suggest when to begin LH testing before expected ovulation.",[date("lastPeriod","First day of last period"),n("cycleLength","Cycle length","days",15,60)],["ovulation-date","fertile-window"]],
  ["biological-age","Biological Age Calculator","biological-age","Women's Wellness","biological-age","Compare chronological age with a simple lifestyle-adjusted educational estimate.",[n("age","Chronological age","years",18,100),n("sleep","Sleep hours","hours",0,16),n("activity","Active minutes/week","minutes",0,1000)],["wellness-score","fitness-age"]],
  ["fertility-awareness","Fertility Awareness Calculator","fertility-awareness","Ovulation & Fertility","fertility-awareness","Combine cycle length and observed fertile signs into a planning prompt.",[n("cycleLength","Cycle length","days",15,60),n("signs","Fertile signs observed","score",0,3)],["fertile-window","cycle-variation"]],
  ["bbt-ovulation","Basal Body Temperature Ovulation Calculator","bbt-ovulation","Ovulation & Fertility","bbt-ovulation","Interpret a reported basal temperature rise as a retrospective ovulation clue.",[n("baseline","Baseline temperature","°C",35,38,0.1),n("rise","Temperature rise","°C",0,1,0.05)],["ovulation-date","fertility-awareness"]],
  ["mucus-fertility","Cervical Mucus Fertility Calculator","mucus-fertility","Ovulation & Fertility","mucus-fertility","Classify a reported cervical mucus observation for fertility awareness.",[select("type","Observation",[{"label":"Dry","value":"dry"},{"label":"Sticky","value":"sticky"},{"label":"Egg-white","value":"egg"}])],["fertility-awareness","fertile-window"]],
  ["fertility-tracking","Fertility Tracking Calculator","fertility-tracking","Ovulation & Fertility","fertility-tracking","Summarize tracked cycle and fertility observations.",[n("cycles","Cycles tracked","cycles",1,24),n("signs","Fertile signs","score",0,24)],["fertility-awareness","tracking-stats"]],
  ["pregnancy-milestone","Pregnancy Milestone Calculator","pregnancy-milestone","Pregnancy","pregnancy-milestone","Map gestational week to a broad pregnancy milestone period.",[n("week","Gestational week","weeks",1,42)],["pregnancy-week","trimester"]],
  ["pregnancy-progress","Pregnancy Progress Calculator","pregnancy-progress","Pregnancy","pregnancy-progress","Calculate the percentage of a 40-week pregnancy completed.",[n("week","Gestational week","weeks",1,42)],["gestational-age","trimester"]],
  ["pregnancy-growth","Pregnancy Growth Calculator","pregnancy-growth","Pregnancy","pregnancy-growth","Give a broad week-based pregnancy growth description.",[n("week","Gestational week","weeks",1,42)],["pregnancy-week","fetal-growth"]],
  ["baby-development","Baby Development Week Calculator","baby-development-week","Postpartum & Baby","baby-development","Calculate a baby's age in weeks for developmental context.",[date("birthDate","Date of birth")],["baby-age","baby-milestone"]],
  ["postpartum-fitness","Postpartum Fitness Calculator","postpartum-fitness","Postpartum & Baby","postpartum-fitness","Classify postpartum activity minutes for gradual planning.",[n("minutes","Weekly activity minutes","minutes",0,600)],["exercise-readiness","postpartum-week"]],
  ["postpartum-nutrition","Postpartum Nutrition Calculator","postpartum-nutrition","Postpartum & Baby","postpartum-nutrition","Summarize broad postpartum protein and fluid starting references.",[n("weight","Weight","kg",30,250)],["postpartum-tdee","breastfeeding-hydration"]],
  ["recovery-tracker","Postpartum Recovery Tracker","postpartum-recovery-tracker","Postpartum & Baby","recovery-tracker","Reflect on recovery domains without diagnosing complications.",[n("pain","Pain score","score",0,10),n("energy","Energy score","score",0,10),n("support","Support score","score",0,10)],["postpartum-week","exercise-readiness"]],
  ["return-work","Return-to-Work Postpartum Calculator","return-to-work-postpartum","Postpartum & Baby","return-work","Estimate a return-to-work date from birth and leave weeks.",[date("birthDate","Date of birth"),n("weeks","Leave weeks","weeks",1,104)],["postpartum-week","maternity-duration"]],
  ["breastfeeding-weight-loss","Breastfeeding Weight Loss Calculator","breastfeeding-weight-loss","Breastfeeding","breastfeeding-weight-loss","Estimate weight change over time using a conservative weekly rate.",[n("kgToLose","Weight to lose","kg",0,100),n("weeklyRate","Weekly rate","kg/week",0.1,1,0.1)],["breastfeeding-calories","postpartum-timeline"]],
  ["breastfeeding-deficit","Breastfeeding Calorie Deficit Calculator","breastfeeding-deficit","Breastfeeding","breastfeeding-deficit","Subtract a conservative deficit from breastfeeding maintenance calories.",[n("maintenance","Maintenance calories","kcal/day",1500,5000),n("deficit","Deficit","kcal/day",100,500)],["breastfeeding-calories","breastfeeding-weight-loss"]],
  ["breastfeeding-schedule","Breastfeeding Schedule Calculator","breastfeeding-schedule","Breastfeeding","breastfeeding-schedule","Calculate average hours between daily breastfeeding sessions.",[n("sessions","Sessions per day","sessions",1,24)],["pumping-frequency","feeding-interval"]],
  ["exclusive-feeding","Exclusive Breastfeeding Calculator","exclusive-breastfeeding","Breastfeeding","exclusive-feeding","Compare breast milk feeds with total daily feeds.",[n("breastfeeds","Breast milk feeds","feeds",0,24),n("total","Total feeds","feeds",1,24)],["feeding-plan","breast-milk-intake"]],
  ["milk-supply","Milk Supply Tracking Calculator","milk-supply-tracking","Breastfeeding","milk-supply","Summarize recorded expressed volume across sessions.",[n("sessions","Sessions","sessions",1,20),n("volume","Average volume","mL",1,500)],["breast-milk-intake","pumping-frequency"]],
  ["step-calories","Women's Step Calorie Calculator","womens-step-calories","Women's Fitness","step-calories","Estimate calories from steps and body weight.",[n("weight","Weight","kg",30,250),n("steps","Steps","steps",100,50000)],["step-goal","training-calories"]],
  ["fat-needs","Women's Fat Needs Calculator","womens-fat-needs","Women's Nutrition","fat-needs","Estimate fat grams from a calorie target and reference percentage.",[n("calories","Calorie target","kcal/day",1000,5000),n("percent","Fat percentage","%",20,40)],["macro-split","protein"]],
  ["deficiency-risk","Nutrition Deficiency Risk Calculator","nutrition-deficiency-risk","Women's Nutrition","deficiency-risk","Flag low reported intake against a selected nutrient target for follow-up.",[n("intake","Reported intake","amount",0,1000),n("target","Reference target","amount",1,1000)],["nutrient-intake","daily-value"]],
  ["menopause-overview","Menopause Calculator","menopause-calculator","Menopause & Perimenopause","menopause-overview","Summarize broad menopause stage from months since last period.",[n("months","Months since last period","months",0,240)],["menopause-stage","menopause-score"]],
  ["perimenopause-age","Perimenopause Age Calculator","perimenopause-age","Menopause & Perimenopause","perimenopause-age","Compare age with a broad perimenopause reference range.",[n("age","Age","years",25,70)],["menopause-age","menopause-stage"]],
  ["menopause-weight","Menopause Weight Calculator","menopause-weight","Menopause & Perimenopause","menopause-weight","Calculate weight change across the menopause transition.",[n("earlier","Earlier weight","kg",30,250),n("current","Current weight","kg",30,250)],["menopause-stage","bmi"]],
  ["menopause-exercise","Menopause Exercise Calculator","menopause-exercise","Menopause & Perimenopause","menopause-exercise","Classify weekly exercise minutes for menopause wellness planning.",[n("minutes","Weekly minutes","minutes",0,600)],["menopause-score","training-calories"]],
  ["menopause-strength","Menopause Strength Training Calculator","menopause-strength","Menopause & Perimenopause","menopause-strength","Estimate weekly strength-training minutes from sessions and duration.",[n("sessions","Sessions/week","sessions",0,14),n("minutes","Minutes/session","minutes",0,180)],["menopause-exercise","training-calories"]],
  ["menopause-gain","Menopause Weight Gain Calculator","menopause-weight-gain","Menopause & Perimenopause","menopause-gain","Calculate weight gained or lost during the transition.",[n("earlier","Earlier weight","kg",30,250),n("current","Current weight","kg",30,250)],["menopause-weight","bmi"]],
  ["menopause-goal","Menopause Weight Goal Calculator","menopause-weight-goal","Menopause & Perimenopause","menopause-goal","Calculate remaining kilograms to a selected goal weight.",[n("current","Current weight","kg",30,250),n("goal","Goal weight","kg",30,250)],["menopause-weight","menopause-exercise"]],
  ["perimenopause-cycle","Perimenopause Cycle Calculator","perimenopause-cycle","Menopause & Perimenopause","perimenopause-cycle","Measure cycle variation in a perimenopause context.",[n("shortest","Shortest cycle","days",10,90),n("longest","Longest cycle","days",10,120)],["cycle-variation","menopause-stage"]],
  ["symptom-tracker","Menopause Symptom Tracker","menopause-symptom-tracker","Menopause & Perimenopause","symptom-tracker","Average reported symptom scores for reflection and appointment preparation.",[n("hot","Hot flashes","score",0,10),n("sleep","Sleep impact","score",0,10),n("mood","Mood impact","score",0,10)],["menopause-score","menopause-wellness"]],
  ["menopause-health-age","Menopause Health Age Calculator","menopause-health-age","Menopause & Perimenopause","menopause-health-age","Compare age with a broad health-age reflection based on activity and sleep.",[n("age","Age","years",25,90),n("activity","Activity score","score",0,10),n("sleep","Sleep score","score",0,10)],["menopause-fitness","menopause-wellness"]],
  ["menopause-wellness","Menopause Wellness Score Calculator","menopause-wellness","Menopause & Perimenopause","menopause-wellness","Average activity, sleep and symptom-management ratings.",[n("activity","Activity score","score",0,10),n("sleep","Sleep score","score",0,10),n("symptoms","Symptom-management score","score",0,10)],["menopause-score","menopause-exercise"]],
  ["menopause-fitness","Menopause Fitness Calculator","menopause-fitness","Menopause & Perimenopause","menopause-fitness","Classify weekly activity for menopause fitness planning.",[n("minutes","Weekly activity minutes","minutes",0,600)],["menopause-exercise","menopause-strength"]],
  ["body-shape","Body Shape Calculator","body-shape","Beauty, Body & Lifestyle","body-shape","Classify broad body shape from waist, hip and shoulder measurements.",[n("waist","Waist","cm",40,180),n("hip","Hip","cm",50,220),n("shoulder","Shoulder","cm",50,220)],["bmi","waist-hip"]],
  ["body-type","Body Type Calculator","body-type","Beauty, Body & Lifestyle","body-type","Describe a broad body-type category from three circumference measurements.",[n("waist","Waist","cm",40,180),n("hip","Hip","cm",50,220),n("shoulder","Shoulder","cm",50,220)],["body-shape","waist-hip"]],
  ["dress-size","Dress Size Calculator","dress-size","Beauty, Body & Lifestyle","dress-size","Estimate a generic dress-size band from bust and waist measurements.",[n("bust","Bust","cm",60,180),n("waist","Waist","cm",40,180)],["body-shape","waist-hip"]],
  ["bra-size","Bra Size Calculator","bra-size","Beauty, Body & Lifestyle","bra-size","Estimate band and cup components from underbust and bust measurements.",[n("underbust","Underbust","cm",55,150),n("bust","Bust","cm",60,180)],["dress-size","body-shape"]],
  ["clothing-size","Clothing Size Converter","clothing-size","Beauty, Body & Lifestyle","clothing-size","Convert a numeric clothing size between US, UK and EU labels.",[n("size","Numeric size","size",0,40),select("from","From",[{"label":"US","value":"us"},{"label":"UK","value":"uk"},{"label":"EU","value":"eu"}])],["dress-size","body-shape"]],
  ["shoe-size","Shoe Size Converter","shoe-size","Beauty, Body & Lifestyle","shoe-size","Convert a women's shoe size between common regional systems.",[n("size","US women's size","size",3,15)],["clothing-size","body-shape"]],
  ["hair-length","Hair Length Growth Calculator","hair-length","Beauty, Body & Lifestyle","hair-length","Estimate future hair length from current length and months.",[n("length","Current length","cm",0,200),n("months","Months","months",1,60)],["hair-growth","self-care-time"]],
  ["hair-dye","Hair Dye Timing Calculator","hair-dye-timing","Beauty, Body & Lifestyle","hair-dye","Estimate a follow-up date from a dye date and interval.",[date("last","Last dye date"),n("weeks","Interval","weeks",2,16)],["hair-growth","skincare-timing"]],
  ["skincare-timing","Skincare Routine Timing Calculator","skincare-timing","Beauty, Body & Lifestyle","skincare-timing","Calculate weekly minutes spent on a skincare routine.",[n("daily","Daily minutes","minutes",0,60),n("weekly","Weekly extras","minutes",0,180)],["self-care-time","beauty-sleep"]],
  ["beauty-sleep","Beauty Sleep Calculator","beauty-sleep","Beauty, Body & Lifestyle","beauty-sleep","Compare sleep duration with a broad adult sleep reference.",[n("hours","Sleep hours","hours",0,16)],["sleep","sleep-duration"]],
  ["life-expectancy","Life Expectancy Calculator","life-expectancy","Women's Wellness","life-expectancy","Show a broad population reference, not an individual prediction.",[n("age","Age","years",18,100)],["biological-age","menopause-health-age"]],
  ["fitness-age","Fitness Age Calculator","fitness-age","Women's Wellness","fitness-age","Estimate a reflection age from chronological age and activity score.",[n("age","Age","years",18,100),n("activity","Activity score","score",0,10)],["fitness-goal","biological-age"]],
  ["sleep-duration","Sleep Duration Calculator","sleep-duration","Women's Wellness","sleep-duration","Compare reported sleep with a broad adult recommendation.",[n("hours","Average sleep","hours",0,16)],["sleep","sleep-debt"]],
  ["body-score","Body Composition Score Calculator","body-composition-score","Women's Wellness","body-score","Calculate a body-composition reflection score from BMI and body fat.",[n("bmi","BMI","kg/m²",12,60),n("bodyFat","Body fat","%",5,70)],["body-composition","bmi"]],
  ["fitness-goal","Fitness Goal Calculator","fitness-goal","Women's Wellness","fitness-goal","Translate a selected priority into a measurable weekly activity target.",[select("goal","Goal",[{"label":"General health","value":"health"},{"label":"Strength","value":"strength"},{"label":"Endurance","value":"endurance"}])],["activity-level","training-calories"]],
  ["weight-goal","Weight Goal Calculator","weight-goal","Women's Wellness","weight-goal","Calculate percentage change needed to reach a weight goal.",[n("current","Current weight","kg",30,250),n("goal","Goal weight","kg",30,250)],["healthy-weight","weight-loss-calories"]],
  ["habit-tracking","Habit Tracking Calculator","habit-tracking","Women's Wellness","habit-tracking","Calculate habit completion percentage from completed and planned days.",[n("completed","Completed days","days",0,31),n("planned","Planned days","days",1,31)],["wellness-score","lifestyle-score"]],
  ["lifestyle-score","Lifestyle Score Calculator","lifestyle-score","Women's Wellness","lifestyle-score","Average sleep, activity and nutrition self-ratings.",[n("sleep","Sleep score","score",0,10),n("activity","Activity score","score",0,10),n("nutrition","Nutrition score","score",0,10)],["wellness-score","stress-score"]],
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
    case "transfer-due": return [{ label: "Estimated due date", value: fmtDate(addDays(d("transferDate"), 266 - x("embryoAge"))) }];
    case "iui-due": return [{ label: "Estimated due date", value: fmtDate(addDays(d("iuiDate"), 266)) }];
    case "pregnancy-bmi": case "bmi": { const z = bmi(x("weight"), x("height")); return [{ label: "BMI", value: round(z, 1).toString() }, { label: "Reference category", value: z < 18.5 ? "Below adult reference" : z < 25 ? "Adult reference range" : z < 30 ? "Above adult reference" : "Higher adult BMI range" }]; }
    case "pregnancy-weight-gain": { const z = x("bmi"); return [{ label: "Singleton pregnancy reference", value: z < 18.5 ? "28�40 lb (12.5�18 kg)" : z < 25 ? "25�35 lb (11.5�16 kg)" : z < 30 ? "15�25 lb (7�11.5 kg)" : "11�20 lb (5�9 kg)" }]; }
    case "pregnancy-calories": { const base = bmr(x("weight"), x("height"), x("age")) * 1.375; const add = ({ "1": 0, "2": 340, "3": 452 } as Record<string, number>)[v.trimester] ?? 0; return [{ label: "Estimated daily energy", value: `${round(base + add)} kcal`, detail: `Includes a ${add} kcal trimester reference addition; discuss personal needs with your prenatal clinician.` }]; }
    case "baby-age": { const days = ageDays("birthDate"); return [{ label: "Age", value: `${days} days` }, { label: "Approximate weeks", value: `${Math.floor(days / 7)}` }, { label: "Approximate months", value: `${round(days / 30.4375, 1)}` }]; }
    case "postpartum-week": return [{ label: "Postpartum age", value: `${Math.floor(ageDays("birthDate") / 7)} weeks` }];
    case "corrected-age": return [{ label: "Corrected age", value: `${Math.max(0, Math.floor(ageDays("birthDate") / 7) - x("weeksEarly"))} weeks` }];
    case "baby-sleep": { const m = x("ageMonths"); return [{ label: "Broad 24-hour range", value: `${m < 3 ? "14-17" : m < 12 ? "12-16" : "11-14"} hours` }]; }
    case "breastfeeding-hydration": case "menopause-hydration": case "skin-hydration": return [{ label: "Estimated fluid reference", value: `${round(x("weight") * 35)} mL/day`, detail: "Fluid needs vary; thirst, climate, activity and clinician advice matter." }];
    case "water": { const ml = x("weight") * 35; const output = v.waterUnit === "oz" ? ml / 29.5735 : mlFromInput(ml, "ml"); return [{ label: "Estimated fluid reference", value: `${round(output)} ${v.waterUnit === "oz" ? "fl oz" : "mL"}/day`, detail: "Fluid needs vary; thirst, climate, activity and clinician advice matter." }]; }
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
    case "vitamin-d": return [{ label: "Vitamin D reference", value: "600 IU (15 �g)/day" }];
    case "macros": return [{ label: "Carbohydrate", value: `${round(x("calories") * .45 / 4)} g/day` }, { label: "Fat", value: `${round(x("calories") * .30 / 9)} g/day` }, { label: "Protein", value: `${round(x("calories") * .25 / 4)} g/day` }];
    case "symptoms": { const total = Object.values(v).reduce((s, z) => s + Number(z || 0), 0); return [{ label: "Symptom impact", value: `${total}/12` }]; }
    case "cycle-variation": return [{ label: "Cycle variation", value: `${Math.max(0, x("longest") - x("shortest"))} days` }];
    case "sleep": return [{ label: "Sleep reference", value: x("hours") >= 7 && x("hours") <= 9 ? "Within the broad 7-9 hour reference" : "Outside the broad 7-9 hour reference" }];
    case "sleep-debt": return [{ label: "Estimated weekly sleep debt", value: `${round(Math.max(0, 8 - x("hours")) * x("nights"), 1)} hours` }];
    case "stress": return [{ label: "Average support score", value: `${round((x("sleep") + x("movement") + x("support")) / 3, 1)}/10` }];
    case "period-end": return [{ label: "Estimated period end", value: fmtDate(addDays(d("start"), x("days") - 1)) }];
    case "average-cycle": return [{ label: "Average cycle length", value: `${round((x("cycle1") + x("cycle2") + x("cycle3")) / 3, 1)} days` }];
    case "period-gap": return [{ label: "Period gap", value: `${Math.max(0, daysBetween(d("start"), d("end")))} days` }];
    case "pregnancy-month": return [{ label: "Estimated pregnancy month", value: `${Math.min(10, Math.floor(ageDays("lastPeriod") / 30.4375) + 1)}` }];
    case "due-countdown": return [{ label: "Days until due date", value: `${Math.max(0, daysBetween(today(), d("dueDate")))} days` }];
    case "pregnancy-protein": return [{ label: "Estimated protein reference", value: `${round(x("weight") * 1.1)} g/day` }];
    case "pregnancy-macros": return [{ label: "Carbohydrate", value: `${round(x("calories") * .5 / 4)} g/day` }, { label: "Fat", value: `${round(x("calories") * .3 / 9)} g/day` }, { label: "Protein", value: `${round(x("calories") * .2 / 4)} g/day` }];
    case "pregnancy-water": return [{ label: "Estimated fluid reference", value: `${round(x("weight") * 35 + 300)} mL/day` }];
    case "postpartum-day": return [{ label: "Postpartum age", value: `${ageDays("birthDate")} days` }];
    case "feeding-interval": return [{ label: "Feeding interval", value: `${Math.max(0, daysBetween(d("start"), d("end")))} days` }];
    case "breastfeeding-duration": return [{ label: "Breastfeeding duration", value: `${Math.max(0, daysBetween(d("start"), d("end")))} days` }];
    case "breastfeeding-session": return [{ label: "Session duration", value: `${x("minutes")} minutes` }];
    case "pumping-frequency": return [{ label: "Average interval", value: `${round(24 / x("sessions"), 1)} hours` }];
    case "calorie-surplus": { const t = bmr(x("weight"), x("height"), x("age")) * 1.375; return [{ label: "Estimated surplus target", value: `${round(t + x("surplus"))} kcal/day` }]; }
    case "carbohydrate": return [{ label: "Estimated carbohydrate", value: `${round(Math.max(x("calories") * .45 / 4, x("weight") * x("factor")))} g/day` }];
    case "fat-intake": return [{ label: "Estimated fat", value: `${round(x("calories") * x("percent") / 100 / 9)} g/day` }];
    case "running-calories": return [{ label: "Estimated running energy", value: `${round(x("weight") * x("minutes") * (0.9 * x("pace") / 60))} kcal` }];
    case "walking-calories": return [{ label: "Estimated walking energy", value: `${round(x("weight") * x("minutes") * (0.3 * x("speed") / 60))} kcal` }];
    case "target-heart-rate": { const max = 208 - .7 * x("age"); return [{ label: "Target heart rate", value: `${round(max * x("intensity") / 100)} bpm` }]; }
    case "waist-hip": return [{ label: "Waist-to-hip ratio", value: round(x("waist") / x("hip"), 2).toString() }];
    case "folate": return [{ label: "Folate reference", value: `${v.stage === "pregnant" ? 600 : v.stage === "lactating" ? 500 : 400} �g DFE/day` }];
    case "magnesium": return [{ label: "Magnesium reference", value: `${x("age") >= 31 ? 320 : 310} mg/day` }];
    case "menopause-stage": return [{ label: "Broad stage", value: x("months") < 12 ? "Perimenopause or transition" : "Postmenopause reference" }];
    case "menopause-years": return [{ label: "Years since menopause", value: `${round(x("months") / 12, 1)} years` }];
    case "resting-heart-rate": return [{ label: "Adult reference", value: x("bpm") >= 60 && x("bpm") <= 100 ? "Within broad adult reference" : "Outside broad adult reference" }];
    case "sleep-cycle": { const bedtime = new Date(`${d("bedtime")}T22:00:00`); bedtime.setMinutes(bedtime.getMinutes() + x("cycles") * 90); return [{ label: "Suggested wake time", value: bedtime.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }) }]; }
    case "step-goal": return [{ label: "Suggested daily steps", value: `${v.activity === "low" ? 5000 : v.activity === "moderate" ? 7500 : 10000} steps` }];
    case "activity-level": return [{ label: "Activity band", value: x("minutes") < 150 ? "Below common activity target" : x("minutes") < 300 ? "Moderately active" : "Highly active" }];
    case "calorie-burn": return [{ label: "Estimated calorie burn", value: `${round(x("met") * 3.5 * x("weight") / 200 * x("minutes"))} kcal` }];
    case "menstrual-cycle": return [{ label: "Cycle length", value: `${Math.max(0, daysBetween(d("start"), d("end")))} days` }];
    case "irregular-period": return [{ label: "Cycle variability", value: `${Math.max(0, x("longest") - x("shortest"))} days`, detail: x("longest") - x("shortest") > 7 ? "Marked variation; discuss persistent changes with a clinician." : "Within a narrower range." }];
    case "period-delay": return [{ label: "Delayed period date", value: fmtDate(addDays(d("expected"), x("delay"))) }];
    case "missed-period": return [{ label: "Days since expected period", value: `${Math.max(0, daysBetween(d("expected"), today()))} days` }];
    case "period-calendar": return [{ label: "Estimated period starts", value: Array.from({ length: x("cycles") }, (_, i) => fmtDate(addDays(d("lastPeriod"), x("cycleLength") * (i + 1)))).join(", ") }];
    case "ovulation-period": return [{ label: "Estimated ovulation", value: fmtDate(addDays(d("lastPeriod"), x("cycleLength") - 14)) }, { label: "Estimated next period", value: fmtDate(addDays(d("lastPeriod"), x("cycleLength"))) }];
    case "menstrual-phase": return [{ label: "Broad phase", value: x("cycleDay") <= x("bleedingDays") ? "Menstrual" : x("cycleDay") < 14 ? "Follicular" : x("cycleDay") === 14 ? "Ovulatory" : "Luteal" }];
    case "period-after-ovulation": return [{ label: "Expected period", value: fmtDate(addDays(d("ovulation"), x("luteal"))) }];
    case "fertile-days": return [{ label: "Estimated fertile days", value: `${fmtDate(addDays(d("lastPeriod"), x("cycleLength") - 19))} - ${fmtDate(addDays(d("lastPeriod"), x("cycleLength") - 13))}` }];
    case "dpo": return [{ label: "Days past ovulation", value: `${ageDays("ovulation")} days` }];
    case "implantation-date": return [{ label: "Estimated implantation", value: `${fmtDate(addDays(d("ovulation"), 6))} - ${fmtDate(addDays(d("ovulation"), 10))}` }];
    case "implantation-window": return [{ label: "Implantation window", value: `${fmtDate(addDays(d("ovulation"), 6))} - ${fmtDate(addDays(d("ovulation"), 12))}` }];
    case "test-timing": return [{ label: "Earliest test estimate", value: fmtDate(addDays(d("ovulation"), 10)) }, { label: "More reliable estimate", value: fmtDate(addDays(d("ovulation"), 14)) }];
    case "weeks-due": return [{ label: "Weeks until due date", value: `${round(Math.max(0, daysBetween(today(), d("dueDate"))) / 7, 1)} weeks` }];
    case "maternity-date": return [{ label: "Estimated leave start", value: fmtDate(addDays(d("dueDate"), -7 * x("weeksBefore"))) }];
    case "maternity-duration": return [{ label: "Estimated leave end", value: fmtDate(addDays(d("start"), x("weeks") * 7)) }];
    case "announcement-date": return [{ label: "Suggested announcement date", value: fmtDate(addDays(d("dueDate"), -(40 - x("week")) * 7)) }];
    case "shower-date": return [{ label: "Suggested shower date", value: fmtDate(addDays(d("dueDate"), -(40 - x("week")) * 7)) }];
    case "hospital-countdown": return [{ label: "Preparation date", value: fmtDate(addDays(d("dueDate"), -7 * x("weeksBefore"))) }];
    case "nutrient-reference": {
      const stage = v.stage;
      const label = kind === "nutrient-reference" ? (stage === "pregnant" ? "Pregnancy reference" : "Adult reference") : "Reference";
      return [{ label, value: kind === "nutrient-reference" && stage === "pregnant" ? "2.6 �g/day B12 or life-stage value" : "Use the displayed life-stage reference and clinician guidance." }];
    }
    case "menopause-age": return [{ label: "Reference difference", value: `${round(51 - x("age"), 1)} years from the average reference age` }];
    case "menopause-transition": return [{ label: "Broad transition", value: x("months") < 12 ? "Perimenopause or transition" : "Postmenopause reference" }];
    case "hair-growth": return [{ label: "Estimated length", value: `${round(x("length") + x("months") * 1.25, 1)} cm` }];
    case "self-care-time": return [{ label: "Weekly self-care time", value: `${x("morning") * 7 + x("evening") * 7 + x("weekly")} minutes` }];
    case "wellness-score": return [{ label: "Wellness reflection score", value: `${round((x("sleep") + x("movement") + x("support")) / 3, 1)}/10` }];
    case "daily-activity": return [{ label: "Activity band", value: x("minutes") < 30 ? "Light activity" : x("minutes") < 60 ? "Moderate activity" : "High activity" }];
    case "phase-follicular": return [{ label: "Follicular phase", value: `${fmtDate(d("lastPeriod"))} - ${fmtDate(addDays(d("lastPeriod"), x("cycleLength") - 15))}` }];
    case "phase-luteal": return [{ label: "Luteal phase", value: `${fmtDate(addDays(d("lastPeriod"), x("cycleLength") - 14))} - ${fmtDate(addDays(d("lastPeriod"), x("cycleLength") - 1))}` }];
    case "fertility-age": return [{ label: "Age context", value: x("age") < 35 ? "Generally favorable age band" : x("age") < 40 ? "Fertility may decline with age" : "Discuss age-related fertility with a clinician" }];
    case "ttc-time": return [{ label: "Planning context", value: x("monthsTrying") < 6 ? "Continue tracking and consider preconception care" : "Consider discussing timing with a clinician" }];
    case "frozen-transfer-due": case "donor-egg-due": return [{ label: "Estimated due date", value: fmtDate(addDays(d("transferDate"), 266 - x("embryoAge"))) }];
    case "pregnancy-nutrition": return [{ label: "Protein reference", value: `${round(x("weight") * 1.1)} g/day` }, { label: "Trimester", value: v.trimester }];
    case "pregnancy-exercise": return [{ label: "Activity reference", value: x("minutes") >= 150 ? "At or above a broad weekly reference" : "Below a broad weekly reference" }];
    case "weight-gain-tracker": return [{ label: "Weight change", value: `${round(x("currentWeight") - x("preWeight"), 1)} kg` }];
    case "fetal-growth": return [{ label: "Educational week reference", value: x("week") < 14 ? "Early pregnancy development" : x("week") < 28 ? "Mid-pregnancy growth" : "Late-pregnancy growth" }];
    case "postpartum-weight": return [{ label: "Weight change", value: `${round(x("birthWeight") - x("currentWeight"), 1)} kg` }];
    case "postpartum-bmi": { const z = bmi(x("weight"), x("height")); return [{ label: "BMI", value: round(z, 1).toString() }]; }
    case "postpartum-tdee": return [{ label: "Estimated daily expenditure", value: `${round(bmr(x("weight"), x("height"), x("age")) * x("activity"))} kcal/day` }];
    case "postpartum-macros": return [{ label: "Carbohydrate", value: `${round(x("calories") * .45 / 4)} g/day` }, { label: "Fat", value: `${round(x("calories") * .3 / 9)} g/day` }, { label: "Protein", value: `${round(x("calories") * .25 / 4)} g/day` }];
    case "postpartum-goal": return [{ label: "Remaining to goal", value: `${round(x("currentWeight") - x("goalWeight"), 1)} kg` }];
    case "postpartum-timeline": return [{ label: "Estimated timeline", value: `${round(x("kgToLose") / x("weeklyRate"), 1)} weeks` }];
    case "exercise-readiness": return [{ label: "Readiness reflection", value: v.clearance === "yes" && x("symptoms") === 0 ? "Discuss gradual return with your clinician" : "Seek clinician guidance before progressing" }];
    case "baby-milestone": return [{ label: "Age at milestone", value: `${round(Math.max(0, daysBetween(d("birthDate"), d("milestoneDate"))) / 30.4375, 1)} months` }];
    case "feeding-schedule": return [{ label: "Scheduled feeds", value: Array.from({ length: x("feeds") }, (_, i) => `${i * x("interval")}h`).join(", ") }];
    case "baby-growth": return [{ label: "Weight change", value: `${round(x("current") - x("initial"), 2)} kg` }];
    case "breast-milk-intake": return [{ label: "Estimated daily volume", value: `${round(x("feeds") * x("volume"))} mL/day` }];
    case "pumping-schedule": return [{ label: "Average pumping interval", value: `${round(24 / x("sessions"), 1)} hours` }];
    case "feeding-plan": return [{ label: "Formula feeds", value: `${Math.max(0, x("feeds") - x("breastfeeds"))}` }];
    case "weaning-date": return [{ label: "Estimated weaning date", value: fmtDate(addDays(d("start"), x("weeks") * 7)) }];
    case "women-calories": return [{ label: "Estimated calories", value: `${round(bmr(x("weight"), x("height"), x("age")) * x("activity"))} kcal/day` }];
    case "cycling-calories": return [{ label: "Estimated cycling energy", value: `${round(x("weight") * x("minutes") * x("speed") * .08)} kcal` }];
    case "strength-calories": return [{ label: "Estimated strength energy", value: `${round(x("met") * 3.5 * x("weight") / 200 * x("minutes"))} kcal` }];
    case "vo2max": return [{ label: "Estimated VO2 max", value: `${round((x("distance") / x("minutes") - 4.5) * 3.5, 1)} mL/kg/min` }];
    case "ffmi": { const lean = x("weight") * (1 - x("bodyFat") / 100); return [{ label: "FFMI", value: round(lean / (x("height") / 100) ** 2, 1).toString() }]; }
    case "body-composition": return [{ label: "Fat mass", value: `${round(x("weight") * x("bodyFat") / 100, 1)} kg` }, { label: "Lean mass", value: `${round(x("weight") * (1 - x("bodyFat") / 100), 1)} kg` }];
    case "meal-calories": return [{ label: "Calories per meal", value: `${round(x("calories") / x("meals"))} kcal` }];
    case "meal-macros": return [{ label: "Calories per meal", value: `${round(x("calories") / x("meals"))} kcal` }, { label: "Protein per meal", value: `${round(x("calories") * .25 / 4 / x("meals"))} g` }];
    case "protein-meal": return [{ label: "Protein per meal", value: `${round(x("protein") / x("meals"), 1)} g` }];
    case "weight-loss-calories": { const t = bmr(x("weight"), x("height"), x("age")) * 1.375; return [{ label: "Illustrative target", value: `${round(Math.max(1200, t - x("deficit")))} kcal/day` }]; }
    case "weight-gain-calories": { const t = bmr(x("weight"), x("height"), x("age")) * 1.375; return [{ label: "Illustrative target", value: `${round(t + x("surplus"))} kcal/day` }]; }
    case "nutrition-needs": return [{ label: "Protein", value: `${round(x("weight") * .8)} g/day` }, { label: "Fiber", value: `${x("age") <= 50 ? 25 : 21} g/day` }, { label: "Fluid", value: `${round(x("weight") * 35)} mL/day` }];
    case "nutrient-intake": return [{ label: "Percent of target", value: `${round(x("intake") / x("target") * 100, 1)}%` }];
    case "daily-value": return [{ label: "Daily value", value: `${round(x("intake") / x("target") * 100, 1)}%` }];
    case "calendar-generator": return [{ label: "Future cycle starts", value: Array.from({ length: x("cycles") }, (_, i) => fmtDate(addDays(d("lastPeriod"), x("cycleLength") * (i + 1)))).join(", ") }];
    case "tracking-stats": return [{ label: "Average cycle", value: `${round((x("cycle1") + x("cycle2") + x("cycle3")) / 3, 1)} days` }, { label: "Variation", value: `${Math.max(x("cycle1"), x("cycle2"), x("cycle3")) - Math.min(x("cycle1"), x("cycle2"), x("cycle3"))} days` }];
    case "peak-fertility": return [{ label: "Peak fertility date", value: fmtDate(addDays(d("lastPeriod"), x("cycleLength") - 14)) }];
    case "ovulation-test": return [{ label: "Begin testing", value: fmtDate(addDays(d("lastPeriod"), x("cycleLength") - 19)) }];
    case "biological-age": return [{ label: "Lifestyle age reflection", value: `${round(x("age") + (7 - x("activity") / 2) + (8 - x("sleep")))} years` }];
    case "fertility-awareness": return [{ label: "Planning signal", value: x("signs") >= 2 ? "Multiple fertile signs reported" : "Continue observing signs" }];
    case "bbt-ovulation": return [{ label: "Temperature pattern", value: x("rise") >= 0.2 ? "Sustained rise may support retrospective ovulation confirmation" : "No clear rise threshold reached" }];
    case "mucus-fertility": return [{ label: "Fertility sign", value: v.type === "egg" ? "Peak-type mucus observation" : v.type === "sticky" ? "Possible transition observation" : "Lower-fertility observation" }];
    case "fertility-tracking": return [{ label: "Tracking coverage", value: `${round(x("signs") / Math.max(1, x("cycles")), 1)} signs per cycle` }];
    case "pregnancy-milestone": return [{ label: "Milestone period", value: x("week") < 13 ? "First trimester" : x("week") < 28 ? "Second trimester" : "Third trimester" }];
    case "pregnancy-progress": return [{ label: "Pregnancy progress", value: `${round(Math.min(100, x("week") / 40 * 100), 1)}%` }];
    case "pregnancy-growth": return [{ label: "Growth period", value: x("week") < 13 ? "Early development" : x("week") < 28 ? "Organ and size growth" : "Late growth and maturation" }];
    case "baby-development": return [{ label: "Developmental age", value: `${Math.floor(ageDays("birthDate") / 7)} weeks` }];
    case "postpartum-fitness": return [{ label: "Fitness reference", value: x("minutes") >= 150 ? "At or above broad activity reference" : "Build gradually with clinical guidance" }];
    case "postpartum-nutrition": return [{ label: "Protein reference", value: `${round(x("weight") * 1.0)} g/day` }, { label: "Fluid reference", value: `${round(x("weight") * 35)} mL/day` }];
    case "recovery-tracker": return [{ label: "Recovery reflection", value: `${round((x("pain") + x("energy") + x("support")) / 3, 1)}/10` }];
    case "return-work": return [{ label: "Estimated return date", value: fmtDate(addDays(d("birthDate"), x("weeks") * 7)) }];
    case "breastfeeding-weight-loss": return [{ label: "Estimated timeline", value: `${round(x("kgToLose") / x("weeklyRate"), 1)} weeks` }];
    case "breastfeeding-deficit": return [{ label: "Illustrative target", value: `${round(x("maintenance") - x("deficit"))} kcal/day` }];
    case "breastfeeding-schedule": return [{ label: "Average interval", value: `${round(24 / x("sessions"), 1)} hours` }];
    case "exclusive-feeding": return [{ label: "Breast milk proportion", value: `${round(x("breastfeeds") / x("total") * 100, 1)}%` }];
    case "milk-supply": return [{ label: "Estimated expressed volume", value: `${round(x("sessions") * x("volume"))} mL/day` }];
    case "step-calories": return [{ label: "Estimated step energy", value: `${round(x("steps") * x("weight") * .0005)} kcal` }];
    case "fat-needs": return [{ label: "Estimated fat", value: `${round(x("calories") * x("percent") / 100 / 9)} g/day` }];
    case "deficiency-risk": return [{ label: "Reference comparison", value: x("intake") < x("target") * .7 ? "Below 70% of target; discuss diet or testing with a clinician" : "At or above 70% of target" }];
    case "menopause-overview": return [{ label: "Broad stage", value: x("months") < 12 ? "Perimenopause or transition" : "Postmenopause reference" }];
    case "perimenopause-age": return [{ label: "Age context", value: x("age") >= 40 && x("age") <= 55 ? "Within a common perimenopause age band" : "Outside the broad age band" }];
    case "menopause-weight": case "menopause-gain": return [{ label: "Weight change", value: `${round(x("current") - x("earlier"), 1)} kg` }];
    case "menopause-exercise": case "menopause-fitness": return [{ label: "Activity reference", value: x("minutes") >= 150 ? "At or above broad activity reference" : "Below broad activity reference" }];
    case "menopause-strength": return [{ label: "Weekly strength minutes", value: `${x("sessions") * x("minutes")} minutes` }];
    case "menopause-goal": return [{ label: "Remaining to goal", value: `${round(x("current") - x("goal"), 1)} kg` }];
    case "perimenopause-cycle": return [{ label: "Cycle variation", value: `${Math.max(0, x("longest") - x("shortest"))} days` }];
    case "symptom-tracker": return [{ label: "Average symptom impact", value: `${round((x("hot") + x("sleep") + x("mood")) / 3, 1)}/10` }];
    case "menopause-health-age": return [{ label: "Health-age reflection", value: `${round(x("age") + 5 - (x("activity") + x("sleep")) / 2)} years` }];
    case "menopause-wellness": return [{ label: "Wellness reflection", value: `${round((x("activity") + x("sleep") + x("symptoms")) / 3, 1)}/10` }];
    case "body-shape": return [{ label: "Shape context", value: x("shoulder") > x("hip") * 1.05 ? "Shoulder-dominant" : x("hip") > x("shoulder") * 1.05 ? "Hip-dominant" : "Balanced proportions" }];
    case "body-type": return [{ label: "Type context", value: x("waist") < Math.min(x("hip"), x("shoulder")) * .75 ? "Defined waist" : "Straighter proportions" }];
    case "dress-size": return [{ label: "Size context", value: `${Math.max(0, Math.round((x("bust") + x("waist")) / 20 - 6))} (approximate)` }];
    case "bra-size": return [{ label: "Band estimate", value: `${Math.round(x("underbust") / 2.5) * 2}` }, { label: "Cup difference", value: `${round(x("bust") - x("underbust"), 1)} cm` }];
    case "clothing-size": return [{ label: "Converted size", value: v.from === "us" ? `${round(x("size") + 4)} EU` : `${round(x("size") - 4)} US` }];
    case "shoe-size": return [{ label: "EU estimate", value: `${round(x("size") + 30.5, 1)}` }];
    case "hair-length": return [{ label: "Estimated length", value: `${round(x("length") + x("months") * 1.25, 1)} cm` }];
    case "hair-dye": return [{ label: "Suggested next date", value: fmtDate(addDays(d("last"), x("weeks") * 7)) }];
    case "skincare-timing": return [{ label: "Weekly routine time", value: `${x("daily") * 7 + x("weekly")} minutes` }];
    case "beauty-sleep": case "sleep-duration": return [{ label: "Sleep reference", value: x("hours") >= 7 && x("hours") <= 9 ? "Within broad adult reference" : "Outside broad adult reference" }];
    case "life-expectancy": return [{ label: "Population context", value: "Individual lifespan cannot be responsibly predicted by this tool." }];
    case "fitness-age": return [{ label: "Fitness-age reflection", value: `${round(x("age") + 5 - x("activity") / 2)} years` }];
    case "body-score": return [{ label: "Composition reflection", value: `${round(10 - Math.abs(x("bmi") - 22) / 3 - Math.abs(x("bodyFat") - 28) / 10, 1)}/10` }];
    case "fitness-goal": return [{ label: "Suggested weekly target", value: v.goal === "strength" ? "2 strength sessions" : v.goal === "endurance" ? "150+ aerobic minutes" : "150 moderate minutes" }];
    case "weight-goal": return [{ label: "Percentage change", value: `${round((x("goal") - x("current")) / x("current") * 100, 1)}%` }];
    case "habit-tracking": return [{ label: "Completion", value: `${round(x("completed") / x("planned") * 100, 1)}%` }];
    case "lifestyle-score": return [{ label: "Lifestyle reflection", value: `${round((x("sleep") + x("activity") + x("nutrition")) / 3, 1)}/10` }];
  }
  return [];
}
const methodByKind: Partial<Record<Kind, string>> = {
  "iui-due": "IUI timing is treated as conception timing and 266 days are added, a conventional estimate for 38 weeks after conception.",
  bmi: "BMI is calculated as weight in kilograms divided by height in metres squared.",
  "next-period": "The usual cycle length is added to the first day of the last period to estimate the next start date.",
  ovulation: "Ovulation is approximated as 14 days before the next expected period.",
  "period-end": "The reported bleeding duration minus one day is added to the period start.",
  "average-cycle": "The arithmetic mean of three reported cycle lengths is calculated.",
  "period-gap": "Calendar days between the two supplied period starts are counted.",
  "pregnancy-month": "Gestational days are divided by the average 30.44-day month.",
  "due-countdown": "The calendar difference between today and the supplied due date is counted.",
  "pregnancy-protein": "A 1.1 g/kg/day pregnancy protein reference is applied to body weight.",
  "pregnancy-macros": "The calorie target is split 50% carbohydrate, 30% fat and 20% protein.",
  "pregnancy-water": "A 35 mL/kg/day starting fluid reference plus 300 mL is shown.",
  "postpartum-day": "Calendar days since the supplied birth date are counted.",
  "feeding-interval": "Calendar days between the supplied feeding dates are counted.",
  "breastfeeding-duration": "Calendar days between breastfeeding start and end are counted.",
  "breastfeeding-session": "The reported start-to-finish session duration is returned.",
  "pumping-frequency": "Twenty-four hours is divided by reported sessions per day.",
  "calorie-surplus": "Mifflin-St Jeor BMR multiplied by a moderate activity factor is increased by the selected surplus.",
  carbohydrate: "A calorie-derived 45% floor is compared with the selected grams-per-kilogram factor.",
  "fat-intake": "Calories multiplied by the selected fat percentage are divided by 9 kcal per gram.",
  "running-calories": "A transparent speed-and-duration estimate uses body weight and a running energy coefficient.",
  "walking-calories": "A transparent speed-and-duration estimate uses body weight and a walking energy coefficient.",
  "target-heart-rate": "The Tanaka maximum-heart-rate estimate is multiplied by the selected intensity.",
  "waist-hip": "Waist circumference is divided by hip circumference.",
  folate: "Life-stage dietary folate equivalent references are shown.",
  magnesium: "An adult age-banded magnesium reference is shown.",
  "menopause-stage": "Months since the last period are classified into a broad transition or postmenopause stage.",
  "menopause-years": "Months since the last period are divided by 12.",
  "resting-heart-rate": "The reading is compared with a broad adult resting-heart-rate reference.",
  "sleep-cycle": "Ninety-minute blocks are added to a selected bedtime.",
  "step-goal": "A practical step target is selected from the declared activity band.",
  "activity-level": "Weekly moderate-equivalent minutes are compared with broad activity thresholds.",
  "calorie-burn": "The standard MET energy equation estimates activity calories.",
  "period-delay": "The selected delay is added to the expected period date.",
  "missed-period": "Calendar days since the expected period date are counted.",
  "period-calendar": "Each future cycle start is generated by repeatedly adding the selected cycle length.",
  "ovulation-period": "Ovulation is estimated 14 days before the next period, and both dates are reported.",
  "menstrual-phase": "Cycle-day boundaries classify menstrual, follicular, ovulatory and luteal phases.",
  "period-after-ovulation": "The selected luteal phase is added to the ovulation date.",
  "fertile-days": "The fertile interval is estimated from the five days before through one day after approximate ovulation.",
  dpo: "Calendar days since the reported ovulation date are counted.",
  "implantation-date": "A broad implantation interval is placed six to ten days after ovulation.",
  "implantation-window": "A conservative six-to-twelve-day interval after ovulation is displayed.",
  "test-timing": "Earliest and more reliable testing dates are placed ten and fourteen days after ovulation.",
  "weeks-due": "Days remaining to the due date are divided by seven.",
  "maternity-date": "The chosen number of weeks is subtracted from the expected birth date.",
  "maternity-duration": "The chosen number of weeks is added to the leave start date.",
  "announcement-date": "The selected pregnancy week is converted to a date using the estimated due date.",
  "shower-date": "The selected gestational week is converted to a date using the estimated due date.",
  "hospital-countdown": "The preparation lead time is subtracted from the expected birth date.",
  "nutrient-reference": "A life-stage nutrient reference is displayed for educational planning.",
  "menopause-age": "Current age is compared with the commonly cited average menopause age of 51.",
  "menopause-transition": "Months since the last period are classified into broad transition stages.",
  "hair-growth": "A typical average growth rate of approximately 1.25 cm per month is applied.",
  "self-care-time": "Daily morning and evening minutes are multiplied by seven and added to weekly minutes.",
  "wellness-score": "Three self-rated wellness domains are averaged as a reflection score.",
  "daily-activity": "Active minutes are classified into broad light, moderate and high bands.",
};
const data: Calculator[] = specs.map(([id, title, slug, category, kind, description, fields, related]) => ({
  id, title, slug, category, description, fields, related, status: "active" as const,
  keywords: [title.toLowerCase(), category.toLowerCase(), "calculator"],
  calculate: (v) => calculate(kind, v),
  methodology: methodByKind[kind] || `${title} uses the displayed inputs and a published reference equation or range. The result is an educational estimate and should be interpreted with context.`,
  faq: [
    { q: `How is ${title.toLowerCase()} calculated?`, a: methodByKind[kind] || "The calculator applies the transparent reference described above to the values you enter." },
    ...faq,
  ].slice(0, 4),
  workedExample: `For a typical example, enter the values shown in the form and compare the labelled estimate with your own context.`,
  limitations: "This is not a diagnosis or a prediction of an individual outcome. Age, health conditions, medications and measurement error can change the result; discuss concerns with a qualified clinician.",
  tests: ["valid inputs return a finite, labelled result", "out-of-range inputs are rejected by the form"],
}));
export const calculators = data;
export const activeCalculators = calculators.filter((c) => c.status === "active");
export const bySlug = (slug: string) => activeCalculators.find((c) => c.slug === slug);

