// Dismissible recruitment-scam warning, shown above the header on every public page.
// Rendered visible by default (so the pre-rendered HTML contains it and there is no layout
// shift for first-time visitors); a stored dismissal hides it right after mount.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { SITE } from "@/config/site";

const KEY = "recruitly.scam-banner-dismissed";
const HIDE_FOR_MS = 7 * 24 * 60 * 60 * 1000; // come back after a week

const TopBanner = () => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      const at = Number(localStorage.getItem(KEY));
      if (at && Date.now() - at < HIDE_FOR_MS) setVisible(false);
    } catch { /* storage unavailable – keep banner visible */ }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
  };

  return (
    <div role="region" aria-label={t("banner.region")} className="bg-primary-dark text-white">
      <div className="page-container flex items-start sm:items-center gap-3 py-2">
        <ShieldAlert className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0 text-amber" aria-hidden />
        <p className="flex-1 text-[13px] leading-snug">
          <strong className="font-semibold">{t("banner.lead")}</strong>{" "}
          <span className="text-white/90">{t("banner.body")} <span className="font-semibold text-white">@{SITE.domain}</span>.</span>{" "}
          <Link to="/security-and-scams" className="font-semibold text-amber underline underline-offset-2 hover:text-white whitespace-nowrap">
            {t("banner.link")} →
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("banner.dismiss")}
          className="flex-shrink-0 -mr-1 p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default TopBanner;
