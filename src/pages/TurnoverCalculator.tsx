// /resources/cost-of-turnover — what staff turnover costs a business, and what a lower rate would save.
import { useMemo, useState } from "react";
import { Hero, CtaBar, Section } from "@/components/blocks";
import { NumberField, money } from "@/components/blocks/fields";
import { SITE } from "@/config/site";
import { useSEO } from "@/hooks/useSEO";
import { useTr } from "@/i18n/useTr";

const TurnoverCalculator = () => {
  const { tr } = useTr();
  useSEO({ title: tr("Cost of Staff Turnover Calculator | Recruitly Group", "Калкулатор за цената на текучеството | Recruitly Group"), description: tr("Calculate what employee turnover costs your business each year, including recruitment, training and lost productivity.", "Изчислете колко ежегодно ви струва текучеството на персонал, включително подбор, обучение и загубена производителност."), canonicalUrl: `${SITE.url}/resources/cost-of-turnover` });
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
      <Hero hero={{ eyebrow: tr("Resources", "Ресурси"), title: tr("Cost of staff turnover", "Цената на текучеството"), lead: tr("Every departure costs more than a salary. Estimate yours and see what a steadier team would save.", "Всяко напускане струва повече от една заплата. Изчислете своето и вижте колко би спестил по-стабилен екип."), primary: { label: tr("Request talent", "Заявка за персонал"), to: "/employers/request-talent" }, secondary: { label: tr("Why Recruitly", "Защо Recruitly"), to: "/employers/why-us" } }} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} aria-label={tr("Turnover inputs", "Данни за текучеството")}>
            <NumberField id="staff" label={tr("Team size", "Размер на екипа")} value={staff} onChange={setStaff} min={1} />
            <NumberField id="salary" label={tr("Average gross monthly salary", "Средна брутна месечна заплата")} value={salary} onChange={setSalary} suffix="EUR" />
            <NumberField id="turnover" label={tr("Annual turnover today", "Текучество днес (годишно)")} value={turnover} onChange={setTurnover} suffix="%" />
            <NumberField id="target" label={tr("Turnover you aim for", "Текучество, към което се стремите")} value={target} onChange={setTarget} suffix="%" />
            <NumberField id="recruit" label={tr("Cost to recruit one replacement", "Разход за подбор на един заместник")} value={recruit} onChange={setRecruit} suffix="EUR" hint={tr("Adverts, agency fees, interview time.", "Обяви, такси на агенции, време за интервюта.")} />
            <NumberField id="train" label={tr("Training cost per new hire", "Разход за обучение на нов служител")} value={train} onChange={setTrain} suffix="EUR" />
            <NumberField id="ramp" label={tr("Months to full productivity", "Месеци до пълна производителност")} value={ramp} onChange={setRamp} suffix={tr("months", "мес.")} step={0.5} />
            <NumberField id="prod" label={tr("Productivity while ramping up", "Производителност по време на въвеждане")} value={prod} onChange={(v) => setProd(Math.min(100, v))} suffix="%" />
          </form>
          <aside className="rg-gradient-border self-start p-7" aria-live="polite">
            <p className="text-sm font-semibold text-muted-foreground">{tr("Turnover costs you each year", "Текучеството ви струва годишно")}</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight text-primary">{money(r.annual)}</p>
            <dl className="mt-6 divide-y divide-border text-[15px]">
              <div className="flex justify-between py-3"><dt>{tr("Leavers per year", "Напуснали за година")}</dt><dd className="font-semibold">{r.leavers.toFixed(1)}</dd></div>
              <div className="flex justify-between py-3"><dt>{tr("Cost of each departure", "Цена на всяко напускане")}</dt><dd className="font-semibold">{money(r.perLeaver)}</dd></div>
              <div className="flex justify-between py-3"><dt>{tr(`Saving at ${target}% turnover`, `Спестяване при ${target}% текучество`)}</dt><dd className="font-semibold text-success">{money(r.saving)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">{tr("Based entirely on the figures you enter.", "Изчислено изцяло по въведените от вас стойности.")}</p>
          </aside>
        </div>
      </Section>
      <CtaBar title={tr("Build a team that stays", "Изградете екип, който остава")} body={tr("Pre-screened, skill-certified candidates with documents verified before arrival.", "Предварително оценени кандидати със сертифицирани умения и документи, проверени преди пристигането.")} primary={{ label: tr("Request talent", "Заявка за персонал"), to: "/employers/request-talent" }} />
    </div>
  );
};
export default TurnoverCalculator;
