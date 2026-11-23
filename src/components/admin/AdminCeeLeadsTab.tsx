// Admin inbox for CEE predictor leads: newest first, "seat booking requested" highlighted, one-tap WhatsApp/call,
// status tracking (new → contacted → converted/archived) and internal notes. Data via the admin-actions edge function.
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Download, Loader2, MessageCircle, Phone, RefreshCw, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LeadRow {
  id: string; created_at: string; full_name: string | null; email: string | null; phone: string | null; status: string | null;
  metadata: Record<string, unknown> | null;
}
interface Lead {
  row: LeadRow; hot: boolean; notes: { at: string; by: string; text: string }[];
}

const STATUSES = ["new", "contacted", "converted", "archived"] as const;
type Filter = "all" | "new" | "hot" | "converted";
const TIER_DOT: Record<string, string> = { high: "🟢", borderline: "🟡", low: "🔴" };
const m = (r: LeadRow, k: string) => (r.metadata ? r.metadata[k] : undefined);

/** Merge legacy duplicate rows (direct-insert fallback created a second row for seat booking, linked by lead_id). */
function mergeLeads(rows: LeadRow[]): Lead[] {
  const hotIds = new Set(rows.filter((r) => m(r, "seat_booking_requested") === true).map((r) => String(m(r, "lead_id"))));
  const seen = new Set<string>();
  const out: Lead[] = [];
  for (const r of rows) {
    const lid = String(m(r, "lead_id") ?? r.id);
    const isHotDup = m(r, "seat_booking_requested") === true && rows.some((o) => o !== r && String(m(o, "lead_id")) === lid && m(o, "seat_booking_requested") !== true);
    if (isHotDup || seen.has(r.id)) continue;
    seen.add(r.id);
    const notes = Array.isArray(m(r, "notes")) ? (m(r, "notes") as Lead["notes"]) : [];
    out.push({ row: r, hot: hotIds.has(lid), notes });
  }
  return out;
}

const AdminCeeLeadsTab = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-actions", { body: { action: "get_cee_leads" } });
      if (error) throw error;
      setRows((data?.leads ?? []) as LeadRow[]);
    } catch {
      toast({ title: "Error", description: "Failed to load CEE leads", variant: "destructive" });
    } finally { setLoading(false); setRefreshing(false); }
  }, [toast]);
  useEffect(() => { void load(); }, [load]);

  const leads = useMemo(() => mergeLeads(rows), [rows]);
  const shown = leads.filter((l) =>
    filter === "all" ? true : filter === "hot" ? l.hot : filter === "new" ? (l.row.status ?? "new") === "new" : l.row.status === "converted");
  const counts = { all: leads.length, new: leads.filter((l) => (l.row.status ?? "new") === "new").length, hot: leads.filter((l) => l.hot).length, converted: leads.filter((l) => l.row.status === "converted").length };

  const update = async (id: string, patch: { status?: string; note?: string }) => {
    try {
      const { error } = await supabase.functions.invoke("admin-actions", { body: { action: "update_cee_lead", lead_row_id: id, ...patch } });
      if (error) throw error;
      toast({ title: "Saved" });
      if (patch.note) setNoteDraft((d) => ({ ...d, [id]: "" }));
      await load();
    } catch { toast({ title: "Error", description: "Could not update lead", variant: "destructive" }); }
  };

  const exportCSV = () => {
    const head = ["created_at", "name", "phone", "email", "program", "rank", "score", "tier", "category", "budget", "district", "guardian", "seat_booking", "status"];
    const lines = shown.map((l) => [l.row.created_at, l.row.full_name, l.row.phone, l.row.email, m(l.row, "program"), m(l.row, "cee_rank"), m(l.row, "cee_score"),
      m(l.row, "nepal_probability_tier"), m(l.row, "category"), m(l.row, "budget"), m(l.row, "district"), m(l.row, "guardian_whatsapp"), l.hot, l.row.status ?? "new"]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const url = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `cee_leads_${format(new Date(), "yyyy-MM-dd")}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-white flex items-center gap-2">CEE Leads <span className="text-sm font-normal text-white/50">({counts.all})</span></CardTitle>
        <div className="flex gap-2">
          <Button onClick={exportCSV} size="sm" className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
          <Button onClick={load} variant="outline" size="sm" disabled={refreshing} className="border-white/20 text-white hover:bg-white/10"><RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {([["all", "All"], ["new", "New"], ["hot", "🔥 Seat booking"], ["converted", "Converted"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${filter === k ? "bg-[#fbbf24] text-[#0a192f] border-[#fbbf24]" : "text-white/70 border-white/20 hover:bg-white/10"}`}>
              {label} ({counts[k]})
            </button>
          ))}
        </div>

        {shown.length === 0 ? <p className="text-white/60 text-center py-10">No leads in this view.</p> : (
          <div className="space-y-3">
            {shown.map((l) => {
              const r = l.row; const tier = String(m(r, "nepal_probability_tier") ?? "");
              const wa = `https://wa.me/977${r.phone ?? ""}`;
              return (
                <div key={r.id} className={`rounded-lg border p-4 text-white ${l.hot ? "border-orange-400/60 bg-orange-500/10" : "border-white/10 bg-white/5"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold flex items-center gap-2">{l.hot && <Flame className="w-4 h-4 text-orange-400" aria-label="Seat booking requested" />}{r.full_name}</p>
                      <p className="text-xs text-white/50">{format(new Date(r.created_at), "MMM d, yyyy HH:mm")} · {r.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-green-600 hover:bg-green-500 px-3 py-1.5 text-xs font-bold"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
                      <a href={`tel:+977${r.phone ?? ""}`} className="inline-flex items-center gap-1 rounded-md border border-white/20 hover:bg-white/10 px-3 py-1.5 text-xs font-bold"><Phone className="w-3.5 h-3.5" /> Call</a>
                      <select aria-label="Status" value={r.status ?? "new"} onChange={(e) => update(r.id, { status: e.target.value })} className="rounded-md bg-[#0a192f] border border-white/20 px-2 py-1.5 text-xs">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-white/80">
                    {String(m(r, "program") ?? "")} · rank {String(m(r, "cee_rank") ?? "n/a")} · score {String(m(r, "cee_score") ?? "n/a")} {TIER_DOT[tier] ?? ""} · {String(m(r, "category") ?? "")} · {String(m(r, "budget") ?? "")}
                    {m(r, "district") ? ` · ${String(m(r, "district"))}` : ""}{m(r, "guardian_whatsapp") ? ` · Guardian ${String(m(r, "guardian_whatsapp"))}` : ""}
                  </p>
                  {l.notes.length > 0 && <ul className="mt-2 space-y-1 text-xs text-white/70">{l.notes.map((n) => <li key={n.at}>{format(new Date(n.at), "MMM d HH:mm")} · {n.by}: {n.text}</li>)}</ul>}
                  <div className="mt-2 flex gap-2">
                    <input value={noteDraft[r.id] ?? ""} onChange={(e) => setNoteDraft((d) => ({ ...d, [r.id]: e.target.value }))} placeholder="Add a note (e.g. called, parents want Bangalore)"
                      className="flex-1 rounded-md bg-[#0a192f] border border-white/20 px-3 py-1.5 text-xs placeholder:text-white/30" />
                    <Button size="sm" variant="outline" disabled={!(noteDraft[r.id] ?? "").trim()} onClick={() => update(r.id, { note: noteDraft[r.id] })} className="border-white/20 text-white hover:bg-white/10">Save</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCeeLeadsTab;
