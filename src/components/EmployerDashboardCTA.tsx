import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EMPLOYER_DASHBOARD_URL } from "@/config/nav";
import { useI18n } from "@/i18n/I18nProvider";

// Meeting-first: employers, intern clients and student-recruitment partners book a consultation before using the dashboard.
const EmployerDashboardCTA = () => {
  const { t } = useI18n();
  return (
    <section className="bg-primary text-white rounded-md p-8 md:p-12">
      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">{t("employer.cta.title")}</h2>
      <p className="text-white/80 max-w-2xl leading-relaxed mb-6">{t("employer.cta.body")}</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link to="/schedule-a-call" className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">
          {t("employer.cta.button")} <ArrowRight className="w-4 h-4" />
        </Link>
        <a href={EMPLOYER_DASHBOARD_URL} className="text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">{t("employer.cta.signin")}</a>
      </div>
    </section>
  );
};
export default EmployerDashboardCTA;
