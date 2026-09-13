import { MetadataRoute } from "next";
import { calculators } from "../lib/registry";
import { siteUrl } from "../lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/calculators`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    ...calculators.map((c) => ({
      url: `${base}/calculators/${c.slug}`,
      lastModified: new Date(),
    })),
  ];
}
