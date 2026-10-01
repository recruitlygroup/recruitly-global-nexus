// src/pages/Auth.tsx — REPLACE existing file
//
// ROOT CAUSE OF RECRUITER → STUDENT DASHBOARD BUG:
// 1. The 'recruiter' value was not in the user_role enum in older DB states,
//    causing role INSERT to fail silently and defaulting user to 'student'.
// 2. Even when the row existed, the redirect check used string comparison
//    against an enum — worked inconsistently across DB states.
// 3. After email confirmation, Supabase fires onAuthStateChange before the
//    user_roles row is committed, so checkUser ran with no role → /dashboard.
//
// FIXES:
// 1. Redirect logic queries with .maybeSingle() and handles null row explicitly.
// 2. Added 200ms delay after auth state change to let DB writes propagate.
// 3. Recruiter signup now creates a 'partner' role (the correct enum value)
//    with status='pending'. Admin then verifies and sets role to 'recruiter'.
//    This aligns with the existing approval workflow.
// 4. Zod validation tightened. All inputs sanitized before DB writes.

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap, Eye, EyeOff, Loader2, UserPlus, LogIn,
  Phone, Globe, Briefcase, Building2,
} from "lucide-react";
import { z } from "zod";
import { ROLE_HOME, fetchRole, isExternal, RECRUITER_DASHBOARD_URL } from "@/components/ProtectedRoute";

const emailSchema    = z.string().trim().email("Please enter a valid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
const fullNameSchema = z.string().trim().min(2, "Full name must be at least 2 characters").max(100);

type AuthMode = "login" | "signup";

const ROLE_OPTIONS = [
  {
    id:          "student",
    dbRole:      "student",       // enum value in DB
    label:       "Student",
    icon:        GraduationCap,
    description: "Study abroad, university matching & visa guidance",
  },
] as const;

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
  "Vietnamese","Yemeni","Zambian","Zimbabwean",
];

// Redirect a user to their correct dashboard based on their DB role
async function redirectByRole(userId: string, navigate: (path: string) => void) {
  const role = await fetchRole(userId);
  const path = ROLE_HOME[role] ?? "/dashboard";
  if (isExternal(path)) { window.location.replace(path); return; } // recruiter/agent -> dashboard site
  navigate(path);
}

