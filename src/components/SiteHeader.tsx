// Site header: logo · 5 sections with mega-menu (disclosure pattern) · language · Search jobs.
// Keyboard: Enter/Space toggles, Esc closes and returns focus, Tab moves through the panel, leaving the
// header closes it. Hover opens for mouse users only. Mobile uses <MobileNav/>.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MegaMenuPanel from "@/components/layout/MegaMenuPanel";
import MobileNav from "@/components/layout/MobileNav";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { useI18n } from "@/i18n/I18nProvider";
import { NAV } from "@/config/nav";
import { SITE } from "@/config/site";
import logo from "@/assets/recruitly-logo.webp";

const SiteHeader = () => {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const auth = useHeaderAuth();
  const uid = useId();

  const [openId, setOpenId] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<number | undefined>(undefined);
  const openedByHover = useRef(false);

  const close = useCallback(() => { window.clearTimeout(closeTimer.current); setOpenId(null); }, []);
  const hoverOpen = (id: string) => { window.clearTimeout(closeTimer.current); openedByHover.current = true; setOpenId(id); };
  const hoverClose = () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setOpenId(null), 160); };
  const keepOpen = () => window.clearTimeout(closeTimer.current);

  useEffect(() => { close(); }, [pathname, close]);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // click outside closes
  useEffect(() => {
    if (!openId) return;
    const onDown = (e: MouseEvent) => { if (!headerRef.current?.contains(e.target as Node)) close(); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openId, close]);

  const onToggle = (id: string) => {
    if (openId === id && openedByHover.current) { openedByHover.current = false; return; } // keep hover-opened panel open on click
    openedByHover.current = false;
    setOpenId((cur) => (cur === id ? null : id));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && openId) {
      const id = openId;
      close();
      triggers.current[id]?.focus();
    }
  };

  // Close when keyboard focus moves to something outside the header. A null relatedTarget (e.g. a click on
  // the panel's padding) is ignored here; the click-outside listener handles real outside clicks.
  const onBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (openId && next && !e.currentTarget.contains(next)) close();
  };

  const isCurrent = (bases: string[]) => bases.some((b) => pathname === b || pathname.startsWith(b + "/"));
  const active = NAV.find((s) => s.id === openId);

  return (
    <header
      ref={headerRef}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
    >
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label={t("header.home")} className="flex flex-shrink-0 items-center gap-2.5 rounded-lg">
          <img src={logo} alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
          <span className="hidden text-[17px] font-extrabold tracking-tight text-primary-dark sm:inline">{SITE.name}</span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label={t("header.mainNav")} className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center">
            {NAV.map((section) => {
              const isOpen = openId === section.id;
              const current = isCurrent(section.basePaths);
              return (
                <li
                  key={section.id}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hoverOpen(section.id)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}
                >
                  <button
                    type="button"
                    ref={(el) => { triggers.current[section.id] = el; }}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-${section.id}`}
                    aria-current={current ? "true" : undefined}
                    onClick={() => onToggle(section.id)}
                    className={`flex h-16 items-center gap-1 border-b-2 px-3 text-xs font-semibold uppercase tracking-eyebrow transition-colors xl:px-4 ${
                      isOpen || current ? "border-primary text-primary" : "border-transparent text-foreground hover:text-primary"
                    }`}
                  >
                    {t(section.labelKey)}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-1.5 lg:flex">
          <LanguageSwitcher />
          {auth.user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 xl:inline-flex">
                <Link to={auth.dashboardPath}>
                  {auth.isAdmin ? <Shield aria-hidden /> : <LayoutDashboard aria-hidden />}
                  {auth.isAdmin ? t("header.admin") : t("header.dashboard")}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="hidden xl:inline-flex" onClick={() => void auth.signOut()}>{t("header.signOut")}</Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden xl:inline-flex"><Link to="/auth">{t("nav.signIn")}</Link></Button>
          )}
          <Button asChild variant="secondary" size="sm" className="hidden xl:inline-flex"><Link to="/employers/request-talent">{t("header.hireTalent")}</Link></Button>
          <Button asChild size="sm"><Link to="/jobs">{t("nav.searchJobs")}</Link></Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <MobileNav auth={auth} />
        </div>
      </div>

      {/* Mega-menu panel (desktop) */}
      {active && (
        <div
          id={`${uid}-${active.id}`}
          onPointerEnter={(e) => e.pointerType === "mouse" && keepOpen()}
          onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}
          className="absolute inset-x-0 top-full hidden animate-fade-in border-b border-border bg-white shadow-popover lg:block"
        >
          <MegaMenuPanel section={active} onNavigate={close} />
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
