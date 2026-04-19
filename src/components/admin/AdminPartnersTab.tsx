// src/components/admin/AdminPartnersTab.tsx — REPLACE existing file
// Changes: Added 4-stage MOU verification flow (pending→mou_sent→mou_signed→verified),
//          company logo display, verification_stage column, MOU link input.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, CheckCircle, XCircle, Clock, Users, RefreshCw,
  ChevronDown, ChevronRight, ExternalLink, ShieldCheck, ShieldX, Send, FileSignature,
} from "lucide-react";
import { format } from "date-fns";
import AgentVerificationBadge from "./AgentVerificationBadge";

interface Partner {
  id: string;
  user_id: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  full_name: string | null;
  phone: string | null;
  email: string;
  created_at: string;
  gender?: string | null;
  age?: number | null;
  company_name?: string | null;
  passport_number?: string | null;
  contact_number?: string | null;
  pcc_link?: string | null;
  pcc_file_url?: string | null;
  is_verified?: boolean;
  verification_stage?: string | null;
  mou_link?: string | null;
  mou_sent_at?: string | null;
  mou_signed_at?: string | null;
  company_logo_url?: string | null;
}

const STAGE_LABEL: Record<string, { label: string; color: string }> = {
  pending:    { label: "Pending",    color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  mou_sent:   { label: "MOU Sent",   color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  mou_signed: { label: "MOU Signed", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  verified:   { label: "Verified ✓", color: "bg-green-500/20 text-green-400 border-green-500/30" },
};

const AdminPartnersTab = () => {
  const { toast }                         = useToast();
  const [partners, setPartners]           = useState<Partner[]>([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing]       = useState(false);
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [mouInputs, setMouInputs]         = useState<Record<string, string>>({});

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "get_pending_partners" },
      });
      if (error) throw error;
      setPartners(data.partners || []);
    } catch {
      toast({ title: "Error", description: "Failed to fetch partners", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (partnerId: string, action: "approve" | "reject") => {
    setActionLoading(partnerId);
    try {
      const { error } = await supabase.functions.invoke("admin-actions", {
        body: { action, user_role_id: partnerId },
      });
      if (error) throw error;
      toast({ title: action === "approve" ? "Partner Approved!" : "Partner Rejected" });
      fetchPartners();
    } catch {
      toast({ title: "Error", description: `Failed to ${action} partner`, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  // ── MOU / Verification stage updaters ──────────────────────────────────────

  const sendMOU = async (partner: Partner) => {
    const link = mouInputs[partner.id]?.trim();
    if (!link) { toast({ title: "Paste the OpenSign MOU link first", variant: "destructive" }); return; }
    setActionLoading(partner.id);
    const { error } = await supabase
      .from("user_roles")
      .update({
        mou_link: link,
        mou_sent_at: new Date().toISOString(),
        verification_stage: "mou_sent",
      } as any)
      .eq("id", partner.id);

    if (!error) {
      // Notify recruiter
      await supabase.from("notifications").insert({
        user_id: partner.user_id,
        type: "mou_sent",
        title: "Please sign your MOU",
        body: "Recruitly Group has sent you a Memorandum of Understanding to sign. Click to open.",
        link,
      } as any);
      toast({ title: "MOU link sent to agent ✓" });
      fetchPartners();
    } else {
      toast({ title: "Failed to send MOU", variant: "destructive" });
    }
    setActionLoading(null);
  };

  const markMOUSigned = async (partner: Partner) => {
    setActionLoading(partner.id);
    await supabase.from("user_roles").update({
      mou_signed_at: new Date().toISOString(),
      verification_stage: "mou_signed",
    } as any).eq("id", partner.id);
    toast({ title: "MOU marked as signed" });
    fetchPartners();
    setActionLoading(null);
  };

  const markVerified = async (partner: Partner) => {
    setActionLoading(partner.id);
    const { error } = await supabase.from("user_roles").update({
      is_verified: true,
      verification_stage: "verified",
    } as any).eq("id", partner.id);

    if (!error) {
      // Notify agent
      await supabase.from("notifications").insert({
        user_id: partner.user_id,
        type: "agent_verified",
        title: "🏅 Account Verified!",
        body: "Congratulations! Your Recruitly Group agent account has been verified. You now have full access.",
        link: "/partner-dashboard",
      } as any);
      toast({ title: "✅ Agent verified!" });
      fetchPartners();
    } else {
      toast({ title: "Verification failed", variant: "destructive" });
    }
    setActionLoading(null);
  };

  const revokeVerified = async (partner: Partner) => {
    await supabase.from("user_roles").update({
      is_verified: false,
      verification_stage: "pending",
    } as any).eq("id", partner.id);
    setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, is_verified: false, verification_stage: "pending" } : p));
    toast({ title: "Verification revoked" });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>;
  }

  const pending  = partners.filter(p => p.status === "pending");
  const approved = partners.filter(p => p.status === "approved");
  const rejected = partners.filter(p => p.status === "rejected");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending",  count: pending.length,  color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Approved", count: approved.length, color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
          { label: "Rejected", count: rejected.length, color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20" },
        ].map(s => (
          <Card key={s.label} className={`${s.bg} border`}>
            <CardContent className="pt-4 pb-4 px-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className={`${s.color} text-xs`}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchPartners} disabled={refreshing} className="border-white/20 text-white hover:bg-white/10">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Partners table */}
      {partners.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No partners found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {["","Name","Company","Status","Verification Stage","Joined","Actions"].map(h => (
                  <TableHead key={h} className="text-white/60 text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map(p => {
                const stage = p.verification_stage ?? "pending";
                const stageInfo = STAGE_LABEL[stage] ?? STAGE_LABEL.pending;
                const isExpanded = expandedId === p.id;
                const isActioning = actionLoading === p.id;

                return (
                  <>
                    <TableRow
                      key={p.id}
                      className={`border-white/10 hover:bg-white/5 cursor-pointer ${isActioning ? "opacity-60" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    >
                      <TableCell className="w-6">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {p.company_logo_url && (
                            <img src={p.company_logo_url} alt="logo" className="w-6 h-6 rounded object-cover" />
                          )}
                          <span className="text-white text-sm font-medium whitespace-nowrap">{p.full_name ?? "—"}</span>
                          <AgentVerificationBadge isVerified={!!p.is_verified} />
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60 text-sm">{p.company_name ?? "—"}</TableCell>
                      <TableCell>
                        {p.status === "pending"  && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>}
                        {p.status === "approved" && <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>}
                        {p.status === "rejected" && <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge className={stageInfo.color}>{stageInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-white/50 text-xs">
                        {format(new Date(p.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2 flex-wrap">
                          {p.status === "pending" && (
                            <>
                              <Button size="sm" onClick={() => handleAction(p.id, "approve")} disabled={isActioning}
                                className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs">
                                {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" />Approve</>}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleAction(p.id, "reject")} disabled={isActioning} className="h-7 text-xs">
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {p.status === "approved" && !p.is_verified && (
                            <span className="text-xs text-white/40 italic">Expand to verify ↓</span>
                          )}
                          {p.is_verified && (
                            <Button size="sm" variant="outline" onClick={() => revokeVerified(p)} className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-7 text-xs">
                              <ShieldX className="w-3 h-3 mr-1" /> Revoke
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* ── Expanded detail + MOU flow ─────────────────────── */}
                    {isExpanded && (
                      <TableRow key={`${p.id}-detail`} className="border-white/10 bg-white/[0.02]">
                        <TableCell colSpan={7} className="py-4 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Agent details */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Agent Details</p>
                              {[
                                ["Email",     p.email],
                                ["Phone",     p.phone ?? p.contact_number ?? "—"],
                                ["Gender",    p.gender ?? "—"],
                                ["Age",       p.age?.toString() ?? "—"],
                                ["Passport",  p.passport_number ?? "—"],
                              ].map(([k, v]) => (
                                <div key={k} className="flex items-center gap-3 text-sm">
                                  <span className="text-white/40 w-20 text-xs">{k}</span>
                                  <span className="text-white">{v}</span>
                                </div>
                              ))}
                              {p.pcc_link && (
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="text-white/40 w-20 text-xs">PCC Link</span>
                                  <a href={p.pcc_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 flex items-center gap-1 text-xs hover:underline">
                                    <ExternalLink className="w-3 h-3" /> View
                                  </a>
                                </div>
                              )}
                              {p.pcc_file_url && (
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="text-white/40 w-20 text-xs">PCC File</span>
                                  <a href={p.pcc_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 flex items-center gap-1 text-xs hover:underline">
                                    <ExternalLink className="w-3 h-3" /> View File
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* MOU / Verification flow */}
                            {p.status === "approved" && (
                              <div className="space-y-3">
                                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Verification Flow</p>

                                {/* Stage progress */}
                                <div className="flex items-center gap-2 mb-4">
                                  {["pending","mou_sent","mou_signed","verified"].map((s, i) => (
                                    <div key={s} className="flex items-center gap-1">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                                        ${["pending","mou_sent","mou_signed","verified"].indexOf(stage) >= i
                                          ? "bg-[#fbbf24] text-[#0a192f]"
                                          : "bg-white/10 text-white/40"}`}>
                                        {i + 1}
                                      </div>
                                      {i < 3 && <div className="w-6 h-px bg-white/10" />}
                                    </div>
                                  ))}
                                  <span className="text-xs text-white/50 ml-2">{stageInfo.label}</span>
                                </div>

                                {/* Stage: pending → send MOU */}
                                {(stage === "pending") && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-white/60">Paste the OpenSign MOU link to send to agent:</p>
                                    <Input
                                      value={mouInputs[p.id] ?? ""}
                                      onChange={e => setMouInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                                      placeholder="https://app.opensignlabs.com/..."
                                      className="h-8 text-xs bg-white/5 border-white/20 text-white"
                                    />
                                    <Button size="sm" onClick={() => sendMOU(p)} disabled={isActioning}
                                      className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs w-full">
                                      <Send className="w-3 h-3 mr-1" /> Send MOU to Agent
                                    </Button>
                                  </div>
                                )}

                                {/* Stage: mou_sent → mark signed */}
                                {stage === "mou_sent" && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-amber-400">⏳ Waiting for agent to sign MOU.</p>
                                    {p.mou_link && (
                                      <a href={p.mou_link} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
                                        <ExternalLink className="w-3 h-3" /> View MOU Document
                                      </a>
                                    )}
                                    <Button size="sm" onClick={() => markMOUSigned(p)} disabled={isActioning}
                                      className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs w-full">
                                      <FileSignature className="w-3 h-3 mr-1" /> Agent Has Signed — Mark as Signed
                                    </Button>
                                  </div>
                                )}

                                {/* Stage: mou_signed → verify */}
                                {stage === "mou_signed" && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-purple-400">✍ MOU signed. Ready to verify agent.</p>
                                    <Button size="sm" onClick={() => markVerified(p)} disabled={isActioning}
                                      className="bg-green-600 hover:bg-green-700 text-white h-8 text-sm w-full font-semibold">
                                      <ShieldCheck className="w-4 h-4 mr-1.5" /> Mark as Verified ✓
                                    </Button>
                                  </div>
                                )}

                                {/* Stage: verified */}
                                {stage === "verified" && (
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-green-400" />
                                    <span className="text-green-400 text-sm font-medium">Agent is fully verified</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPartnersTab;