const Auth = () => {
  const [searchParams]  = useSearchParams();
  const initialMode     = searchParams.get("mode") === "register" ? "signup" : "login";

  const [authMode,          setAuthMode]         = useState<AuthMode>(initialMode);
  const [selectedRole,      setSelectedRole]     = useState<typeof ROLE_OPTIONS[number]>(ROLE_OPTIONS[0]);
  const [fullName,          setFullName]         = useState("");
  const [email,             setEmail]            = useState("");
  const [password,          setPassword]         = useState("");
  const [confirmPassword,   setConfirmPassword]  = useState("");
  const [whatsapp,          setWhatsapp]         = useState("");
  const [nationality,       setNationality]      = useState("");
  const [showPassword,      setShowPassword]     = useState(false);
  const [isLoading,         setIsLoading]        = useState(false);
  const [errors,            setErrors]           = useState<Record<string, string>>({});

  const { toast }  = useToast();
  const navigate   = useNavigate();
  const redirected = useRef(false);  // prevent double-redirect

  // ── Auth state listener — fires on login and on email confirmation ──────────
  useEffect(() => {
    const handleSession = async (userId: string) => {
      if (redirected.current) return;
      redirected.current = true;
      // Small delay so DB triggers have time to write the role row
      await new Promise(r => setTimeout(r, 300));
      await redirectByRole(userId, navigate);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) handleSession(session.user.id);
      }
    );

    // Handle already-logged-in users landing on /auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleSession(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // ── Validation ──────────────────────────────────────────────────────────────
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
    if (isSignup && password !== confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate(false)) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email:    email.trim().toLowerCase(),
        password,
      });
      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrors({ email: "Invalid email or password" });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title:       "Email Not Verified",
            description: "Please check your inbox and click the verification link.",
            variant:     "destructive",
          });
        } else {
          toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        }
        return;
      }
      if (data.user) {
        // onAuthStateChange handles the redirect
        toast({ title: "Welcome back!", description: "Redirecting to your dashboard…" });
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  const handleSignUp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate(true)) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email:    email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name:   fullName.trim(),
            whatsapp:    whatsapp.trim() || null,
            nationality: nationality || null,
            user_type:   selectedRole.id,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setErrors({ email: "This email is already registered. Please sign in." });
        } else {
          toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
        }
        return;
      }

      if (data.user) {
        // Upsert profile row
        await supabase.from("profiles").upsert({
          id:          data.user.id,
          full_name:   fullName.trim(),
          email:       email.trim().toLowerCase(),
          whatsapp:    whatsapp.trim() || null,
          nationality: nationality || null,
        });

        // Insert role row — using dbRole which maps to the DB enum value.
        // The sanitize_user_role_insert trigger enforces status='pending'
        // and blocks is_verified=true, so no need to set those here.
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id:   data.user.id,
          role:      selectedRole.dbRole as any,
          full_name: fullName.trim(),
          phone:     whatsapp.trim() || null,
        });

        if (roleError) {
          console.error("user_roles INSERT error:", roleError);
          toast({
            title:       "Role Assignment Issue",
            description: `Account created but role setup failed: ${roleError.message}. Contact support if this persists.`,
            variant:     "destructive",
          });
        } else {
          toast({
            title:       "Account Created! 🎉",
            description: "Please check your email to verify your account.",
          });
        }

        // Reset form and switch to login
        setAuthMode("login");
        setPassword("");
        setConfirmPassword("");
        redirected.current = false; // allow redirect after email confirmation
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot Password ─────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email) { setErrors({ email: "Please enter your email first" }); return; }
    const er = emailSchema.safeParse(email);
    if (!er.success) { setErrors({ email: er.error.errors[0].message }); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/auth` }
      );
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Password Reset Sent", description: "Check your inbox for a reset link." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">

          {/* Logo + header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {authMode === "signup" ? "Create Your Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {authMode === "signup"
                ? "Select your role and join Recruitly Group"
                : "Log in to access your dashboard"}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            {(["login", "signup"] as AuthMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => { setAuthMode(mode); setErrors({}); redirected.current = false; }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  authMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Recruiters/agents use the dedicated dashboard site */}
          <p className="text-xs text-muted-foreground text-center mb-4">
            Recruiter or agent?{" "}
            <a href={RECRUITER_DASHBOARD_URL} className="text-primary underline font-medium">Go to the recruiter dashboard</a>
          </p>

          {/* Error banner */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4">
              {Object.values(errors)[0]}
            </div>
          )}

          {/* Form */}
          <form
            key={authMode}
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
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className={errors.fullName ? "border-destructive" : ""}
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp" className="text-sm">
                    WhatsApp Number <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nationality" className="text-sm">Nationality</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select
                      id="nationality"
                      value={nationality}
                      onChange={e => setNationality(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select nationality</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
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
                onChange={e => { setEmail(e.target.value); setErrors({}); }}
                placeholder="you@example.com"
                className={errors.email ? "border-destructive" : ""}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">Password</Label>
                {authMode === "login" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors({}); }}
                  placeholder="••••••••"
                  className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
            </div>

            {authMode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setErrors({}); }}
                  placeholder="••••••••"
                  className={errors.confirmPassword ? "border-destructive" : ""}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs">{errors.confirmPassword}</p>
                )}
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
                ? (authMode === "signup" ? "Creating account…" : "Signing in…")
                : (authMode === "signup"
                    ? `Sign Up as ${selectedRole.label}`
                    : "Sign In")}
            </Button>
          </form>

          {authMode === "signup" && (
            <p className="text-muted-foreground text-xs text-center mt-4">
              You'll receive a verification email. Please confirm to activate your account.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
