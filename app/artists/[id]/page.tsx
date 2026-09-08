import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { GenreBar } from "@/components/charts/genre-bar";
import { compact, country, duration, flag, full, pct } from "@/lib/format";
import {
  getArtist,
  getArtistGenreMix,
  getArtistTopTracks,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artistId = Number(id);
  if (!Number.isFinite(artistId)) notFound();

  const [artist, topTracks, genreMix] = await Promise.all([
    getArtist(artistId),
    getArtistTopTracks(artistId, 12),
    getArtistGenreMix(artistId),
  ]);

  if (!artist) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/artists"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All artists
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{artist.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {artist.top_genre ? <Badge variant="secondary">{artist.top_genre}</Badge> : null}
            {artist.home_market ? (
              <Badge variant="outline">
                {flag(artist.home_market)} {country(artist.home_market)}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total streams" value={compact(artist.total_streams)} />
        <StatCard label="Tracks in dataset" value={full(artist.track_count)} />
        <StatCard label="Avg. popularity" value={`${artist.avg_popularity}`} sub="0–100" />
        <StatCard label="Explicit share" value={pct(artist.explicit_share)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Most-streamed tracks</CardTitle>
            <CardDescription>Top {topTracks.length} by play count</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Track</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead className="hidden sm:table-cell">Released</TableHead>
                  <TableHead className="text-right">Length</TableHead>
                  <TableHead className="text-right">Streams</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTracks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="max-w-[200px] truncate font-medium">{t.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.genre}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {t.release_date}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {duration(t.duration_ms)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {compact(t.stream_count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Genre mix</CardTitle>
            <CardDescription>Streams by genre for this artist</CardDescription>
          </CardHeader>
          <CardContent>
            <GenreBar
              data={genreMix.map((g) => ({
                genre: g.genre,
                total_streams: g.total_streams,
                track_count: g.track_count,
              }))}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
