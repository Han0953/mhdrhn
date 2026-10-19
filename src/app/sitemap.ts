import type { MetadataRoute } from "next";
// A production origin has not been approved. Never publish an invented hostname.
export default function sitemap(): MetadataRoute.Sitemap { return []; }
