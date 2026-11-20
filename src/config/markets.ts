// src/config/markets.ts — market registry for B2B sourcing pages.
//
// Only Australia is active. To add a market (e.g. Portugal, Ireland):
//   1. add an entry to MARKETS (+ `/portugal/...` keys in market-routes.json for sitemap/prerender),
//   2. add a spec file next to src/data/pages/australia.ts and a route group in App.tsx,
//   3. add the market to the MARKET_OPTIONS enum in the b2b-lead edge function.
// Nothing in the form, SEO helpers or sitemap/prerender scripts is Australia-hard-coded beyond the registry.
import routeMeta from "./market-routes.json";

export type MarketId = "australia";
export type PoolId = "nepal" | "bulgaria" | "eu";

export interface Market { id: MarketId; name: string; basePath: string; pools: PoolId[]; active: boolean }
export const MARKETS: Record<MarketId, Market> = {
  australia: { id: "australia", name: "Australia", basePath: "/australia", pools: ["nepal", "bulgaria", "eu"], active: true },
};

export const SOURCING_POOLS: Record<PoolId, { id: PoolId; name: string; path: string }> = {
  nepal:    { id: "nepal",    name: "Nepal",    path: "/australia/sourcing/nepal" },
  bulgaria: { id: "bulgaria", name: "Bulgaria", path: "/australia/sourcing/bulgaria" },
  eu:       { id: "eu",       name: "European Union", path: "/australia/sourcing/eu" },
};

export const CONTACT_TYPES = [
  { value: "direct_employer", label: "Direct Australian employer" },
  { value: "licensed_agency", label: "Licensed Australian recruitment / labour-hire agency" },
] as const;

export const AU_TRADES = [
  "Electrician", "Welder / fabricator", "Diesel / auto mechanic", "Carpenter / joiner", "Plumber / gasfitter",
  "Bricklayer / concreter", "Chef / cook", "Heavy vehicle / machinery operator", "Engineering / technical", "Other trade or role",
] as const;

export const AU_WORKER_COUNTS = ["1", "2–5", "6–15", "16+"] as const;
export const AU_TIMEFRAMES = ["Within 3 months", "3–6 months", "6–12 months", "Planning ahead / not sure"] as const;

/** SEO metadata per route — single source for pages, sitemap and the prerender script. */
export type RouteMeta = { title: string; description: string; priority: string };
export const ROUTE_META = routeMeta as Record<string, RouteMeta>;
export const metaFor = (path: string): RouteMeta => {
  const m = ROUTE_META[path];
  if (!m) throw new Error(`No route meta for ${path} in src/config/market-routes.json`);
  return m;
};

/**
 * Company facts shown in trust blocks. Anything left empty is NOT rendered — never invent these.
 * [TODO: confirm each value with the business/legal before filling in.]
 */
export const AU_COMPANY = {
  /** [TODO: name of the registered/licensed Australian migration partner, if any] */
  migrationPartnerName: "",
  /** [TODO: partner's MARN — only the partner's own, verified number] */
  migrationPartnerMarn: "",
  /** [TODO: legal entity name + registration details to show in the footer/trust strip] */
  legalEntity: "",
  /** [TODO: confirm whether offices in Sofia and Kathmandu may be named in Australia copy] */
  officesConfirmed: true,
};
