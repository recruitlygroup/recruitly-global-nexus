// Grounded, human-centric hero (replaces the AI-style SmartIntentHero).
import { Link } from "react-router-dom";
import PhotoSlot from "./PhotoSlot";
import { useI18n } from "@/i18n/I18nProvider";
import { EMPLOYER_DASHBOARD_URL } from "@/config/nav";

const CorporateHero = () => {
  const { t } = useI18n();
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block bg-accent text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm mb-5">
            {t("hero.eyebrow")}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary leading-[1.05] mb-5">{t("hero.title")}</h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-xl mb-8">{t("hero.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={EMPLOYER_DASHBOARD_URL} className="bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3.5 rounded-md text-center transition-colors">
              {t("hero.ctaHire")}
            </a>
            <Link to="/student-recruitment#wisescore" className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3.5 rounded-md text-center transition-colors">
              {t("hero.ctaScore")}
            </Link>
            <Link to="/intern-recruitment" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-6 py-3.5 rounded-md text-center transition-colors">
              {t("hero.ctaIntern")}
            </Link>
          </div>
        </div>
        <PhotoSlot file="hero-team.jpg" alt="Recruitment team with candidates" className="w-full h-72 md:h-[28rem] rounded-md" />
      </div>
    </section>
  );
};
export default CorporateHero;
