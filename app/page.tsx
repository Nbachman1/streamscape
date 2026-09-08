import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { GenreBar } from "@/components/charts/genre-bar";
import { YearArea } from "@/components/charts/year-area";
import { compact, country, flag, full } from "@/lib/format";
import {
  getGenreStats,
  getMarketStats,
  getOverview,
  getStreamsByYear,
  getTopArtists,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [overview, genres, years, topArtists, markets] = await Promise.all([
    getOverview(),
    getGenreStats(),
    getStreamsByYear(),
    getTopArtists(8),
    getMarketStats(),
  ]);

  const topMarkets = markets.slice(0, 6);

  return (
    <div className="space-y-10">
      {/* hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-card px-6 py-12 md:px-10">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className="relative max-w-2xl">
          <Badge variant="outline" className="mb-4">
            2020 – 2025 · 20 genres · 30 markets
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            The shape of six years in streaming.
          </h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Streamscape turns {full(overview.total_tracks)} Spotify tracks into a browsable
            map of streams, popularity, and the audio DNA behind them.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tracks"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse tracks <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/artists"
              className="inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Artist leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* stat row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total streams" value={compact(overview.total_streams)} sub="across all tracks" />
        <StatCard label="Tracks" value={full(overview.total_tracks)} sub="2020–2025 releases" />
        <StatCard label="Artists" value={full(overview.total_artists)} sub="unique performers" />
        <StatCard
          label="Avg. popularity"
          value={`${overview.avg_popularity}`}
          sub="Spotify score, 0–100"
        />
      </section>

      {/* charts */}
      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Streams by genre</CardTitle>
            <CardDescription>Total plays across the catalogue, top 12 genres</CardDescription>
          </CardHeader>
          <CardContent>
            <GenreBar data={genres} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Streams by release year</CardTitle>
            <CardDescription>When the most-played tracks came out</CardDescription>
          </CardHeader>
          <CardContent>
            <YearArea data={years} />
          </CardContent>
        </Card>
      </section>

      {/* leaderboard + markets */}
      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Top artists by streams</CardTitle>
              <CardDescription>Career totals within the dataset window</CardDescription>
            </div>
            <Link href="/artists" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-border/60">
            {topArtists.map((a, i) => (
              <Link
                key={a.id}
                href={`/artists/${a.id}`}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 hover:opacity-80"
              >
                <span className="w-5 text-sm tabular-nums text-muted-foreground">{i + 1}</span>
                <span className="flex-1 font-medium">{a.name}</span>
                {a.top_genre ? (
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {a.top_genre}
                  </Badge>
                ) : null}
                <span className="w-24 text-right text-sm tabular-nums">
                  {compact(a.total_streams)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Biggest markets</CardTitle>
            <CardDescription>Release country, by total streams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topMarkets.map((m) => {
              const max = topMarkets[0].total_streams;
              return (
                <div key={m.market} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      <span className="mr-2">{flag(m.market)}</span>
                      {country(m.market)}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {compact(m.total_streams)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(m.total_streams / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
