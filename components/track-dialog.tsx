"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FeatureRadar } from "@/components/charts/feature-radar";
import type { TrackWithArtist } from "@/lib/types";
import { compact, country, duration, full } from "@/lib/format";

export function TrackDialog({
  track,
  onOpenChange,
}: {
  track: TrackWithArtist | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!track} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        {track ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">{track.name}</DialogTitle>
              <DialogDescription>
                {track.artists ? (
                  <Link href={`/artists/${track.artists.id}`} className="hover:underline">
                    {track.artists.name}
                  </Link>
                ) : (
                  "Unknown artist"
                )}
                {" · "}
                {track.album_name} · {track.release_date}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{track.genre}</Badge>
              <Badge variant="outline">
                {flagSafe(track.market)} {country(track.market)}
              </Badge>
              <Badge variant="outline">{track.key_name} {track.mode_name}</Badge>
              {track.explicit ? <Badge variant="destructive">Explicit</Badge> : null}
              <Badge variant="outline">{track.label}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <Metric label="Streams" value={compact(track.stream_count)} />
              <Metric label="Popularity" value={`${track.popularity}/100`} />
              <Metric label="Length" value={duration(track.duration_ms)} />
              <Metric label="Tempo" value={`${Math.round(track.tempo)} BPM`} />
              <Metric label="Loudness" value={`${track.loudness} dB`} />
              <Metric label="Energy" value={track.energy.toFixed(2)} />
              <Metric label="Danceability" value={track.danceability.toFixed(2)} />
              <Metric label="Instrumental" value={track.instrumentalness.toFixed(2)} />
            </div>

            <Separator />

            <div>
              <p className="mb-1 text-sm font-medium">Audio profile</p>
              <FeatureRadar
                features={[
                  { label: "Dance", value: track.danceability },
                  { label: "Energy", value: track.energy },
                  { label: "Upbeat", value: track.upbeat_score },
                  { label: "Instrumental", value: track.instrumentalness },
                  { label: "Tempo", value: clamp01((track.tempo - 60) / 160) },
                  { label: "Loudness", value: clamp01((track.loudness + 20) / 20) },
                ]}
              />
              <p className="text-xs text-muted-foreground">
                Full stream count: {full(track.stream_count)}
              </p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  );
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function flagSafe(iso2: string) {
  return iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
