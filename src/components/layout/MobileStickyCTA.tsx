// Sticky bottom action bar on mobile/tablet (hidden on desktop where the header carries these actions).
import { Link } from "react-router-dom";
import { Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";

const MobileStickyCTA = () => {
  const { t } = useI18n();
  return (
    <div
      role="region"
      aria-label={t("cta.bar")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-3 pt-2.5 backdrop-blur lg:hidden"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5">
        <Button asChild><Link to="/jobs"><Search aria-hidden />{t("nav.searchJobs")}</Link></Button>
        <Button asChild variant="secondary"><Link to="/employers/request-talent"><Briefcase aria-hidden />{t("header.hireTalent")}</Link></Button>
      </div>
    </div>
  );
};

export default MobileStickyCTA;
