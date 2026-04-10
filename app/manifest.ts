import type { MetadataRoute } from "next";

import manifestJson from "@/public/favicons/manifest.json";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return manifestJson as MetadataRoute.Manifest;
}
