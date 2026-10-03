import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { COUNTRY_LIST } from "@/data/generated";
import { getCountryStats, searchUniversities, searchPrograms } from "@/lib/universityApi";
import { PageShell, UniversityCard, ProgramCard, VisaSource, Notice, UNI_NOTICE, ListSkeleton } from "@/components/study/parts";
import { Reveal } from "@/components/motion/Reveal";

export const StudyAbroadIndex = () => {
  useSEO({
    title: "Study Abroad Destinations | Recruitly Group",
    description: "Choose a study destination and explore its universities, programs, admission information and official visa sources.",
    canonicalUrl: "https://www.recruitlygroup.com/study-abroad",
  });
  return (
    <PageShell>
      {/* Hero — soft glass accent band behind the heading */}
      <div className="relative -mx-4 px-4 pt-2 pb-10 mb-2 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.06] via-accent/[0.04] to-transparent" aria-hidden />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl -z-10" aria-hidden />
        <Reveal>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Study abroad destinations</h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-base md:text-lg">
            Pick a country to see its universities and programs, with links to official sources — no account needed.
          </p>
        </Reveal>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {COUNTRY_LIST.map((c, i) => (
          <Reveal key={c.slug} delay={Math.min(i, 9) * 0.03}>
            <Link to={`/study-abroad/${c.slug}`} className="group block h-full">
              <Card className="h-full rounded-2xl border-border/70 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200">
                <CardContent className="p-4 flex flex-col gap-1">
                  <div className="flex items-start justify-between">
                    <span className="text-2xl" aria-hidden>{c.flag}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="font-medium text-foreground mt-1">{c.name}</span>
                </CardContent>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
};

const CHECKLIST = ["Valid passport", "Academic transcripts and certificates", "English test result, if the university asks for one", "Statement of purpose / motivation letter", "Proof of funds", "Application submitted through the university's official portal", "Visa application through the official immigration source"];
const FAQ = [
  ["Are the requirements shown here final?", "No. Admission and visa requirements change. Always confirm on the university's official website and the official immigration source."],
  ["What does 'Official source required' mean?", "We don't yet have enough checked information for that entry. Use the official website link to confirm the details."],
  ["How do I compare programs?", "Use the program search filters (country, level, field) and save programs to your shortlist."],
];

export const CountryPage = () => {
  const { country: slug = "" } = useParams();
  const c = COUNTRY_LIST.find((x) => x.slug === slug);
  const name = c?.name ?? "";
  const stats = useQuery({ queryKey: ["country-stats", name], queryFn: () => getCountryStats(name), enabled: !!c, staleTime: 30 * 60_000 });
  const unis = useQuery({ queryKey: ["unis", "", name, 0], queryFn: () => searchUniversities({ country: name }), enabled: !!c, staleTime: 30 * 60_000 });
  const progs = useQuery({ queryKey: ["progs", "", name, "", "", "", 0], queryFn: () => searchPrograms({ country: name }), enabled: !!c, staleTime: 30 * 60_000 });

  useSEO({
    title: c ? `Study in ${name}: Universities, Programs & Visa | Recruitly Group` : "Study destination | Recruitly Group",
    description: c ? `Explore universities and programs in ${name}, with admission information and links to official university and immigration sources.` : "Study destination",
    canonicalUrl: `https://www.recruitlygroup.com/study-abroad/${slug}`,
    noIndex: !c,
  });

  // Breadcrumb + ItemList structured data: real data only (actual university names/counts), nothing fabricated.
  useEffect(() => {
    if (!c) return;
    const payloads: Record<string, unknown>[] = [{
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Study abroad", item: "https://www.recruitlygroup.com/study-abroad" },
        { "@type": "ListItem", position: 2, name, item: `https://www.recruitlygroup.com/study-abroad/${slug}` },
      ],
    }];
    if (unis.data?.rows.length) {
      payloads.push({
        "@context": "https://schema.org", "@type": "ItemList",
        itemListElement: unis.data.rows.slice(0, 10).map((u, i) => ({
          "@type": "ListItem", position: i + 1, name: u.university_name,
          url: `https://www.recruitlygroup.com/universities/${u.slug}`,
        })),
      });
    }
    const tags = payloads.map((data) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.text = JSON.stringify(data);
      document.head.appendChild(el);
      return el;
    });
    return () => tags.forEach((el) => el.remove());
  }, [c, name, slug, unis.data]);

  if (!c) return <PageShell><div className="py-20 text-center"><h1 className="text-2xl font-bold mb-3">Destination not found</h1><Button asChild><Link to="/study-abroad">All destinations</Link></Button></div></PageShell>;
  const s = stats.data;

  return (
    <PageShell>
      <nav className="text-sm text-muted-foreground mb-4"><Link to="/study-abroad" className="hover:underline">Study abroad</Link> / <span className="text-foreground">{name}</span></nav>
      <Reveal>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{c.flag} Study in {name}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          {s ? `Our records list ${s.universities.toLocaleString()} universities and ${s.programs.toLocaleString()} programs in ${name}.` : `Universities and programs in ${name}.`}
          {" "}Details differ by university and program, so use the official links on each page to confirm.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button asChild><Link to={`/universities?country=${encodeURIComponent(name)}`}>Universities in {name}</Link></Button>
          <Button asChild variant="outline"><Link to={`/programs?country=${encodeURIComponent(name)}`}>Programs in {name}</Link></Button>
        </div>
      </Reveal>
      {s && s.topDepartments.length > 0 && (
        <Reveal delay={0.05}><section className="mt-8"><h2 className="text-xl font-semibold mb-2">Popular study areas in our data</h2>
          <div className="flex flex-wrap gap-2">{s.topDepartments.map((d) => <Link key={d} to={`/programs?country=${encodeURIComponent(name)}&field=${encodeURIComponent(d)}`} className="px-3 py-1.5 rounded-full border border-border text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors">{d}</Link>)}</div></section></Reveal>
      )}

      <Reveal delay={0.05}><section className="mt-8"><h2 className="text-xl font-semibold mb-3">Universities</h2>
        {unis.isLoading ? <ListSkeleton /> : unis.data && unis.data.rows.length > 0
          ? <><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{unis.data.rows.slice(0, 6).map((u) => <UniversityCard key={u.id} u={u} />)}</div>
              <Link to={`/universities?country=${encodeURIComponent(name)}`} className="inline-block mt-3 text-primary hover:underline">See all universities in {name}</Link></>
          : <p className="text-muted-foreground">No universities listed yet.</p>}
      </section></Reveal>
      <Reveal><section className="mt-8"><h2 className="text-xl font-semibold mb-3">Programs</h2>
        {progs.isLoading ? <ListSkeleton /> : progs.data && progs.data.rows.length > 0
          ? <><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{progs.data.rows.slice(0, 6).map((p) => <ProgramCard key={p.id} p={p} />)}</div>
              <Link to={`/programs?country=${encodeURIComponent(name)}`} className="inline-block mt-3 text-primary hover:underline">See all programs in {name}</Link></>
          : <p className="text-muted-foreground">No programs listed for {name} yet. Check university websites directly.</p>}
      </section></Reveal>

      <Reveal><section className="mt-8"><h2 className="text-xl font-semibold mb-2">Admission and tuition</h2>
        <Notice>{UNI_NOTICE}</Notice>
        <p className="text-muted-foreground text-sm mt-2">Deadlines, fees and requirements are shown on each university page. Tuition is shown per program where our data has it.</p></section></Reveal>
      <Reveal><section className="mt-8"><h2 className="text-xl font-semibold mb-2">Visa and immigration</h2><VisaSource country={name} /></section></Reveal>
      <Reveal><section className="mt-8"><h2 className="text-xl font-semibold mb-2">Student checklist</h2>
        <ul className="list-disc pl-5 space-y-1 text-foreground">{CHECKLIST.map((i) => <li key={i}>{i}</li>)}</ul></section></Reveal>
      <Reveal><section className="mt-8"><h2 className="text-xl font-semibold mb-2">FAQ</h2>
        <div className="space-y-2 max-w-2xl">{FAQ.map(([q, a]) => <details key={q} className="border border-border rounded-lg px-4 py-2 hover:border-primary/40 transition-colors"><summary className="cursor-pointer font-medium">{q}</summary><p className="text-muted-foreground text-sm mt-2">{a}</p></details>)}</div></section></Reveal>
    </PageShell>
  );
};
