// Cookie consent: essential-only vs accept-all. Drives Google Consent Mode (analytics_storage) for GTM.
// Defaults are set to "denied" in index.html BEFORE GTM loads, and a stored "all" is re-applied there too.
// The footer's "Cookie settings" button calls openCookieSettings() to reopen this banner.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";

const KEY = "recruitly.cookie-consent"; // "all" | "essential"
const OPEN_EVENT = "recruitly:open-cookie-settings";

declare global { interface Window { dataLayer?: unknown[] } }

export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_EVENT));

function gtag(..._args: unknown[]) {
  // GTM needs the real `arguments` object, not an array
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer = window.dataLayer || []).push(arguments);
}

const applyConsent = (choice: "all" | "essential") => {
  gtag("consent", "update", { analytics_storage: choice === "all" ? "granted" : "denied" });
};

const CookieConsent = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setOpen(true); } catch { setOpen(true); }
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const choose = (choice: "all" | "essential") => {
    try { localStorage.setItem(KEY, choice); } catch { /* ignore */ }
    applyConsent(choice);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="region"
      aria-label={t("cookie.region")}
      className="fixed inset-x-3 bottom-[4.75rem] z-[70] mx-auto max-w-xl rounded-xl border border-border bg-card p-5 shadow-popover animate-fade-in lg:inset-x-auto lg:bottom-5 lg:left-5 lg:mx-0"
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" aria-hidden />
        <div>
          <h2 className="text-base font-bold">{t("cookie.title")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t("cookie.body")}{" "}
            <Link to="/cookies" className="font-medium text-primary underline underline-offset-2">{t("cookie.policy")}</Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => choose("all")}>{t("cookie.accept")}</Button>
            <Button size="sm" variant="secondary" onClick={() => choose("essential")}>{t("cookie.reject")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
