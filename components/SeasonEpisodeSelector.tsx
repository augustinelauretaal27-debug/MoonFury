"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Season } from "@/data/movies";
import { SeasonSelector, EpisodeList } from "./EpisodeList";

export function SeasonEpisodeSelector({
  seriesId,
  seasons,
}: {
  seriesId: string;
  seasons: Season[];
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const season =
    seasons.find((x) => x.number === selected) || seasons[0];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold sm:text-2xl">Episodes</h2>
        {mounted && (
          <SeasonSelector
            seasons={seasons}
            selected={selected}
            onChange={setSelected}
          />
        )}
      </div>
      {mounted && (
        <EpisodeList
          seriesId={seriesId}
          season={season}
          onPlay={(ep) => {
            router.push(
              `/watch/${seriesId}?s=${season.number}&e=${ep.number}`
            );
          }}
        />
      )}
    </div>
  );
}
