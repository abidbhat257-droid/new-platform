# HerCalc

A modern Next.js App Router platform with a curated registry of distinct women's health calculators.

## Setup

```bash
npm install
npm run dev
```

## Architecture

`lib/types.ts` defines the typed calculator contract, `lib/formulas.ts` contains reusable date and health helpers, and `lib/registry.ts` is the single catalog. Each route is generated from the registry and rendered with the accessible shared form in `components/CalculatorForm.tsx`. Inputs are client-only; no persistence or analytics are included.

## Adding a calculator

Add a typed tuple to `specs` in `lib/registry.ts`, select a calculation kind (or add a branch to `calculate`), provide fields, methodology, FAQ and contextual related IDs. The registry automatically supplies a static detail route, SEO metadata and sitemap entry.

## Verification and deployment

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin in production; development safely falls back to `http://localhost:3000`.
