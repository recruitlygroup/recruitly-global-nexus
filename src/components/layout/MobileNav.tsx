// Mobile navigation drawer: accordion per section, quick actions, auth, language.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ExternalLink, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { NAV } from "@/config/nav";
import type { useHeaderAuth } from "@/hooks/useHeaderAuth";
import logo from "@/assets/recruitly-logo.webp";

type Auth = ReturnType<typeof useHeaderAuth>;

const MobileNav = ({ auth }: { auth: Auth }) => {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  const close = () => setOpen(false);

  const linkCls = "flex items-center gap-1.5 py-2.5 text-[15px] font-medium text-foreground hover:text-primary";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("header.openMenu")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[88%] max-w-sm flex-col gap-0 overflow-y-auto p-0">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <img src={logo} alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
          <SheetTitle className="text-base font-extrabold text-primary">{t("header.menu")}</SheetTitle>
          <SheetDescription className="sr-only">{t("header.menuDesc")}</SheetDescription>
        </div>

        <nav aria-label={t("header.mainNav")} className="flex-1 px-5 py-2">
          <Accordion type="single" collapsible>
            {NAV.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border-border">
                <AccordionTrigger className="py-4 text-xs font-semibold uppercase tracking-eyebrow hover:no-underline">
                  {t(section.labelKey)}
                </AccordionTrigger>
                <AccordionContent>
                  {section.columns.map((col, i) => (
                    <div key={i} className="mb-3">
                      {col.headingKey && <p className="eyebrow mb-1 text-muted-foreground">{t(col.headingKey)}</p>}
                      <ul>
                        {col.items.map((item) => (
                          <li key={item.path + item.labelKey}>
                            {item.external ? (
                              <a href={item.path} target="_blank" rel="noopener noreferrer" className={linkCls}>
                                {t(item.labelKey)} <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
                              </a>
                            ) : (
                              <Link to={item.path} onClick={close} className={linkCls}>{t(item.labelKey)}</Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </nav>

        <div className="space-y-3 border-t border-border bg-muted/40 px-5 py-5">
          <Button asChild size="lg" className="w-full"><Link to="/jobs" onClick={close}>{t("nav.searchJobs")}</Link></Button>
          <Button asChild size="lg" variant="secondary" className="w-full"><Link to="/employers/request-talent" onClick={close}>{t("header.hireTalent")}</Link></Button>
          <div className="flex items-center pt-1">
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
