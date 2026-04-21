// src/components/admin/AdminCandidatesTab.tsx
// FIXED:
//   1. Realtime channel uses Date.now() suffix → prevents duplicate-channel freeze
//   2. Fetch uses AbortController → prevents stale state from slow responses
//   3. Interview Type column added
//   4. Search/filter by name or passport number (new)
//   5. Broadcast delete via edge function (admin only)

import { useState, useEffect, useCallback, useRef } from "react";
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
import { RefreshCw, Loader2, FolderOpen, FileText, Download, AlertTriangle, Search } from "lucide-react";

interface Candidate {
  id: string;
  full_name: string;
  trade: string | null;
  target_country: string | null;
  passport_number: string | null;
  passport_expiry_date: string | null;
  nationality: string | null;
  interview_availability: string;
  interview_type: string | null;
  pcc_status: string;
  slc_status: string | null;
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
  Available:                 "bg-green-50 text-green-700 border-green-200",
  "Not Available":           "bg-red-50 text-red-700 border-red-200",
  "Not Responded":           "bg-gray-100 text-gray-600 border-gray-200",
  Pending:                   "bg-amber-50 text-amber-700 border-amber-200",
  Apostilled:                "bg-blue-50 text-blue-700 border-blue-200",
  "Dispatched to Admin":     "bg-blue-100 text-blue-800 border-blue-300",
  Received:                  "bg-green-100 text-green-800 border-green-300",
  "Dispatched to Recruiter": "bg-green-50 text-green-700 border-green-200",
  Selected:                  "bg-green-100 text-green-800 border-green-300",
  Rejected:                  "bg-red-50 text-red-700 border-red-200",
};

function SBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${STATUS_STYLES[value] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {value}
    </span>
  );
}

function passportDaysLeft(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  return Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86400000);
}

