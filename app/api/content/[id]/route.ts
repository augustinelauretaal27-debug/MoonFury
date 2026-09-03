import { NextRequest, NextResponse } from "next/server";
import { getTmdbContent } from "@/lib/tmdb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const typeHint = req.nextUrl.searchParams.get("type"); // "movie" | "tv" | null

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ content: null }, { status: 404 });
  }

  let content = null;

  if (typeHint === "movie") {
    content = await getTmdbContent(id, "movie");
  } else if (typeHint === "tv") {
    content = await getTmdbContent(id, "tv");
  } else {
    const [movie, tv] = await Promise.all([
      getTmdbContent(id, "movie"),
      getTmdbContent(id, "tv"),
    ]);
    content = tv ?? movie;
  }

  if (!content) {
    return NextResponse.json({ content: null }, { status: 404 });
  }

  return NextResponse.json({ content });
}
