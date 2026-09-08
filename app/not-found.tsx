import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-6xl font-semibold text-primary">404</p>
      <p className="text-muted-foreground">That track skipped. Nothing here.</p>
      <Link href="/" className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
        Back to overview
      </Link>
    </div>
  );
}
