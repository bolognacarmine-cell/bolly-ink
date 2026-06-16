import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MediaContent } from "@/lib/media";
import type { PortfolioImage, VideoItem } from "@/data/site";

export const runtime = "nodejs";

function safeExt(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return ext.replace(/[^a-z0-9.]/g, "");
}

function slugBase() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function saveFileToPublic(file: File, subdir: string) {
  const ext = safeExt(file.name) || "";
  const filename = `${slugBase()}-${Math.random().toString(16).slice(2)}${ext}`;
  const absDir = path.join(process.cwd(), "public", subdir);
  await mkdir(absDir, { recursive: true });
  const absPath = path.join(absDir, filename);

  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, buf);

  return {
    publicPath: `/${subdir}/${filename}`,
    filename,
  };
}

async function readMediaFile(): Promise<MediaContent> {
  const p = path.join(process.cwd(), "content", "media.json");
  const raw = await readFile(p, "utf8");
  return JSON.parse(raw) as MediaContent;
}

async function writeMediaFile(media: MediaContent) {
  const p = path.join(process.cwd(), "content", "media.json");
  await writeFile(p, JSON.stringify(media, null, 2) + "\n", "utf8");
}

export async function POST(req: Request) {
  const form = await req.formData();
  const type = String(form.get("type") || "");

  if (type !== "image" && type !== "video") {
    return NextResponse.json(
      { ok: false, error: "Campo `type` non valido (image|video)" },
      { status: 400 },
    );
  }

  const media = await readMediaFile();

  if (type === "image") {
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "File immagine mancante" },
        { status: 400 },
      );
    }

    const style = String(form.get("style") || "blackwork");
    const alt = String(form.get("alt") || "Tatuaggio");
    const date = String(form.get("date") || new Date().toISOString().slice(0, 10));

    const saved = await saveFileToPublic(file, "portfolio");
    const item: PortfolioImage = {
      id: `p${Date.now()}`,
      src: saved.publicPath,
      alt,
      style,
      date,
    };

    media.portfolioImages.unshift(item);
    await writeMediaFile(media);

    return NextResponse.json({ ok: true, item });
  }

  // video
  const file = form.get("file");
  const poster = form.get("poster");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "File video mancante" },
      { status: 400 },
    );
  }
  if (!(poster instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Poster mancante (immagine)" },
      { status: 400 },
    );
  }

  const title = String(form.get("title") || "Video lavorazione");
  const duration = String(form.get("duration") || "00:00");
  const orientation = String(form.get("orientation") || "horizontal");
  const date = String(form.get("date") || new Date().toISOString().slice(0, 10));

  if (orientation !== "horizontal" && orientation !== "vertical") {
    return NextResponse.json(
      { ok: false, error: "orientation non valido (horizontal|vertical)" },
      { status: 400 },
    );
  }

  const savedVideo = await saveFileToPublic(file, "videos");
  const savedPoster = await saveFileToPublic(poster, "video-posters");

  const item: VideoItem = {
    id: `v${Date.now()}`,
    src: savedVideo.publicPath,
    poster: savedPoster.publicPath,
    title,
    duration,
    orientation,
    date,
  };

  media.videos.unshift(item);
  await writeMediaFile(media);

  return NextResponse.json({ ok: true, item });
}

