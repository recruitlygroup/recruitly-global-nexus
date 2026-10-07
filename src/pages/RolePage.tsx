// Dedicated page for one "role we consistently fill" — /roles/:slug
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import BackgroundPhoto from "@/components/BackgroundPhoto";
import EmployerDashboardCTA from "@/components/EmployerDashboardCTA";
import { findRole } from "@/data/roles";
import { NICHE_PAGES } from "./niche/nicheData";
import { findNavLabelKey } from "@/config/nav";
import { SITE } from "@/config/site";
import { useSEO } from "@/hooks/useSEO";
import { useI18n } from "@/i18n/I18nProvider";

const STEPS = ["role.step1", "role.step2", "role.step3", "role.step4", "role.step5", "role.step6", "role.step7"];

const RolePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const role = findRole(slug);
  const { t } = useI18n();
  useSEO({
    title: role ? `${t(`role.${role.slug}.title`)} | ${SITE.name}` : SITE.name,
    description: role ? t(`role.${role.slug}.sum`) : "",
    canonicalUrl: `${SITE.url}/roles/${slug}`,
  });
  if (!role) return <Navigate to="/manpower-recruitment" replace />;

  const programme = NICHE_PAGES.find((n) => n.slug === role.programme);

  return (
    <div className="bg-background">
      <section className="relative isolate overflow-hidden text-white">
        <BackgroundPhoto src={role.photo} alt={t(`role.alt.${role.slug}`)} overlay="left" priority />
        <div className="page-container relative flex min-h-[22rem] items-end py-14 md:min-h-[28rem] md:py-20">
          <div className="max-w-2xl">
            <Link to="/manpower-recruitment" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden /> {t("role.all")}
            </Link>
            <h1 className="text-4xl text-white md:text-6xl">{t(`role.${role.slug}.title`)}</h1>
            <p className="mt-4 text-lg leading-relaxed text-white/90 md:text-xl">{t(`role.${role.slug}.sum`)}</p>
            <Link to="/schedule-a-call" className="mt-7 inline-block rounded-sm bg-amber px-6 py-3.5 font-semibold text-amber-foreground hover:brightness-95">
              {t("hero.ctaHire")}
            </Link>
          </div>
        </div>
      </section>

      <div className="page-container space-y-14 py-14 md:py-20">
        {programme && (
          <section aria-labelledby="role-programme">
            <h2 id="role-programme" className="text-ink">{t("role.programme")}</h2>
            <Link to={`/specializations/${programme.slug}`} className="group mt-5 block max-w-3xl border-t-2 border-ink pt-5 transition-colors hover:border-primary">
              <p className="text-sm font-semibold text-muted-foreground">{programme.eyebrow}</p>
              <h3 className="mt-1 text-2xl text-ink group-hover:text-primary">{programme.title}</h3>
              <p className="mt-2 text-muted-foreground">{programme.subtitle}</p>
              <span className="mt-4 inline-flex items-center gap-2 font-semibold text-primary">
                {t("role.programme.cta")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
              </span>
            </Link>
          </section>
        )}

        <section aria-labelledby="role-process">
          <h2 id="role-process" className="text-ink">{t("role.process")}</h2>
          <ol className="mt-6 grid max-w-4xl gap-x-12 gap-y-4 md:grid-cols-2">
            {STEPS.map((k, i) => (
              <li key={k} className="flex items-start gap-4 border-b border-border pb-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                <span className="pt-1 text-foreground">{t(k)}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">{t("role.free")}</p>
        </section>

        {role.industries.length > 0 && (
          <section aria-labelledby="role-industries">
            <h2 id="role-industries" className="text-ink">{t("role.industries")}</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {role.industries.map((path) => (
                <li key={path}>
                  <Link to={path} className="inline-flex items-center rounded-sm border border-ink px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white">
                    {t(findNavLabelKey(path) ?? "menu.industries")}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <EmployerDashboardCTA />
      </div>
    </div>
  );
};
export default RolePage;
