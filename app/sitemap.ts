import type { MetadataRoute } from "next";

import { getAllTypeCodes } from "@/lib/data";
import { getAbsoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const typeCodes = await getAllTypeCodes();
  const now = new Date();

  return [
    {
      url: getAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...typeCodes.map((typeCode) => ({
      url: getAbsoluteUrl(`/types/${typeCode}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
