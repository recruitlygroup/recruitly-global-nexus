import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Building2, Mail, User, Phone, Loader2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess?: () => void;
}

const USER_TYPES = [
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    description: "Unlock university matches & Letter of Intent",
  },
  {
    id: "jobseeker",
    label: "Job Seeker",
    icon: Briefcase,
    description: "Access global job opportunities",
  },
  {
    id: "recruiter",
    label: "Recruiter",
    icon: Building2,
    description: "Find qualified candidates",
  },
];

// Input validation schemas
const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be less than 72 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(1, "Password is required").max(72, "Password must be less than 72 characters"),
});

const LoginModal = ({ open, onOpenChange, prefillData, onSuccess }: LoginModalProps) => {
  const [selectedType, setSelectedType] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: prefillData?.name || "",
    email: prefillData?.email || "",
    phone: prefillData?.phone || "",
    password: "",
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Validate input
      const validated = signupSchema.parse(formData);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error: signupError } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: validated.name,
            phone: validated.phone || null,
            user_type: selectedType,
          },
        },
      });

      if (signupError) {
        if (signupError.message.includes("already registered")) {
          setError("This email is already registered. Please log in instead.");
        } else if (signupError.message.includes("not confirmed")) {
          setError("Please check your email to verify your account.");
        } else if (signupError.message.includes("rate limit")) {
          setError("Too many attempts. Please try again later.");
        } else {
          console.error("Signup error:", signupError);
          setError("Unable to create account. Please try again or contact support.");
        }
        return;
      }

      if (data.user) {
        toast.success("Account created successfully!");
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Validate input
      const validated = loginSchema.parse(loginData);
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (loginError) {
        if (loginError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (loginError.message.includes("not confirmed")) {
          setError("Please verify your email before logging in.");
        } else if (loginError.message.includes("rate limit")) {
          setError("Too many login attempts. Please try again later.");
        } else {
          console.error("Login error:", loginError);
          setError("Unable to log in. Please try again or contact support.");
        }
        return;
      }

      if (data.user) {
        toast.success("Logged in successfully!");
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Unlock Your Full Results
          </DialogTitle>
          <DialogDescription className="text-center">
            Create an account to see your matched universities and get your personalized Letter of Intent
          </DialogDescription>
        </DialogHeader>

        {/* User Type Selection */}
        <div className="grid grid-cols-3 gap-3 my-4">
          {USER_TYPES.map((type) => (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                selectedType === type.id
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                selectedType === type.id ? "text-accent" : "text-muted-foreground"
              }`} />
              <span className={`text-sm font-medium ${
                selectedType === type.id ? "text-foreground" : "text-muted-foreground"
              }`}>
                {type.label}
              </span>
            </motion.button>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mb-4">
          {USER_TYPES.find(t => t.id === selectedType)?.description}
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <Tabs defaultValue="signup" className="w-full" onValueChange={() => setError(null)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Log In</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    placeholder="Your name"
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    placeholder="your@email.com"
                    required
                    maxLength={255}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    placeholder="+1 (555) 000-0000"
                    maxLength={20}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    placeholder="Create a password (min 6 characters)"
                    required
                    minLength={6}
                    maxLength={72}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create Account & Unlock Results"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="pl-10"
                    placeholder="your@email.com"
                    required
                    maxLength={255}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="pl-10"
                    placeholder="Your password"
                    required
                    maxLength={72}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Log In & Unlock Results"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
