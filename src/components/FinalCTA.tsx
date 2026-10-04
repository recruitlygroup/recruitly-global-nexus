// Closing banner, placed directly above the footer.
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackgroundPhoto from "./BackgroundPhoto";
import { PHOTOS } from "@/config/images";
import { EMPLOYER_DASHBOARD_URL } from "@/config/nav";
import { useI18n } from "@/i18n/I18nProvider";

const FinalCTA = () => {
  const { t } = useI18n();
  return (
    <section aria-labelledby="final-cta" className="relative isolate overflow-hidden text-white">
      <BackgroundPhoto src={PHOTOS.ctaBanner} overlay="flat" />
      <div className="page-container relative py-20 text-center md:py-28">
        <h2 id="final-cta" className="mx-auto max-w-3xl text-3xl text-white md:text-5xl">{t("home.cta.title")}</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/90">{t("home.cta.body")}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="amber" size="lg" className="rounded-sm">
            <Link to="/contact">{t("home.cta.primary")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-sm border-2 border-white bg-transparent text-white hover:bg-white hover:text-ink">
            <a href={EMPLOYER_DASHBOARD_URL}>{t("home.cta.secondary")}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};
export default FinalCTA;
