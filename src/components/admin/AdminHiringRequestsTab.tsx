// src/components/admin/AdminHiringRequestsTab.tsx
// View and manage employer hiring requests submitted from the B2B form.

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Loader2, Mail, Phone, Building2, Download } from "lucide-react";

interface HiringRequest {
  id: string;
  role: string;
  quantity: number | null;
  target_country: string | null;
  deadline: string | null;
  email: string;
  phone: string | null;
  company_name: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function AdminHiringRequestsTab() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<HiringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employer_hiring_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRequests(data as HiringRequest[]);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("employer_hiring_requests")
      .update({ status })
      .eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast({ title: "Status updated" });
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Role","Quantity","Country","Deadline","Email","Phone","Company","Message","Status","Submitted"],
      ...requests.map(r => [
        r.role, r.quantity ?? "", r.target_country ?? "", r.deadline ?? "",
        r.email, r.phone ?? "", r.company_name ?? "", (r.message ?? "").replace(/,/g, ";"),
        r.status, new Date(r.created_at).toLocaleDateString()
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hiring_requests_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const filtered = requests.filter(r => filterStatus === "ALL" || r.status === filterStatus);

  const newCount = requests.filter(r => r.status === "new").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold">Employer Hiring Requests</h3>
          {newCount > 0 && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">
              {newCount} NEW
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchRequests} className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/20 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      <p className="text-white/50 text-sm">{filtered.length} requests</p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/0">
                {["Role","Qty","Country","Deadline","Contact","Company","Status","Submitted","Action"].map(h => (
                  <TableHead key={h} className="text-white/60 text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(req => (
                <TableRow key={req.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white text-sm font-medium">{req.role}</TableCell>
                  <TableCell className="text-white/70 text-sm text-center">{req.quantity ?? "—"}</TableCell>
                  <TableCell className="text-white/70 text-sm">{req.target_country ?? "—"}</TableCell>
                  <TableCell className="text-white/60 text-sm">{req.deadline ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    <div className="space-y-1">
                      <a href={`mailto:${req.email}`} className="flex items-center gap-1 text-blue-400 hover:underline">
                        <Mail className="w-3 h-3" />{req.email}
                      </a>
                      {req.phone && (
                        <a href={`tel:${req.phone}`} className="flex items-center gap-1 text-white/60 hover:text-white">
                          <Phone className="w-3 h-3" />{req.phone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {req.company_name && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />{req.company_name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[req.status] ?? "bg-white/10 text-white/60"}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/50 text-xs">
                    {new Date(req.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select value={req.status} onValueChange={(v) => updateStatus(req.id, v)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-28 h-7"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-white/40 py-8">No hiring requests yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
