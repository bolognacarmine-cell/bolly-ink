import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PortfolioImage, VideoItem } from "@/data/site";

export type MediaContent = {
  portfolioImages: PortfolioImage[];
  videos: VideoItem[];
};

export async function getMedia(): Promise<MediaContent> {
  const p = path.join(process.cwd(), "content", "media.json");
  const raw = await readFile(p, "utf8");
  return JSON.parse(raw) as MediaContent;
}

