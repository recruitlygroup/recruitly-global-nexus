import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  LogIn,
  Phone,
  Globe,
} from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const fullNameSchema = z.string().trim().min(2, "Full name must be at least 2 characters").max(100);

type AuthMode = "login" | "signup";

const NATIONALITIES = [
  "Afghan","Albanian","Algerian","American","Argentine","Armenian","Australian","Austrian",
  "Bangladeshi","Belgian","Bhutanese","Bolivian","Brazilian","British","Bulgarian","Burmese",
  "Cambodian","Cameroonian","Canadian","Chilean","Chinese","Colombian","Croatian","Cuban",
  "Czech","Danish","Dominican","Dutch","Ecuadorian","Egyptian","Emirati","Estonian","Ethiopian",
  "Filipino","Finnish","French","Georgian","German","Ghanaian","Greek","Guatemalan","Hungarian",
  "Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli","Italian","Jamaican",
  "Japanese","Jordanian","Kazakh","Kenyan","Kuwaiti","Latvian","Lebanese","Lithuanian",
  "Malaysian","Maldivian","Mexican","Moldovan","Mongolian","Moroccan","Nepalese","New Zealand",
  "Nigerian","Norwegian","Omani","Pakistani","Panamanian","Peruvian","Polish","Portuguese",
  "Qatari","Romanian","Russian","Saudi","Serbian","Singaporean","Slovak","Slovenian",
  "South African","South Korean","Spanish","Sri Lankan","Sudanese","Swedish","Swiss","Syrian",
  "Taiwanese","Thai","Tunisian","Turkish","Ukrainian","Uruguayan","Uzbek","Venezuelan",
  "Vietnamese","Yemeni","Zambian","Zimbabwean"
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "signup" : "login";
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nationality, setNationality] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async (userId: string) => {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      // Updated navigation logic based on user role
      if (roleData?.role === "admin") {
        navigate("/admin-recruitly-secure");
      } else if (roleData?.role === "partner") {
        navigate("/partner-dashboard");
      } else if (roleData?.role === "candidate") {
        navigate("/candidate-dashboard");
      } else if (roleData?.role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else {
        navigate("/dashboard");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setTimeout(() => checkUser(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validate = (isSignup: boolean): boolean => {
    const e: Record<string, string> = {};
    if (isSignup) {
      const nr = fullNameSchema.safeParse(fullName);
      if (!nr.success) e.fullName = nr.error.errors[0].message;
    }
    const er = emailSchema.safeParse(email);
    if (!er.success) e.email = er.error.errors[0].message;
    const pr = passwordSchema.safeParse(password);
    if (!pr.success) e.password = pr.error.errors[0].message;
    if (isSignup && password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate(false)) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrors({ email: "Invalid email or password" });
        } else if (error.message.includes("Email not confirmed")) {
          toast({ title: "Email Not Verified", description: "Please check your inbox and verify your email.", variant: "destructive" });
        } else {
          toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        }
        return;
      }
      if (data.user) {
        toast({ title: "Welcome back!", description: "Redirecting to your dashboard..." });
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate(true)) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: fullName.trim(),
            whatsapp: whatsapp.trim() || null,
            nationality: nationality || null,
          },
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          setErrors({ email: "This email is already registered. Please login instead." });
        } else {
          toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
        }
        return;
      }
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          whatsapp: whatsapp.trim() || null,
          nationality: nationality || null,
        });
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "student" as any,
          full_name: fullName.trim(),
          phone: whatsapp.trim() || null,
        });

        toast({ title: "Account Created!", description: "Please check your email to verify your account." });
        setAuthMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setErrors({ email: "Please enter your email first" }); return; }
    const er = emailSchema.safeParse(email);
    if (!er.success) { setErrors({ email: er.error.errors[0].message }); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Password Reset Email Sent", description: "Check your inbox for a password reset link." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {authMode === "signup" ? "Create Your Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {authMode === "signup"
                ? "Join Recruitly Group to unlock your study abroad journey"
                : "Log in to access your dashboard"}
            </p>
          </div>

          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => { setAuthMode("login"); setErrors({}); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                authMode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode("signup"); setErrors({}); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                authMode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4">
              {Object.values(errors)[0]}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.form
              key={authMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={authMode === "signup" ? handleSignUp : handleLogin}
              className="space-y-4"
            >
              {authMode === "signup" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp" className="text-sm">WhatsApp Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+977 98XXXXXXXX"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nationality" className="text-sm">Nationality</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select
                        id="nationality"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select nationality</option>
                        {NATIONALITIES.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                  placeholder="you@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  {authMode === "login" && (
                    <button type="button" onClick={handleForgotPassword} className="text-xs text-primary hover:underline">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                    placeholder="••••••••"
                    className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : authMode === "signup" ? (
                  <UserPlus className="w-4 h-4 mr-2" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {isLoading
                  ? (authMode === "signup" ? "Creating account..." : "Signing in...")
                  : (authMode === "signup" ? "Create Account" : "Sign In")}
              </Button>
            </motion.form>
          </AnimatePresence>

          {authMode === "signup" && (
            <p className="text-muted-foreground text-xs text-center mt-4">
              You'll receive a verification email. Please confirm to activate your account.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
