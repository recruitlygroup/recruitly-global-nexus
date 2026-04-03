import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Clock, Users, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Partner {
  id: string;
  user_id: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  full_name: string | null;
  phone: string | null;
  email: string;
  created_at: string;
}

const AdminPartnersTab = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: typeof CheckCircle; label: string }> = {
      approved: { className: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle, label: "Approved" },
      rejected: { className: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle, label: "Rejected" },
      pending: { className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock, label: "Pending" },
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
                  <TableHead className="text-white/70">Name</TableHead>
                  <TableHead className="text-white/70">Email</TableHead>
                  <TableHead className="text-white/70">Phone</TableHead>
                  <TableHead className="text-white/70">Date</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((p) => (
                  <TableRow key={p.id} className="border-white/10">
                    <TableCell className="text-white font-medium">{p.full_name || "—"}</TableCell>
                    <TableCell className="text-white/80">{p.email}</TableCell>
                    <TableCell className="text-white/80">{p.phone || "—"}</TableCell>
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
