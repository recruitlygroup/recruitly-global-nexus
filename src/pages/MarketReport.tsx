// /resources/market-report — where Recruitly is actively recruiting, by region. Qualitative on purpose: every row links
// to a programme page or guide that already exists. Add vacancy and salary figures here once they are verified.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Hero, CtaBar, Section } from "@/components/blocks";
import { Icon } from "@/components/blocks/Icon";
import type { IconName } from "@/components/blocks/icons";
import { SITE } from "@/config/site";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

type Region = "Europe" | "Australia & New Zealand" | "Gulf (GCC)";
interface Row { role: string; icon: IconName; regions: Region[]; destinations: string; asks: string[]; to: string; cta: string }

const ROWS: Row[] = [
  { role: "Nurses", icon: "stethoscope", regions: ["Europe", "Australia & New Zealand"], destinations: "Germany, Australia, New Zealand", asks: ["Nursing qualification and registration", "Language level for the destination", "Recognition or skills assessment"], to: "/specializations/bsc-nurses-germany", cta: "Germany programme" },
  { role: "Heavy drivers", icon: "truck", regions: ["Europe", "Gulf (GCC)"], destinations: "Bulgaria, Poland, Germany", asks: ["C or CE licence", "Verifiable driving experience", "Driver CPC or equivalent"], to: "/specializations/heavy-drivers-eu", cta: "Drivers programme" },
  { role: "Hospitality", icon: "utensils", regions: ["Europe", "Australia & New Zealand"], destinations: "Greece, EU, New Zealand", asks: ["Kitchen or front-of-house experience", "Basic workplace language", "Seasonal availability"], to: "/blog/hospitality-labor-crisis-eu-nz", cta: "Read the guide" },
  { role: "Carpenters and trades", icon: "hardhat", regions: ["Europe", "Australia & New Zealand"], destinations: "Europe, Australia, New Zealand", asks: ["Trade certification", "Documented experience", "English test for visa pathway"], to: "/blog/construction-trades-labor-deficit-europe-new-zealand", cta: "Read the guide" },
  { role: "Welders", icon: "zap", regions: ["Europe"], destinations: "Slovenia, Romania", asks: ["Welding certification", "Practical test or video demonstration"], to: "/blog/welder-jobs-slovenia-romania", cta: "Read the guide" },
  { role: "Warehouse workers", icon: "layers", regions: ["Europe"], destinations: "Slovenia", asks: ["Physical fitness for warehouse work", "Basic workplace language"], to: "/blog/warehouse-jobs-slovenia-nepal", cta: "Read the guide" },
  { role: "Beauty technicians", icon: "sparkles", regions: ["Australia & New Zealand"], destinations: "New Zealand", asks: ["Relevant qualification", "Portfolio of work", "Employer-accredited visa pathway"], to: "/blog/nail-technicians-new-zealand-aewv-visa-guide", cta: "Read the guide" },
  { role: "Ausbildung trainees", icon: "graduation", regions: ["Europe"], destinations: "Germany", asks: ["Secondary school completion", "German language level for the trade", "German-format CV"], to: "/specializations/ausbildung-germany", cta: "Ausbildung programme" },
];
const REGIONS: ("All" | Region)[] = ["All", "Europe", "Australia & New Zealand", "Gulf (GCC)"];

const MarketReport = () => {
  useSEO({ title: "Hiring Market Report | Recruitly Group", description: "Where Recruitly Group is actively recruiting: roles, destinations and typical entry requirements across Europe, Australia, New Zealand and the Gulf.", canonicalUrl: `${SITE.url}/resources/market-report` });
  const [region, setRegion] = useState<"All" | Region>("All");
  const rows = useMemo(() => ROWS.filter((r) => region === "All" || r.regions.includes(region)), [region]);
  return (
    <div className="bg-background">
      <Hero hero={{ eyebrow: "Resources", title: "Where we are recruiting", lead: "A working map of the roles and destinations behind our current programmes, with the entry requirements employers usually ask for.", primary: { label: "See live openings", to: "/jobs" }, secondary: { label: "Request talent", to: "/employers/request-talent" } }} />
      <Section title="Roles and destinations" lead="Pick a region. For current vacancy counts, the jobs page is always up to date.">
        <div role="tablist" aria-label="Filter by region" className="mb-8 flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button key={r} role="tab" aria-selected={region === r} onClick={() => setRegion(r)}
              className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition-colors", region === r ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>{r}</button>
          ))}
        </div>
        <ul className="grid gap-5 md:grid-cols-2" aria-live="polite">
          {rows.map((r) => (
            <li key={r.role} className="card-lift flex flex-col p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon name={r.icon} className="h-5 w-5" /></span>
                <div><h3 className="text-lg">{r.role}</h3><p className="text-sm text-muted-foreground">{r.destinations}</p></div>
              </div>
              <p className="mt-4 text-sm font-semibold">Employers usually ask for</p>
              <ul className="mt-2 flex-1 list-disc space-y-1 pl-5 text-[15px] text-foreground/80">{r.asks.map((a) => <li key={a}>{a}</li>)}</ul>
              <Link to={r.to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">{r.cta}<ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBar title="Hiring for one of these roles?" body="Send us your brief and we will confirm timelines, requirements and the best source market." primary={{ label: "Request talent", to: "/employers/request-talent" }} />
    </div>
  );
};
export default MarketReport;
