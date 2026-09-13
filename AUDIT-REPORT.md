# HerCalc audit report

## Registry

- Genuine active calculators: **51**
- Category counts: Period & Menstrual Cycle 6; Ovulation & Fertility 4; Pregnancy 9; Postpartum & Baby 4; Breastfeeding 4; Women's Fitness 11; Women's Nutrition 7; Menopause & Perimenopause 2; Beauty, Body & Lifestyle 1; Women's Wellness 3.
- Duplicate IDs, slugs, titles: **0**
- Generic/fallback calculation branches: **0** (every registry entry selects a named calculation kind).
- Every entry has typed fields, methodology, FAQ, tests, and contextual related IDs; all related IDs resolve.

## Corrections

Pregnancy calories now use explicit first/second/third trimester reference additions. Lactation calories are a separate calculator with exclusive/partial feeding inputs; no universal `+450` is shared between pregnancy and breastfeeding. Date arithmetic uses calendar-day helpers, and forms reject missing, malformed, out-of-range numbers, dates, and select values.

## SEO, privacy, and accessibility

`lib/site.ts` is the sole site URL configuration with `NEXT_PUBLIC_SITE_URL` fallback. Metadata, canonical calculator URLs, JSON-LD, sitemap and robots no longer contain the placeholder domain. Calculations remain client-side; results are typed and form controls have labels, IDs, required states, and live result announcements.

## Validation

- `npm.cmd run typecheck` - passed
- `npm.cmd test` - passed (8 tests)
- `npm.cmd run lint` - passed
- `npm.cmd run build` - passed (59 static routes)

Changed files include the registry and tests, formula/form accessibility, centralized site configuration, metadata routes, README, and this report.
