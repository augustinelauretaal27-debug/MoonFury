import { NextRequest, NextResponse } from "next/server";
import { getTmdbSeason } from "@/lib/tmdb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; season: string }> }
) {
  const { id, season } = await params;
  const seasonNum = Number(season);

  if (!id || isNaN(seasonNum)) {
    return NextResponse.json({ season: null }, { status: 400 });
  }

  const data = await getTmdbSeason(id, seasonNum);
  return NextResponse.json({ season: data });
}
