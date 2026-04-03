import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, LogOut, Loader2, CheckCircle, XCircle, Clock,
  Users, RefreshCw, Download, GraduationCap, FileCheck, MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import AdminPartnersTab from "@/components/admin/AdminPartnersTab";
import AdminDataTab from "@/components/admin/AdminDataTab";

interface DashboardStats {
  partners: number;
  wisescoreLeads: number;
  visaPredictions: number;
  consultations: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ partners: 0, wisescoreLeads: 0, visaPredictions: 0, consultations: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { _user_id: session.user.id });

      if (adminError || !isAdmin) { navigate("/not-found"); return; }

      setIsAuthorized(true);
      setIsLoading(false);
      fetchStats();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) { navigate("/auth"); return; }
      const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: session.user.id });
      if (!isAdmin) navigate("/not-found");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "get_dashboard_stats" },
      });
      if (!error && data) setStats(data);
    } catch {}
  };

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

  if (!isAuthorized) return null;

  const statCards = [
    { label: "Partners", value: stats.partners, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "WiseScore Leads", value: stats.wisescoreLeads, icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Visa Predictions", value: stats.visaPredictions, icon: FileCheck, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: "Consultations", value: stats.consultations, icon: MessageSquare, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#0a192f]">
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fbbf24]/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#fbbf24]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Admin <span className="text-[#fbbf24]">Dashboard</span>
              </h1>
              <p className="text-white/60 text-xs">Recruitly Group Management</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={s.bg}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${s.color} text-sm`}>{s.label}</p>
                      <p className="text-3xl font-bold text-white">{s.value}</p>
                    </div>
                    <s.icon className={`w-8 h-8 ${s.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="partners" className="space-y-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="partners" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f]">
              <Users className="w-4 h-4 mr-2" /> Partners
            </TabsTrigger>
            <TabsTrigger value="wisescore" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f]">
              <GraduationCap className="w-4 h-4 mr-2" /> WiseScore
            </TabsTrigger>
            <TabsTrigger value="visa" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f]">
              <FileCheck className="w-4 h-4 mr-2" /> Visa
            </TabsTrigger>
            <TabsTrigger value="consultations" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f]">
              <MessageSquare className="w-4 h-4 mr-2" /> Consultations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            <AdminPartnersTab />
          </TabsContent>

          <TabsContent value="wisescore">
            <AdminDataTab
              title="WiseScore Leads"
              action="get_wisescore_leads"
              dataKey="leads"
              columns={["full_name", "email", "phone", "nationality", "destination_country", "wise_score", "score_tier", "created_at"]}
              columnLabels={{ full_name: "Name", email: "Email", phone: "Phone", nationality: "Nationality", destination_country: "Country", wise_score: "Score", score_tier: "Tier", created_at: "Date" }}
              fileName="wisescore_leads"
            />
          </TabsContent>

          <TabsContent value="visa">
            <AdminDataTab
              title="Visa Predictions"
              action="get_visa_predictions"
              dataKey="predictions"
              columns={["user_id", "target_country", "visa_success_probability", "sponsor_type", "total_funds", "visa_refusals", "created_at"]}
              columnLabels={{ user_id: "User ID", target_country: "Country", visa_success_probability: "Success %", sponsor_type: "Sponsor", total_funds: "Funds", visa_refusals: "Refusals", created_at: "Date" }}
              fileName="visa_predictions"
            />
          </TabsContent>

          <TabsContent value="consultations">
            <AdminDataTab
              title="Consultation Requests"
              action="get_consultation_requests"
              dataKey="consultations"
              columns={["full_name", "email", "phone", "service_type", "country_of_interest", "status", "created_at"]}
              columnLabels={{ full_name: "Name", email: "Email", phone: "Phone", service_type: "Service", country_of_interest: "Country", status: "Status", created_at: "Date" }}
              fileName="consultation_requests"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
