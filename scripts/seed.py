#!/usr/bin/env python3
"""
Streamscape — load spotify_artist_streaming_2020_2025.csv into Supabase.

Usage:
    pip install pandas psycopg2-binary python-dotenv
    # put the Supabase connection string in .env  (Project Settings -> Database -> Connection string -> URI)
    #   SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
    python scripts/seed.py path/to/spotify_artist_streaming_2020_2025.csv

Run supabase/schema.sql in the Supabase SQL editor first.
"""
import io
import os
import sys

import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv()

CSV_PATH = sys.argv[1] if len(sys.argv) > 1 else "data/spotify_artist_streaming_2020_2025.csv"
DB_URL = os.environ.get("SUPABASE_DB_URL")

if not DB_URL:
    sys.exit("ERROR: set SUPABASE_DB_URL in your environment or .env file")
if not os.path.exists(CSV_PATH):
    sys.exit(f"ERROR: CSV not found at {CSV_PATH}")


def mode_or_none(series: pd.Series):
    m = series.mode()
    return m.iloc[0] if len(m) else None


def copy_df(cur, table: str, df: pd.DataFrame):
    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False, na_rep="")
    buf.seek(0)
    cols = ", ".join(df.columns)
    cur.copy_expert(f"COPY {table} ({cols}) FROM STDIN WITH (FORMAT csv, NULL '')", buf)


print(f"Reading {CSV_PATH} ...")
raw = pd.read_csv(CSV_PATH)
raw["explicit_bool"] = raw["is_explicit_bool"].astype(str).str.lower().eq("true")
raw["weekend_bool"] = raw["is_weekend_release"].astype(str).str.lower().eq("true")
print(f"  {len(raw):,} rows, {raw['artist_name'].nunique()} artists")

# ---- artists ---------------------------------------------------------------
artists = (
    raw.groupby("artist_name")
    .apply(
        lambda g: pd.Series(
            {
                "track_count": len(g),
                "total_streams": int(g["stream_count"].sum()),
                "avg_popularity": round(g["popularity"].mean(), 2),
                "top_genre": mode_or_none(g["genre"]),
                "home_market": mode_or_none(g["country"]),
                "explicit_share": round(g["explicit_bool"].mean(), 4),
            }
        ),
        include_groups=False,
    )
    .reset_index()
    .rename(columns={"artist_name": "name"})
)
artists = artists[
    ["name", "track_count", "total_streams", "avg_popularity",
     "top_genre", "home_market", "explicit_share"]
]

conn = psycopg2.connect(DB_URL)
conn.autocommit = False
cur = conn.cursor()

print("Truncating tables ...")
cur.execute("TRUNCATE public.tracks, public.artists RESTART IDENTITY CASCADE;")

print(f"Loading {len(artists):,} artists ...")
copy_df(cur, "public.artists", artists)

cur.execute("SELECT id, name FROM public.artists;")
artist_id = {name: aid for aid, name in cur.fetchall()}

# ---- tracks ---------------------------------------------------------------
tracks = pd.DataFrame(
    {
        "id": raw["track_id"],
        "artist_id": raw["artist_name"].map(artist_id),
        "name": raw["track_name"],
        "album_name": raw["album_name"],
        "label": raw["label"],
        "genre": raw["genre"],
        "market": raw["country"],
        "release_date": raw["release_date"],
        "release_year": raw["release_year"],
        "release_quarter": raw["release_quarter"],
        "weekend_release": raw["weekend_bool"],
        "duration_ms": raw["duration_ms"],
        "explicit": raw["explicit_bool"],
        "stream_count": raw["stream_count"],
        "popularity": raw["popularity"],
        "popularity_tier": raw["popularity_category"],
        "danceability": raw["danceability"],
        "energy": raw["energy"],
        "instrumentalness": raw["instrumentalness"],
        "upbeat_score": raw["upbeat_score"],
        "tempo": raw["tempo"],
        "loudness": raw["loudness"],
        "loudness_tier": raw["loudness_category"],
        "music_key": raw["key"],
        "key_name": raw["key_name"],
        "mode": raw["mode"],
        "mode_name": raw["mode_name"],
    }
)

print(f"Loading {len(tracks):,} tracks ...")
copy_df(cur, "public.tracks", tracks)

conn.commit()
cur.execute("SELECT count(*) FROM public.artists;")
a = cur.fetchone()[0]
cur.execute("SELECT count(*) FROM public.tracks;")
t = cur.fetchone()[0]
cur.close()
conn.close()
print(f"Done. artists={a:,}  tracks={t:,}")
