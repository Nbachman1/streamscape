"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENRES, MARKETS, POPULARITY_TIERS, YEARS } from "@/lib/types";
import { country } from "@/lib/format";

const ANY = "any";

export function TrackFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = React.useState(params.get("q") ?? "");
  const [dance, setDance] = React.useState(Number(params.get("minDance") ?? 0));

  // debounce the free-text + slider into the URL
  React.useEffect(() => {
    const t = setTimeout(() => {
      update({ q: q || null, minDance: dance ? String(dance) : null }, false);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dance]);

  function update(next: Record<string, string | null>, resetPage = true) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === ANY) sp.delete(k);
      else sp.set(k, v);
    }
    if (resetPage) sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  const hasFilters = ["q", "genre", "market", "year", "tier", "explicit", "minDance"].some((k) =>
    params.get(k),
  );

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search track titles…"
            className="pl-9"
          />
        </div>

        <Select value={params.get("genre") ?? ANY} onValueChange={(v) => update({ genre: v })}>
          <SelectTrigger className="md:w-40"><SelectValue placeholder="Genre" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All genres</SelectItem>
            {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={params.get("market") ?? ANY} onValueChange={(v) => update({ market: v })}>
          <SelectTrigger className="md:w-40"><SelectValue placeholder="Market" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All markets</SelectItem>
            {MARKETS.map((m) => <SelectItem key={m} value={m}>{country(m)}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={params.get("year") ?? ANY} onValueChange={(v) => update({ year: v })}>
          <SelectTrigger className="md:w-28"><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any year</SelectItem>
            {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select value={params.get("tier") ?? ANY} onValueChange={(v) => update({ tier: v })}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="Popularity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any popularity</SelectItem>
            {POPULARITY_TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={params.get("explicit") ?? ANY} onValueChange={(v) => update({ explicit: v })}>
          <SelectTrigger className="md:w-40"><SelectValue placeholder="Explicit" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Explicit + clean</SelectItem>
            <SelectItem value="false">Clean only</SelectItem>
            <SelectItem value="true">Explicit only</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-1 items-center gap-3">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            Min danceability {dance.toFixed(2)}
          </span>
          <Slider
            value={[dance]}
            onValueChange={([v]) => setDance(v)}
            min={0}
            max={1}
            step={0.05}
            className="max-w-56"
          />
        </div>

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("");
              setDance(0);
              router.replace(pathname, { scroll: false });
            }}
          >
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
