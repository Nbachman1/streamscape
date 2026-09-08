-- ============================================================================
-- Streamscape — Supabase schema
-- Dataset: spotify_artist_streaming_2020_2025.csv (50,000 tracks / 500 artists)
-- ============================================================================

-- trigram search needs this extension (available on Supabase by default)
create extension if not exists pg_trgm;

-- Clean slate (safe to re-run)
drop view  if exists public.genre_stats;
drop table if exists public.tracks cascade;
drop table if exists public.artists cascade;

-- ----------------------------------------------------------------------------
-- artists — one row per performer, with pre-aggregated rollups for fast leaderboards
-- ----------------------------------------------------------------------------
create table public.artists (
  id             bigint generated always as identity primary key,
  name           text not null unique,
  track_count    integer not null default 0,          -- tracks present in this dataset
  total_streams  bigint  not null default 0,          -- sum of stream_count across those tracks
  avg_popularity numeric(5,2) not null default 0,     -- mean Spotify popularity (0-100)
  top_genre      text,                                -- most frequent genre for this artist
  home_market    text,                                -- most frequent release country (ISO-2)
  explicit_share numeric(5,4) not null default 0      -- fraction of tracks flagged explicit
);

-- ----------------------------------------------------------------------------
-- tracks — one row per track, audio features + release metadata + streams
-- ----------------------------------------------------------------------------
create table public.tracks (
  id               uuid primary key,                  -- source track_id
  artist_id        bigint not null references public.artists(id) on delete cascade,
  name             text not null,
  album_name       text,
  label            text,
  genre            text not null,
  market           text not null,                     -- release country, ISO-2
  release_date     date not null,
  release_year     smallint not null,
  release_quarter  text not null,                     -- Q1..Q4
  weekend_release  boolean not null default false,

  duration_ms      integer not null,
  explicit         boolean not null default false,

  -- streaming + popularity
  stream_count     bigint not null,
  popularity       smallint not null,                 -- 0-100
  popularity_tier  text not null,                     -- Low / Medium / High / Very High

  -- audio features
  danceability     numeric(6,4) not null,             -- 0-1
  energy           numeric(6,4) not null,             -- 0-1
  instrumentalness numeric(7,5) not null,             -- 0-1
  upbeat_score     numeric(6,4) not null,             -- 0-1 (danceability x energy blend)
  tempo            numeric(6,2) not null,             -- BPM
  loudness         numeric(6,2) not null,             -- dB
  loudness_tier    text not null,                     -- Quiet / Moderate / Loud
  music_key        smallint not null,                 -- 0-11 pitch class
  key_name         text not null,                     -- C, C#, ...
  mode             smallint not null,                 -- 0 = minor, 1 = major
  mode_name        text not null                      -- Minor / Major
);

-- ----------------------------------------------------------------------------
-- Indexes — tuned for the browser filters and leaderboards
-- ----------------------------------------------------------------------------
create index tracks_artist_id_idx    on public.tracks (artist_id);
create index tracks_genre_idx        on public.tracks (genre);
create index tracks_market_idx       on public.tracks (market);
create index tracks_release_year_idx on public.tracks (release_year);
create index tracks_streams_idx      on public.tracks (stream_count desc);
create index tracks_popularity_idx   on public.tracks (popularity desc);
create index tracks_name_trgm_idx    on public.tracks using gin (name gin_trgm_ops);
create index artists_name_trgm_idx   on public.artists using gin (name gin_trgm_ops);
create index artists_streams_idx     on public.artists (total_streams desc);

-- ----------------------------------------------------------------------------
-- Convenience view: genre-level aggregates for the dashboard
-- ----------------------------------------------------------------------------
create or replace view public.genre_stats as
select
  genre,
  count(*)                         as track_count,
  sum(stream_count)                as total_streams,
  round(avg(popularity), 1)        as avg_popularity,
  round(avg(danceability), 3)      as avg_danceability,
  round(avg(energy), 3)            as avg_energy,
  round(avg(tempo), 1)             as avg_tempo,
  round(avg(duration_ms) / 60000.0, 2) as avg_duration_min
from public.tracks
group by genre
order by total_streams desc;

-- ----------------------------------------------------------------------------
-- RPC helpers — aggregates the dashboard needs (called via supabase.rpc())
-- ----------------------------------------------------------------------------
create or replace function public.overview_stats()
returns table (total_tracks bigint, total_artists bigint, total_streams bigint, avg_popularity numeric)
language sql stable as $$
  select count(*)::bigint                              as total_tracks,
         (select count(*) from public.artists)::bigint as total_artists,
         sum(t.stream_count)::bigint                   as total_streams,
         round(avg(t.popularity), 1)                   as avg_popularity
  from public.tracks t;
$$;

create or replace function public.streams_by_year()
returns table (release_year smallint, total_streams bigint, track_count bigint, avg_popularity numeric)
language sql stable as $$
  select t.release_year                as release_year,
         sum(t.stream_count)::bigint   as total_streams,
         count(*)::bigint              as track_count,
         round(avg(t.popularity), 1)   as avg_popularity
  from public.tracks t
  group by t.release_year
  order by t.release_year;
$$;

create or replace function public.market_stats()
returns table (market text, total_streams bigint, track_count bigint)
language sql stable as $$
  select t.market                    as market,
         sum(t.stream_count)::bigint as total_streams,
         count(*)::bigint            as track_count
  from public.tracks t
  group by t.market
  order by sum(t.stream_count) desc;
$$;

create or replace function public.artist_genre_mix(a_id bigint)
returns table (genre text, track_count bigint, total_streams bigint)
language sql stable as $$
  select t.genre                     as genre,
         count(*)::bigint            as track_count,
         sum(t.stream_count)::bigint as total_streams
  from public.tracks t
  where t.artist_id = a_id
  group by t.genre
  order by sum(t.stream_count) desc;
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security — public read-only site
-- ----------------------------------------------------------------------------
alter table public.artists enable row level security;
alter table public.tracks  enable row level security;

create policy "public read artists" on public.artists for select using (true);
create policy "public read tracks"  on public.tracks  for select using (true);
