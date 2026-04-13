// src/components/SiteHeader.tsx
// ─────────────────────────────────────────────────────────────
// CHANGE: Removed `position: fixed` from the <header> element.
// The parent div in Layout.tsx is now the fixed container.
// This makes TopBanner + SiteHeader stack correctly.
// The `<div className="h-16" />` ghost spacer is also removed
// because Layout.tsx now uses pt-16 on the content wrapper.
//
// UI UPGRADE: Cleaner nav styles, better CTA button, improved
// dropdown hover states.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Users, FileCheck, Plane, Menu, X,
  Briefcase, LayoutDashboard, Shield, ChevronDown, ArrowRight,
  Building2, MessageCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import recruitlyLogo from "@/assets/recruitly-logo.png";

const NAV = [
  { label: "For Employers", path: "/for-employers", highlight: true },
  {
    label: "Services",
    items: [
      { label: "Hire Top Talent",     sub: "South Asia & GCC talent for EU employers", icon: Building2,    path: "/manpower-recruitment", badge: "Popular" },
      { label: "Agency Partnership",  sub: "White-label global talent pipeline",         icon: Briefcase,    path: "/for-employers#agency-partner" },
      { label: "Study Abroad",        sub: "University placement & study visas",          icon: GraduationCap, path: "/educational-consultancy" },
      { label: "Apostille & Docs",    sub: "Fast document legalization worldwide",         icon: FileCheck,    path: "/apostille-services" },
      { label: "Travel & Ticketing",  sub: "Flights, tours & travel packages",            icon: Plane,        path: "/tours-and-travels" },
    ],
  },
  { label: "Universities", path: "/universities" },
  { label: "Jobs",         path: "/jobs" },
  { label: "Blog",         path: "/blog" },
];

const SiteHeader = () => {
  const [isScrolled, setIsScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser]                 = useState<User | null>(null);
  const [userRole, setUserRole]         = useState<string | null>(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const go = (path: string) => {
    navigate(path); setOpenDropdown(null); setMobileOpen(false);
  };

  return (
    // NO `fixed` class here — Layout.tsx parent div is the fixed container
    <header
      className={`w-full bg-background border-b transition-all duration-200 ${
        isScrolled ? "border-border shadow-sm" : "border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => go("/")}
          className="flex items-center gap-2.5 flex-shrink-0 group"
        >
          <img
            src={recruitlyLogo}
            alt="Recruitly Group"
            className="h-8 w-auto"
            loading="eager"
          />
          <span className="text-base font-bold text-foreground tracking-tight hidden sm:inline group-hover:text-accent transition-colors">
            Recruitly Group
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          {NAV.map((item) => {
            if ("items" in item && item.items) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 mt-1 w-72 bg-card border border-border rounded-xl shadow-lg p-1.5 z-50"
                      >
                        {item.items.map((sub) => (
                          <button
                            key={sub.path}
                            onClick={() => go(sub.path)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors rounded-lg text-left group/item"
                          >
                            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover/item:bg-accent group-hover/item:text-white transition-colors flex-shrink-0">
                              <sub.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">{sub.label}</p>
                                {"badge" in sub && sub.badge && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/12 text-accent font-semibold">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{sub.sub}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            if ("highlight" in item && item.highlight) {
              return (
                <button
                  key={item.label}
                  onClick={() => go(item.path!)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === item.path
                      ? "text-accent bg-accent/10"
                      : "text-accent hover:bg-accent/8"
                  }`}
                >
                  {item.label}
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => go(item.path!)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button
                onClick={() => go(userRole === "admin" ? "/admin-recruitly-secure" : "/dashboard")}
                variant="ghost"
                size="sm"
                className="gap-1.5 text-sm"
              >
                {userRole === "admin" ? <Shield className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                {userRole === "admin" ? "Admin" : "Dashboard"}
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-sm">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => go("/auth")} variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
              <a
                href="https://wa.me/9779743208282?text=Hi%2C%20I%27d%20like%20a%20free%20counselling%20session%20with%20Recruitly%20Group."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Free Counselling
              </a>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {/* Employer highlight */}
              <button
                onClick={() => go("/for-employers")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-accent/8 text-accent mb-2 text-left"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-semibold">For Employers / Hire Talent</span>
              </button>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1">
                Services
              </p>
              {(NAV[1] as { items: { label: string; path: string; icon: React.ComponentType<{ className?: string }> }[] }).items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <item.icon className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}

              <div className="border-t border-border/50 my-2" />
              {NAV.slice(2).map((item) =>
                !("items" in item) && !("highlight" in item) ? (
                  <button
                    key={item.label}
                    onClick={() => go(item.path!)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ) : null
              )}

              <div className="border-t border-border/50 my-2" />
              {user ? (
                <>
                  <button
                    onClick={() => go(userRole === "admin" ? "/admin-recruitly-secure" : "/dashboard")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    {userRole === "admin" ? <Shield className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                    <span className="text-sm font-medium">{userRole === "admin" ? "Admin Panel" : "My Dashboard"}</span>
                  </button>
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-sm">
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Button onClick={() => go("/auth")} variant="outline" className="w-full">
                    Sign In
                  </Button>
                  <a
                    href="https://wa.me/9779743208282?text=Hi%2C%20I%27d%20like%20a%20free%20counselling%20session%20with%20Recruitly%20Group."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Get Free Counselling
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;
