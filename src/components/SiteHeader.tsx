// Site header — two tiers.
//   Tier 1 (ink bar): audience switcher  Student Recruitment · Manpower Recruitment · Intern Recruitment
//   Tier 2 (white):   logo · audience navigation (employer dropdowns under Manpower) · FAQ · Resources · Search · Contact
// Keyboard: Enter/Space toggles a dropdown, Esc closes it and returns focus, Tab moves through the panel and
// leaving the header closes it. Hover opens for mouse users only. Mobile uses <MobileNav/>.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LayoutDashboard, Search, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MegaMenuPanel from "@/components/layout/MegaMenuPanel";
import HeaderSearch from "@/components/layout/HeaderSearch";
import MobileNav from "@/components/layout/MobileNav";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { useI18n } from "@/i18n/I18nProvider";
import { AUDIENCES, HEADER_CONTACT, HEADER_RESOURCES, MENUS, audienceFromPath, type NavSection } from "@/config/nav";
import { SITE } from "@/config/site";
import logo from "@/assets/recruitly-logo.png";

const isUnder = (pathname: string, bases: string[]) => bases.some((b) => pathname === b || pathname.startsWith(b + "/"));

const SiteHeader = () => {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const auth = useHeaderAuth();
  const uid = useId();

  const { active: activeAudience, menu: menuId } = audienceFromPath(pathname);
  const menu = MENUS[menuId];

  const [openId, setOpenId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const searchBtn = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const openedByHover = useRef(false);

  const close = useCallback(() => { window.clearTimeout(closeTimer.current); setOpenId(null); }, []);
  const closeAll = useCallback(() => { close(); setSearchOpen(false); }, [close]);
  const hoverOpen = (id: string) => { window.clearTimeout(closeTimer.current); openedByHover.current = true; setSearchOpen(false); setOpenId(id); };
  const hoverClose = () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setOpenId(null), 160); };
  const keepOpen = () => window.clearTimeout(closeTimer.current);

  useEffect(() => { closeAll(); }, [pathname, closeAll]);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // click outside closes
  useEffect(() => {
    if (!openId && !searchOpen) return;
    const onDown = (e: MouseEvent) => { if (!headerRef.current?.contains(e.target as Node)) closeAll(); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openId, searchOpen, closeAll]);

  const onToggle = (id: string) => {
    if (openId === id && openedByHover.current) { openedByHover.current = false; return; } // keep hover-opened panel open on click
    openedByHover.current = false;
    setSearchOpen(false);
    setOpenId((cur) => (cur === id ? null : id));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (openId) { const id = openId; close(); triggers.current[id]?.focus(); }
    else if (searchOpen) { setSearchOpen(false); searchBtn.current?.focus(); }
  };

  // Close when keyboard focus moves outside the header. A null relatedTarget (a click on panel padding) is
  // ignored here; the click-outside listener handles real outside clicks.
  const onBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if ((openId || searchOpen) && next && !e.currentTarget.contains(next)) closeAll();
  };

  const activeSection: NavSection | undefined = menu.entries
    .map((e) => (e.type === "dropdown" ? e.section : null))
    .find((s): s is NavSection => !!s && s.id === openId);

  const navLink = "flex h-16 items-center gap-1 border-b-2 px-3 text-[15px] font-semibold transition-colors xl:px-4";
  const stateCls = (on: boolean) => (on ? "border-primary text-primary" : "border-transparent text-foreground hover:text-primary");
  const topLink = "text-[13px] font-medium text-white/80 transition-colors hover:text-white";

  return (
    <header
      ref={headerRef}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      className="sticky top-0 z-50 bg-white shadow-[0_1px_0_hsl(var(--border))]"
    >
      {/* ── Tier 1 · audience switcher ─────────────────────────────────── */}
      <div className="bg-ink text-white">
        <div className="page-container flex h-10 items-stretch justify-between">
          <nav aria-label={t("header.audience")}>
            <ul className="flex h-full items-stretch">
              {AUDIENCES.map((a) => {
                const on = activeAudience === a.id;
                return (
                  <li key={a.id} className="flex">
                    <Link
                      to={a.path}
                      aria-current={on ? "page" : undefined}
                      className={`flex items-center px-3 text-[13px] font-semibold transition-colors sm:px-5 ${
                        on ? "bg-white text-ink" : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="sm:hidden">{t(a.shortKey)}</span>
                      <span className="hidden sm:inline">{t(a.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            {auth.user ? (
              <>
                <Link to={auth.dashboardPath} className={`${topLink} inline-flex items-center gap-1.5`}>
                  {auth.isAdmin ? <Shield className="h-3.5 w-3.5" aria-hidden /> : <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />}
                  {auth.isAdmin ? t("header.admin") : t("header.dashboard")}
                </Link>
                <button type="button" onClick={() => void auth.signOut()} className={topLink}>{t("header.signOut")}</button>
              </>
            ) : (
              <Link to="/auth" className={topLink}>{t("nav.signIn")}</Link>
            )}
            <LanguageSwitcher dark />
          </div>
        </div>
      </div>

      {/* ── Tier 2 · main navigation ───────────────────────────────────── */}
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label={t("header.home")} className="flex flex-shrink-0 items-center gap-2.5 rounded-sm">
          <img src={logo} alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
          <span className="hidden text-[17px] font-extrabold tracking-tight text-ink sm:inline">{SITE.name}</span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label={t("header.mainNav")} className="hidden flex-1 lg:block">
          <ul className="flex items-center">
            {menu.entries.map((entry) => {
              if (entry.type === "link") {
                const { item } = entry;
                const here = pathname === item.path.split("#")[0];
                return (
                  <li key={item.path}>
                    <Link to={item.path} aria-current={here ? "page" : undefined} className={`${navLink} ${stateCls(here)}`}>
                      {t(item.labelKey)}
                    </Link>
                  </li>
                );
              }
              const { section } = entry;
              const isOpen = openId === section.id;
              const current = isUnder(pathname, section.basePaths);
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
                    className={`${navLink} ${stateCls(isOpen || current)}`}
                  >
                    {t(section.labelKey)}
                    <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop: FAQ · Resources · Search · Contact */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link to={menu.faq.path} className="hidden px-3 text-[15px] font-semibold text-foreground transition-colors hover:text-primary xl:inline-flex">
            {t(menu.faq.labelKey)}
          </Link>
          <Link to={HEADER_RESOURCES.path} className="hidden px-3 text-[15px] font-semibold text-foreground transition-colors hover:text-primary xl:inline-flex">
            {t(HEADER_RESOURCES.labelKey)}
          </Link>
          <button
            type="button"
            ref={searchBtn}
            onClick={() => { close(); setSearchOpen((v) => !v); }}
            aria-expanded={searchOpen}
            aria-controls={`${uid}-search`}
            aria-label={t("header.search")}
            className="flex h-10 w-10 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            {searchOpen ? <X className="h-5 w-5" aria-hidden /> : <Search className="h-5 w-5" aria-hidden />}
          </button>
          <Button asChild size="sm" className="ml-1 rounded-sm px-5">
            <Link to={HEADER_CONTACT.path}>{t(HEADER_CONTACT.labelKey)}</Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <MobileNav auth={auth} />
        </div>
      </div>

      {/* Dropdown panel (desktop) */}
      {activeSection && (
        <div
          id={`${uid}-${activeSection.id}`}
          onPointerEnter={(e) => e.pointerType === "mouse" && keepOpen()}
          onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}
          className="absolute inset-x-0 top-full hidden animate-fade-in border-b border-border bg-white shadow-popover lg:block"
        >
          <MegaMenuPanel section={activeSection} onNavigate={closeAll} />
        </div>
      )}

      {/* Search panel (desktop) */}
      {searchOpen && (
        <div id={`${uid}-search`} className="absolute inset-x-0 top-full hidden animate-fade-in border-b border-border bg-white shadow-popover lg:block">
          <div className="page-container py-6">
            <HeaderSearch autoFocus showClose onDone={() => setSearchOpen(false)} className="mx-auto max-w-3xl" />
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
