// Public site shell: scam banner → sticky header → page → footer.
// The header is `sticky` (in normal flow), so no fixed-position spacer hacks are needed.
import { Outlet } from "react-router-dom";
import TopBanner from "./TopBanner";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import CookieConsent from "./layout/CookieConsent";
import MobileStickyCTA from "./layout/MobileStickyCTA";
import { useI18n } from "@/i18n/I18nProvider";

const Layout = () => {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("header.skip")}
      </a>
      <TopBanner />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileStickyCTA />
      <CookieConsent />
    </div>
  );
};

export default Layout;
