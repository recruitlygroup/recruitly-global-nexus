import { ArrowRight } from "lucide-react";
import { EMPLOYER_DASHBOARD_URL } from "@/config/nav";
import { useI18n } from "@/i18n/I18nProvider";

// Replaces every inline employer / agency form.
const EmployerDashboardCTA = () => {
  const { t } = useI18n();
  return (
    <section className="bg-primary text-white rounded-md p-8 md:p-12">
      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">{t("employer.cta.title")}</h2>
      <p className="text-white/80 max-w-2xl leading-relaxed mb-6">{t("employer.cta.body")}</p>
      <a href={EMPLOYER_DASHBOARD_URL} className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">
        {t("employer.cta.button")} <ArrowRight className="w-4 h-4" />
      </a>
    </section>
  );
};
export default EmployerDashboardCTA;
