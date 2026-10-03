import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSEO } from "@/hooks/useSEO";
import { useDebounce } from "@/hooks/useDebounce";
import { COUNTRY_LIST } from "@/data/generated";
import { searchUniversities } from "@/lib/universityApi";
import { PageShell, UniversityCard, ListSkeleton, Pager, EmptyState, ErrorState, Notice, UNI_NOTICE } from "@/components/study/parts";
import { Reveal } from "@/components/motion/Reveal";

const UniversitiesPage = () => {
  const [sp, setSp] = useSearchParams();
  const country = sp.get("country") ?? "";
  const page = Number(sp.get("page") ?? 0) || 0;
  const [text, setText] = useState(sp.get("q") ?? "");
  const q = useDebounce(text, 300);

  useSEO({
    title: country ? `Universities in ${country} | Recruitly Group` : "Search Universities Abroad | Recruitly Group",
    description: `Search universities${country ? ` in ${country}` : " across Europe, Asia and North America"}. See official websites, admission requirements and programs.`,
    canonicalUrl: `https://www.recruitlygroup.com/universities${country ? `?country=${encodeURIComponent(country)}` : ""}`,
  });

  const set = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    setSp(n, { replace: true });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the debounced text changes
  useEffect(() => { if (q !== (sp.get("q") ?? "")) set({ q: q || null, page: null }); }, [q]);

  const query = useQuery({
    queryKey: ["unis", sp.get("q") ?? "", country, page],
    queryFn: () => searchUniversities({ q: sp.get("q") ?? "", country, page }),
    placeholderData: keepPreviousData, staleTime: 5 * 60_000,
  });

  return (
    <PageShell>
      <Reveal>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Universities</h1>
        <p className="text-muted-foreground mt-2 mb-6 max-w-2xl">Search by name or filter by country. Only the results you need are loaded.</p>
      </Reveal>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search university name…" className="pl-9" aria-label="Search universities" />
        </div>
        <Select value={country || "all"} onValueChange={(v) => set({ country: v === "all" ? null : v, page: null })}>
          <SelectTrigger className="sm:w-56" aria-label="Country"><SelectValue placeholder="All countries" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {COUNTRY_LIST.map((c) => <SelectItem key={c.slug} value={c.name}>{c.flag} {c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Notice>{UNI_NOTICE}</Notice>
      <div className="mt-6" aria-busy={query.isFetching}>
        {query.isError ? <ErrorState onRetry={() => query.refetch()} />
          : !query.data ? <ListSkeleton />
          : query.data.rows.length === 0 ? <EmptyState text="No universities match your search." onClear={() => { setText(""); setSp({}, { replace: true }); }} />
          : <>
              <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ${query.isPlaceholderData ? "opacity-60" : ""}`}>
                {query.data.rows.map((u, i) => <Reveal key={u.id} delay={Math.min(i, 8) * 0.02}><UniversityCard u={u} /></Reveal>)}
              </div>
              <Pager page={page} hasMore={query.data.hasMore} onPage={(p) => { set({ page: p ? String(p) : null }); window.scrollTo({ top: 0 }); }} />
            </>}
      </div>
    </PageShell>
  );
};
export default UniversitiesPage;
