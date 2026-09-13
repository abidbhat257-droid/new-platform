import { MetadataRoute } from "next";
import { calculators } from "../lib/registry";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hercalc.example";
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/calculators`, lastModified: new Date() },
    ...calculators.map((c) => ({
      url: `${base}/calculators/${c.slug}`,
      lastModified: new Date(),
    })),
  ];
}
