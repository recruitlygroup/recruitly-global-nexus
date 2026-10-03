import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSEO } from "@/hooks/useSEO";
import { useDebounce } from "@/hooks/useDebounce";
import { COUNTRY_LIST, DEPARTMENTS, LEVELS } from "@/data/generated";
import { searchPrograms } from "@/lib/universityApi";
import { PageShell, ProgramCard, ListSkeleton, Pager, EmptyState, ErrorState, Notice, UNI_NOTICE } from "@/components/study/parts";
import { Reveal } from "@/components/motion/Reveal";

const FilterSelect = ({ label, value, options, onChange }: { label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) => (
  <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
    <SelectTrigger aria-label={label}><SelectValue placeholder={label} /></SelectTrigger>
    <SelectContent><SelectItem value="all">{label}</SelectItem>{options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
  </Select>
);

const ProgramsPage = () => {
  const [sp, setSp] = useSearchParams();
  const country = sp.get("country") ?? "", level = sp.get("level") ?? "", department = sp.get("field") ?? "";
  const universityId = sp.get("uid") ?? "";
  const page = Number(sp.get("page") ?? 0) || 0;
  const [text, setText] = useState(sp.get("q") ?? "");
  const q = useDebounce(text, 300);

  useSEO({
    title: `Study Programs${country ? ` in ${country}` : " Abroad"} | Recruitly Group`,
    description: "Search bachelor's and master's programs by country, level and field, with tuition and official links where available.",
    canonicalUrl: `https://www.recruitlygroup.com/programs${country ? `?country=${encodeURIComponent(country)}` : ""}`,
  });

  const set = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    n.delete("page");
    setSp(n, { replace: true });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the debounced text changes
  useEffect(() => { if (q !== (sp.get("q") ?? "")) set({ q: q || null }); }, [q]);

  const query = useQuery({
    queryKey: ["progs", sp.get("q") ?? "", country, level, department, universityId, page],
    queryFn: () => searchPrograms({ q: sp.get("q") ?? "", country, level, department, universityId, page }),
    placeholderData: keepPreviousData, staleTime: 5 * 60_000,
  });

  return (
    <PageShell>
      <Reveal>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Programs</h1>
        <p className="text-muted-foreground mt-2 mb-6 max-w-2xl">Filter by country, level and field. Language and intake filters will be added once that data is available.</p>
      </Reveal>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <div className="relative sm:col-span-2 lg:col-span-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search program name…" className="pl-9" aria-label="Search programs" />
        </div>
        <FilterSelect label="All countries" value={country} onChange={(v) => set({ country: v || null })} options={COUNTRY_LIST.map((c) => ({ v: c.name, l: `${c.flag} ${c.name}` }))} />
        <FilterSelect label="All levels" value={level} onChange={(v) => set({ level: v || null })} options={LEVELS.map((l) => ({ v: l, l }))} />
        <FilterSelect label="All fields" value={department} onChange={(v) => set({ field: v || null })} options={DEPARTMENTS.map((d) => ({ v: d, l: d }))} />
        {universityId && <button className="text-sm text-primary text-left" onClick={() => set({ uid: null })}>Showing one university only — clear</button>}
      </div>
      <Notice>{UNI_NOTICE}</Notice>
      <div className="mt-6" aria-busy={query.isFetching}>
        {query.isError ? <ErrorState onRetry={() => query.refetch()} />
          : !query.data ? <ListSkeleton />
          : query.data.rows.length === 0 ? <EmptyState text="No programs match these filters." onClear={() => { setText(""); setSp({}, { replace: true }); }} />
          : <>
              <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ${query.isPlaceholderData ? "opacity-60" : ""}`}>
                {query.data.rows.map((p, i) => <Reveal key={p.id} delay={Math.min(i, 8) * 0.02}><ProgramCard p={p} /></Reveal>)}
              </div>
              <Pager page={page} hasMore={query.data.hasMore} onPage={(p) => { const n = new URLSearchParams(sp); if (p) n.set("page", String(p)); else n.delete("page"); setSp(n, { replace: true }); window.scrollTo({ top: 0 }); }} />
            </>}
      </div>
    </PageShell>
  );
};
export default ProgramsPage;