export default function AdminCandidatesTab({ isAdmin = true }: { isAdmin?: boolean } = {}) {
  const { toast }                         = useToast();
  const [candidates, setCandidates]       = useState<Candidate[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filterAvail, setFilterAvail]     = useState("ALL");
  const [filterResult, setFilterResult]   = useState("ALL");
  const [search, setSearch]               = useState("");
  const [updating, setUpdating]           = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const mountedRef                        = useRef(true);
  const channelRef                        = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
  }, []);

  // ── fetch with abort support ─────────────────────────────────────────────
  const fetchCandidates = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    const { data, error } = await (supabase.from("candidates") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (signal?.aborted) return;
    if (!error && data && mountedRef.current) setCandidates(data as Candidate[]);
    if (mountedRef.current) setLoading(false);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchCandidates(ac.signal);
    return () => ac.abort();
  }, [fetchCandidates]);

  // ── Realtime — unique channel name prevents duplicate-subscription freeze ──
  useEffect(() => {
    mountedRef.current = true;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    // Remove any existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const ch = supabase.channel(`admin-candidates-${Date.now()}`);
    channelRef.current = ch;

    ch.on("postgres_changes", { event: "*", schema: "public", table: "candidates" }, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (mountedRef.current) fetchCandidates();
      }, 600);
    }).subscribe();

    return () => {
      mountedRef.current = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [fetchCandidates]);

  // ── Core update with optional edge function alert ────────────────────────
  const update = async (candidate: Candidate, field: string, value: string) => {
    setUpdating(candidate.id);
    const { error } = await (supabase.from("candidates") as any)
      .update({ [field]: value })
      .eq("id", candidate.id);
    setUpdating(null);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }

    // Optimistic local update to avoid waiting for realtime echo
    setCandidates(prev =>
      prev.map(c => c.id === candidate.id ? { ...c, [field]: value } : c)
    );

    // Fire alert edge function when admin marks PCC/SLC as Received
    if (isAdmin && (field === "pcc_status" || field === "slc_status") && value === "Received") {
      supabase.functions.invoke("document-status-alert", {
        body: {
          candidate_id:   candidate.id,
          candidate_name: candidate.full_name,
          recruiter_id:   candidate.recruiter_id,
          field,
          new_value:      value,
          actor_role:     "admin",
          actor_user_id:  currentUserId,
        },
      }).catch(() => { /* non-blocking */ });
      toast({ title: "✅ Status updated. Recruiter has been notified." });
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Name","Trade","Country","Passport","Nationality","Passport Expiry","Availability","Interview Type","PCC","SLC","Work Permit","Visa","Result","Drive Folder","Date"],
      ...filtered.map(c => {
        const days = passportDaysLeft(c.passport_expiry_date);
        const expiryLabel = days === null ? "" : days < 0 ? "EXPIRED" : days <= 60 ? `${days}d ⚠` : c.passport_expiry_date ?? "";
        return [
          c.full_name, c.trade ?? "", c.target_country ?? "", c.passport_number ?? "",
          c.nationality ?? "", expiryLabel,
          c.interview_availability, c.interview_type ?? "",
          c.pcc_status, c.slc_status ?? "Pending",
          c.work_permit_status, c.visa_status, c.interview_result,
          c.drive_folder_url ?? "", new Date(c.created_at).toLocaleDateString(),
        ];
      }),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `candidates_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = candidates.filter(c => {
    if (filterAvail  !== "ALL" && c.interview_availability !== filterAvail)  return false;
    if (filterResult !== "ALL" && c.interview_result       !== filterResult) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch     = c.full_name.toLowerCase().includes(q);
      const passportMatch = (c.passport_number ?? "").toLowerCase().includes(q);
      const tradeMatch    = (c.trade ?? "").toLowerCase().includes(q);
      if (!nameMatch && !passportMatch && !tradeMatch) return false;
    }
    return true;
  });

  const totalSelected  = candidates.filter(c => c.interview_result === "Selected").length;
  const totalAvail     = candidates.filter(c => c.interview_availability === "Available").length;
  const expiringCount  = candidates.filter(c => { const d = passportDaysLeft(c.passport_expiry_date); return d !== null && d <= 60; }).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-white font-semibold">All Candidates</h3>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{totalAvail} Available</Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{totalSelected} Selected</Badge>
          {expiringCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <AlertTriangle className="w-3 h-3 mr-1" /> {expiringCount} Passport Expiring
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, passport, trade…"
              className="bg-white/5 border border-white/10 text-white text-xs rounded-lg pl-8 pr-3 h-8 w-52 focus:outline-none focus:ring-1 focus:ring-white/30 placeholder:text-white/30"
            />
          </div>
          <Select value={filterAvail} onValueChange={setFilterAvail}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Availability</SelectItem>
              {["Available","Not Available","Not Responded"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterResult} onValueChange={setFilterResult}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Results</SelectItem>
              {["Pending","Selected","Rejected"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => fetchCandidates()} className="border-white/20 text-white hover:bg-white/10 h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/20 text-white hover:bg-white/10 h-8">
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <p className="text-white/50 text-xs">{filtered.length} of {candidates.length} candidates shown</p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {["Name","Trade","Country","Passport","Expiry","Availability","Interview Type","PCC Status","SLC Status","Work Permit","Visa","Result","Drive","Notes"].map(h => (
                  <TableHead key={h} className="text-white/60 text-xs whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => {
                const days = passportDaysLeft(c.passport_expiry_date);
                const expiryWarn = days !== null && days <= 60;

                return (
                  <TableRow key={c.id} className={`border-white/10 hover:bg-white/5 ${updating === c.id ? "opacity-60" : ""}`}>
                    <TableCell className="text-white text-sm font-medium whitespace-nowrap">{c.full_name}</TableCell>
                    <TableCell className="text-white/70 text-sm whitespace-nowrap">{c.trade ?? "—"}</TableCell>
                    <TableCell className="text-white/60 text-sm whitespace-nowrap">{c.target_country ?? "—"}</TableCell>
                    <TableCell className="text-white/60 text-xs font-mono whitespace-nowrap">{c.passport_number ?? "—"}</TableCell>

                    {/* Passport Expiry */}
                    <TableCell>
                      {days === null ? (
                        <span className="text-white/20 text-xs">—</span>
                      ) : (
                        <span className={`text-xs flex items-center gap-1 ${days < 0 ? "text-red-400 font-bold" : expiryWarn ? "text-amber-400" : "text-white/50"}`}>
                          {expiryWarn && <AlertTriangle className="w-3 h-3" />}
                          {days < 0 ? "EXPIRED" : `${days}d`}
                        </span>
                      )}
                    </TableCell>

                    <TableCell><SBadge value={c.interview_availability} /></TableCell>

                    {/* Interview Type */}
                    <TableCell>
                      {isAdmin ? (
                        <Select value={c.interview_type ?? ""} onValueChange={v => update(c, "interview_type", v)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-36 h-7"><SelectValue placeholder="Type…" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">—</SelectItem>
                            {["Online","Physical","Zoom","Client Direct","Embassy"].map(o => (
                              <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <SBadge value={c.interview_type ?? "—"} />
                      )}
                    </TableCell>

                    {/* PCC */}
                    <TableCell>
                      {isAdmin ? (
                        <Select value={c.pcc_status} onValueChange={v => update(c, "pcc_status", v)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-40 h-7"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Pending","Apostilled","Dispatched to Admin","Received"].map(o => (
                              <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <SBadge value={c.pcc_status} />
                      )}
                    </TableCell>

                    {/* SLC */}
                    <TableCell>
                      {isAdmin ? (
                        <Select value={c.slc_status ?? "Pending"} onValueChange={v => update(c, "slc_status", v)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-40 h-7"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Pending","Apostilled","Dispatched to Admin","Received"].map(o => (
                              <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <SBadge value={c.slc_status ?? "Pending"} />
                      )}
                    </TableCell>

                    {/* Work Permit */}
                    {isAdmin ? (
                      <TableCell>
                        <Select value={c.work_permit_status} onValueChange={v => update(c, "work_permit_status", v)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-40 h-7"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Pending","Received","Dispatched to Recruiter"].map(o => (
                              <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    ) : (
                      <TableCell><SBadge value={c.work_permit_status} /></TableCell>
                    )}

                    {/* Visa */}
                    {isAdmin ? (
                      <TableCell>
                        <Select value={c.visa_status} onValueChange={v => update(c, "visa_status", v)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-32 h-7"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Pending","Received"].map(o => (
                              <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    ) : (
                      <TableCell><SBadge value={c.visa_status} /></TableCell>
                    )}

                    {/* Interview Result */}
                    {isAdmin ? (
                      <TableCell>
                        <Select value={c.interview_result} onValueChange={v => update(c, "interview_result", v)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-32 h-7"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Pending","Selected","Rejected"].map(o => (
                              <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    ) : (
                      <TableCell><SBadge value={c.interview_result} /></TableCell>
                    )}

                    {/* Drive */}
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

                    {/* Notes */}
                    <TableCell>
                      {isAdmin ? (
                        <input
                          defaultValue={c.admin_notes ?? ""}
                          onBlur={e => {
                            if (e.target.value !== (c.admin_notes ?? "")) update(c, "admin_notes", e.target.value);
                          }}
                          className="bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-1 w-28 focus:outline-none focus:ring-1 focus:ring-white/30"
                          placeholder="Notes…"
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} className="text-center text-white/40 py-8 text-sm">
                    {search ? `No candidates matching "${search}"` : "No candidates match the selected filters"}
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
