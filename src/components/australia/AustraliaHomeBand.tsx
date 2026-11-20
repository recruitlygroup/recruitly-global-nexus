// Homepage band for Australian employers and licensed agencies (sits directly under the hero).
// Links into the /australia hub and hosts the compact B2B enquiry form.
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Handshake, Video } from "lucide-react";
import AuAudienceForm from "./AuAudienceForm";
import { SOURCING_POOLS } from "@/config/markets";

const AustraliaHomeBand = () => (
  <section id="australia" aria-labelledby="au-home-h" className="section bg-secondary/60">
    <div className="page-container grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="eyebrow mb-3">Australia · Employers and licensed agencies</p>
        <h2 id="au-home-h">Hiring skilled workers for Australia?</h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          We source, pre-screen and pipeline vetted skilled candidates from Nepal, Bulgaria and the EU for Australian employers and licensed recruitment agencies.
        </p>
        <ul className="mt-6 space-y-3 text-[15px]">
          <li className="flex gap-3"><BadgeCheck className="mt-0.5 h-5 w-5 flex-none text-primary" aria-hidden />Interviewed, reference-checked and document-reviewed candidates</li>
          <li className="flex gap-3"><Video className="mt-0.5 h-5 w-5 flex-none text-primary" aria-hidden />Practical-skills videos before you commit to interviews</li>
          <li className="flex gap-3"><Handshake className="mt-0.5 h-5 w-5 flex-none text-primary" aria-hidden />Direct employer or white-label agency partner model</li>
        </ul>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {Object.values(SOURCING_POOLS).map((p) => <Link key={p.id} to={p.path} className="text-primary underline-offset-4 hover:underline">{p.name} pool</Link>)}
          <Link to="/specializations/skilled-trades-australia" className="text-primary underline-offset-4 hover:underline">Skilled trades</Link>
        </p>
        <Link to="/australia" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">Explore the Australia hub <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        <p className="mt-6 max-w-xl text-xs text-muted-foreground">We are a recruitment and sourcing business and do not provide immigration advice or assistance.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg">Send a hiring enquiry</h3>
        <AuAudienceForm compact sourcePage="/" />
      </div>
    </div>
  </section>
);
export default AustraliaHomeBand;
