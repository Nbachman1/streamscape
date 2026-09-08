"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SortableHeader({
  sortKey,
  children,
  className,
  defaultSort = "streams",
}: {
  sortKey: string;
  children: React.ReactNode;
  className?: string;
  defaultSort?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const sort = params.get("sort") ?? defaultSort;
  const dir = params.get("dir") ?? "desc";
  const active = sort === sortKey;

  function onClick() {
    const sp = new URLSearchParams(params.toString());
    if (active) sp.set("dir", dir === "asc" ? "desc" : "asc");
    else {
      sp.set("sort", sortKey);
      sp.set("dir", "desc");
    }
    sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <button
      onClick={onClick}
      className={cn("inline-flex items-center gap-1 hover:text-foreground", className)}
    >
      {children}
      {active ? (
        dir === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  );
}
