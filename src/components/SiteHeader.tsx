import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Users, FileCheck, Plane, Menu, X,
  LogIn, Briefcase, LayoutDashboard, Shield, ChevronDown, ArrowRight
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import recruitlyLogo from "@/assets/recruitly-logo.png";

const NAV = [
  {
    label: "Services",
    items: [
      { label: "Study Abroad", sub: "University placement & visas", icon: GraduationCap, path: "/educational-consultancy" },
      { label: "Manpower Recruitment", sub: "Hire skilled workers", icon: Users, path: "/manpower-recruitment" },
      { label: "Apostille & Docs", sub: "Fast document legalization", icon: FileCheck, path: "/apostille-services" },
      { label: "Travel & Ticketing", sub: "Flights, tours & packages", icon: Plane, path: "/tours-and-travels" },
    ],
  },
  { label: "Universities", path: "/universities" },
  { label: "Jobs", path: "/jobs" },
  { label: "Blog", path: "/blog" },
];

const SiteHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const go = (path: string) => { navigate(path); setOpenDropdown(null); setMobileOpen(false); };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-lg shadow-sm border-b border-border/50" : "bg-background/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => go("/")} className="flex items-center gap-2.5 flex-shrink-0">
            <img src={recruitlyLogo} alt="Recruitly Group" className="h-9 w-auto" loading="eager" />
            <span className="text-lg font-bold text-foreground tracking-tight hidden sm:inline">
              Recruitly Group
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV.map((item) =>
              item.items ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-72 bg-background border border-border/60 rounded-xl shadow-xl p-2 z-50">
                        {item.items.map((sub) => (
                          <button key={sub.path} onClick={() => go(sub.path)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/5 transition-colors group/item text-left rounded-lg">
                            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover/item:bg-accent group-hover/item:text-accent-foreground transition-colors">
                              <sub.icon className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{sub.label}</p>
                              <p className="text-xs text-muted-foreground">{sub.sub}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button key={item.label} onClick={() => go(item.path!)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === item.path
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}>
                  {item.label}
                </button>
              )
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Button onClick={() => go(userRole === "admin" ? "/admin-recruitly-secure" : "/dashboard")}
                  variant="ghost" size="sm" className="gap-1.5 text-sm">
                  {userRole === "admin" ? <Shield className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                  {userRole === "admin" ? "Admin" : "Dashboard"}
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-sm">Sign Out</Button>
              </>
            ) : (
              <>
                <Button onClick={() => go("/auth")} variant="ghost" size="sm" className="text-sm">Sign In</Button>
                <Button onClick={() => go("/auth?mode=register")} size="sm"
                  className="bg-accent hover:bg-accent/90 text-white text-sm px-4 rounded-lg">
                  Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border/50 bg-background overflow-hidden">
              <div className="px-4 py-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Services</p>
                {NAV[0].items!.map((item) => (
                  <button key={item.path} onClick={() => go(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left">
                    <item.icon className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
                <div className="border-t border-border/30 my-2" />
                {NAV.slice(1).map((item) => (
                  <button key={item.label} onClick={() => go(item.path!)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left">
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
                <div className="border-t border-border/30 my-2" />
                {user ? (
                  <>
                    <button onClick={() => go(userRole === "admin" ? "/admin-recruitly-secure" : "/dashboard")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left">
                      {userRole === "admin" ? <Shield className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                      <span className="text-sm font-medium">{userRole === "admin" ? "Admin Panel" : "My Dashboard"}</span>
                    </button>
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-sm">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button onClick={() => go("/auth")} variant="outline" className="w-full">Sign In</Button>
                    <Button onClick={() => go("/auth?mode=register")} className="w-full bg-accent hover:bg-accent/90 text-white">
                      Get Started Free
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="h-16" />
    </>
  );
};

export default SiteHeader;
