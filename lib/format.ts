const COMPACT = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const FULL = new Intl.NumberFormat("en-US");

export const compact = (n: number | null | undefined) => (n == null ? "—" : COMPACT.format(n));
export const full = (n: number | null | undefined) => (n == null ? "—" : FULL.format(n));

export const pct = (n: number | null | undefined, digits = 0) =>
  n == null ? "—" : `${(n * 100).toFixed(digits)}%`;

export const duration = (ms: number) => {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const REGION = new Intl.DisplayNames(["en"], { type: "region" });
export const country = (iso2: string) => {
  try {
    return REGION.of(iso2) ?? iso2;
  } catch {
    return iso2;
  }
};

export const flag = (iso2: string) =>
  iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
