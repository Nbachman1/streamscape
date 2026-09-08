import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Streamscape — synthetic streaming analytics, 2020–2025",
  description:
    "Explore a synthetic dataset of 50,000 tracks from 500 artists: streams, popularity, audio features, and release trends across 20 genres and 30 markets. Figures are procedurally generated, not real Spotify data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SiteHeader />
          <main className="container py-8">{children}</main>
          <footer className="border-t border-border/60 py-6">
            <div className="container space-y-1 text-xs text-muted-foreground">
              <p>
                Built with Next.js, shadcn/ui, and Supabase · Dataset:{" "}
                <code>spotify_artist_streaming_2020_2025</code>
              </p>
              <p>
                Synthetic data — artist names and streaming figures are procedurally
                generated for analysis practice and do not represent real artists or
                Spotify metrics.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
