// /resources/salary-calculator — total cost of employing an international worker. All inputs are the employer's own;
// the contribution rate is an editable placeholder, not a statement of any country's actual rate.
import { useMemo, useState } from "react";
import { Hero, CtaBar, Section } from "@/components/blocks";
import { NumberField, money } from "@/components/blocks/fields";
import { SITE } from "@/config/site";
import { useSEO } from "@/hooks/useSEO";
import { useTr } from "@/i18n/useTr";

const SalaryCalculator = () => {
  const { tr } = useTr();
  useSEO({ title: tr("Hiring Cost Calculator | Recruitly Group", "Калкулатор на разходите за наемане | Recruitly Group"), description: tr("Estimate the total cost of employing international workers: salary, employer contributions, housing and one-off relocation costs.", "Изчислете общите разходи за наемане на международни работници: заплата, осигуровки, настаняване и еднократни разходи по преместване."), canonicalUrl: `${SITE.url}/resources/salary-calculator` });
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
      <Hero hero={{ eyebrow: tr("Resources", "Ресурси"), title: tr("Hiring cost calculator", "Калкулатор на разходите за наемане"), lead: tr("See what an international team really costs you, month by month and over the full contract.", "Вижте колко наистина ви струва един международен екип, месец по месец и за целия договор."), primary: { label: tr("Request talent", "Заявка за персонал"), to: "/employers/request-talent" }, secondary: { label: tr("Book a consultation", "Резервирайте консултация"), to: "/schedule-a-call" } }} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} aria-label={tr("Hiring cost inputs", "Данни за разходите")}>
            <NumberField id="workers" label={tr("Number of workers", "Брой работници")} value={workers} onChange={setWorkers} min={1} />
            <NumberField id="months" label={tr("Contract length", "Продължителност на договора")} value={months} onChange={setMonths} min={1} suffix={tr("months", "мес.")} />
            <NumberField id="salary" label={tr("Gross monthly salary per worker", "Брутна месечна заплата на работник")} value={salary} onChange={setSalary} suffix="EUR" />
            <NumberField id="rate" label={tr("Employer contributions and taxes", "Осигуровки и данъци за сметка на работодателя")} value={rate} onChange={setRate} suffix="%" hint={tr("Placeholder. Enter the rate your payroll uses.", "Примерна стойност. Въведете ставката от вашето ТРЗ.")} />
            <NumberField id="housing" label={tr("Monthly accommodation per worker", "Месечно настаняване на работник")} value={housing} onChange={setHousing} suffix="EUR" />
            <NumberField id="oneoff" label={tr("One-off cost per worker", "Еднократен разход на работник")} value={oneOff} onChange={setOneOff} suffix="EUR" hint={tr("Travel, visa or permit fees, document attestation, medicals.", "Пътуване, визови такси или такси за разрешение, заверка на документи, медицински прегледи.")} />
          </form>
          <aside className="rg-gradient-border self-start p-7" aria-live="polite">
            <p className="text-sm font-semibold text-muted-foreground">{tr(`Estimated total over ${months} months`, `Прогнозна обща сума за ${months} мес.`)}</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight text-primary">{money(r.total)}</p>
            <dl className="mt-6 divide-y divide-border text-[15px]">
              <div className="flex justify-between py-3"><dt>{tr("Monthly cost per worker", "Месечен разход на работник")}</dt><dd className="font-semibold">{money(r.monthlyPerWorker)}</dd></div>
              <div className="flex justify-between py-3"><dt>{tr("Recurring cost, whole team", "Периодичен разход, целият екип")}</dt><dd className="font-semibold">{money(r.recurring)}</dd></div>
              <div className="flex justify-between py-3"><dt>{tr("One-off costs, whole team", "Еднократни разходи, целият екип")}</dt><dd className="font-semibold">{money(r.upfront)}</dd></div>
              <div className="flex justify-between py-3"><dt>{tr("All-in cost per worker per month", "Общ разход на работник на месец")}</dt><dd className="font-semibold">{money(r.perWorkerMonth)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">{tr("An estimate from your own inputs. It excludes any recruitment service fee agreed with Recruitly.", "Приблизителна оценка по вашите данни. Не включва евентуална такса за услугата, договорена с Recruitly.")}</p>
          </aside>
        </div>
      </Section>
      <CtaBar title={tr("Want a quote based on your real brief?", "Искате оферта по вашето реално задание?")} body={tr("Share the role, numbers and dates and we will reply with a plan.", "Споделете позицията, броя и датите и ще отговорим с план.")} primary={{ label: tr("Request talent", "Заявка за персонал"), to: "/employers/request-talent" }} />
    </div>
  );
};
export default SalaryCalculator;
