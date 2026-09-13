const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
export const siteUrl = (configured || "http://localhost:3000").replace(/\/$/, "");
