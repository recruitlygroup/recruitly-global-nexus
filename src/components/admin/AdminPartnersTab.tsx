/**
 * src/components/admin/AdminPartnersTab.tsx   ← REPLACE existing file
 *
 * CHANGES from original:
 *  - Shows agent verification fields: gender, age, company, passport, contact, PCC
 *  - Verified / Not Verified badge via AgentVerificationBadge
 *  - Admin can toggle is_verified on any approved partner
 *  - Expandable row detail panel for all agent fields
 *  - All original approve/reject logic UNCHANGED
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, CheckCircle, XCircle, Clock, Users, RefreshCw,
  ChevronDown, ChevronRight, ExternalLink, ShieldCheck, ShieldX,
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
  // Verification fields
  gender?: string | null;
  age?: number | null;
  company_name?: string | null;
  passport_number?: string | null;
  contact_number?: string | null;
  pcc_link?: string | null;
  pcc_file_url?: string | null;
  is_verified?: boolean;
}

const AdminPartnersTab = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const toggleVerified = async (partnerId: string, current: boolean) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ is_verified: !current })
      .eq("id", partnerId);

    if (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } else {
      setPartners(prev =>
        prev.map(p => p.id === partnerId ? { ...p, is_verified: !current } : p)
      );
      toast({ title: !current ? "✓ Agent marked as Verified" : "Agent marked as Not Verified" });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: typeof CheckCircle; label: string }> = {
      approved: { className: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle, label: "Approved" },
      rejected: { className: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle, label: "Rejected" },
      pending:  { className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock, label: "Pending" },
    };
    const c = config[status] || config.pending;
    return <Badge className={c.className}><c.icon className="w-3 h-3 mr-1" />{c.label}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>;
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[#fbbf24]" /> Partner Applications
        </CardTitle>
        <Button onClick={fetchPartners} variant="outline" size="sm" disabled={refreshing}
          className="border-white/20 text-white hover:bg-white/10">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No partner applications yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70 w-6" />
                  <TableHead className="text-white/70">Name</TableHead>
                  <TableHead className="text-white/70">Email</TableHead>
                  <TableHead className="text-white/70">Phone</TableHead>
                  <TableHead className="text-white/70">Verification</TableHead>
                  <TableHead className="text-white/70">Date</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((p) => (
                  <>
                    <TableRow key={p.id} className="border-white/10">
                      {/* Expand toggle */}
                      <TableCell>
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="text-white/30 hover:text-white/70"
                        >
                          {expandedId === p.id
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                      </TableCell>
                      <TableCell className="text-white font-medium">{p.full_name || "—"}</TableCell>
                      <TableCell className="text-white/80">{p.email}</TableCell>
                      <TableCell className="text-white/80">{p.phone || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AgentVerificationBadge isVerified={!!p.is_verified} />
                          {p.status === "approved" && (
                            <button
                              onClick={() => toggleVerified(p.id, !!p.is_verified)}
                              className="text-white/30 hover:text-white/60 transition-colors"
                              title={p.is_verified ? "Revoke verification" : "Mark as verified"}
                            >
                              {p.is_verified
                                ? <ShieldX className="w-4 h-4" />
                                : <ShieldCheck className="w-4 h-4" />
                              }
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60">{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell className="text-right">
                        {p.status === "pending" ? (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" onClick={() => handleAction(p.id, "approve")}
                              disabled={actionLoading === p.id} className="bg-green-600 hover:bg-green-700 text-white">
                              {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-1" />Approve</>}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction(p.id, "reject")}
                              disabled={actionLoading === p.id}>
                              {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1" />Reject</>}
                            </Button>
                          </div>
                        ) : <span className="text-white/40 text-sm">Processed</span>}
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail row */}
                    {expandedId === p.id && (
                      <TableRow key={`${p.id}-detail`} className="border-white/10 bg-white/2">
                        <TableCell colSpan={8} className="py-3 px-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-white/40 text-xs mb-0.5">Gender</p>
                              <p className="text-white/80">{p.gender || "—"}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-0.5">Age</p>
                              <p className="text-white/80">{p.age || "—"}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-0.5">Company</p>
                              <p className="text-white/80">{p.company_name || "—"}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-0.5">Passport No.</p>
                              <p className="text-white/80 font-mono">{p.passport_number || "—"}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-0.5">Contact</p>
                              <p className="text-white/80">{p.contact_number || p.phone || "—"}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-0.5">PCC</p>
                              {p.pcc_link ? (
                                <a href={p.pcc_link} target="_blank" rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" /> View PCC
                                </a>
                              ) : p.pcc_file_url ? (
                                <a href={p.pcc_file_url} target="_blank" rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" /> View File
                                </a>
                              ) : (
                                <p className="text-white/40">Not provided</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPartnersTab;
