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
import { useTr } from "@/i18n/useTr";
import { translateDeep } from "@/i18n/translateDeep";
import { PAGE_BG } from "@/i18n/pageStrings.bg";

type Region = "Europe" | "Australia & New Zealand" | "Gulf (GCC)";
export interface Row { role: string; icon: IconName; regions: Region[]; destinations: string; asks: string[]; to: string; cta: string }

export const ROWS: Row[] = [
  { role: "Nurses", icon: "stethoscope", regions: ["Europe", "Australia & New Zealand"], destinations: "Germany, Australia, New Zealand", asks: ["Nursing qualification and registration", "Language level for the destination", "Recognition or skills assessment"], to: "/specializations/bsc-nurses-germany", cta: "Germany programme" },
  { role: "Heavy drivers", icon: "truck", regions: ["Europe", "Gulf (GCC)"], destinations: "Bulgaria, Poland, Germany", asks: ["C or CE licence", "Verifiable driving experience", "Driver CPC or equivalent"], to: "/specializations/heavy-drivers-eu", cta: "Drivers programme" },
  { role: "Hospitality", icon: "utensils", regions: ["Europe", "Australia & New Zealand"], destinations: "Greece, EU, New Zealand", asks: ["Kitchen or front-of-house experience", "Basic workplace language", "Seasonal availability"], to: "/blog/hospitality-labor-crisis-eu-nz", cta: "Read the guide" },
  { role: "Carpenters and trades", icon: "hardhat", regions: ["Europe", "Australia & New Zealand"], destinations: "Europe, Australia, New Zealand", asks: ["Trade certification", "Documented experience", "English test for visa pathway"], to: "/blog/construction-trades-labor-deficit-europe-new-zealand", cta: "Read the guide" },
  { role: "Welders", icon: "zap", regions: ["Europe"], destinations: "Slovenia, Romania", asks: ["Welding certification", "Practical test or video demonstration"], to: "/blog/welder-jobs-slovenia-romania", cta: "Read the guide" },
  { role: "Warehouse workers", icon: "layers", regions: ["Europe"], destinations: "Slovenia", asks: ["Physical fitness for warehouse work", "Basic workplace language"], to: "/blog/warehouse-jobs-slovenia-nepal", cta: "Read the guide" },
  { role: "Beauty technicians", icon: "sparkles", regions: ["Australia & New Zealand"], destinations: "New Zealand", asks: ["Relevant qualification", "Portfolio of work", "Employer-accredited visa pathway"], to: "/blog/nail-technicians-new-zealand-aewv-visa-guide", cta: "Read the guide" },
  { role: "Ausbildung trainees", icon: "graduation", regions: ["Europe"], destinations: "Germany", asks: ["Secondary school completion", "German language level for the trade", "German-format CV"], to: "/specializations/ausbildung-germany", cta: "Ausbildung programme" },
];
export const REGIONS: ("All" | Region)[] = ["All", "Europe", "Australia & New Zealand", "Gulf (GCC)"];

const MarketReport = () => {
  const { tr, lang } = useTr();
  useSEO({ title: tr("Hiring Market Report | Recruitly Group", "Доклад за пазара на труда | Recruitly Group"), description: tr("Where Recruitly Group is actively recruiting: roles, destinations and typical entry requirements across Europe, Australia, New Zealand and the Gulf.", "Къде Recruitly Group активно подбира: позиции, дестинации и типични изисквания в Европа, Австралия, Нова Зеландия и Залива."), canonicalUrl: `${SITE.url}/resources/market-report` });
  const [region, setRegion] = useState<"All" | Region>("All");
  const rows = useMemo(() => ROWS.filter((r) => region === "All" || r.regions.includes(region)).map((r) => (lang === "bg" ? translateDeep(r, PAGE_BG) : r)), [region, lang]);
  const regionLabel = (r: string) => (lang === "bg" ? PAGE_BG[r === "Australia & New Zealand" ? "Australia & New Zealand" : r] ?? r : r);
  return (
    <div className="bg-background">
      <Hero hero={{ eyebrow: tr("Resources", "Ресурси"), title: tr("Where we are recruiting", "Къде подбираме"), lead: tr("A working map of the roles and destinations behind our current programmes, with the entry requirements employers usually ask for.", "Работна карта на позициите и дестинациите в текущите ни програми, с изискванията, които работодателите обикновено поставят."), primary: { label: tr("See live openings", "Вижте свободните позиции"), to: "/jobs" }, secondary: { label: tr("Request talent", "Заявка за персонал"), to: "/employers/request-talent" } }} />
      <Section title={tr("Roles and destinations", "Позиции и дестинации")} lead={tr("Pick a region. For current vacancy counts, the jobs page is always up to date.", "Изберете регион. За актуален брой свободни места страницата с работа винаги е най-точна.")}>
        <div role="tablist" aria-label={tr("Filter by region", "Филтър по регион")} className="mb-8 flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button key={r} role="tab" aria-selected={region === r} onClick={() => setRegion(r)}
              className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition-colors", region === r ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>{r === "All" ? tr("All", "Всички") : regionLabel(r)}</button>
          ))}
        </div>
        <ul className="grid gap-5 md:grid-cols-2" aria-live="polite">
          {rows.map((r) => (
            <li key={r.role} className="card-lift flex flex-col p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon name={r.icon} className="h-5 w-5" /></span>
                <div><h3 className="text-lg">{r.role}</h3><p className="text-sm text-muted-foreground">{r.destinations}</p></div>
              </div>
              <p className="mt-4 text-sm font-semibold">{tr("Employers usually ask for", "Работодателите обикновено изискват")}</p>
              <ul className="mt-2 flex-1 list-disc space-y-1 pl-5 text-[15px] text-foreground/80">{r.asks.map((a) => <li key={a}>{a}</li>)}</ul>
              <Link to={r.to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">{r.cta}<ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBar title={tr("Hiring for one of these roles?", "Наемате за някоя от тези позиции?")} body={tr("Send us your brief and we will confirm timelines, requirements and the best source market.", "Изпратете заданието си и ще потвърдим срокове, изисквания и най-подходящия пазар.")} primary={{ label: tr("Request talent", "Заявка за персонал"), to: "/employers/request-talent" }} />
    </div>
  );
};
export default MarketReport;
