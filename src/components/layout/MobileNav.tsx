// Mobile navigation drawer: audience tabs, accordion for the active audience's menu, search, quick links, auth.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { useI18n } from "@/i18n/I18nProvider";
import { AUDIENCES, HEADER_CONTACT, HEADER_RESOURCES, MENUS, audienceFromPath } from "@/config/nav";
import type { useHeaderAuth } from "@/hooks/useHeaderAuth";
import logo from "@/assets/recruitly-logo.png";

type Auth = ReturnType<typeof useHeaderAuth>;

const MobileNav = ({ auth }: { auth: Auth }) => {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  const close = () => setOpen(false);

  const { active, menu: menuId } = audienceFromPath(pathname);
  const menu = MENUS[menuId];

  const linkCls = "flex items-center py-2.5 text-[15px] font-medium text-foreground hover:text-primary";
  const rootLinkCls = "flex items-center border-b border-border py-4 text-base font-semibold text-foreground hover:text-primary";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("header.openMenu")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-foreground hover:bg-muted"
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[88%] max-w-sm flex-col gap-0 overflow-y-auto p-0">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <img src={logo} alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
          <SheetTitle className="text-base font-extrabold text-ink">{t("header.menu")}</SheetTitle>
          <SheetDescription className="sr-only">{t("header.menuDesc")}</SheetDescription>
        </div>

        {/* Audience switcher */}
        <nav aria-label={t("header.mobileMenuAudience")} className="grid grid-cols-3 border-b border-border bg-ink">
          {AUDIENCES.map((a) => (
            <Link
              key={a.id}
              to={a.path}
              onClick={close}
              aria-current={active === a.id ? "page" : undefined}
              className={`px-2 py-3 text-center text-xs font-semibold transition-colors ${
                active === a.id ? "bg-white text-ink" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t(a.shortKey)}
            </Link>
          ))}
        </nav>

        <nav aria-label={t("header.mainNav")} className="flex-1 px-5 py-1">
          <Accordion type="single" collapsible>
            {menu.entries.map((entry) => {
              if (entry.type === "link") {
                return (
                  <Link key={entry.item.path} to={entry.item.path} onClick={close} className={rootLinkCls}>
                    {t(entry.item.labelKey)}
                  </Link>
                );
              }
              const { section } = entry;
              return (
                <AccordionItem key={section.id} value={section.id} className="border-border">
                  <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">{t(section.labelKey)}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="pb-2">
                      {section.items.map((item, i) => (
                        <li key={item.path + item.labelKey}>
                          <Link to={item.path} onClick={close} className={`${linkCls} ${i === 0 ? "font-semibold text-primary" : ""}`}>
                            {t(item.labelKey)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <Link to={menu.faq.path} onClick={close} className={rootLinkCls}>{t(menu.faq.labelKey)}</Link>
          <Link to={HEADER_RESOURCES.path} onClick={close} className={rootLinkCls}>{t(HEADER_RESOURCES.labelKey)}</Link>
        </nav>

        <div className="space-y-4 border-t border-border bg-muted/40 px-5 py-5">
          <HeaderSearch onDone={close} />
          <Button asChild size="lg" className="w-full rounded-sm"><Link to={HEADER_CONTACT.path} onClick={close}>{t(HEADER_CONTACT.labelKey)}</Link></Button>
          <div className="flex items-center">
            {auth.user ? (
              <div className="flex items-center gap-1">
                <Button asChild variant="ghost" size="sm"><Link to={auth.dashboardPath} onClick={close}>{auth.isAdmin ? t("header.adminPanel") : t("header.myDashboard")}</Link></Button>
                <Button variant="ghost" size="sm" onClick={() => { void auth.signOut(); close(); }}>{t("header.signOut")}</Button>
              </div>
            ) : (
              <Button asChild variant="ghost" size="sm"><Link to="/auth" onClick={close}>{t("nav.signIn")}</Link></Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
