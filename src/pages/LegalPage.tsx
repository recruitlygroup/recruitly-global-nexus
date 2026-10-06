// Legal documents (terms, privacy, cookies, candidate privacy, equal opportunity) — content in data/pages/legal.ts.
import { useLocation } from "react-router-dom";
import { Hero } from "@/components/blocks";
import { LEGAL, LEGAL_UPDATED, SHOW_DRAFT_BADGE } from "@/data/pages/legal";
import { useSEO } from "@/hooks/useSEO";
import { SITE } from "@/config/site";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const LegalPage = ({ slug }: { slug: keyof typeof LEGAL }) => {
  const doc = LEGAL[slug];
  const { pathname } = useLocation();
  useSEO({ title: `${doc.title} | ${SITE.name}`, description: doc.summary, canonicalUrl: `${SITE.url}${pathname}` });
  return (
    <div className="bg-background">
      <Hero hero={{ eyebrow: "Legal", title: doc.title, lead: doc.summary, primary: { label: "Contact us", to: "/contact" } }} />
      <div className="page-container grid gap-12 py-14 lg:grid-cols-[220px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-28 space-y-2 border-l border-border pl-4 text-sm">
            {doc.sections.map((s) => <li key={s.heading}><a className="text-muted-foreground hover:text-primary" href={`#${slugify(s.heading)}`}>{s.heading}</a></li>)}
          </ul>
        </nav>
        <article className="max-w-3xl">
          <p className="mb-8 text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>
          {SHOW_DRAFT_BADGE && <p role="note" className="mb-8 rounded-md border border-amber/50 bg-amber/10 p-3 text-sm">This text is a working draft awaiting legal review.</p>}
          {doc.sections.map((s) => (
            <section key={s.heading} id={slugify(s.heading)} className="mb-10 scroll-mt-28">
              <h2 className="text-2xl">{s.heading}</h2>
              {s.body.map((p) => <p key={p} className="mt-3 leading-[1.75] text-foreground/80">{p}</p>)}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
};
export default LegalPage;
