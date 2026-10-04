// "Who we are" — introduction under the hero, plus the three audience pillars.
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, GraduationCap, Users } from "lucide-react";
import BackgroundPhoto from "./BackgroundPhoto";
import { PHOTOS } from "@/config/images";
import { useI18n } from "@/i18n/I18nProvider";

const PILLARS = [
  { titleKey: "pillar.student",  bodyKey: "home.who.student",  path: "/student-recruitment",  icon: GraduationCap },
  { titleKey: "pillar.manpower", bodyKey: "home.who.manpower", path: "/manpower-recruitment", icon: Users },
  { titleKey: "pillar.intern",   bodyKey: "home.who.intern",   path: "/intern-recruitment",   icon: Briefcase },
];

const WhoWeAre = () => {
  const { t } = useI18n();
  return (
    <section aria-labelledby="who-we-are" className="bg-white">
      <div className="page-container py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <h2 id="who-we-are" className="text-ink">{t("home.who.title")}</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{t("home.who.body")}</p>
            <Link to="/about" className="group mt-7 inline-flex items-center gap-2 font-semibold text-primary hover:text-primary-dark">
              {t("home.who.link")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" aria-hidden />
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm lg:col-span-6">
            <BackgroundPhoto src={PHOTOS.whoWeAre} alt={t("home.who.photoAlt")} overlay="none" />
          </div>
        </div>

        <ul className="mt-14 grid gap-x-10 gap-y-8 md:mt-20 md:grid-cols-3">
          {PILLARS.map((p) => (
            <li key={p.path} className="border-t-2 border-ink pt-5 transition-colors hover:border-primary">
              <Link to={p.path} className="group block">
                <p.icon className="mb-4 h-7 w-7 text-primary" aria-hidden />
                <h3 className="text-xl text-ink group-hover:text-primary">{t(p.titleKey)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t(p.bodyKey)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  {t("common.learnMore")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
export default WhoWeAre;
