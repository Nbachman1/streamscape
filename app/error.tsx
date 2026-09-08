"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-2xl font-semibold">Something broke fetching the data.</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message.includes("SUPABASE")
          ? "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
          : error.message}
      </p>
      <button onClick={reset} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
        Try again
      </button>
    </div>
  );
}
