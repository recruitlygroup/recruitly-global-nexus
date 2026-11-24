// /cee/:slug — SEO landing pages for Nepal's highest-intent student searches (CEE result, college lists, fees, cut-offs).
// Built from real data: MEC result lists, MEC seat allocation 2083/84, quota closing ranks 2080-2082.
import { Link, useParams } from "react-router-dom";
import PageHero from "@/components/PageHero";
import NotFound from "@/pages/NotFound";
import CeePredictor from "@/components/student/cee/CeePredictor";
import { useSEO } from "@/hooks/useSEO";
import { MBBS_QUOTAS } from "@/data/ceeCutoffs";
import { CEE_FACTS, CEE_PAGES, getCeePage, type CeeSection } from "@/data/ceePages";
import { NEPAL_COLLEGES } from "@/data/nepalColleges";
import { feeFor } from "@/lib/ceePredictor";
import { NE_PAGES, NE_UI } from "@/data/ceeCopyNe";
import { useEffect } from "react";
import type { ResultProgram } from "@/lib/ceeResults";

const BASE = "https://www.recruitlygroup.com";
const UPDATED = "22 Nov 2026";

const CollegeList = ({ program, lang }: { program: ResultProgram; lang: "en" | "ne" }) => {
  const ne = lang === "ne";
  const rows = NEPAL_COLLEGES.filter((c) => c.seats[program] > 0).sort((a, b) => b.seats[program] - a.seats[program] || a.name.localeCompare(b.name));
  const groups = [
    { label: ne ? NE_UI.groupGov : "Government / scholarship colleges", rows: rows.filter((c) => c.type === "public"), note: ne ? NE_UI.noteGov : "About 75% of seats are scholarship seats." },
    { label: ne ? NE_UI.groupPrivate : "Private / paying colleges", rows: rows.filter((c) => c.type === "private"), note: ne ? NE_UI.notePrivate : "About 10% of seats are scholarship seats; the rest pay MEC-capped tuition." },
  ].filter((g) => g.rows.length);
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <div key={g.label}>
          <h3 className="text-xl font-bold text-primary">{g.label} ({g.rows.length})</h3>
          <p className="text-sm text-slate-600 mb-2">{g.note}</p>
          <div className="overflow-x-auto border border-border rounded-md bg-white">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-muted text-left text-primary"><tr><th className="p-3">{ne ? NE_UI.college : "College"}</th><th className="p-3">{ne ? NE_UI.location : "Location"}</th><th className="p-3">{ne ? NE_UI.seatsCol(program) : `${program} seats`}</th><th className="p-3">{ne ? NE_UI.tuition : "Tuition (MEC ceiling)"}</th></tr></thead>
              <tbody>
                {g.rows.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-3 font-semibold">{c.name}{c.affiliation && <span className="block text-xs font-normal text-slate-600">{ne ? `${NE_UI.affiliation}: ${c.affiliation}` : `${c.affiliation} affiliation`}</span>}</td>
                    <td className="p-3">{c.city ?? "—"}</td>
                    <td className="p-3">{c.seats[program]}</td>
                    <td className="p-3">{c.type === "public" ? (ne ? NE_UI.govFee : "Scholarship seats free; paying seats per MEC") : feeFor(program, c).text}</td>
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

const QuotaTable = ({ ne = false }: { ne?: boolean }) => (
  <div className="overflow-x-auto border border-border rounded-md bg-white">
    <table className="w-full text-sm min-w-[620px]">
      <thead className="bg-muted text-left text-primary"><tr>{(ne ? ["कोटा", "सिट (२०८२)", "अन्तिम र‍्याङ्क २०८२", "२०८१", "२०८०", "अन्तिम अंक २०८२"] : ["Quota", "Seats (2082)", "Closing rank 2082", "2081", "2080", "Closing score 2082"]).map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
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

const Section = ({ s }: { s: CeeSection }) => (
  <div>
    <h2 className="text-2xl font-extrabold text-primary mb-3">{s.h2}</h2>
    {s.paragraphs?.map((p) => <p key={p.slice(0, 40)} className="text-slate-700 leading-relaxed mb-3 max-w-prose">{p}</p>)}
    {s.table && (
      <div className="overflow-x-auto border border-border rounded-md bg-white mb-3">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-muted text-left text-primary"><tr>{s.table.head.map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody>{s.table.rows.map((r) => <tr key={String(r[0])} className="border-t border-border align-top">{r.map((c, i) => <td key={i} className={`p-3 ${i === 0 ? "font-semibold" : ""}`}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    )}
    {s.bullets && <ul className="list-disc pl-5 space-y-2 text-slate-700 max-w-prose">{s.bullets.map((b) => <li key={b.slice(0, 40)}>{b}</li>)}</ul>}
    {s.links && <ul className="mt-3 space-y-2">{s.links.map((l) => <li key={l.to}><Link to={l.to} className="underline text-primary font-semibold">{l.label}</Link></li>)}</ul>}
  </div>
);

const CeeHub = ({ lang = "en" }: { lang?: "en" | "ne" }) => {
  const { slug } = useParams();
  const ne = lang === "ne";
  const base = getCeePage(slug);
  const nePage = slug ? NE_PAGES[slug] : undefined;
  const page = base && (!ne || nePage) ? (ne && nePage ? { ...base, ...nePage } : base) : undefined;
  const url = `${BASE}${ne ? "/ne" : ""}/cee/${page?.slug ?? slug ?? ""}`;
  // hreflang pairs (+ html lang) for pages that exist in both languages
  useEffect(() => {
    if (!base || !nePage) return;
    const added: HTMLElement[] = [];
    [["en", `${BASE}/cee/${base.slug}`], ["ne", `${BASE}/ne/cee/${base.slug}`], ["x-default", `${BASE}/cee/${base.slug}`]].forEach(([l, href]) => {
      const el = document.createElement("link"); el.rel = "alternate"; el.hreflang = l; el.href = href; el.dataset.ceeAlt = "1"; document.head.appendChild(el); added.push(el);
    });
    const prev = document.documentElement.lang;
    if (ne) document.documentElement.lang = "ne";
    return () => { added.forEach((el) => el.remove()); if (ne) document.documentElement.lang = prev; };
  }, [base, nePage, ne]);
  useSEO({
    title: page?.title ?? "CEE | Recruitly Group",
    description: page?.description ?? "CEE",
    canonicalUrl: url,
    noIndex: !page,
    structuredData: page ? [
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: ne ? "सीईई नेपाल" : "CEE Nepal", item: `${BASE}${ne ? "/ne" : ""}/cee/result-2083` },
        { "@type": "ListItem", position: 3, name: page.h1, item: url },
      ] },
    ] : undefined,
  });
  if (!page) return <NotFound />;
  const programs = page.factsFor ?? (page.program ? [page.program] : (Object.keys(CEE_FACTS) as ResultProgram[]));

  return (
    <div className="bg-background">
      <PageHero eyebrow={ne ? NE_UI.eyebrow : "CEE · MECEE-BL 2027"} title={page.h1} subtitle={page.subtitle} photo="students.jpg" photoAlt="Nepali students checking CEE results" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-3 gap-4">
          {programs.map((p) => { const f = CEE_FACTS[p]; return (
            <div key={p} className="bg-white border border-border rounded-md p-5">
              <h2 className="text-lg font-extrabold text-primary">{p}</h2>
              <ul className="mt-2 text-sm text-slate-700 space-y-1">
                <li>{ne ? NE_UI.cutoff : "Qualifying cut-off"}: <strong>{f.cutoff}</strong></li><li>{ne ? NE_UI.qualified : "Qualified candidates"}: <strong>{f.qualified.toLocaleString()}</strong></li>
                <li>{ne ? NE_UI.top : "Top score"}: <strong>{f.top}</strong></li><li>{ne ? NE_UI.seats(f.seats.toLocaleString(), f.colleges) : <>MEC seats 2083/84: <strong>{f.seats.toLocaleString()}</strong> in {f.colleges} colleges</>}</li><li>{ne ? NE_UI.published : "Result published"}: {f.published}</li>
              </ul>
            </div>
          ); })}
        </div>
        <p className="text-xs text-slate-600 mt-2">{ne ? NE_UI.source(UPDATED) : `Source: Medical Education Commission MECEE-BL 2027 result lists and 2083/84 seat allocation. Last updated ${UPDATED}.`}</p>
      </section>

      {page.embedPredictor && <CeePredictor lang={lang} />}

      {(page.sections || page.quotaTable) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 space-y-10">
          {page.quotaTable && <div><h2 className="text-2xl font-extrabold text-primary mb-1">MBBS scholarship closing ranks by quota</h2>
            <p className="text-sm text-slate-600 mb-3">Rank and score of the last candidate admitted in each scholarship quota, from MEC results.</p><QuotaTable ne={ne} /></div>}
          {page.sections?.map((sec) => <Section key={sec.h2} s={sec} />)}
        </section>
      )}

      {page.program && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 space-y-10">
          <div><h2 className="text-2xl font-extrabold text-primary mb-3">{ne ? NE_UI.allColleges(page.program) : `All ${page.program} colleges in Nepal (MEC 2083/84)`}</h2><CollegeList program={page.program} lang={lang} /></div>
          {page.program === "MBBS" && (
            <div><h2 className="text-2xl font-extrabold text-primary mb-1">{ne ? NE_UI.quotaTitle : "MBBS scholarship closing ranks by quota"}</h2>
              <p className="text-sm text-slate-600 mb-3">{ne ? "MEC नतिजाअनुसार प्रत्येक छात्रवृत्ति कोटामा भर्ना भएका अन्तिम उम्मेदवारको र‍्याङ्क र अंक।" : "Rank and score of the last candidate admitted in each scholarship quota, from MEC results."}</p><QuotaTable ne={ne} /></div>
          )}
          <div className="bg-primary text-white rounded-md p-6">
            <h2 className="text-xl md:text-2xl font-extrabold">{ne ? NE_UI.ctaTitle(page.program) : `Find out which ${page.program} colleges fit your rank`}</h2>
            <p className="mt-2 text-white/85">{ne ? NE_UI.ctaBody : "Enter your roll number to see your exact rank and named scholarship and paying colleges. Free, takes 60 seconds."}</p>
            <Link to={`${ne ? "/ne" : ""}/cee/result-2083`} className="inline-block mt-4 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">{ne ? NE_UI.ctaBtn : "Check my rank & college chances →"}</Link>
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-extrabold text-primary mb-4">{ne ? NE_UI.faq : "Frequently asked questions"}</h2>
        <div className="space-y-3">
          {page.faqs.map((f) => (
            <details key={f.q} className="bg-white border border-border rounded-md p-4">
              <summary className="font-semibold text-primary cursor-pointer">{f.q}</summary><p className="mt-2 text-slate-700">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
          {CEE_PAGES.filter((p) => p.slug !== page.slug && (!ne || NE_PAGES[p.slug])).map((p) => <Link key={p.slug} to={`${ne ? "/ne" : ""}/cee/${p.slug}`} className="underline text-primary">{ne ? NE_PAGES[p.slug].h1 : p.h1}</Link>)}
          {nePage && <Link to={ne ? `/cee/${page.slug}` : `/ne/cee/${page.slug}`} className="underline text-primary" hrefLang={ne ? "en" : "ne"}>{ne ? NE_UI.english : "नेपालीमा पढ्नुहोस्"}</Link>}
          <Link to="/student-recruitment/india" className="underline text-primary">{ne ? NE_UI.india : "Study MBBS, BDS & BSc Nursing in India: free seat booking"}</Link>
          <Link to="/wisescore" className="underline text-primary">{ne ? NE_UI.wise : "WiseScore: study in the US, Australia, NZ & Europe"}</Link>
        </div>
      </section>
    </div>
  );
};

export default CeeHub;
