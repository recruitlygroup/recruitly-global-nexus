import { Link } from "react-router-dom";
import { useParams, Navigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import EmployerDashboardCTA from "@/components/EmployerDashboardCTA";
import { useSEO } from "@/hooks/useSEO";
import { NICHE_PAGES } from "./nicheData";

const NicheProgram = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = NICHE_PAGES.find((p) => p.slug === slug);
  useSEO({
    title: page ? `${page.title} | Recruitly Group` : "Programme | Recruitly Group",
    description: page?.subtitle ?? "",
    canonicalUrl: `https://www.recruitlygroup.com/specializations/${slug}`,
  });
  if (!page) return <Navigate to="/manpower-recruitment" replace />;

  return (
    <div className="bg-background">
      <PageHero eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} photo={page.photo} photoAlt={page.photoAlt}>
        <Link to="/schedule-a-call" className="inline-block bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">Book a hiring call</Link>
      </PageHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-14">
        <section className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-extrabold text-primary mb-4">Candidate requirements</h2>
            <ul className="space-y-3">
              {page.requirements.map((r) => (
                <li key={r} className="flex gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-primary mb-4">How it works</h2>
            <ol className="space-y-3">
              {page.process.map((s, i) => (
                <li key={s} className="flex gap-3 items-start">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-slate-700 pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <p className="text-sm text-slate-500">Destination: {page.destinations}. Placement of workers is free of charge to the candidate.</p>
        <EmployerDashboardCTA />
      </div>
    </div>
  );
};
export default NicheProgram;
