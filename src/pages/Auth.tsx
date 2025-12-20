import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  Briefcase, 
  Eye, 
  EyeOff, 
  Check, 
  BarChart3, 
  Users, 
  TrendingUp,
  Globe,
  Award,
  Target,
  MessageCircle,
  Loader2
} from "lucide-react";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().trim().email("Please enter a valid email address").max(255, "Email is too long");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type RoleType = "student" | "partner";
type LoginMethod = "email" | "google" | "whatsapp";

const Auth = () => {
  const [role, setRole] = useState<RoleType>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Redirect based on role - students go to WiseScore, partners to dashboard
        const userRole = localStorage.getItem("userRole");
        if (userRole === "partner") {
          navigate("/partner-dashboard");
        } else {
          navigate("/education");
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userRole = localStorage.getItem("userRole");
        if (userRole === "partner") {
          navigate("/partner-dashboard");
        } else {
          navigate("/education");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Server-side auth logging via Edge Function
  const logAuthAttempt = async (
    method: LoginMethod,
    success: boolean,
    errorMessage?: string
  ) => {
    try {
      await supabase.functions.invoke("log-auth-attempt", {
        body: {
          email: email || null,
          role_type: role,
          login_method: method,
          success,
          error_message: errorMessage || null,
        },
      });
    } catch (error) {
      // Silent fail - don't block auth flow for logging issues
      console.error("Failed to log auth attempt");
    }
  };

  const triggerShake = (field: "email" | "password") => {
    if (field === "email") {
      setShakeEmail(true);
      setTimeout(() => setShakeEmail(false), 500);
    } else {
      setShakePassword(true);
      setTimeout(() => setShakePassword(false), 500);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
      triggerShake("email");
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
      triggerShake("password");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        await logAuthAttempt("email", false, error.message);
        
        if (error.message.includes("Invalid login credentials")) {
          setErrors({ email: "Invalid email or password" });
          triggerShake("email");
          triggerShake("password");
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      // Store role preference
      localStorage.setItem("userRole", role);
      
      await logAuthAttempt("email", true);
      toast({
        title: "Welcome back!",
        description: role === "student" ? "Ready to explore your opportunities!" : "Access your partner dashboard",
      });
      
      // Redirect based on role
      if (role === "partner") {
        navigate("/partner-dashboard");
      } else {
        navigate("/education");
      }
    } catch (error) {
      await logAuthAttempt("email", false, "Unexpected error");
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    localStorage.setItem("userRole", role);
    
    try {
      const redirectUrl = role === "partner" 
        ? `${window.location.origin}/partner-dashboard`
        : `${window.location.origin}/education`;
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        await logAuthAttempt("google", false, error.message);
        toast({
          title: "Google Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        await logAuthAttempt("google", true);
      }
    } catch (error) {
      await logAuthAttempt("google", false, "Unexpected error");
      toast({
        title: "Error",
        description: "Failed to connect with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppLogin = () => {
    // WhatsApp login - opens WhatsApp for verification
    const message = encodeURIComponent(
      `Hi! I want to login to Recruitly Group as a ${role}. My email is: ${email || "[please provide your email]"}`
    );
    window.open(`https://wa.me/9779743208282?text=${message}`, "_blank");
    logAuthAttempt("whatsapp", true);
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: role === "partner" 
            ? `${window.location.origin}/partner-dashboard`
            : `${window.location.origin}/education`,
        },
      });

      if (error) {
        await logAuthAttempt("email", false, error.message);
        
        if (error.message.includes("already registered")) {
          setErrors({ email: "This email is already registered. Please login instead." });
          triggerShake("email");
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      // Store role preference
      localStorage.setItem("userRole", role);
      
      await logAuthAttempt("email", true);
      toast({
        title: "Account Created!",
        description: "You can now sign in with your credentials.",
      });
    } catch (error) {
      await logAuthAttempt("email", false, "Unexpected error");
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: "Please enter your email first" });
      triggerShake("email");
      return;
    }

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      triggerShake("email");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Check your inbox for a password reset link.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const studentBenefits = [
    { icon: Target, text: "Check Your WiseScore" },
    { icon: Globe, text: "Personalized Visa Strategy" },
    { icon: Award, text: "University Match Algorithm" },
    { icon: GraduationCap, text: "Scholarship Opportunities" },
  ];

  const partnerBenefits = [
    { icon: BarChart3, text: "Lead Dashboard Access" },
    { icon: TrendingUp, text: "Real-time Analytics" },
    { icon: Users, text: "Student Tracking System" },
    { icon: Briefcase, text: "Commission Reports" },
  ];

  const benefits = role === "student" ? studentBenefits : partnerBenefits;

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#fbbf24]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#fbbf24]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#fbbf24]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Recruitly <span className="text-[#fbbf24]">Group</span>
            </h1>
            <p className="text-white/60 text-sm">Your Gateway to Global Opportunities</p>
          </div>

          {/* Floating Role Switcher */}
          <div className="flex bg-white/5 rounded-2xl p-1.5 mb-8 shadow-lg">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                role === "student"
                  ? "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#0a192f] shadow-lg shadow-[#fbbf24]/30"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Login
            </button>
            <button
              onClick={() => setRole("partner")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                role === "partner"
                  ? "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#0a192f] shadow-lg shadow-[#fbbf24]/30"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Partner Login
            </button>
          </div>

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, x: role === "student" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: role === "student" ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Welcome Message */}
              <h2 className="text-xl font-semibold text-white text-center mb-6">
                {role === "student" ? (
                  <>Welcome back, <span className="text-[#fbbf24]">Future Grad!</span></>
                ) : (
                  <>Global <span className="text-[#fbbf24]">Partnership Portal</span></>
                )}
              </h2>

              {/* Benefits List */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-xs text-white/80"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#fbbf24]/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-3 h-3 text-[#fbbf24]" />
                    </div>
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Social Login for Students */}
              {role === "student" && (
                <div className="space-y-3 mb-6">
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Continue with Google
                  </Button>

                  <Button
                    onClick={handleWhatsAppLogin}
                    disabled={isLoading}
                    className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium py-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#25D366]/30 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MessageCircle className="w-5 h-5" />
                    )}
                    Continue with WhatsApp
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/40">Or continue with email</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80 text-sm">
                    Email Address
                  </Label>
                  <motion.div
                    animate={shakeEmail ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="you@example.com"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 py-6 rounded-xl focus:border-[#fbbf24] focus:ring-[#fbbf24]/20 transition-all ${
                        errors.email ? "border-red-500 focus:border-red-500" : ""
                      }`}
                    />
                  </motion.div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white/80 text-sm">
                      Password
                    </Label>
                    {role === "partner" && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[#fbbf24] hover:text-[#f59e0b] text-xs transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <motion.div
                    animate={shakePassword ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      placeholder="••••••••"
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 py-6 pr-12 rounded-xl focus:border-[#fbbf24] focus:ring-[#fbbf24]/20 transition-all ${
                        errors.password ? "border-red-500 focus:border-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d97706] text-[#0a192f] font-semibold py-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#fbbf24]/30 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSignUp}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10 py-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <a
              href="https://wa.me/9779743208282"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/60 hover:text-[#fbbf24] text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Need help? Message Khem on WhatsApp
            </a>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center items-center gap-6 mt-6 text-white/40 text-xs">
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-[#fbbf24]" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-[#fbbf24]" />
            <span>GDPR Compliant</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
