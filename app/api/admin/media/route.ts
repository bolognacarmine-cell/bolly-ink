import { getMedia } from "@/lib/media";
import { NextResponse } from "next/server";

export async function GET() {
  const media = await getMedia();
  return NextResponse.json(media);
}

