// /cee/colleges/:slug — one page per Nepal medical/dental/nursing college (MEC 2083/84 seat matrix).
import { Link, useParams } from "react-router-dom";
import PageHero from "@/components/PageHero";
import NotFound from "@/pages/NotFound";
import WhatsAppChannelCta from "@/components/student/WhatsAppChannelCta";
import { useSEO } from "@/hooks/useSEO";
import { collegeContent, collegeSlug, getCollegeBySlug } from "@/lib/collegeContent";

const BASE = "https://www.recruitlygroup.com";

const CollegePage = () => {
  const { slug } = useParams();
  const college = getCollegeBySlug(slug);
  const c = college ? collegeContent(college) : null;
  const url = `${BASE}/cee/colleges/${slug ?? ""}`;
  useSEO({
    title: c?.title ?? "College | Recruitly Group",
    description: c?.description ?? "College",
    canonicalUrl: url,
    noIndex: !c,
    structuredData: c && college ? [
      { "@context": "https://schema.org", "@type": "CollegeOrUniversity", name: college.name, url,
        ...(college.city ? { address: { "@type": "PostalAddress", addressLocality: college.city, addressCountry: "NP" } } : { address: { "@type": "PostalAddress", addressCountry: "NP" } }) },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "CEE Nepal", item: `${BASE}/cee/result-2083` },
        { "@type": "ListItem", position: 3, name: college.name, item: url } ] },
    ] : undefined,
  });
  if (!college || !c) return <NotFound />;

  return (
    <div className="bg-background">
      <PageHero eyebrow="Nepal colleges · MEC 2083/84" title={c.h1} subtitle={c.intro} photo="students.jpg" photoAlt={`${college.name} admission information`} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <section>
          <h2 className="text-2xl font-extrabold text-primary mb-3">{college.name} at a glance</h2>
          <div className="overflow-x-auto border border-border rounded-md bg-white">
            <table className="w-full text-sm"><tbody>
              {c.facts.map(([k, v]) => <tr key={k} className="border-t first:border-t-0 border-border align-top"><th scope="row" className="p-3 text-left font-semibold text-primary w-44">{k}</th><td className="p-3">{v}</td></tr>)}
            </tbody></table>
          </div>
          <p className="text-xs text-slate-600 mt-2">Source: Medical Education Commission 2083/84 seat allocation and reported MEC fee ceilings. Confirm current figures with the college.</p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-primary mb-3">How it compares</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">{c.comparison.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-primary mb-3">What rank do you need?</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">{c.rankNote.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="mt-4 bg-primary text-white rounded-md p-6">
            <p className="text-lg font-extrabold">Check your rank against the real CEE 2083 results</p>
            <p className="mt-1 text-white/85 text-sm">Free, 60 seconds. Recruitly Group charges NPR 0 for seat booking and counselling.</p>
            <Link to="/cee/result-2083" className="inline-block mt-3 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">Check my rank &amp; college chances →</Link>
          </div>
        </section>

        {c.similar.map((s) => (
          <section key={s.program}>
            <h2 className="text-xl font-extrabold text-primary mb-2">Similar {s.program} colleges</h2>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              {s.colleges.map((x) => <li key={x.id}><Link to={`/cee/colleges/${collegeSlug(x)}`} className="underline text-primary">{x.name}</Link> <span className="text-slate-600">({x.seats[s.program]} seats)</span></li>)}
            </ul>
            <p className="mt-2 text-sm"><Link to={`/cee/${s.program === "MBBS" ? "mbbs-colleges-nepal" : s.program === "BDS" ? "bds-colleges-nepal" : "bsc-nursing-colleges-nepal"}`} className="underline text-primary">All {s.program} colleges in Nepal →</Link></p>
          </section>
        ))}

        <WhatsAppChannelCta placement="college_page" />

        <section>
          <h2 className="text-2xl font-extrabold text-primary mb-3">Frequently asked questions</h2>
          <div className="space-y-3">{c.faqs.map((f) => <details key={f.q} className="bg-white border border-border rounded-md p-4"><summary className="font-semibold text-primary cursor-pointer">{f.q}</summary><p className="mt-2 text-slate-700">{f.a}</p></details>)}</div>
          <p className="mt-6 text-sm"><Link to="/student-recruitment/india" className="underline text-primary">Back-up plan: study MBBS, BDS &amp; BSc Nursing in India with free seat booking</Link></p>
        </section>
      </div>
    </div>
  );
};

export default CollegePage;
