// src/components/admin/AdminCandidatesTab.tsx
// Admin view: all candidates across all recruiters.
// Filters, status updates (work permit, interview result), realtime.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Loader2, FolderOpen, FileText, Download } from "lucide-react";

interface Candidate {
  id: string;
  full_name: string;
  trade: string | null;
  target_country: string | null;
  passport_number: string | null;
  nationality: string | null;
  interview_availability: string;
  pcc_status: string;
  work_permit_status: string;
  visa_status: string;
  interview_result: string;
  drive_folder_url: string | null;
  drive_document_url: string | null;
  admin_notes: string | null;
  created_at: string;
  recruiter_id: string;
}

const STATUS_STYLES: Record<string, string> = {
  Available:                "bg-green-50 text-green-700 border-green-200",
  "Not Available":          "bg-red-50 text-red-700 border-red-200",
  "Not Responded":          "bg-gray-100 text-gray-600 border-gray-200",
  Pending:                  "bg-amber-50 text-amber-700 border-amber-200",
  Apostilled:               "bg-blue-50 text-blue-700 border-blue-200",
  "Dispatched to Admin":    "bg-blue-100 text-blue-800 border-blue-300",
  Received:                 "bg-green-100 text-green-800 border-green-300",
  "Dispatched to Recruiter":"bg-green-50 text-green-700 border-green-200",
  Selected:                 "bg-green-100 text-green-800 border-green-300",
  Rejected:                 "bg-red-50 text-red-700 border-red-200",
};

function SBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${STATUS_STYLES[value] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {value}
    </span>
  );
}

export default function AdminCandidatesTab({ isAdmin = true }: { isAdmin?: boolean } = {}) {
  const { toast }                         = useToast();
  const [candidates, setCandidates]       = useState<Candidate[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filterAvail, setFilterAvail]     = useState("ALL");
  const [filterResult, setFilterResult]   = useState("ALL");
  const [updating, setUpdating]           = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCandidates(data as Candidate[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime
  useEffect(() => {
    const ch = supabase.channel("admin-candidates")
      .on("postgres_changes", { event: "*", schema: "public", table: "candidates" }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetch]);

  const update = async (id: string, field: string, value: string) => {
    setUpdating(id);
    const { error } = await supabase.from("candidates").update({ [field]: value }).eq("id", id);
    setUpdating(null);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
  };

  const exportCSV = () => {
    const rows = [
      ["Name","Trade","Country","Passport","Nationality","Availability","PCC","Work Permit","Visa","Result","Drive Folder","Date"],
      ...filtered.map(c => [
        c.full_name, c.trade ?? "", c.target_country ?? "", c.passport_number ?? "",
        c.nationality ?? "", c.interview_availability, c.pcc_status, c.work_permit_status,
        c.visa_status, c.interview_result, c.drive_folder_url ?? "",
        new Date(c.created_at).toLocaleDateString(),
      ])
    ];
    const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url  = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a    = document.createElement("a");
    a.href = url; a.download = `candidates_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const filtered = candidates.filter(c => {
    if (filterAvail  !== "ALL" && c.interview_availability !== filterAvail)  return false;
    if (filterResult !== "ALL" && c.interview_result       !== filterResult) return false;
    return true;
  });

  const totalSelected = candidates.filter(c => c.interview_result === "Selected").length;
  const totalAvail    = candidates.filter(c => c.interview_availability === "Available").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold">All Candidates</h3>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            {totalAvail} Available
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {totalSelected} Selected
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Availability filter */}
          <Select value={filterAvail} onValueChange={setFilterAvail}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Availability</SelectItem>
              {["Available","Not Available","Not Responded"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          {/* Result filter */}
          <Select value={filterResult} onValueChange={setFilterResult}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Results</SelectItem>
              {["Pending","Selected","Rejected"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetch} className="border-white/20 text-white hover:bg-white/10 h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/20 text-white hover:bg-white/10 h-8">
            <Download className="w-3.5 h-3.5 mr-1" /> Export
          </Button>
        </div>
      </div>

      <p className="text-white/50 text-xs">{filtered.length} candidates shown</p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {["Name","Trade","Country","Passport","Availability","PCC","Work Permit","Visa","Result","Drive","Actions"].map(h => (
                  <TableHead key={h} className="text-white/60 text-xs whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow
                  key={c.id}
                  className={`border-white/10 hover:bg-white/5 ${updating === c.id ? "opacity-60" : ""}`}
                >
                  <TableCell className="text-white text-sm font-medium whitespace-nowrap">{c.full_name}</TableCell>
                  <TableCell className="text-white/70 text-sm whitespace-nowrap">{c.trade ?? "—"}</TableCell>
                  <TableCell className="text-white/60 text-sm whitespace-nowrap">{c.target_country ?? "—"}</TableCell>
                  <TableCell className="text-white/60 text-xs font-mono whitespace-nowrap">{c.passport_number ?? "—"}</TableCell>

                  {/* Availability — read-only for admin (recruiter owns this) */}
                  <TableCell><SBadge value={c.interview_availability} /></TableCell>

                  {/* PCC — read-only */}
                  <TableCell><SBadge value={c.pcc_status} /></TableCell>

                  {/* Work Permit — ADMIN editable */}
                  <TableCell>
                    <Select
                      value={c.work_permit_status}
                      onValueChange={v => update(c.id, "work_permit_status", v)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-40 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Pending","Received","Dispatched to Recruiter"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Visa — ADMIN editable */}
                  <TableCell>
                    <Select
                      value={c.visa_status}
                      onValueChange={v => update(c.id, "visa_status", v)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-32 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Pending","Received"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Interview Result — ADMIN editable */}
                  <TableCell>
                    <Select
                      value={c.interview_result}
                      onValueChange={v => update(c.id, "interview_result", v)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-32 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Pending","Selected","Rejected"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Drive links */}
                  <TableCell>
                    {c.drive_folder_url ? (
                      <div className="flex items-center gap-1.5">
                        <a href={c.drive_folder_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300" title="Open folder">
                          <FolderOpen className="w-4 h-4" />
                        </a>
                        {c.drive_document_url && (
                          <a href={c.drive_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300" title="View document">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ) : <span className="text-white/20 text-xs">—</span>}
                  </TableCell>

                  {/* Admin notes */}
                  <TableCell>
                    <input
                      defaultValue={c.admin_notes ?? ""}
                      onBlur={e => { if (e.target.value !== (c.admin_notes ?? "")) update(c.id, "admin_notes", e.target.value); }}
                      className="bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-1 w-28 focus:outline-none focus:ring-1 focus:ring-white/30"
                      placeholder="Notes…"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-white/40 py-8 text-sm">
                    No candidates match the selected filters
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
