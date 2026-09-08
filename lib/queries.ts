import "server-only";
import { getSupabase } from "./supabase";
import type { Artist, GenreStat, TrackWithArtist } from "./types";

export type Overview = {
  total_tracks: number;
  total_artists: number;
  total_streams: number;
  avg_popularity: number;
};

export async function getOverview(): Promise<Overview> {
  const { data, error } = await getSupabase().rpc("overview_stats").single();
  if (error) throw error;
  return data as Overview;
}

export async function getStreamsByYear() {
  const { data, error } = await getSupabase().rpc("streams_by_year");
  if (error) throw error;
  return (data ?? []) as {
    release_year: number;
    total_streams: number;
    track_count: number;
    avg_popularity: number;
  }[];
}

export async function getGenreStats(): Promise<GenreStat[]> {
  const { data, error } = await getSupabase()
    .from("genre_stats")
    .select("*")
    .order("total_streams", { ascending: false });
  if (error) throw error;
  return (data ?? []) as GenreStat[];
}

export async function getMarketStats() {
  const { data, error } = await getSupabase().rpc("market_stats");
  if (error) throw error;
  return (data ?? []) as { market: string; total_streams: number; track_count: number }[];
}

export async function getTopArtists(limit = 10): Promise<Artist[]> {
  const { data, error } = await getSupabase()
    .from("artists")
    .select("*")
    .order("total_streams", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Artist[];
}

// ---- Artists page --------------------------------------------------------
const ARTIST_SORTS = {
  streams: "total_streams",
  tracks: "track_count",
  popularity: "avg_popularity",
  name: "name",
} as const;
export type ArtistSort = keyof typeof ARTIST_SORTS;

export async function getArtists(opts: {
  q?: string;
  sort?: ArtistSort;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  const { q = "", sort = "streams", dir = "desc", page = 1, pageSize = 25 } = opts;
  let query = getSupabase().from("artists").select("*", { count: "exact" });
  if (q) query = query.ilike("name", `%${q}%`);
  query = query
    .order(ARTIST_SORTS[sort] ?? "total_streams", { ascending: dir === "asc" })
    .range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as Artist[], total: count ?? 0 };
}

export async function getArtist(id: number): Promise<Artist | null> {
  const { data, error } = await getSupabase().from("artists").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Artist) ?? null;
}

export async function getArtistTopTracks(id: number, limit = 10) {
  const { data, error } = await getSupabase()
    .from("tracks")
    .select("*, artists(id, name)")
    .eq("artist_id", id)
    .order("stream_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as TrackWithArtist[];
}

export async function getArtistGenreMix(id: number) {
  const { data, error } = await getSupabase().rpc("artist_genre_mix", { a_id: id });
  if (error) throw error;
  return (data ?? []) as { genre: string; track_count: number; total_streams: number }[];
}

// ---- Tracks browser -----------------------------------------------------
const TRACK_SORTS = {
  streams: "stream_count",
  popularity: "popularity",
  release: "release_date",
  tempo: "tempo",
  danceability: "danceability",
  energy: "energy",
} as const;
export type TrackSort = keyof typeof TRACK_SORTS;

export type TrackFilters = {
  q?: string;
  genre?: string;
  market?: string;
  year?: number;
  tier?: string;
  explicit?: "true" | "false";
  minDance?: number;
  sort?: TrackSort;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function getTracks(f: TrackFilters) {
  const {
    q = "", genre, market, year, tier, explicit, minDance,
    sort = "streams", dir = "desc", page = 1, pageSize = 25,
  } = f;

  let query = getSupabase().from("tracks").select("*, artists(id, name)", { count: "exact" });

  if (q) query = query.ilike("name", `%${q}%`);
  if (genre) query = query.eq("genre", genre);
  if (market) query = query.eq("market", market);
  if (year) query = query.eq("release_year", year);
  if (tier) query = query.eq("popularity_tier", tier);
  if (explicit === "true" || explicit === "false") query = query.eq("explicit", explicit === "true");
  if (minDance && minDance > 0) query = query.gte("danceability", minDance);

  query = query
    .order(TRACK_SORTS[sort] ?? "stream_count", { ascending: dir === "asc" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as TrackWithArtist[], total: count ?? 0 };
}
