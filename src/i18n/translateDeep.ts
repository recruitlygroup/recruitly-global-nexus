// Deep-translates page-content objects (PageSpec, legal docs, tables) using the EN→BG dictionary in pageStrings.bg.ts.
// Non-text keys (icons, routes, URLs, layout flags) are never touched.
export const SKIP_KEYS = new Set(["icon", "to", "href", "kind", "tone", "cols", "highlight", "value", "slug", "regions", "id"]);
export const isTranslatable = (s: string) => /[A-Za-z]{2}/.test(s) && !/^(https?:|mailto:|\/)/.test(s);

export const translateDeep = <T,>(v: T, dict: Record<string, string>, key?: string): T => {
  if (typeof v === "string") {
    if (key && SKIP_KEYS.has(key)) return v;
    return (dict[v] ?? v) as unknown as T;
  }
  if (Array.isArray(v)) return v.map((x) => translateDeep(x, dict, key)) as unknown as T;
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) o[k] = translateDeep(x, dict, k);
    return o as T;
  }
  return v;
};
