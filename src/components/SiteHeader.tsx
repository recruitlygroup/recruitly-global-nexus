// src/components/SiteHeader.tsx
// Corporate header: pillar strip (3 operational pillars) + main bar with the
// 4 menu groups, EN|BG switcher and the primary "Hire Talent" CTA.
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, LayoutDashboard, Shield, ExternalLink } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import recruitlyLogo from "@/assets/recruitly-logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { NAV_GROUPS, PILLARS, EMPLOYER_DASHBOARD_URL, type NavLink } from "@/config/nav";

const SiteHeader = () => {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [openGroup, setOpenGroup]       = useState<string | null>(null);
  const [user, setUser]                 = useState<User | null>(null);
  const [userRole, setUserRole]         = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); setOpenGroup(null); }, [location.pathname]);

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
      setUserRole(data?.role || "student");
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setTimeout(() => fetchRole(session.user.id), 0);
      else setUserRole(null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setUserRole(null);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const renderLink = (l: NavLink, className: string) =>
    l.external ? (
      <a key={l.path} href={l.path} target="_blank" rel="noopener noreferrer" className={className}>
        {t(l.labelKey)} <ExternalLink className="inline w-3 h-3 ml-1 opacity-70" />
      </a>
    ) : (
      <Link key={l.path + l.labelKey} to={l.path} className={className}>{t(l.labelKey)}</Link>
    );

  const dashboardPath = userRole === "admin" ? "/admin-recruitly-secure" : "/dashboard";

  return (
    <header className="w-full bg-white">
      {/* Pillar strip */}
      <div className="hidden lg:block bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between text-xs font-semibold">
          <nav className="flex items-center gap-6" aria-label="Pillars">
            {PILLARS.map((p) => (
              <Link
                key={p.path}
                to={p.path}
                className={`h-9 flex items-center border-b-2 transition-colors ${
                  isActive(p.path) ? "border-accent text-white" : "border-transparent text-white/75 hover:text-white"
                }`}
              >
                {t(p.labelKey)}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher dark />
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src={recruitlyLogo} alt="Recruitly Group" className="h-8 w-auto" loading="eager" />
            <span className="text-base font-extrabold text-primary tracking-tight hidden sm:inline">Recruitly Group</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_GROUPS.map((g) => (
              <div
                key={g.labelKey}
                className="relative"
                onMouseEnter={() => setOpenGroup(g.labelKey)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  className={`flex items-center gap-1 px-3 h-16 text-sm font-bold border-b-2 transition-colors ${
                    openGroup === g.labelKey ? "text-accent border-accent" : "text-primary border-transparent hover:text-accent"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={openGroup === g.labelKey}
                >
                  {t(g.labelKey)}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openGroup === g.labelKey ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openGroup === g.labelKey && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 w-72 bg-white border border-border rounded-md shadow-lg py-2 z-50"
                    >
                      {g.links.map((l) =>
                        renderLink(l, "block px-4 py-2.5 text-sm font-medium text-primary hover:bg-slate-50 hover:text-accent transition-colors")
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link
              to="/blog"
              className={`px-3 h-16 flex items-center text-sm font-bold border-b-2 transition-colors ${
                location.pathname.startsWith("/blog") ? "text-accent border-accent" : "text-primary border-transparent hover:text-accent"
              }`}
            >
              {t("nav.blog")}
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Button onClick={() => navigate(dashboardPath)} variant="ghost" size="sm" className="gap-1.5 text-sm">
                  {userRole === "admin" ? <Shield className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                  {userRole === "admin" ? "Admin" : "Dashboard"}
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-sm">Sign Out</Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="ghost" size="sm" className="text-sm font-semibold">
                {t("nav.signIn")}
              </Button>
            )}
            <a
              href={EMPLOYER_DASHBOARD_URL}
              className="inline-flex items-center bg-accent hover:bg-accent/90 text-white text-sm font-bold px-5 py-2.5 rounded-md transition-colors"
            >
              {t("nav.hireTalent")}
            </a>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-b border-border bg-white overflow-hidden max-h-[80vh] overflow-y-auto"
          >
            <div className="px-4 py-3 space-y-4">
              <div className="space-y-1">
                {PILLARS.map((p) => (
                  <Link key={p.path} to={p.path} className="block px-3 py-2.5 rounded-md bg-primary text-white text-sm font-bold">
                    {t(p.labelKey)}
                  </Link>
                ))}
              </div>
              {NAV_GROUPS.map((g) => (
                <div key={g.labelKey}>
                  <p className="text-xs font-extrabold text-accent uppercase tracking-wider px-3 py-1">{t(g.labelKey)}</p>
                  {g.links.map((l) =>
                    renderLink(l, "block px-3 py-2 text-sm font-medium text-primary hover:text-accent")
                  )}
                </div>
              ))}
              <Link to="/blog" className="block px-3 py-2 text-sm font-bold text-primary">{t("nav.blog")}</Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {user ? (
                  <>
                    <Button onClick={() => navigate(dashboardPath)} variant="outline" className="w-full">
                      {userRole === "admin" ? "Admin Panel" : "My Dashboard"}
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" className="w-full">Sign Out</Button>
                  </>
                ) : (
                  <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">{t("nav.signIn")}</Button>
                )}
                <a href={EMPLOYER_DASHBOARD_URL} className="w-full text-center bg-accent text-white font-bold py-2.5 rounded-md text-sm">
                  {t("nav.hireTalent")}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;
