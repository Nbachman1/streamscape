import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchBox } from "@/components/search-box";
import { SortableHeader } from "@/components/sortable-header";
import { compact, country, flag, full, pct } from "@/lib/format";
import { getArtists, type ArtistSort } from "@/lib/queries";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const { rows, total } = await getArtists({
    q: sp.q,
    sort: (sp.sort as ArtistSort) ?? "streams",
    dir: sp.dir === "asc" ? "asc" : "desc",
    page,
    pageSize: PAGE_SIZE,
  });

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const u = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => v && k !== "page" && u.set(k, v));
    u.set("page", String(p));
    return `/artists?${u.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Artist leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          {full(total)} artists · sorted by total streams within the 2020–2025 window
        </p>
      </div>

      <SearchBox placeholder="Search artists…" />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">#</TableHead>
              <TableHead>
                <SortableHeader sortKey="name">Artist</SortableHeader>
              </TableHead>
              <TableHead>Top genre</TableHead>
              <TableHead className="hidden sm:table-cell">Home</TableHead>
              <TableHead className="text-right">
                <SortableHeader sortKey="tracks" className="ml-auto">Tracks</SortableHeader>
              </TableHead>
              <TableHead className="hidden text-right md:table-cell">
                <SortableHeader sortKey="popularity" className="ml-auto">Avg pop.</SortableHeader>
              </TableHead>
              <TableHead className="hidden text-right lg:table-cell">Explicit</TableHead>
              <TableHead className="text-right">
                <SortableHeader sortKey="streams" className="ml-auto">Streams</SortableHeader>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a, i) => (
              <TableRow key={a.id}>
                <TableCell className="tabular-nums text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </TableCell>
                <TableCell>
                  <Link href={`/artists/${a.id}`} className="font-medium hover:underline">
                    {a.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {a.top_genre ? <Badge variant="secondary">{a.top_genre}</Badge> : "—"}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap sm:table-cell">
                  {a.home_market ? (
                    <>
                      <span className="mr-1">{flag(a.home_market)}</span>
                      <span className="text-muted-foreground">{country(a.home_market)}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{full(a.track_count)}</TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">
                  {a.avg_popularity}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums lg:table-cell">
                  {pct(a.explicit_share)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {compact(a.total_streams)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {page} of {full(pages)}
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={qs(page - 1)} scroll={false} className="rounded-md border px-3 py-1.5 hover:bg-accent">
              Previous
            </Link>
          ) : (
            <span className="rounded-md border px-3 py-1.5 opacity-50">Previous</span>
          )}
          {page < pages ? (
            <Link href={qs(page + 1)} scroll={false} className="rounded-md border px-3 py-1.5 hover:bg-accent">
              Next
            </Link>
          ) : (
            <span className="rounded-md border px-3 py-1.5 opacity-50">Next</span>
          )}
        </div>
      </div>
    </div>
  );
}
