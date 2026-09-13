# HerCalc

A modern Next.js App Router platform with 300 metadata-driven women's health calculators.

## Setup

```bash
npm install
npm run dev
```

## Architecture

`lib/types.ts` defines the typed calculator contract, `lib/formulas.ts` contains reusable date and health helpers, and `lib/registry.ts` is the single catalog. Each route is generated from the registry and rendered with the accessible shared form in `components/CalculatorForm.tsx`. Inputs are client-only; no persistence or analytics are included.

## Adding a calculator

Add a typed spec to `specs` in `lib/registry.ts`, select a calculation kind (or add a branch to `calc`), provide fields, methodology, FAQ and related IDs. The registry automatically supplies a static detail route, SEO metadata and sitemap entry.

## Verification and deployment

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Deploy to any Node-compatible Next.js host (Vercel is the simplest option). Replace the example metadataBase in `app/layout.tsx`, sitemap and robots with your production domain.
