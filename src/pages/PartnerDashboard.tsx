// src/pages/PartnerDashboard.tsx — REPLACE existing file
// Changes: Shows MOU verification stage progress, notification bell,
//          SLC status column visible, messages tab added.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut, Loader2, Clock, AlertCircle, Settings,
  Users, CheckCircle2, UserCheck, ClipboardList, Receipt, Inbox,
  FileSignature, ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AgentVerificationBadge from "@/components/admin/AgentVerificationBadge";
import AdminCandidatesTab from "@/components/admin/AdminCandidatesTab";
import AdminInvoicesTab from "@/components/admin/AdminInvoicesTab";
import NotificationBell from "@/components/shared/NotificationBell";

type PartnerStatus = "pending" | "approved" | "rejected";

interface AgentStats {
  total: number;
  available: number;
  selected: number;
  pccPending: number;
}

interface BroadcastMsg {
  id: string;
  subject: string;
  body: string;
  sent_at: string;
}

// ── Messages Inbox (same as RecruiterDashboard version) ──────────────────────

function MessagesInbox() {
  const [messages, setMessages] = useState<BroadcastMsg[]>([]);
  const [selected, setSelected] = useState<BroadcastMsg | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("broadcast_messages") as any)
        .select("*").order("sent_at", { ascending: false }).limit(30);
      if (data) setMessages(data as BroadcastMsg[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#fbbf24]" /></div>;

  return (
    <div className="flex gap-4 h-[480px]">
      <div className="w-64 flex-shrink-0 border border-white/10 rounded-xl overflow-y-auto bg-white/5">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-sm">No messages yet</div>
        ) : messages.map(m => (
          <div key={m.id} onClick={() => setSelected(m)}
            className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 ${selected?.id === m.id ? "bg-white/10" : ""}`}>
            <p className="text-sm font-medium text-white truncate">{m.subject}</p>
            <p className="text-xs text-white/40 mt-0.5">{new Date(m.sent_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 border border-white/10 rounded-xl p-5 overflow-y-auto bg-white/5">
        {selected ? (
          <>
            <h3 className="font-semibold text-white text-base mb-1">{selected.subject}</h3>
            <p className="text-xs text-white/40 mb-4">From: Recruitly Group Admin · {new Date(selected.sent_at).toLocaleString()}</p>
            <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{selected.body}</p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
            <Inbox className="w-10 h-10" />
            <p className="text-sm">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MOU Stage Banner ──────────────────────────────────────────────────────────

function MOUStageBanner({ stage, mouLink }: { stage: string; mouLink: string | null }) {
  if (stage === "verified") return null;

  const stages = ["pending", "mou_sent", "mou_signed", "verified"];
  const currentIdx = stages.indexOf(stage);

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <FileSignature className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white">Verification in Progress</p>
          <p className="text-xs text-white/50">Complete all steps to get your Verified badge</p>
        </div>
      </div>

      {/* Stage progress */}
      <div className="flex items-center gap-2 mb-3">
        {["Pending", "MOU Sent", "MOU Signed", "Verified"].map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 ${i <= currentIdx ? "text-[#fbbf24]" : "text-white/20"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border
                ${i < currentIdx ? "bg-[#fbbf24] border-[#fbbf24] text-[#0a192f]"
                  : i === currentIdx ? "border-[#fbbf24] text-[#fbbf24]"
                  : "border-white/20 text-white/20"}`}>
                {i < currentIdx ? "✓" : i + 1}
              </div>
              <span className="text-[10px] hidden sm:inline">{label}</span>
            </div>
            {i < 3 && <div className={`w-6 h-px ${i < currentIdx ? "bg-[#fbbf24]" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {stage === "mou_sent" && mouLink && (
        <a href={mouLink} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#fbbf24] text-[#0a192f] font-semibold text-xs px-4 py-2 rounded-lg hover:bg-[#f59e0b] transition-colors">
          <FileSignature className="w-3.5 h-3.5" /> Sign MOU Document →
        </a>
      )}
      {stage === "mou_signed" && (
        <p className="text-xs text-purple-400">✍ MOU signed. Waiting for admin to complete verification.</p>
      )}
    </div>
  );
}

// ── Pending / Rejected screens ────────────────────────────────────────────────

function PendingScreen({ email, onLogout, onSettings }: { email: string; onLogout: () => void; onSettings: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a192f]">
      <DashHeader email={email} onLogout={onLogout} onSettings={onSettings} isVerified={false} userId={null} />
      <main className="container mx-auto px-4 py-16">
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
              Usually takes 24–48 hours.{" "}
              <a href="https://wa.me/9779743208282" className="text-[#fbbf24] hover:underline" target="_blank" rel="noopener noreferrer">
                Contact us on WhatsApp
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function RejectedScreen({ email, onLogout, onSettings }: { email: string; onLogout: () => void; onSettings: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a192f]">
      <DashHeader email={email} onLogout={onLogout} onSettings={onSettings} isVerified={false} userId={null} />
      <main className="container mx-auto px-4 py-16">
        <Card className="bg-red-500/10 border-red-500/20 backdrop-blur-lg max-w-lg mx-auto">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Application Not Approved</h3>
            <p className="text-white/70 max-w-md mx-auto mb-6">
              Unfortunately, your partner application was not approved at this time.
            </p>
            <p className="text-white/50 text-sm">
              <a href="https://wa.me/9779743208282" className="text-[#fbbf24] hover:underline" target="_blank" rel="noopener noreferrer">
                Contact us on WhatsApp
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// ── Shared header ─────────────────────────────────────────────────────────────

function DashHeader({
  email, onLogout, onSettings, isVerified, userId,
}: { email: string; onLogout: () => void; onSettings: () => void; isVerified: boolean; userId: string | null }) {
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
          {userId && <NotificationBell userId={userId} />}
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

// ── Main component ────────────────────────────────────────────────────────────

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading]               = useState(true);
  const [user, setUser]                         = useState<{ email: string; id: string } | null>(null);
  const [partnerStatus, setPartnerStatus]       = useState<PartnerStatus | null>(null);
  const [isVerified, setIsVerified]             = useState(false);
  const [verificationStage, setVerificationStage] = useState("pending");
  const [mouLink, setMouLink]                   = useState<string | null>(null);
  const [stats, setStats]                       = useState<AgentStats>({ total: 0, available: 0, selected: 0, pccPending: 0 });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      setUser({ email: session.user.email || "", id: session.user.id });

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role, status, is_verified, verification_stage, mou_link")
        .eq("user_id", session.user.id)
        .eq("role", "partner")
        .maybeSingle();

      if (roleError || !roleData) { navigate("/education"); return; }

      setPartnerStatus(roleData.status as PartnerStatus);
      setIsVerified(!!roleData.is_verified);
      setVerificationStage((roleData as any).verification_stage ?? "pending");
      setMouLink((roleData as any).mou_link ?? null);

      if (roleData.status === "approved") fetchStats(session.user.id);

      setIsLoading(false);
    };

    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async (uid: string) => {
    const { data } = await (supabase.from("candidates") as any)
      .select("interview_availability, interview_result, pcc_status")
      .eq("recruiter_id", uid);

    if (data) {
      setStats({
        total:      data.length,
        available:  data.filter((c: any) => c.interview_availability === "Available").length,
        selected:   data.filter((c: any) => c.interview_result === "Selected").length,
        pccPending: data.filter((c: any) => c.pcc_status === "Pending").length,
      });
    }
  };

  const handleLogout  = async () => { await supabase.auth.signOut(); navigate("/auth"); };
  const handleSettings = () => navigate("/profile-settings");

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a192f] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>;
  }

  if (partnerStatus === "pending")  return <PendingScreen  email={user?.email ?? ""} onLogout={handleLogout} onSettings={handleSettings} />;
  if (partnerStatus === "rejected") return <RejectedScreen email={user?.email ?? ""} onLogout={handleLogout} onSettings={handleSettings} />;

  // ── Approved partner dashboard ────────────────────────────────────────────

  const statCards = [
    { icon: Users,         label: "My Candidates", value: stats.total,      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
    { icon: CheckCircle2,  label: "Available",      value: stats.available,  color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
    { icon: UserCheck,     label: "Selected",       value: stats.selected,   color: "text-[#fbbf24]",  bg: "bg-yellow-500/10 border-yellow-500/20" },
    { icon: ClipboardList, label: "PCC Pending",    value: stats.pccPending, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#0a192f]">
      <DashHeader
        email={user?.email ?? ""}
        onLogout={handleLogout}
        onSettings={handleSettings}
        isVerified={isVerified}
        userId={user?.id ?? null}
      />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats — no framer-motion */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(s => (
            <Card key={s.label} className={`${s.bg} border`}>
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex flex-col gap-2">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className={`${s.color} text-xs`}>{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* MOU stage banner (shows when not yet verified) */}
        {!isVerified && (
          <MOUStageBanner stage={verificationStage} mouLink={mouLink} />
        )}

        {/* Not verified warning */}
        {!isVerified && verificationStage === "pending" && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
            <p className="text-orange-300 text-sm">
              Your account is not yet verified. Admin will send you an MOU to sign. Check your notifications.
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="candidates">
          <TabsList className="bg-white/5 border border-white/10 gap-1 p-1">
            {[
              { value: "candidates", label: "My Candidates",    icon: Users    },
              { value: "invoices",   label: "Service Requests", icon: Receipt  },
              { value: "messages",   label: "Messages",         icon: Inbox    },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value}
                className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f] text-white/70">
                <t.icon className="w-4 h-4 mr-1.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="candidates" className="mt-4">
            <AdminCandidatesTab isAdmin={false} />
          </TabsContent>
          <TabsContent value="invoices" className="mt-4">
            <AdminInvoicesTab />
          </TabsContent>
          <TabsContent value="messages" className="mt-4">
            <MessagesInbox />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PartnerDashboard;
