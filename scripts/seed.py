#!/usr/bin/env python3
"""
Streamscape — one-shot Supabase setup: create the schema AND load the dataset.

Usage:
    py -m pip install pandas psycopg2-binary python-dotenv
    copy .env.example .env          # then edit .env and set SUPABASE_DB_URL
    py scripts/seed.py

    # options
    py scripts/seed.py --skip-schema            # data only, don't re-run schema.sql
    py scripts/seed.py path/to/other.csv        # use a different CSV

SUPABASE_DB_URL comes from the Supabase dashboard:
    Project -> "Connect" (top bar) -> Connection string -> URI  (Session pooler, port 5432)
    postgresql://postgres.<ref>:<db-password>@aws-0-<region>.pooler.supabase.com:5432/postgres
"""
import io
import os
import sys

import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv()

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SCHEMA_PATH = os.path.join(ROOT, "supabase", "schema.sql")

args = [a for a in sys.argv[1:]]
skip_schema = "--skip-schema" in args
args = [a for a in args if not a.startswith("--")]
CSV_PATH = args[0] if args else os.path.join(ROOT, "data", "spotify_artist_streaming_2020_2025.csv")

DB_URL = os.environ.get("SUPABASE_DB_URL")
if not DB_URL:
    sys.exit(
        "ERROR: SUPABASE_DB_URL is not set.\n"
        "  1. copy .env.example to .env\n"
        "  2. in the Supabase dashboard click 'Connect' -> Connection string -> URI\n"
        "  3. paste it into .env as SUPABASE_DB_URL=... (with your DB password in it)"
    )
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


def build_frames(csv_path: str):
    print(f"Reading {csv_path} ...")
    raw = pd.read_csv(csv_path)
    raw["explicit_bool"] = raw["is_explicit_bool"].astype(str).str.lower().eq("true")
    raw["weekend_bool"] = raw["is_weekend_release"].astype(str).str.lower().eq("true")
    print(f"  {len(raw):,} rows, {raw['artist_name'].nunique()} artists")

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
    return raw, artists


def main():
    raw, artists = build_frames(CSV_PATH)

    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    if not skip_schema:
        print("Applying supabase/schema.sql ...")
        with open(SCHEMA_PATH, "r", encoding="utf-8") as fh:
            cur.execute(fh.read())
    else:
        print("Skipping schema (--skip-schema).")

    print("Clearing existing rows ...")
    cur.execute("TRUNCATE public.tracks, public.artists RESTART IDENTITY CASCADE;")

    print(f"Loading {len(artists):,} artists ...")
    copy_df(cur, "public.artists", artists)

    cur.execute("SELECT id, name FROM public.artists;")
    artist_id = {name: aid for aid, name in cur.fetchall()}

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
    print(f"\nDone.  artists={a:,}  tracks={t:,}")
    if a != 500 or t != 50000:
        print("WARNING: expected 500 artists / 50,000 tracks — check the CSV.")


if __name__ == "__main__":
    main()
