import Link from "next/link";
import { TrackFilters } from "@/components/track-filters";
import { TrackTable } from "@/components/track-table";
import { full } from "@/lib/format";
import { getTracks, type TrackFilters as TF, type TrackSort } from "@/lib/queries";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function TracksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const filters: TF = {
    q: sp.q,
    genre: sp.genre,
    market: sp.market,
    year: sp.year ? Number(sp.year) : undefined,
    tier: sp.tier,
    explicit: sp.explicit === "true" || sp.explicit === "false" ? sp.explicit : undefined,
    minDance: sp.minDance ? Number(sp.minDance) : undefined,
    sort: (sp.sort as TrackSort) ?? "streams",
    dir: sp.dir === "asc" ? "asc" : "desc",
    page,
    pageSize: PAGE_SIZE,
  };

  const { rows, total } = await getTracks(filters);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const u = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => v && k !== "page" && u.set(k, v));
    u.set("page", String(p));
    return `/tracks?${u.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Track browser</h1>
        <p className="text-sm text-muted-foreground">
          {full(total)} tracks match · click any row for the full audio profile
        </p>
      </div>

      <TrackFilters />
      <TrackTable rows={rows} />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {page} of {full(pages)}
        </span>
        <div className="flex gap-2">
          <PagerLink href={qs(page - 1)} disabled={page <= 1}>
            Previous
          </PagerLink>
          <PagerLink href={qs(page + 1)} disabled={page >= pages}>
            Next
          </PagerLink>
        </div>
      </div>
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md border px-3 py-1.5 text-muted-foreground opacity-50">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} scroll={false} className="rounded-md border px-3 py-1.5 hover:bg-accent">
      {children}
    </Link>
  );
}
