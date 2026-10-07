// /jobs/type/:type, /jobs/sector/:sector, /jobs/location/:city — landing pages that show live openings from the job board
// and route candidates to /jobs with WhatsApp or the online form.
import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { ApplyOptions, CtaBar, Faqs, Hero, Section } from "@/components/blocks";
import { useJobListings } from "@/hooks/useJobListings";
import { useSEO } from "@/hooks/useSEO";
import { SITE } from "@/config/site";
import { useTr } from "@/i18n/useTr";

const human = (s = "") => decodeURIComponent(s).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const JobLanding = () => {
  const { tr } = useTr();
  const { type, sector, city } = useParams();
  const { pathname } = useLocation();
  const kind = type ? "type" : sector ? "sector" : "location";
  const term = human(type ?? sector ?? city);
  const needle = term.toLowerCase();
  const { jobs, loading } = useJobListings();

  const title = kind === "location" ? tr(`Jobs in ${term}`, `Работа в ${term}`) : tr(`${term} jobs abroad`, `Работа в чужбина: ${term}`);
  useSEO({ title: `${title} | ${SITE.name}`, description: tr(`Browse verified ${term.toLowerCase()} openings and apply on WhatsApp or with our online form. Placement is free for workers.`, `Разгледайте проверени позиции (${term.toLowerCase()}) и кандидатствайте през WhatsApp или онлайн формуляр. Подборът е безплатен за работниците.`), canonicalUrl: `${SITE.url}${pathname}` });

  const { matches, exact } = useMemo(() => {
    const m = kind === "type" ? [] : jobs.filter((j) => (kind === "sector" ? j.job_title : j.country ?? "").toLowerCase().includes(needle.replace(/s$/, "")));
    return { matches: (m.length ? m : jobs).slice(0, 8), exact: m.length > 0 };
  }, [jobs, kind, needle]);

  return (
    <div className="bg-background">
      <Hero hero={{ eyebrow: tr("Jobs", "Работа"), title, lead: tr("Verified openings, a free process for workers, and two simple ways to apply.", "Проверени позиции, безплатен процес за работниците и два лесни начина за кандидатстване."), primary: { label: tr("See all openings", "Всички позиции"), to: `/jobs${kind === "type" ? "" : `?q=${encodeURIComponent(term)}`}` }, secondary: { label: tr("How to apply", "Как да кандидатствате"), to: "/job-seekers/how-to-apply" } }} />
      <Section title={exact ? tr(`Open ${term.toLowerCase()} roles`, `Свободни позиции: ${term.toLowerCase()}`) : tr("Open roles right now", "Свободни позиции в момента")} lead={exact ? undefined : tr(`No roles match “${term}” at the moment. Here is what is open today.`, `В момента няма позиции за „${term}“. Ето какво е отворено днес.`)}>
        {loading ? <p className="text-muted-foreground">{tr("Loading openings…", "Зареждане на позиции…")}</p> : matches.length === 0 ? (
          <p className="text-muted-foreground">{tr("New roles are added often. Message us and we will tell you when one opens.", "Нови позиции се добавят често. Пишете ни и ще ви кажем, когато се открие такава.")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {matches.map((j) => (
              <li key={j.id}>
                <Link to={`/jobs?q=${encodeURIComponent(j.job_title)}`} className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-primary/[0.03]">
                  <span><span className="block font-bold group-hover:text-primary">{j.job_title}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" aria-hidden />{j.country ?? tr("Multiple countries", "Няколко държави")}{j.remaining_vacancies ? ` · ${j.remaining_vacancies} ${tr("vacancies", "места")}` : ""}</span></span>
                  <ArrowRight className="h-5 w-5 flex-none text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <ApplyOptions context={tr(`I would like to apply for ${term} jobs through Recruitly Group.`, `Искам да кандидатствам за работа (${term}) чрез Recruitly Group.`)} />
      <Faqs f={{ items: [
        { q: tr("Do I pay to apply?", "Плащам ли, за да кандидатствам?"), a: tr("No. Placement is free of charge to workers.", "Не. Подборът е безплатен за работниците.") },
        { q: tr("What happens after I apply?", "Какво става след като кандидатствам?"), a: tr("A recruiter reviews your profile, contacts you for a screening call and explains the next steps for the role.", "Рекрутър преглежда профила ви, свързва се с вас за разговор и обяснява следващите стъпки за позицията.") },
        { q: tr("Can you help with documents?", "Можете ли да помогнете с документите?"), a: tr("Yes. Our partner Apostille Sewa coordinates attestation and police clearance support.", "Да. Нашият партньор Apostille Sewa координира заверката и съдействието за свидетелство за съдимост.") },
      ] }} />
      <CtaBar title={tr("Not seeing the right role?", "Не виждате подходящата позиция?")} body={tr("Tell us your trade and preferred country and we will contact you when a match opens.", "Кажете ни занаята и предпочитаната държава и ще се свържем с вас, когато се появи подходяща позиция.")} primary={{ label: tr("Browse all openings", "Всички позиции"), to: "/jobs" }} />
    </div>
  );
};
export default JobLanding;
