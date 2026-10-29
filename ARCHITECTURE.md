# HerCalc architecture

The calculator registry in `lib/registry.ts` is the source of truth for IDs, slugs, fields, formulas, metadata and relationships. Next.js dynamic routes render active registry entries; no calculator has a hand-written route. Non-active statuses (`draft`, `coming-soon`, `deprecated`) remain available to editorial tooling but are excluded from public routes, search and the sitemap.

Calculations are client-side and the registry's `calculate` functions are also directly testable. Unit conversions normalize to kg, cm and ml before formulas run.
