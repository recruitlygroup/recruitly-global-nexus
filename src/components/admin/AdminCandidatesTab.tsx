/**
 * src/components/admin/AdminCandidatesTab.tsx  ← REPLACE Phase 1 version
 *
 * Phase 2 additions:
 *  - Submission checklist button per candidate (ClipboardList icon)
 *  - Agent-scoped fetch: non-admins only see their own candidates
 *  - Job listing assignment column (optional)
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, RefreshCw, Plus, Download, Search, Filter,
  FolderOpen, Pencil, CheckSquare, ClipboardList,
} from "lucide-react";
import { differenceInYears, isValid } from "date-fns";
import CandidateDocumentsModal from "./CandidateDocumentsModal";
import CandidateFormModal, { type CandidateRow } from "./CandidateFormModal";
import SubmissionChecklist from "./SubmissionChecklist";

// ─── Types ─────────────────────────────────────────────────────────────────

interface DocLink {
  name: string;
  link: string;
  type: "drive" | "send-anywhere" | "uploaded";
}

interface Checklist {
  passport: boolean;
  cv: boolean;
  pcc: boolean;
  video: boolean;
}

interface Candidate extends CandidateRow {
  id: string;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  trade?: string | null;
  passport_number?: string | null;
  passport_issue_date?: string | null;
  passport_expiry_date?: string | null;
  marital_status?: string | null;
  nationality?: string | null;
  current_location?: string | null;
  whatsapp_number?: string | null;
  position_applied: string;
  country_applied?: string | null;
  status: string;
  interview_status?: string;
  interview_availability?: string;
  pcc_status?: string;
  work_permit_status?: string | null;
  visa_status?: string | null;
  drive_folder_id?: string | null;
  drive_folder_link?: string | null;
  doc_links?: DocLink[];
  submission_checklist?: Checklist;
  created_at: string;
}

// ─── Badge configs ──────────────────────────────────────────────────────────

const INTERVIEW_STATUS_COLORS: Record<string, string> = {
  Pending:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Scheduled: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Selected:  "bg-green-500/20 text-green-400 border-green-500/30",
};

const AVAILABILITY_COLORS: Record<string, string> = {
  Available:      "bg-green-500/20 text-green-400 border-green-500/30",
  "Not Available": "bg-red-500/20 text-red-400 border-red-500/30",
  "Not Responded": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const PCC_COLORS: Record<string, string> = {
  Pending:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Dispatched: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  return isValid(d) ? differenceInYears(new Date(), d) : null;
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isValid(d)) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = d.getFullYear();
      return `${dd}.${mm}.${yy}`;
    }
  } catch {}
  return val;
}

function checklistProgress(cl?: Checklist): string {
  if (!cl) return "0/4";
  const done = [cl.passport, cl.cv, cl.pcc, cl.video].filter(Boolean).length;
  return `${done}/4`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminCandidatesTab({ isAdmin = true }: { isAdmin?: boolean }) {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterInterview, setFilterInterview] = useState("ALL");
  const [filterAvailability, setFilterAvailability] = useState("ALL");

  // Modals
  const [docCandidate, setDocCandidate] = useState<Candidate | null>(null);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);
  const [checklistCandidate, setChecklistCandidate] = useState<Candidate | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Bulk select
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAvailability, setBulkAvailability] = useState("");

  const fetchCandidates = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);

    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });

    // Non-admin agents only see their own candidates
    if (!isAdmin && user) {
      query = query.eq("agent_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Failed to load candidates", variant: "destructive" });
    } else {
      setCandidates((data as unknown as Candidate[]) || []);
    }
    setLoading(false);
    setRefreshing(false);
  }, [toast, isAdmin]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  // ── Inline update ─────────────────────────────────────────────────────────

  const updateField = async (id: string, field: string, value: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    const { error } = await supabase
      .from("job_applications")
      .update({ [field]: value })
      .eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
  };

  // ── Bulk availability update ──────────────────────────────────────────────

  const applyBulkAvailability = async () => {
    if (!bulkAvailability || selected.size === 0) return;
    const ids = Array.from(selected);
    const { error } = await supabase
      .from("job_applications")
      .update({ interview_availability: bulkAvailability })
      .in("id", ids);
    if (error) {
      toast({ title: "Bulk update failed", variant: "destructive" });
    } else {
      setCandidates(prev =>
        prev.map(c => selected.has(c.id) ? { ...c, interview_availability: bulkAvailability } : c)
      );
      setSelected(new Set());
      setBulkAvailability("");
      toast({ title: `Updated ${ids.length} candidates` });
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = [
      ["Name", "DOB", "Age", "Trade", "Passport", "Expiry", "Marital", "Nationality",
       "WhatsApp", "Interview Status", "Availability", "PCC", "Work Permit", "Visa",
       "Checklist", "Docs", "Created"],
      ...filtered.map(c => {
        const age = calcAge(c.date_of_birth);
        const docs = Array.isArray(c.doc_links) ? c.doc_links.length : 0;
        return [
          c.full_name, fmtDate(c.date_of_birth), age ?? "", c.trade ?? "",
          c.passport_number ?? "", fmtDate(c.passport_expiry_date), c.marital_status ?? "",
          c.nationality ?? "", c.whatsapp_number ?? "",
          c.interview_status ?? "", c.interview_availability ?? "", c.pcc_status ?? "",
          c.work_permit_status ?? "", c.visa_status ?? "",
          checklistProgress(c.submission_checklist), docs,
          new Date(c.created_at).toLocaleDateString(),
        ];
      }),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url;
    a.download = `candidates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || [
      c.full_name, c.passport_number, c.nationality,
      c.trade, c.whatsapp_number, c.position_applied,
    ].some(v => v?.toLowerCase().includes(q));
    const matchInterview = filterInterview === "ALL" || c.interview_status === filterInterview;
    const matchAvail = filterAvailability === "ALL" || c.interview_availability === filterAvailability;
    return matchSearch && matchInterview && matchAvail;
  });

  const availableCount = candidates.filter(c => c.interview_availability === "Available").length;

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(c => c.id)));
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-start justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <h3 className="text-white font-semibold text-lg">
            {isAdmin ? "All Candidates" : "My Candidates"}
          </h3>
          <Badge className="bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30">{candidates.length} total</Badge>
          {availableCount > 0 && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
              {availableCount} available
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchCandidates(true)} variant="outline" size="sm" disabled={refreshing}
            className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={exportCSV} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-medium">
            <Plus className="w-4 h-4 mr-1" /> Add Candidate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, passport, trade..."
            className="bg-white/5 border-white/10 text-white pl-8 h-8 text-sm" />
        </div>
        <Filter className="w-4 h-4 text-white/30" />
        <Select value={filterInterview} onValueChange={setFilterInterview}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs w-40">
            <SelectValue placeholder="Interview Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Interview</SelectItem>
            {["Pending", "Scheduled", "Selected"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAvailability} onValueChange={setFilterAvailability}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs w-40">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Availability</SelectItem>
            {["Available", "Not Available", "Not Responded"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-white/40 text-xs ml-1">{filtered.length} shown</p>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg px-4 py-2">
          <CheckSquare className="w-4 h-4 text-[#fbbf24]" />
          <span className="text-white/70 text-sm">{selected.size} selected</span>
          <Select value={bulkAvailability} onValueChange={setBulkAvailability}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white h-7 text-xs w-44">
              <SelectValue placeholder="Set Availability..." />
            </SelectTrigger>
            <SelectContent>
              {["Available", "Not Available", "Not Responded"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={applyBulkAvailability} disabled={!bulkAvailability}
            className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black h-7 text-xs">Apply</Button>
          <button onClick={() => setSelected(new Set())} className="text-white/40 hover:text-white/70 text-xs ml-2">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-8">
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll} className="w-3.5 h-3.5 accent-[#fbbf24]" />
              </TableHead>
              {[
                "Name", "DOB / Age", "Trade", "Passport", "Expiry",
                "Marital", "Interview Status", "Availability", "PCC",
                ...(isAdmin ? ["Work Permit", "Visa"] : []),
                "Docs", "Checklist", "Actions",
              ].map(h => (
                <TableHead key={h} className="text-white/50 text-xs whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => {
              const age = calcAge(c.date_of_birth);
              const docCount = Array.isArray(c.doc_links) ? c.doc_links.length : 0;
              const hasSendAnywhere = Array.isArray(c.doc_links) && c.doc_links.some(d => d.type === "send-anywhere");
              const cl = c.submission_checklist;
              const clDone = cl ? [cl.passport, cl.cv, cl.pcc, cl.video].filter(Boolean).length : 0;
              const clComplete = clDone === 4;

              return (
                <TableRow key={c.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                      className="w-3.5 h-3.5 accent-[#fbbf24]" />
                  </TableCell>
                  <TableCell className="text-white font-medium text-sm whitespace-nowrap">
                    {c.full_name}
                    <div className="text-white/40 text-xs">{c.nationality ?? ""}</div>
                  </TableCell>
                  <TableCell className="text-white/70 text-xs whitespace-nowrap">
                    <div>{fmtDate(c.date_of_birth)}</div>
                    {age !== null && <div className="text-white/40">Age: {age}</div>}
                  </TableCell>
                  <TableCell className="text-white/70 text-xs">{c.trade ?? "—"}</TableCell>
                  <TableCell className="text-white/70 text-xs font-mono">{c.passport_number ?? "—"}</TableCell>
                  <TableCell className="text-white/70 text-xs whitespace-nowrap">{fmtDate(c.passport_expiry_date)}</TableCell>
                  <TableCell className="text-white/60 text-xs">{c.marital_status ?? "—"}</TableCell>

                  {/* Interview Status */}
                  <TableCell>
                    <Select value={c.interview_status ?? "Pending"} onValueChange={v => updateField(c.id, "interview_status", v)}>
                      <SelectTrigger className="bg-transparent border-0 p-0 h-auto w-auto focus:ring-0">
                        <Badge className={INTERVIEW_STATUS_COLORS[c.interview_status ?? "Pending"] ?? "bg-white/10 text-white/60"}>
                          {c.interview_status ?? "Pending"}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {["Pending", "Scheduled", "Selected"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Availability */}
                  <TableCell>
                    <Select value={c.interview_availability ?? "Not Responded"} onValueChange={v => updateField(c.id, "interview_availability", v)}>
                      <SelectTrigger className="bg-transparent border-0 p-0 h-auto w-auto focus:ring-0">
                        <Badge className={AVAILABILITY_COLORS[c.interview_availability ?? "Not Responded"] ?? "bg-white/10 text-white/60"}>
                          {c.interview_availability ?? "Not Responded"}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {["Available", "Not Available", "Not Responded"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* PCC */}
                  <TableCell>
                    <Select value={c.pcc_status ?? "Pending"} onValueChange={v => updateField(c.id, "pcc_status", v)}>
                      <SelectTrigger className="bg-transparent border-0 p-0 h-auto w-auto focus:ring-0">
                        <Badge className={PCC_COLORS[c.pcc_status ?? "Pending"] ?? "bg-white/10 text-white/60"}>
                          {c.pcc_status ?? "Pending"}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {["Pending", "Dispatched"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {isAdmin && <TableCell className="text-white/60 text-xs">{c.work_permit_status ?? "—"}</TableCell>}
                  {isAdmin && <TableCell className="text-white/60 text-xs">{c.visa_status ?? "—"}</TableCell>}

                  {/* Docs */}
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setDocCandidate(c)}
                      className={`h-7 px-2 text-xs ${hasSendAnywhere ? "text-orange-400" : docCount > 0 ? "text-green-400" : "text-white/40"} hover:bg-white/5`}>
                      <FolderOpen className="w-3.5 h-3.5 mr-1" />
                      {docCount > 0 ? docCount : "Upload"}
                      {hasSendAnywhere && " ⚠"}
                    </Button>
                  </TableCell>

                  {/* Checklist */}
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setChecklistCandidate(c)}
                      className={`h-7 px-2 text-xs ${clComplete ? "text-green-400" : clDone > 0 ? "text-[#fbbf24]" : "text-white/40"} hover:bg-white/5`}>
                      <ClipboardList className="w-3.5 h-3.5 mr-1" />
                      {clDone}/4
                    </Button>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setEditCandidate(c)}
                      className="h-7 w-7 p-0 text-white/40 hover:text-white/80">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 17 : 15} className="text-center text-white/30 py-12">
                  No candidates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <CandidateDocumentsModal
        candidate={docCandidate}
        open={!!docCandidate}
        onClose={() => setDocCandidate(null)}
        onUpdated={() => fetchCandidates(true)}
      />
      <CandidateFormModal
        candidate={editCandidate}
        open={!!editCandidate}
        onClose={() => setEditCandidate(null)}
        onSaved={() => fetchCandidates(true)}
        isAdmin={isAdmin}
      />
      <CandidateFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => fetchCandidates(true)}
        isAdmin={isAdmin}
      />
      <SubmissionChecklist
        candidate={checklistCandidate}
        open={!!checklistCandidate}
        onClose={() => setChecklistCandidate(null)}
        onUpdated={() => fetchCandidates(true)}
      />
    </div>
  );
}
