/**
 * src/pages/PartnerDashboard.tsx   ← REPLACE existing file
 *
 * CHANGES from original:
 *  - Approved partners now see full agent dashboard with:
 *      • Stats: their candidates, available, selected, pending PCC
 *      • Candidates tab: their own candidates only (AdminCandidatesTab restricted)
 *      • Invoices tab: request services / view own invoices
 *      • Submission checklist accessible per candidate
 *  - Verified badge shown in header
 *  - Pending / Rejected states UNCHANGED
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut, Loader2, Clock, AlertCircle, Settings,
  Users, CheckCircle2, UserCheck, ClipboardList, Receipt,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import AgentVerificationBadge from "@/components/admin/AgentVerificationBadge";
import AdminCandidatesTab from "@/components/admin/AdminCandidatesTab";
import AdminInvoicesTab from "@/components/admin/AdminInvoicesTab";

type PartnerStatus = "pending" | "approved" | "rejected";

interface AgentStats {
  total: number;
  available: number;
  selected: number;
  pccPending: number;
}

// ─── Pending / Rejected screens (unchanged logic, extracted for clarity) ──

function PendingScreen({ email, onLogout, onSettings }: { email: string; onLogout: () => void; onSettings: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a192f]">
      <DashHeader email={email} onLogout={onLogout} onSettings={onSettings} isVerified={false} />
      <main className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-yellow-500/10 border-yellow-500/20 backdrop-blur-lg max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Approval Pending</h3>
              <p className="text-white/70 max-w-md mx-auto mb-6">
                Your partner account is currently under review. Our team will verify your application
                and notify you via email once approved.
              </p>
              <p className="text-white/50 text-sm">
                This usually takes 24-48 hours. Need help?{" "}
                <a href="https://wa.me/9779743208282" className="text-[#fbbf24] hover:underline" target="_blank" rel="noopener noreferrer">
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

function RejectedScreen({ email, onLogout, onSettings }: { email: string; onLogout: () => void; onSettings: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a192f]">
      <DashHeader email={email} onLogout={onLogout} onSettings={onSettings} isVerified={false} />
      <main className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-red-500/10 border-red-500/20 backdrop-blur-lg max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Application Not Approved</h3>
              <p className="text-white/70 max-w-md mx-auto mb-6">
                Unfortunately, your partner application was not approved at this time.
                If you believe this was in error, please contact our team.
              </p>
              <p className="text-white/50 text-sm">
                Questions?{" "}
                <a href="https://wa.me/9779743208282" className="text-[#fbbf24] hover:underline" target="_blank" rel="noopener noreferrer">
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

// ─── Shared header ──────────────────────────────────────────────────────────

function DashHeader({
  email, onLogout, onSettings, isVerified,
}: { email: string; onLogout: () => void; onSettings: () => void; isVerified: boolean }) {
  return (
    <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">
              Agent <span className="text-[#fbbf24]">Dashboard</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-white/50 text-xs">{email}</p>
              <AgentVerificationBadge isVerified={isVerified} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onSettings} variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Settings className="w-5 h-5" />
          </Button>
          <Button onClick={onLogout} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [stats, setStats] = useState<AgentStats>({ total: 0, available: 0, selected: 0, pccPending: 0 });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      setUser({ email: session.user.email || "", id: session.user.id });

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role, status, is_verified")
        .eq("user_id", session.user.id)
        .eq("role", "partner")
        .maybeSingle();

      if (roleError || !roleData) { navigate("/education"); return; }

      setPartnerStatus(roleData.status as PartnerStatus);
      setIsVerified(!!roleData.is_verified);

      if (roleData.status === "approved") {
        fetchStats(session.user.id);
      }

      setIsLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async (userId: string) => {
    const { data } = await supabase
      .from("job_applications")
      .select("interview_availability, interview_status, pcc_status")
      .eq("agent_user_id", userId);

    if (data) {
      setStats({
        total:      data.length,
        available:  data.filter(c => c.interview_availability === "Available").length,
        selected:   data.filter(c => c.interview_status === "Selected").length,
        pccPending: data.filter(c => c.pcc_status === "Pending").length,
      });
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/auth"); };
  const handleSettings = () => navigate("/profile-settings");

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a192f] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>;
  }

  if (partnerStatus === "pending") return <PendingScreen email={user?.email ?? ""} onLogout={handleLogout} onSettings={handleSettings} />;
  if (partnerStatus === "rejected") return <RejectedScreen email={user?.email ?? ""} onLogout={handleLogout} onSettings={handleSettings} />;

  // ── Approved partner dashboard ────────────────────────────────────────────

  const statCards = [
    { icon: Users,        label: "My Candidates", value: stats.total,      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
    { icon: CheckCircle2, label: "Available",      value: stats.available,  color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
    { icon: UserCheck,    label: "Selected",       value: stats.selected,   color: "text-[#fbbf24]",  bg: "bg-yellow-500/10 border-yellow-500/20" },
    { icon: ClipboardList,label: "PCC Pending",    value: stats.pccPending, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#0a192f]">
      <DashHeader
        email={user?.email ?? ""}
        onLogout={handleLogout}
        onSettings={handleSettings}
        isVerified={isVerified}
      />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`${s.bg} border`}>
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex flex-col gap-2">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className={`${s.color} text-xs`}>{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Not verified warning */}
        {!isVerified && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
            <p className="text-orange-300 text-sm">
              Your account is not yet verified by admin. You can still manage candidates, but some features may be restricted.
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="candidates">
          <TabsList className="bg-white/5 border border-white/10 gap-1 p-1">
            {[
              { value: "candidates", label: "My Candidates", icon: Users },
              { value: "invoices",   label: "Service Requests", icon: Receipt },
            ].map(t => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f] text-white/70"
              >
                <t.icon className="w-4 h-4 mr-1.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="candidates" className="mt-4">
            {/* AdminCandidatesTab is reused with isAdmin=false to hide work permit/visa fields */}
            <AdminCandidatesTab isAdmin={false} />
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <AdminInvoicesTab isAdmin={false} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PartnerDashboard;
