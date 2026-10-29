import { MetadataRoute } from "next";
import { activeCalculators, categories } from "../lib/registry";
import { siteUrl } from "../lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/calculators`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    ...categories.map((category) => ({
      url: `${base}/categories/${category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      lastModified: new Date(),
    })),
    { url: `${base}/period-tracker`, lastModified: new Date() },
    ...activeCalculators.map((c) => ({
      url: `${base}/calculators/${c.slug}`,
      lastModified: new Date(),
    })),
  ];
}
