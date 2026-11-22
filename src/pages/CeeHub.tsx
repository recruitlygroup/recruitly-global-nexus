// /cee/:slug — SEO landing pages for Nepal's highest-intent student searches (CEE result, college lists, fees, cut-offs).
// Built from real data: MEC result lists, MEC seat allocation 2083/84, quota closing ranks 2080-2082.
import { Link, useParams } from "react-router-dom";
import PageHero from "@/components/PageHero";
import NotFound from "@/pages/NotFound";
import CeePredictor from "@/components/student/cee/CeePredictor";
import { useSEO } from "@/hooks/useSEO";
import { MBBS_QUOTAS } from "@/data/ceeCutoffs";
import { CEE_FACTS, CEE_PAGES, getCeePage } from "@/data/ceePages";
import { NEPAL_COLLEGES } from "@/data/nepalColleges";
import { feeFor } from "@/lib/ceePredictor";
import type { ResultProgram } from "@/lib/ceeResults";

const BASE = "https://www.recruitlygroup.com";
const UPDATED = "22 Nov 2026";

const CollegeList = ({ program }: { program: ResultProgram }) => {
  const rows = NEPAL_COLLEGES.filter((c) => c.seats[program] > 0).sort((a, b) => b.seats[program] - a.seats[program] || a.name.localeCompare(b.name));
  const groups = [
    { label: "Government / scholarship colleges", rows: rows.filter((c) => c.type === "public"), note: "About 75% of seats are scholarship seats." },
    { label: "Private / paying colleges", rows: rows.filter((c) => c.type === "private"), note: "About 10% of seats are scholarship seats; the rest pay MEC-capped tuition." },
  ].filter((g) => g.rows.length);
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <div key={g.label}>
          <h3 className="text-xl font-bold text-primary">{g.label} ({g.rows.length})</h3>
          <p className="text-sm text-slate-600 mb-2">{g.note}</p>
          <div className="overflow-x-auto border border-border rounded-md bg-white">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-muted text-left text-primary"><tr><th className="p-3">College</th><th className="p-3">Location</th><th className="p-3">{program} seats</th><th className="p-3">Tuition (MEC ceiling)</th></tr></thead>
              <tbody>
                {g.rows.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-3 font-semibold">{c.name}{c.affiliation && <span className="block text-xs font-normal text-slate-600">{c.affiliation} affiliation</span>}</td>
                    <td className="p-3">{c.city ?? "—"}</td>
                    <td className="p-3">{c.seats[program]}</td>
                    <td className="p-3">{c.type === "public" ? "Scholarship seats free; paying seats per MEC" : feeFor(program, c).text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

const QuotaTable = () => (
  <div className="overflow-x-auto border border-border rounded-md bg-white">
    <table className="w-full text-sm min-w-[620px]">
      <thead className="bg-muted text-left text-primary"><tr><th className="p-3">Quota</th><th className="p-3">Seats (2082)</th><th className="p-3">Closing rank 2082</th><th className="p-3">2081</th><th className="p-3">2080</th><th className="p-3">Closing score 2082</th></tr></thead>
      <tbody>
        {MBBS_QUOTAS.map((q) => (
          <tr key={q.id} className="border-t border-border">
            <td className="p-3 font-semibold">{q.name}</td><td className="p-3">{q.seats2082}</td>
            <td className="p-3">{q.y2082[1].toLocaleString()}</td><td className="p-3">{q.y2081[1].toLocaleString()}</td><td className="p-3">{q.y2080[1].toLocaleString()}</td><td className="p-3">{q.y2082[0]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CeeHub = () => {
  const { slug } = useParams();
  const page = getCeePage(slug);
  const url = `${BASE}/cee/${page?.slug ?? slug ?? ""}`;
  useSEO({
    title: page?.title ?? "CEE | Recruitly Group",
    description: page?.description ?? "CEE",
    canonicalUrl: url,
    noIndex: !page,
    structuredData: page ? [
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "CEE Nepal", item: `${BASE}/cee/result-2083` },
        { "@type": "ListItem", position: 3, name: page.h1, item: url },
      ] },
    ] : undefined,
  });
  if (!page) return <NotFound />;
  const programs = page.program ? [page.program] : (Object.keys(CEE_FACTS) as ResultProgram[]);

  return (
    <div className="bg-background">
      <PageHero eyebrow="CEE · MECEE-BL 2027" title={page.h1} subtitle={page.subtitle} photo="students.jpg" photoAlt="Nepali students checking CEE results" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-3 gap-4">
          {programs.map((p) => { const f = CEE_FACTS[p]; return (
            <div key={p} className="bg-white border border-border rounded-md p-5">
              <h2 className="text-lg font-extrabold text-primary">{p}</h2>
              <ul className="mt-2 text-sm text-slate-700 space-y-1">
                <li>Qualifying cut-off: <strong>{f.cutoff}</strong></li><li>Qualified candidates: <strong>{f.qualified.toLocaleString()}</strong></li>
                <li>Top score: <strong>{f.top}</strong></li><li>MEC seats 2083/84: <strong>{f.seats.toLocaleString()}</strong> in {f.colleges} colleges</li><li>Result published: {f.published}</li>
              </ul>
            </div>
          ); })}
        </div>
        <p className="text-xs text-slate-600 mt-2">Source: Medical Education Commission MECEE-BL 2027 result lists and 2083/84 seat allocation. Last updated {UPDATED}.</p>
      </section>

      {!page.program && <CeePredictor />}

      {page.program && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 space-y-10">
          <div><h2 className="text-2xl font-extrabold text-primary mb-3">All {page.program} colleges in Nepal (MEC 2083/84)</h2><CollegeList program={page.program} /></div>
          {page.program === "MBBS" && (
            <div><h2 className="text-2xl font-extrabold text-primary mb-1">MBBS scholarship closing ranks by quota</h2>
              <p className="text-sm text-slate-600 mb-3">Rank and score of the last candidate admitted in each scholarship quota, from MEC results.</p><QuotaTable /></div>
          )}
          <div className="bg-primary text-white rounded-md p-6">
            <h2 className="text-xl md:text-2xl font-extrabold">Find out which {page.program} colleges fit your rank</h2>
            <p className="mt-2 text-white/85">Enter your roll number to see your exact rank and named scholarship and paying colleges. Free, takes 60 seconds.</p>
            <Link to="/cee/result-2083" className="inline-block mt-4 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">Check my rank &amp; college chances →</Link>
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-extrabold text-primary mb-4">Frequently asked questions</h2>
        <div className="space-y-3">
          {page.faqs.map((f) => (
            <details key={f.q} className="bg-white border border-border rounded-md p-4">
              <summary className="font-semibold text-primary cursor-pointer">{f.q}</summary><p className="mt-2 text-slate-700">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
          {CEE_PAGES.filter((p) => p.slug !== page.slug).map((p) => <Link key={p.slug} to={`/cee/${p.slug}`} className="underline text-primary">{p.h1}</Link>)}
          <Link to="/student-recruitment/india" className="underline text-primary">Study MBBS, BDS &amp; BSc Nursing in India: free seat booking</Link>
          <Link to="/wisescore" className="underline text-primary">WiseScore: study in the US, Australia, NZ &amp; Europe</Link>
        </div>
      </section>
    </div>
  );
};

export default CeeHub;
