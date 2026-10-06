// /resources/salary-calculator — total cost of employing an international worker. All inputs are the employer's own;
// the contribution rate is an editable placeholder, not a statement of any country's actual rate.
import { useMemo, useState } from "react";
import { Hero, CtaBar, Section } from "@/components/blocks";
import { NumberField, money } from "@/components/blocks/fields";
import { EMPLOYER_DASHBOARD_URL } from "@/config/nav";
import { SITE } from "@/config/site";
import { useSEO } from "@/hooks/useSEO";

const SalaryCalculator = () => {
  useSEO({ title: "Hiring Cost Calculator | Recruitly Group", description: "Estimate the total cost of employing international workers: salary, employer contributions, housing and one-off relocation costs.", canonicalUrl: `${SITE.url}/resources/salary-calculator` });
  const [workers, setWorkers] = useState(5);
  const [salary, setSalary] = useState(1200);
  const [rate, setRate] = useState(20);
  const [housing, setHousing] = useState(250);
  const [oneOff, setOneOff] = useState(900);
  const [months, setMonths] = useState(12);

  const r = useMemo(() => {
    const monthlyPerWorker = salary * (1 + rate / 100) + housing;
    const recurring = monthlyPerWorker * months * workers;
    const upfront = oneOff * workers;
    const total = recurring + upfront;
    return { monthlyPerWorker, recurring, upfront, total, perWorkerMonth: workers && months ? total / workers / months : 0 };
  }, [workers, salary, rate, housing, oneOff, months]);

  return (
    <div className="bg-background">
      <Hero hero={{ eyebrow: "Resources", title: "Hiring cost calculator", lead: "See what an international team really costs you, month by month and over the full contract.", primary: { label: "Request talent", to: "/employers/request-talent" }, secondary: { label: "Open Employer Dashboard", href: EMPLOYER_DASHBOARD_URL } }} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} aria-label="Hiring cost inputs">
            <NumberField id="workers" label="Number of workers" value={workers} onChange={setWorkers} min={1} />
            <NumberField id="months" label="Contract length" value={months} onChange={setMonths} min={1} suffix="months" />
            <NumberField id="salary" label="Gross monthly salary per worker" value={salary} onChange={setSalary} suffix="EUR" />
            <NumberField id="rate" label="Employer contributions and taxes" value={rate} onChange={setRate} suffix="%" hint="Placeholder. Enter the rate your payroll uses." />
            <NumberField id="housing" label="Monthly accommodation per worker" value={housing} onChange={setHousing} suffix="EUR" />
            <NumberField id="oneoff" label="One-off cost per worker" value={oneOff} onChange={setOneOff} suffix="EUR" hint="Travel, visa or permit fees, document attestation, medicals." />
          </form>
          <aside className="rg-gradient-border self-start p-7" aria-live="polite">
            <p className="text-sm font-semibold text-muted-foreground">Estimated total over {months} months</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight text-primary">{money(r.total)}</p>
            <dl className="mt-6 divide-y divide-border text-[15px]">
              <div className="flex justify-between py-3"><dt>Monthly cost per worker</dt><dd className="font-semibold">{money(r.monthlyPerWorker)}</dd></div>
              <div className="flex justify-between py-3"><dt>Recurring cost, whole team</dt><dd className="font-semibold">{money(r.recurring)}</dd></div>
              <div className="flex justify-between py-3"><dt>One-off costs, whole team</dt><dd className="font-semibold">{money(r.upfront)}</dd></div>
              <div className="flex justify-between py-3"><dt>All-in cost per worker per month</dt><dd className="font-semibold">{money(r.perWorkerMonth)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">An estimate from your own inputs. It excludes any recruitment service fee agreed with Recruitly.</p>
          </aside>
        </div>
      </Section>
      <CtaBar title="Want a quote based on your real brief?" body="Share the role, numbers and dates and we will reply with a plan." primary={{ label: "Request talent", to: "/employers/request-talent" }} />
    </div>
  );
};
export default SalaryCalculator;
