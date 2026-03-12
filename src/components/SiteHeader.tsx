import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, FileCheck, Plane, Menu, X, LogIn, BookOpen, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import recruitlyLogo from "@/assets/recruitly-logo.png";

const SiteHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const navItems = [
    { label: "Education", icon: GraduationCap, path: "/educational-consultancy" },
    { label: "Jobs", icon: Users, path: "/manpower-recruitment" },
    { label: "Apostille", icon: FileCheck, path: "/apostille-services" },
    { label: "Travel", icon: Plane, path: "/tours-and-travels" },
    { label: "Blog", icon: BookOpen, path: "/blog" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img 
              src={recruitlyLogo} 
              alt="Recruitly Group" 
              className="h-10 w-10 object-contain rounded-lg"
            />
            <span className="text-lg font-bold text-foreground hidden sm:block">
              Recruitly Group
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground mr-2">
                  {user.email?.split('@')[0]}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/auth")}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/educational-consultancy")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border/50"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              {user ? (
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="mt-2"
                >
                  Logout ({user.email?.split('@')[0]})
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="mt-2 flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login / Sign Up
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/educational-consultancy");
                      setIsMobileMenuOpen(false);
                    }}
                    className="mt-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default SiteHeader;
