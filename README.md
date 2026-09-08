# Streamscape

A Spotify streaming-analytics explorer built on **Next.js (App Router) + shadcn/ui + Supabase**.
It turns `spotify_artist_streaming_2020_2025.csv` — 50,000 tracks from 500 artists across
20 genres and 30 markets — into a browsable dashboard.

## Features

- **Overview dashboard** — total streams / tracks / artists / avg. popularity, streams-by-genre
  bar chart, streams-by-release-year area chart, top-artist leaderboard, biggest markets.
- **Track browser** — full-text search plus filters (genre, market, year, popularity tier,
  explicit, min. danceability), server-side sorting on 6 columns, pagination over all 50k rows,
  and a per-track dialog with an audio-feature radar.
- **Artist leaderboard** — sortable by streams / track count / popularity / name, with search.
- **Artist detail** — rollup stats, most-streamed tracks, genre mix.
- Dark-first theme with a light toggle, responsive down to mobile.

## Tech

| Layer      | Choice |
|------------|--------|
| Framework  | Next.js 16, React 19, TypeScript |
| UI         | shadcn/ui (new-york), Tailwind CSS v3, Recharts |
| Data       | Supabase (Postgres + PostgREST), `@supabase/supabase-js` |
| Hosting    | Vercel |

## Data model (`supabase/schema.sql`)

```
artists ──1:N──> tracks
```

- **`artists`** (500 rows) — pre-aggregated rollups: `track_count`, `total_streams`,
  `avg_popularity`, `top_genre`, `home_market`, `explicit_share`.
- **`tracks`** (50,000 rows) — release metadata, streaming counts, popularity tier,
  and audio features (`danceability`, `energy`, `instrumentalness`, `tempo`, `loudness`,
  `music_key` / `key_name`, `mode` / `mode_name`, `upbeat_score`).
- **`genre_stats`** view + RPC helpers (`overview_stats`, `streams_by_year`, `market_stats`,
  `artist_genre_mix`) for the dashboard aggregates.
- Trigram indexes on `name` columns for search; RLS enabled with public **SELECT-only** policies.

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Click **Connect** in the top bar → **Connection string** → **URI** → copy the
   **Session pooler** string (port 5432). It looks like
   `postgresql://postgres.<ref>:<db-password>@aws-0-<region>.pooler.supabase.com:5432/postgres`
   — replace `<db-password>` with your database password.
3. From the project folder, create the schema **and** load all 50k rows in one command:
   ```bash
   py -m pip install pandas psycopg2-binary python-dotenv   # once
   copy .env.example .env                                    # then edit .env, set SUPABASE_DB_URL
   py scripts/seed.py
   ```
   Expect `Done.  artists=500  tracks=50,000`.

   (The script runs `supabase/schema.sql` for you. To load data without touching the
   schema, use `py scripts/seed.py --skip-schema`.)

### 2. Local dev

```bash
npm install
cp .env.example .env.local        # fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev                       # http://localhost:3000
```

### 3. Deploy to Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project → Import** the GitHub repo.
3. Add environment variables (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy.**

## Environment variables

| Name | Where | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | anon/public key — safe to expose |
| `SUPABASE_DB_URL` | `.env` (local only) | Postgres URI, **seeding only**, never commit |
