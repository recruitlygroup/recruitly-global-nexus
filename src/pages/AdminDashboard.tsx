import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield,
  LogOut,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check admin role from database using the is_admin function
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { _user_id: session.user.id });

      if (adminError || !isAdmin) {
        navigate("/not-found");
        return;
      }

      setIsAuthorized(true);
      fetchPartners();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      
      // Re-verify admin status on auth change
      const { data: isAdmin } = await supabase
        .rpc('is_admin', { _user_id: session.user.id });
      
      if (!isAdmin) {
        navigate("/not-found");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchPartners = async () => {
    try {
      setRefreshing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "get_pending_partners" },
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch partners",
          variant: "destructive",
        });
        return;
      }

      setPartners(data.partners || []);
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (partnerId: string, action: "approve" | "reject") => {
    setActionLoading(partnerId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: { 
          action, 
          user_role_id: partnerId 
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: action === "approve" ? "Partner Approved!" : "Partner Rejected",
        description: action === "approve" 
          ? "Approval email has been sent to the partner."
          : "The partner has been notified.",
      });

      // Refresh the list
      fetchPartners();
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${action} partner`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const pendingCount = partners.filter(p => p.status === "pending").length;
  const approvedCount = partners.filter(p => p.status === "approved").length;
  const rejectedCount = partners.filter(p => p.status === "rejected").length;

  return (
    <div className="min-h-screen bg-[#0a192f]">
      {/* Header */}
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
              <p className="text-white/60 text-xs">Partner Management</p>
            </div>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-white">{pendingCount}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm">Approved</p>
                    <p className="text-3xl font-bold text-white">{approvedCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-400 text-sm">Rejected</p>
                    <p className="text-3xl font-bold text-white">{rejectedCount}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Partners Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#fbbf24]" />
                Partner Applications
              </CardTitle>
              <Button
                onClick={fetchPartners}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
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
                        <TableHead className="text-white/70">Signup Date</TableHead>
                        <TableHead className="text-white/70">Status</TableHead>
                        <TableHead className="text-white/70 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((partner) => (
                        <TableRow key={partner.id} className="border-white/10">
                          <TableCell className="text-white font-medium">
                            {partner.full_name || "—"}
                          </TableCell>
                          <TableCell className="text-white/80">
                            {partner.email}
                          </TableCell>
                          <TableCell className="text-white/80">
                            {partner.phone || "—"}
                          </TableCell>
                          <TableCell className="text-white/60">
                            {format(new Date(partner.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(partner.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            {partner.status === "pending" && (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(partner.id, "approve")}
                                  disabled={actionLoading === partner.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {actionLoading === partner.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAction(partner.id, "reject")}
                                  disabled={actionLoading === partner.id}
                                >
                                  {actionLoading === partner.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                            {partner.status !== "pending" && (
                              <span className="text-white/40 text-sm">Processed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
