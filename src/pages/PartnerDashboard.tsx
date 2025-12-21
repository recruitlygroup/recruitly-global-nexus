import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign,
  LogOut,
  Loader2,
  Clock,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

type PartnerStatus = "pending" | "approved" | "rejected";

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus | null>(null);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser({ email: session.user.email || "" });

      // Verify role from database - not localStorage
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role, status")
        .eq("user_id", session.user.id)
        .eq("role", "partner")
        .maybeSingle();

      if (roleError) {
        navigate("/auth");
        return;
      }

      // If no partner role found, redirect to education page
      if (!roleData) {
        navigate("/education");
        return;
      }

      // Set the partner status
      setPartnerStatus(roleData.status as PartnerStatus);
      setIsLoading(false);
    };

    checkAuthAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
      </div>
    );
  }

  // Show pending approval message
  if (partnerStatus === "pending") {
    return (
      <div className="min-h-screen bg-[#0a192f]">
        <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Partner <span className="text-[#fbbf24]">Dashboard</span>
              </h1>
              <p className="text-white/60 text-sm">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-yellow-500/10 border-yellow-500/20 backdrop-blur-lg max-w-lg mx-auto">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Approval Pending
                </h3>
                <p className="text-white/70 max-w-md mx-auto mb-6">
                  Your partner account is currently under review. Our team will verify your application 
                  and notify you via email once approved.
                </p>
                <p className="text-white/50 text-sm">
                  This usually takes 24-48 hours. Need help?{" "}
                  <a 
                    href="https://wa.me/9779743208282" 
                    className="text-[#fbbf24] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact us on WhatsApp
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Show rejection message
  if (partnerStatus === "rejected") {
    return (
      <div className="min-h-screen bg-[#0a192f]">
        <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Partner <span className="text-[#fbbf24]">Dashboard</span>
              </h1>
              <p className="text-white/60 text-sm">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-red-500/10 border-red-500/20 backdrop-blur-lg max-w-lg mx-auto">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Application Not Approved
                </h3>
                <p className="text-white/70 max-w-md mx-auto mb-6">
                  Unfortunately, your partner application was not approved at this time. 
                  If you believe this was in error, please contact our team.
                </p>
                <p className="text-white/50 text-sm">
                  Questions?{" "}
                  <a 
                    href="https://wa.me/9779743208282" 
                    className="text-[#fbbf24] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact us on WhatsApp
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Approved partner dashboard
  const stats = [
    { icon: Users, label: "Total Leads", value: "0", change: "+0%" },
    { icon: TrendingUp, label: "Conversion Rate", value: "0%", change: "+0%" },
    { icon: BarChart3, label: "Active Students", value: "0", change: "+0%" },
    { icon: DollarSign, label: "Commission", value: "$0", change: "+0%" },
  ];

  return (
    <div className="min-h-screen bg-[#0a192f]">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Partner <span className="text-[#fbbf24]">Dashboard</span>
            </h1>
            <p className="text-white/60 text-sm">{user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="w-4 h-4 text-[#fbbf24]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-green-400">{stat.change} from last month</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-[#fbbf24]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-[#fbbf24]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Dashboard Coming Soon
              </h3>
              <p className="text-white/60 max-w-md mx-auto">
                We're building powerful analytics and lead management tools for our partners. 
                Stay tuned for real-time insights, student tracking, and commission reports.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default PartnerDashboard;
