// /schedule-a-call — meeting-first route for employers, intern clients and student-recruitment partners.
import { BadgeCheck, Rocket, Wallet } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { CtaBar, Faqs, Section } from "@/components/blocks";
import ScheduleCall from "@/components/schedule/ScheduleCall";
import { EMPLOYER_DASHBOARD_URL } from "@/config/nav";
import { SITE } from "@/config/site";
import { useSEO } from "@/hooks/useSEO";
import { useTr } from "@/i18n/useTr";

const ScheduleCallPage = () => {
  const { tr } = useTr();
  const [params] = useSearchParams();
  const mode = params.get("mode") === "preview" ? "preview" : "embed"; // ?mode=preview shows the interactive demo UI
  useSEO({
    title: tr("Book a Hiring Consultation | Recruitly Group", "Резервирайте консултация за наемане | Recruitly Group"),
    description: tr("Schedule a call with Recruitly Group to hire skilled workers, interns or partner on student recruitment.", "Запазете разговор с Recruitly Group за наемане на квалифицирани работници, стажанти или партньорство за студентски набор."),
    canonicalUrl: `${SITE.url}/schedule-a-call`,
  });
  const bullets = [
    { icon: BadgeCheck, t: tr("Pre-screened candidates", "Предварително проверени кандидати"), b: tr("Qualifications, documents and skills checked before you see a file.", "Квалификации, документи и умения са проверени, преди да видите досие.") },
    { icon: Rocket, t: tr("Fast onboarding", "Бързо въвеждане"), b: tr("Visa, travel and arrival handled so new hires start productive.", "Виза, пътуване и пристигане са организирани, за да започнат работа бързо.") },
    { icon: Wallet, t: tr("Zero upfront fees", "Без предварителни такси"), b: tr("Start the conversation with no cost and no commitment.", "Започнете разговора без разходи и без ангажимент.") },
  ];
  const steps = [
    tr("We review your roles, skill sets and hiring timeline.", "Преглеждаме позициите, уменията и сроковете ви за наемане."),
    tr("We walk you through our pre-vetted pipeline and partners.", "Представяме ви предварително проверените ни кандидати и партньори."),
    tr("We outline a custom recruitment plan and next steps.", "Очертаваме индивидуален план за подбор и следващи стъпки."),
  ];
  return (
    <div className="bg-background">
      <section className="relative isolate overflow-hidden border-b border-border bg-secondary/50">
        <div className="page-container grid gap-10 py-14 md:py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow mb-3">{tr("Hire from us", "Наемете чрез нас")}</p>
            <h1 className="max-w-2xl">{tr("Partner with Us to Hire Top Global Talent", "Партнирайте си с нас, за да наемете най-добрите таланти от света")}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/80">
              {tr("Book a short call with our talent team. We learn what you need, show you how our vetted pipeline works, and agree a plan for skilled workers, interns or a student-recruitment partnership. Pick a time below and we will send a calendar invite with a video link.",
                  "Запазете кратък разговор с нашия екип. Разбираме от какво имате нужда, показваме как работи проверената ни система и уточняваме план за квалифицирани работници, стажанти или партньорство за студентски набор. Изберете час по-долу и ще ви изпратим покана с видеовръзка.")}
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-3">
              {bullets.map(({ icon: I, t, b }) => (
                <li key={t}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><I className="h-5 w-5" aria-hidden /></span>
                  <p className="mt-3 font-bold">{t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{b}</p>
                </li>
              ))}
            </ul>
          </div>
          <aside className="rg-gradient-border self-start p-6">
            <h2 className="text-lg">{tr("What happens on the call", "Какво се случва по време на разговора")}</h2>
            <ol className="mt-4 space-y-4">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-[15px]"><span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>{s}</li>
              ))}
            </ol>
            <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
              {tr("Already a Recruitly partner?", "Вече сте партньор на Recruitly?")}{" "}
              <a href={EMPLOYER_DASHBOARD_URL} className="font-semibold text-primary hover:underline">{tr("Open your dashboard", "Отворете портала си")}</a>
            </p>
          </aside>
        </div>
      </section>

      <Section id="scheduler"><ScheduleCall mode={mode} /></Section>

      <Faqs f={{ title: tr("Before you book", "Преди да резервирате"), items: [
        { q: tr("Why a call first?", "Защо първо разговор?"), a: tr("Every hiring, intern or student-recruitment request is different. A short conversation lets us confirm requirements, timelines and the right source market before anyone spends time on files.", "Всяка заявка е различна. Кратък разговор ни позволява да уточним изискванията, сроковете и най-подходящия пазар, преди да се хаби време за досиета.") },
        { q: tr("Who is this call for?", "За кого е този разговор?"), a: tr("Employers hiring skilled workers, companies wanting interns, universities and agents interested in student recruitment, and enterprises considering our Master Vendor Program.", "За работодатели, търсещи квалифицирани работници, компании, търсещи стажанти, университети и агенти за студентски набор и предприятия, които обмислят нашата Master Vendor Program.") },
        { q: tr("Does it cost anything?", "Струва ли нещо?"), a: tr("No. The consultation is free and carries no obligation.", "Не. Консултацията е безплатна и без задължения.") },
        { q: tr("What should I prepare?", "Какво да подготвя?"), a: tr("Roles and numbers, your preferred start date, country of work and any language or licence requirements. Rough ideas are fine.", "Позиции и брой, желана начална дата, държава на работа и езикови или лицензионни изисквания. Приблизителни идеи са напълно достатъчни.") },
      ] }} />
      <CtaBar title={tr("Prefer to write to us?", "Предпочитате да ни пишете?")} body={tr("Send your brief by email or WhatsApp and we will reply the same working day.", "Изпратете заявката си по имейл или WhatsApp и ще отговорим в рамките на работния ден.")} />
    </div>
  );
};
export default ScheduleCallPage;
