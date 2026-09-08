import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Streamscape — Spotify streaming analytics, 2020–2025",
  description:
    "Explore 50,000 tracks from 500 artists: streams, popularity, audio features, and release trends across 20 genres and 30 markets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SiteHeader />
          <main className="container py-8">{children}</main>
          <footer className="border-t border-border/60 py-6">
            <div className="container text-xs text-muted-foreground">
              Built with Next.js, shadcn/ui, and Supabase · Dataset:{" "}
              <code>spotify_artist_streaming_2020_2025</code>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
