// /australia/get-started — full B2B hiring & agency-partnership intake.
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { SITE } from "@/config/site";
import { metaFor } from "@/config/markets";
import AuAudienceForm from "@/components/australia/AuAudienceForm";

const PATH = "/australia/get-started";
const AustraliaGetStarted = () => {
  const [params] = useSearchParams();
  const m = metaFor(PATH);
  useSEO({
    title: m.title, description: m.description, canonicalUrl: `${SITE.url}${PATH}`,
    structuredData: [{ "@type": "ContactPage", name: m.title, url: `${SITE.url}${PATH}`, about: { "@type": "EmploymentAgency", name: SITE.name } }],
  });
  const type = params.get("type") === "agency" ? "licensed_agency" : params.get("type") === "employer" ? "direct_employer" : undefined;
  return (
    <div className="bg-background">
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-primary-dark to-primary opacity-95" aria-hidden />
        <div className="page-container py-14 md:py-20">
          <p className="eyebrow-on-dark mb-4">Australia · Employers and licensed agencies</p>
          <h1 className="max-w-3xl text-white">Start your skilled hiring enquiry</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">Tell us the roles, volumes and timeframe. We reply with a sourcing plan from Nepal, Bulgaria or the EU.</p>
        </div>
      </section>
      <section className="section">
        <div className="page-container grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-border bg-card p-6 md:p-8"><AuAudienceForm defaultContactType={type} sourcePage={PATH} /></div>
          <aside className="space-y-6">
            <div><h2 className="text-xl">What happens next</h2>
              <ol className="mt-3 space-y-3 text-[15px] text-muted-foreground">
                {["We review your brief and confirm feasibility.", "We recommend the best sourcing pool(s) and timeline.", "You approve the plan and we start sourcing and screening.", "You receive shortlisted files and skills videos."].map((s) => (
                  <li key={s} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-primary" aria-hidden />{s}</li>))}
              </ol></div>
            <div className="rounded-lg border border-border bg-secondary/60 p-5 text-sm text-muted-foreground">
              <h2 className="mb-2 text-base text-foreground">Prefer to talk?</h2>
              <p>Book a short call or message us directly.</p>
              <p className="mt-2"><Link className="font-semibold text-primary underline" to="/schedule-a-call">Book a call</Link> · <a className="font-semibold text-primary underline" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a> · <a className="font-semibold text-primary underline" href={`mailto:${SITE.email}`}>Email</a></p>
            </div>
            <p className="text-xs text-muted-foreground">We are a recruitment and sourcing business and do not provide immigration advice or assistance. Visa and sponsorship matters are handled by the employer's Registered Migration Agent or Australian legal practitioner.</p>
          </aside>
        </div>
      </section>
    </div>
  );
};
export default AustraliaGetStarted;
