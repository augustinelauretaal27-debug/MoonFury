import { NextRequest, NextResponse } from "next/server";
import { getTmdbSeriesSeasons } from "@/lib/tmdb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getTmdbSeriesSeasons(id);
  return NextResponse.json({ seasons: data?.seasons ?? [] });
}
