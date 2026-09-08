export type Artist = {
  id: number;
  name: string;
  track_count: number;
  total_streams: number;
  avg_popularity: number;
  top_genre: string | null;
  home_market: string | null;
  explicit_share: number;
};

export type Track = {
  id: string;
  artist_id: number;
  name: string;
  album_name: string | null;
  label: string | null;
  genre: string;
  market: string;
  release_date: string;
  release_year: number;
  release_quarter: string;
  weekend_release: boolean;
  duration_ms: number;
  explicit: boolean;
  stream_count: number;
  popularity: number;
  popularity_tier: string;
  danceability: number;
  energy: number;
  instrumentalness: number;
  upbeat_score: number;
  tempo: number;
  loudness: number;
  loudness_tier: string;
  music_key: number;
  key_name: string;
  mode: number;
  mode_name: string;
};

export type TrackWithArtist = Track & { artists: Pick<Artist, "id" | "name"> | null };

export type GenreStat = {
  genre: string;
  track_count: number;
  total_streams: number;
  avg_popularity: number;
  avg_danceability: number;
  avg_energy: number;
  avg_tempo: number;
  avg_duration_min: number;
};

export const GENRES = [
  "Afrobeats", "Alternative", "Classical", "Country", "Disco", "EDM", "Folk",
  "Hip-Hop", "Indie", "Jazz", "K-Pop", "Latin", "Metal", "Pop", "Punk", "R&B",
  "Reggaeton", "Rock", "Soul", "Trap",
] as const;

export const MARKETS = [
  "AR", "AU", "BR", "CA", "CL", "CO", "DE", "EG", "ES", "FR", "GB", "ID", "IN",
  "IT", "JP", "KR", "MX", "MY", "NG", "NL", "NZ", "PH", "PL", "PT", "SE", "SG",
  "TH", "TR", "US", "ZA",
] as const;

export const YEARS = [2020, 2021, 2022, 2023, 2024, 2025] as const;

export const POPULARITY_TIERS = ["Low", "Medium", "High", "Very High"] as const;
