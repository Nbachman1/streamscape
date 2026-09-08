"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrackDialog } from "@/components/track-dialog";
import type { TrackWithArtist } from "@/lib/types";
import { compact, flag } from "@/lib/format";

const COLUMNS: { key: string; label: string; sortKey?: string; className?: string }[] = [
  { key: "name", label: "Track" },
  { key: "artist", label: "Artist" },
  { key: "genre", label: "Genre" },
  { key: "market", label: "Market" },
  { key: "release", label: "Released", sortKey: "release", className: "hidden md:table-cell" },
  { key: "tempo", label: "BPM", sortKey: "tempo", className: "hidden lg:table-cell text-right" },
  { key: "danceability", label: "Dance", sortKey: "danceability", className: "hidden lg:table-cell text-right" },
  { key: "popularity", label: "Pop.", sortKey: "popularity", className: "text-right" },
  { key: "streams", label: "Streams", sortKey: "streams", className: "text-right" },
];

export function TrackTable({ rows }: { rows: TrackWithArtist[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [selected, setSelected] = React.useState<TrackWithArtist | null>(null);

  const sort = params.get("sort") ?? "streams";
  const dir = params.get("dir") ?? "desc";

  function toggleSort(key: string) {
    const sp = new URLSearchParams(params.toString());
    if (sort === key) {
      sp.set("dir", dir === "asc" ? "desc" : "asc");
    } else {
      sp.set("sort", key);
      sp.set("dir", "desc");
    }
    sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {COLUMNS.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.sortKey ? (
                    <button
                      onClick={() => toggleSort(c.sortKey!)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {c.label}
                      {sort === c.sortKey ? (
                        dir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="py-12 text-center text-muted-foreground">
                  No tracks match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((t) => (
                <TableRow
                  key={t.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(t)}
                >
                  <TableCell className="max-w-[220px]">
                    <div className="truncate font-medium">{t.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{t.album_name}</div>
                  </TableCell>
                  <TableCell>
                    {t.artists ? (
                      <Link
                        href={`/artists/${t.artists.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {t.artists.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t.genre}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="mr-1">{flag(t.market)}</span>
                    <span className="text-muted-foreground">{t.market}</span>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                    {t.release_date}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums lg:table-cell">
                    {Math.round(t.tempo)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums lg:table-cell">
                    {t.danceability.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{t.popularity}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {compact(t.stream_count)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TrackDialog track={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
}
