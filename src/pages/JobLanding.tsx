// /jobs/type/:type, /jobs/sector/:sector, /jobs/location/:city — landing pages that show live openings from the job board
// and route candidates to /jobs with WhatsApp or the online form.
import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { ApplyOptions, CtaBar, Faqs, Hero, Section } from "@/components/blocks";
import { useJobListings } from "@/hooks/useJobListings";
import { useSEO } from "@/hooks/useSEO";
import { SITE } from "@/config/site";

const human = (s = "") => decodeURIComponent(s).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const JobLanding = () => {
  const { type, sector, city } = useParams();
  const { pathname } = useLocation();
  const kind = type ? "type" : sector ? "sector" : "location";
  const term = human(type ?? sector ?? city);
  const needle = term.toLowerCase();
  const { jobs, loading } = useJobListings();

  const title = kind === "type" ? `${term} jobs abroad` : kind === "sector" ? `${term} jobs abroad` : `Jobs in ${term}`;
  useSEO({ title: `${title} | ${SITE.name}`, description: `Browse verified ${term.toLowerCase()} openings and apply on WhatsApp or with our online form. Placement is free for workers.`, canonicalUrl: `${SITE.url}${pathname}` });

  const { matches, exact } = useMemo(() => {
    const m = kind === "type" ? [] : jobs.filter((j) => (kind === "sector" ? j.job_title : j.country ?? "").toLowerCase().includes(needle.replace(/s$/, "")));
    return { matches: (m.length ? m : jobs).slice(0, 8), exact: m.length > 0 };
  }, [jobs, kind, needle]);

  return (
    <div className="bg-background">
      <Hero hero={{ eyebrow: "Jobs", title, lead: "Verified openings, a free process for workers, and two simple ways to apply.", primary: { label: "See all openings", to: `/jobs${kind === "type" ? "" : `?q=${encodeURIComponent(term)}`}` }, secondary: { label: "How to apply", to: "/job-seekers/how-to-apply" } }} />
      <Section title={exact ? `Open ${term.toLowerCase()} roles` : "Open roles right now"} lead={exact ? undefined : `No roles match “${term}” at the moment. Here is what is open today.`}>
        {loading ? <p className="text-muted-foreground">Loading openings…</p> : matches.length === 0 ? (
          <p className="text-muted-foreground">New roles are added often. Message us and we will tell you when one opens.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {matches.map((j) => (
              <li key={j.id}>
                <Link to={`/jobs?q=${encodeURIComponent(j.job_title)}`} className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-primary/[0.03]">
                  <span><span className="block font-bold group-hover:text-primary">{j.job_title}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" aria-hidden />{j.country ?? "Multiple countries"}{j.remaining_vacancies ? ` · ${j.remaining_vacancies} vacancies` : ""}</span></span>
                  <ArrowRight className="h-5 w-5 flex-none text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <ApplyOptions context={`I would like to apply for ${term} jobs through Recruitly Group.`} />
      <Faqs f={{ items: [
        { q: "Do I pay to apply?", a: "No. Placement is free of charge to workers." },
        { q: "What happens after I apply?", a: "A recruiter reviews your profile, contacts you for a screening call and explains the next steps for the role." },
        { q: "Can you help with documents?", a: "Yes. Our partner Apostille Sewa coordinates attestation and police clearance support." },
      ] }} />
      <CtaBar title="Not seeing the right role?" body="Tell us your trade and preferred country and we will contact you when a match opens." primary={{ label: "Browse all openings", to: "/jobs" }} />
    </div>
  );
};
export default JobLanding;
