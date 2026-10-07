// Homepage hero: full-width, full-HD background photo with a dark overlay for legibility.
// Headline, value proposition and the three calls to action are the existing hero.* strings — unchanged.
import { Link } from "react-router-dom";
import BackgroundPhoto from "./BackgroundPhoto";
import { PHOTOS } from "@/config/images";
import { useI18n } from "@/i18n/I18nProvider";

const CorporateHero = () => {
  const { t } = useI18n();
  const btn = "rounded-sm px-6 py-3.5 text-center font-semibold transition-colors";
  return (
    <section className="relative isolate overflow-hidden text-white">
      <BackgroundPhoto src={PHOTOS.hero} overlay="left" priority />
      <div className="page-container relative flex min-h-[34rem] items-center py-20 md:min-h-[42rem] md:py-28">
        <div className="max-w-2xl">
          <p className="mb-5 inline-block rounded-sm bg-amber px-3 py-1 text-sm font-semibold text-amber-foreground">{t("hero.eyebrow")}</p>
          <h1 className="mb-5 text-4xl text-white md:text-6xl">{t("hero.title")}</h1>
          <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/90 md:text-xl">{t("hero.subtitle")}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/schedule-a-call" className={`${btn} bg-amber text-amber-foreground hover:brightness-95`}>
              {t("hero.ctaHire")}
            </Link>
            <Link to="/student-recruitment#wisescore" className={`${btn} bg-white text-ink hover:bg-white/90`}>
              {t("hero.ctaScore")}
            </Link>
            <Link to="/intern-recruitment" className={`${btn} border-2 border-white text-white hover:bg-white hover:text-ink`}>
              {t("hero.ctaIntern")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
export default CorporateHero;
