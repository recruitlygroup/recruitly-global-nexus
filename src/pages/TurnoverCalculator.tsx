// /resources/cost-of-turnover — what staff turnover costs a business, and what a lower rate would save.
import { useMemo, useState } from "react";
import { Hero, CtaBar, Section } from "@/components/blocks";
import { NumberField, money } from "@/components/blocks/fields";
import { SITE } from "@/config/site";
import { useSEO } from "@/hooks/useSEO";

const TurnoverCalculator = () => {
  useSEO({ title: "Cost of Staff Turnover Calculator | Recruitly Group", description: "Calculate what employee turnover costs your business each year, including recruitment, training and lost productivity.", canonicalUrl: `${SITE.url}/resources/cost-of-turnover` });
  const [staff, setStaff] = useState(40);
  const [turnover, setTurnover] = useState(25);
  const [target, setTarget] = useState(15);
  const [salary, setSalary] = useState(1300);
  const [recruit, setRecruit] = useState(1500);
  const [train, setTrain] = useState(400);
  const [ramp, setRamp] = useState(2);
  const [prod, setProd] = useState(50);

  const r = useMemo(() => {
    const perLeaver = recruit + train + salary * ramp * (1 - prod / 100);
    const leavers = (staff * turnover) / 100;
    const annual = leavers * perLeaver;
    const targetAnnual = ((staff * target) / 100) * perLeaver;
    return { perLeaver, leavers, annual, saving: Math.max(0, annual - targetAnnual) };
  }, [staff, turnover, target, salary, recruit, train, ramp, prod]);

  return (
    <div className="bg-background">
      <Hero hero={{ eyebrow: "Resources", title: "Cost of staff turnover", lead: "Every departure costs more than a salary. Estimate yours and see what a steadier team would save.", primary: { label: "Request talent", to: "/employers/request-talent" }, secondary: { label: "Why Recruitly", to: "/employers/why-us" } }} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} aria-label="Turnover inputs">
            <NumberField id="staff" label="Team size" value={staff} onChange={setStaff} min={1} />
            <NumberField id="salary" label="Average gross monthly salary" value={salary} onChange={setSalary} suffix="EUR" />
            <NumberField id="turnover" label="Annual turnover today" value={turnover} onChange={setTurnover} suffix="%" />
            <NumberField id="target" label="Turnover you aim for" value={target} onChange={setTarget} suffix="%" />
            <NumberField id="recruit" label="Cost to recruit one replacement" value={recruit} onChange={setRecruit} suffix="EUR" hint="Adverts, agency fees, interview time." />
            <NumberField id="train" label="Training cost per new hire" value={train} onChange={setTrain} suffix="EUR" />
            <NumberField id="ramp" label="Months to full productivity" value={ramp} onChange={setRamp} suffix="months" step={0.5} />
            <NumberField id="prod" label="Productivity while ramping up" value={prod} onChange={(v) => setProd(Math.min(100, v))} suffix="%" />
          </form>
          <aside className="rg-gradient-border self-start p-7" aria-live="polite">
            <p className="text-sm font-semibold text-muted-foreground">Turnover costs you each year</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight text-primary">{money(r.annual)}</p>
            <dl className="mt-6 divide-y divide-border text-[15px]">
              <div className="flex justify-between py-3"><dt>Leavers per year</dt><dd className="font-semibold">{r.leavers.toFixed(1)}</dd></div>
              <div className="flex justify-between py-3"><dt>Cost of each departure</dt><dd className="font-semibold">{money(r.perLeaver)}</dd></div>
              <div className="flex justify-between py-3"><dt>Saving at {target}% turnover</dt><dd className="font-semibold text-success">{money(r.saving)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">Based entirely on the figures you enter.</p>
          </aside>
        </div>
      </Section>
      <CtaBar title="Build a team that stays" body="Pre-screened, skill-certified candidates with documents verified before arrival." primary={{ label: "Request talent", to: "/employers/request-talent" }} />
    </div>
  );
};
export default TurnoverCalculator;
