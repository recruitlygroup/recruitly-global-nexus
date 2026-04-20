// src/components/admin/AdminConsultationsTab.tsx — NEW FILE
// Fixes the "admin cannot manage inbound consultation leads" warning.
// Reads from consultation_requests using the new admin RLS policies.
// Allows admin to: view all leads, update status, add notes, export CSV.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Loader2, Download, MessageCircle, Phone, Mail } from "lucide-react";
import { format } from "date-fns";

interface Consultation {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  service_type: string | null;
  country_of_interest: string | null;
  message: string | null;
  admin_notes: string | null;
  lead_status: string;
  created_at: string;
}

const LEAD_STATUS_STYLES: Record<string, string> = {
  new:         "bg-blue-50 text-blue-700 border-blue-200",
  contacted:   "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-purple-50 text-purple-700 border-purple-200",
  closed:      "bg-green-50 text-green-700 border-green-200",
  spam:        "bg-gray-100 text-gray-500 border-gray-200",
};

export default function AdminConsultationsTab() {
  const { toast }                             = useToast();
  const [consultations, setConsultations]     = useState<Consultation[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [updating, setUpdating]               = useState<string | null>(null);
  const [filterStatus, setFilterStatus]       = useState("ALL");

  const fetch = useCallback(async () => {
    setLoading(true);
    // Uses the admin-actions edge function (service role bypasses RLS entirely)
    const { data, error } = await supabase.functions.invoke("admin-actions", {
      body: { action: "get_consultation_requests" },
    });
    if (error) {
      toast({ title: "Failed to load consultations", description: error.message, variant: "destructive" });
    } else {
      setConsultations((data?.consultations ?? []) as Consultation[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateField = async (id: string, field: string, value: string) => {
    setUpdating(id);
    // Direct update — admin RLS policy allows this
    const { error } = await supabase
      .from("consultation_requests")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setConsultations(prev =>
        prev.map(c => c.id === id ? { ...c, [field]: value } : c)
      );
    }
    setUpdating(null);
  };

  const exportCSV = () => {
    const rows = [
      ["Name","Email","Phone","Service","Country","Lead Status","Notes","Date"],
      ...filtered.map(c => [
        c.full_name, c.email, c.phone ?? "", c.service_type ?? "",
        c.country_of_interest ?? "", c.lead_status,
        (c.admin_notes ?? "").replace(/\n/g, " "),
        format(new Date(c.created_at), "dd MMM yyyy"),
      ]),
    ];
    const csv = rows.map(r =>
      r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `consultation_leads_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = consultations.filter(c =>
    filterStatus === "ALL" || c.lead_status === filterStatus
  );

  const newCount  = consultations.filter(c => c.lead_status === "new").length;
  const openCount = consultations.filter(c => ["new","contacted","in_progress"].includes(c.lead_status)).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-white font-semibold">Consultation Requests</h3>
          {newCount > 0 && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {newCount} New
            </Badge>
          )}
          <Badge className="bg-white/10 text-white/60 border-white/20">
            {openCount} Open
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {["new","contacted","in_progress","closed","spam"].map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace("_"," ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline" size="sm"
            onClick={fetch}
            className="border-white/20 text-white hover:bg-white/10 h-8"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={exportCSV}
            className="border-white/20 text-white hover:bg-white/10 h-8"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <p className="text-white/50 text-xs">{filtered.length} consultations shown</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {["Name","Contact","Service","Country","Status","Admin Notes","Date"].map(h => (
                  <TableHead key={h} className="text-white/60 text-xs whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow
                  key={c.id}
                  className={`border-white/10 hover:bg-white/5 ${
                    updating === c.id ? "opacity-60" : ""
                  } ${c.lead_status === "new" ? "bg-blue-500/5" : ""}`}
                >
                  <TableCell className="text-white font-medium whitespace-nowrap">
                    {c.full_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <a
                        href={`mailto:${c.email}`}
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" /> {c.email}
                      </a>
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="text-green-400 hover:text-green-300 text-xs flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> {c.phone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white/70 text-sm whitespace-nowrap">
                    {c.service_type ?? "—"}
                  </TableCell>
                  <TableCell className="text-white/60 text-sm whitespace-nowrap">
                    {c.country_of_interest ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={c.lead_status}
                      onValueChange={v => updateField(c.id, "lead_status", v)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-36 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["new","contacted","in_progress","closed","spam"].map(s => (
                          <SelectItem key={s} value={s} className="text-xs capitalize">
                            {s.replace("_"," ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <input
                      defaultValue={c.admin_notes ?? ""}
                      onBlur={e => {
                        if (e.target.value !== (c.admin_notes ?? "")) {
                          updateField(c.id, "admin_notes", e.target.value);
                        }
                      }}
                      className="bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-1 w-36 focus:outline-none focus:ring-1 focus:ring-white/30"
                      placeholder="Add note…"
                    />
                  </TableCell>
                  <TableCell className="text-white/40 text-xs whitespace-nowrap">
                    {format(new Date(c.created_at), "dd MMM yyyy")}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-white/40 py-8 text-sm">
                    {filterStatus === "ALL"
                      ? "No consultation requests yet"
                      : `No requests with status "${filterStatus}"`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
