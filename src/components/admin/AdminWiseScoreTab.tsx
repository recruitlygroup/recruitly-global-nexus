/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/AdminWiseScoreTab.tsx
// Admin control of the WiseScore engine:
//   1. Demographics — nationality groups, the "no English test" score penalty (extracted from the old hard-coded rule) and acceptance adjustment
//   2. Acceptance   — per-country Top-5 order, baseline % and per-demographic % for universities AND their programs
// Universities / programs themselves (add, links, photos) are managed in the "Universities" tab.

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Plus, Search, SlidersHorizontal, Trash2, Users } from "lucide-react";
import { DESTINATIONS, NATIONALITIES } from "@/components/wisescore/options";
import { computeChance } from "@/components/wisescore/engine";

const db = supabase as unknown as SupabaseClient;
const field = "bg-white/5 border-white/10 text-white";
const amber = "bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]";
const outline = "border-white/20 text-white hover:bg-white/10";

interface Demographic { id: string; label: string; nationalities: string[]; no_english_penalty: number; acceptance_adjust: number; is_default: boolean; is_active: boolean; sort_order: number }
const EMPTY_DEMO: Omit<Demographic, "id"> = { label: "", nationalities: [], no_english_penalty: 0, acceptance_adjust: 0, is_default: false, is_active: true, sort_order: 10 };

const clampPct = (n: number) => Math.min(99, Math.max(1, n));
const numOrNull = (v: string) => { const n = parseInt(v, 10); return isNaN(n) ? null : clampPct(n); };

/* ─────────────────────────── Demographics ─────────────────────────── */
function DemographicsPanel({ demos, reload }: { demos: Demographic[]; reload: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Demographic, "id"> & { id?: string }>(EMPTY_DEMO);
  const [natText, setNatText] = useState("");
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const parsed = useMemo(() => natText.split(/[,\n]/).map(s => s.trim()).filter(Boolean), [natText]);
  const unknown = parsed.filter(n => !NATIONALITIES.includes(n));

  const edit = (d?: Demographic) => { const f = d ? { ...d } : { ...EMPTY_DEMO }; setForm(f); setNatText(f.nationalities.join(", ")); setOpen(true); };

  const save = async () => {
    if (!form.label.trim()) { toast({ title: "Label required", variant: "destructive" }); return; }
    setSaving(true);
    const payload: any = {
      label: form.label.trim(), nationalities: parsed, is_active: form.is_active, sort_order: form.sort_order,
      no_english_penalty: Math.max(0, Math.min(50, Number(form.no_english_penalty) || 0)),
      acceptance_adjust: Math.max(-50, Math.min(50, Number(form.acceptance_adjust) || 0)),
      is_default: form.is_default, updated_at: new Date().toISOString(),
    };
    try {
      // only one default group is allowed (unique index) → clear the others first
      if (payload.is_default) await db.from("wisescore_demographics").update({ is_default: false }).neq("id", form.id ?? "00000000-0000-0000-0000-000000000000");
      const { error } = form.id ? await db.from("wisescore_demographics").update(payload).eq("id", form.id) : await db.from("wisescore_demographics").insert(payload);
      if (error) throw error;
      toast({ title: "Saved", description: payload.label }); setOpen(false); reload();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setSaving(false);
  };

  const remove = async () => {
    if (!delId) return;
    const { error } = await db.from("wisescore_demographics").delete().eq("id", delId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" }); else { toast({ title: "Deleted" }); reload(); }
    setDelId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-white/60">
          A demographic is a group of nationalities that share the same rules. A student is matched by nationality; anyone not listed falls into the
          <b className="text-white"> default</b> group. <b className="text-white">No-English penalty</b> removes points from the WiseScore (and shows the visa-risk warning) when a student has no English test.
          <b className="text-white"> Acceptance adjust</b> adds/subtracts percentage points to every university's baseline for that group.
        </p>
        <Button size="sm" className={amber} onClick={() => edit()}><Plus className="mr-1 h-4 w-4" /> Add demographic</Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <Table>
          <TableHeader><TableRow className="border-white/10 hover:bg-white/0">
            {["Group", "Nationalities", "No-English penalty", "Acceptance adjust", "Status", ""].map(h => <TableHead key={h} className="text-xs text-white/60">{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {demos.map(d => (
              <TableRow key={d.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="text-sm font-medium text-white">{d.label}{d.is_default && <Badge className="ml-2 border-blue-500/30 bg-blue-500/20 text-blue-300">default</Badge>}</TableCell>
                <TableCell className="max-w-[320px] truncate text-sm text-white/60">{d.is_default && !d.nationalities.length ? "Everyone not listed in another group" : d.nationalities.join(", ") || "—"}</TableCell>
                <TableCell className="text-sm text-white/70">−{d.no_english_penalty} pts</TableCell>
                <TableCell className="text-sm text-white/70">{d.acceptance_adjust > 0 ? "+" : ""}{d.acceptance_adjust} pp</TableCell>
                <TableCell><Badge className={d.is_active ? "border-green-500/30 bg-green-500/20 text-green-400" : "border-red-500/30 bg-red-500/20 text-red-400"}>{d.is_active ? "Active" : "Off"}</Badge></TableCell>
                <TableCell><div className="flex gap-2">
                  <button onClick={() => edit(d)} className="text-blue-400 hover:text-blue-300" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  {!d.is_default && <button onClick={() => setDelId(d.id)} className="text-red-400 hover:text-red-300" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>}
                </div></TableCell>
              </TableRow>
            ))}
            {!demos.length && <TableRow><TableCell colSpan={6} className="py-8 text-center text-white/40">No demographics yet — run the WiseScore migration, or add one.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-white/10 bg-[#0d2137] text-white">
          <DialogHeader><DialogTitle>{form.id ? "Edit demographic" : "Add demographic"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1"><Label className="text-xs text-white/70">Group label *</Label><Input className={field} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-white/70">Nationalities (comma separated, exactly as in the form)</Label>
              <Textarea className={field} rows={3} value={natText} onChange={e => setNatText(e.target.value)} placeholder="Indian, Nepalese, Pakistani" />
              {unknown.length > 0 && <p className="text-xs text-orange-300">Not in the form's list (will never match): {unknown.join(", ")}</p>}
            </div>
            <div className="space-y-1"><Label className="text-xs text-white/70">No-English-test score penalty (0–50 pts)</Label>
              <Input type="number" className={field} value={form.no_english_penalty} onChange={e => setForm(f => ({ ...f, no_english_penalty: parseInt(e.target.value, 10) || 0 }))} /></div>
            <div className="space-y-1"><Label className="text-xs text-white/70">Acceptance adjust (−50…+50 pp)</Label>
              <Input type="number" className={field} value={form.acceptance_adjust} onChange={e => setForm(f => ({ ...f, acceptance_adjust: parseInt(e.target.value, 10) || 0 }))} /></div>
            <div className="space-y-1"><Label className="text-xs text-white/70">Default group (fallback)</Label>
              <Select value={form.is_default ? "yes" : "no"} onValueChange={v => setForm(f => ({ ...f, is_default: v === "yes" }))}><SelectTrigger className={field}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs text-white/70">Status</Label>
              <Select value={form.is_active ? "on" : "off"} onValueChange={v => setForm(f => ({ ...f, is_active: v === "on" }))}><SelectTrigger className={field}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="on">Active</SelectItem><SelectItem value="off">Off</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className={outline} onClick={() => setOpen(false)}>Cancel</Button>
            <Button className={amber} disabled={saving} onClick={save}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!delId} onOpenChange={() => setDelId(null)}>
        <DialogContent className="border-white/10 bg-[#0d2137] text-white">
          <DialogHeader><DialogTitle>Delete demographic?</DialogTitle></DialogHeader>
          <p className="text-white/60">All per-university percentages set for this group are deleted too.</p>
          <DialogFooter><Button variant="outline" className={outline} onClick={() => setDelId(null)}>Cancel</Button><Button className="bg-red-600 text-white hover:bg-red-700" onClick={remove}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────────────────── Acceptance by university ─────────────────────── */
interface Uni { id: string; university_name: string; country: string; wisescore_rank: number | null; base_acceptance: number; wisescore_enabled: boolean; image_url: string | null; apply_email: string | null }
interface Prog { id: string; course_name: string; level: string | null; base_acceptance: number | null }
interface Override { id: string; university_id: string; program_id: string | null; demographic_id: string; acceptance_pct: number }

function TuneDialog({ uni, demos, onClose, onSaved }: { uni: Uni; demos: Demographic[]; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const active = demos.filter(d => d.is_active);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progs, setProgs] = useState<Prog[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [meta, setMeta] = useState({ rank: uni.wisescore_rank?.toString() ?? "", enabled: uni.wisescore_enabled, image: uni.image_url ?? "", email: uni.apply_email ?? "" });
  const [pq, setPq] = useState("");

  useEffect(() => {
    (async () => {
      const [a, b, o] = await Promise.all([
        db.from("university_programs").select("id,course_name,level,base_acceptance").eq("university_id", uni.id).limit(300),
        db.from("university_programs").select("id,course_name,level,base_acceptance").eq("country", uni.country).eq("university_name", uni.university_name).limit(300),
        db.from("wisescore_acceptance_overrides").select("*").eq("university_id", uni.id),
      ]);
      const merged = new Map<string, Prog>(); [...(a.data ?? []), ...(b.data ?? [])].forEach((p: any) => merged.set(p.id, p));
      const plist = [...merged.values()].sort((x, y) => x.course_name.localeCompare(y.course_name));
      const ov = (o.data ?? []) as Override[];
      const v: Record<string, string> = { "u:base": String(uni.base_acceptance) };
      plist.forEach(p => { v[`p:${p.id}:base`] = p.base_acceptance?.toString() ?? ""; });
      ov.forEach(r => { v[`${r.program_id ? `p:${r.program_id}` : "u"}:${r.demographic_id}`] = String(r.acceptance_pct); });
      setProgs(plist); setOverrides(ov); setVals(v); setLoading(false);
    })();
  }, [uni]);

  const setV = (k: string, v: string) => setVals(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const uBase = numOrNull(vals["u:base"] ?? "") ?? 60;
      const { error: ue } = await db.from("universities").update({
        base_acceptance: uBase, wisescore_enabled: meta.enabled, wisescore_rank: meta.rank === "" ? null : parseInt(meta.rank, 10) || null,
        image_url: meta.image.trim() || null, apply_email: meta.email.trim() || null,
      }).eq("id", uni.id);
      if (ue) throw ue;

      for (const p of progs) {
        const nv = numOrNull(vals[`p:${p.id}:base`] ?? "");
        if (nv !== p.base_acceptance) { const { error } = await db.from("university_programs").update({ base_acceptance: nv }).eq("id", p.id); if (error) throw error; }
      }
      // demographic overrides: blank → delete, number → update/insert (partial unique indexes → no upsert)
      const targets: { programId: string | null; key: string }[] = [{ programId: null, key: "u" }, ...progs.map(p => ({ programId: p.id, key: `p:${p.id}` }))];
      for (const t of targets) for (const d of active) {
        const nv = numOrNull(vals[`${t.key}:${d.id}`] ?? "");
        const ex = overrides.find(o => o.demographic_id === d.id && (o.program_id ?? null) === t.programId);
        if (nv === null && ex) { const { error } = await db.from("wisescore_acceptance_overrides").delete().eq("id", ex.id); if (error) throw error; }
        else if (nv !== null && ex && ex.acceptance_pct !== nv) { const { error } = await db.from("wisescore_acceptance_overrides").update({ acceptance_pct: nv, updated_at: new Date().toISOString() }).eq("id", ex.id); if (error) throw error; }
        else if (nv !== null && !ex) { const { error } = await db.from("wisescore_acceptance_overrides").insert({ university_id: uni.id, program_id: t.programId, demographic_id: d.id, acceptance_pct: nv }); if (error) throw error; }
      }
      toast({ title: "Saved", description: uni.university_name }); onSaved(); onClose();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setSaving(false);
  };

  const shownProgs = progs.filter(p => p.course_name.toLowerCase().includes(pq.toLowerCase())).slice(0, 150);
  const cell = (k: string, ph: string) => <Input type="number" min={1} max={99} placeholder={ph} className={`${field} h-8 w-20`} value={vals[k] ?? ""} onChange={e => setV(k, e.target.value)} />;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-white/10 bg-[#0d2137] text-white">
        <DialogHeader><DialogTitle>{uni.university_name} <span className="text-sm font-normal text-white/50">· {uni.country}</span></DialogTitle></DialogHeader>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#fbbf24]" /></div> : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1"><Label className="text-xs text-white/70">Top-5 rank</Label><Input type="number" min={1} className={field} value={meta.rank} onChange={e => setMeta(m => ({ ...m, rank: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs text-white/70">Show in results</Label>
                <Select value={meta.enabled ? "yes" : "no"} onValueChange={v => setMeta(m => ({ ...m, enabled: v === "yes" }))}><SelectTrigger className={field}><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">Hidden</SelectItem></SelectContent></Select></div>
              <div className="space-y-1 sm:col-span-2"><Label className="text-xs text-white/70">Documents email</Label><Input className={field} value={meta.email} onChange={e => setMeta(m => ({ ...m, email: e.target.value }))} placeholder="info@recruitlygroup.com" /></div>
              <div className="space-y-1 sm:col-span-4"><Label className="text-xs text-white/70">Card photo URL</Label><Input className={field} value={meta.image} onChange={e => setMeta(m => ({ ...m, image: e.target.value }))} placeholder="https://…" /></div>
            </div>

            <p className="text-xs text-white/50">Leave a box blank to inherit. <b className="text-white/80">Baseline</b> = chance for an average profile. A <b className="text-white/80">demographic %</b> replaces the baseline for students in that group. The student's own WiseScore then moves the result up or down (±0.4 pts per score point away from 60).</p>

            <div className="overflow-x-auto rounded-lg border border-white/10">
              <Table>
                <TableHeader><TableRow className="border-white/10 hover:bg-white/0">
                  <TableHead className="text-xs text-white/60">University / program</TableHead>
                  <TableHead className="text-xs text-white/60">Baseline %</TableHead>
                  {active.map(d => <TableHead key={d.id} className="text-xs text-white/60">{d.label} %</TableHead>)}
                </TableRow></TableHeader>
                <TableBody>
                  <TableRow className="border-white/10 bg-white/[0.04]">
                    <TableCell className="text-sm font-semibold text-[#fbbf24]">Whole university</TableCell>
                    <TableCell>{cell("u:base", "60")}</TableCell>
                    {active.map(d => <TableCell key={d.id}>{cell(`u:${d.id}`, "—")}</TableCell>)}
                  </TableRow>
                  {shownProgs.map(p => (
                    <TableRow key={p.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="max-w-[260px] truncate text-sm text-white/80" title={p.course_name}>{p.course_name}{p.level ? <span className="text-white/40"> · {p.level}</span> : null}</TableCell>
                      <TableCell>{cell(`p:${p.id}:base`, "inherit")}</TableCell>
                      {active.map(d => <TableCell key={d.id}>{cell(`p:${p.id}:${d.id}`, "—")}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {progs.length > 8 && <div className="relative max-w-xs"><Search className="absolute left-2 top-2.5 h-4 w-4 text-white/40" /><Input className={`${field} pl-8`} placeholder="Filter programs…" value={pq} onChange={e => setPq(e.target.value)} /></div>}
            {!progs.length && <p className="text-sm text-white/40">No programs recorded for this university yet — add them in the Universities tab → Programs.</p>}

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
              <p className="mb-1 font-semibold text-white">Live preview — what students see (whole university)</p>
              {active.map(d => {
                const ov = numOrNull(vals[`u:${d.id}`] ?? ""); const base = numOrNull(vals["u:base"] ?? "") ?? 60;
                return <p key={d.id} className="text-white/70"><span className="text-white">{d.label}:</span> {[60, 75, 90].map(s => `WiseScore ${s} → ${computeChance({ score: s, base, demographicAdjust: d.acceptance_adjust, override: ov })}%`).join("  ·  ")}</p>;
              })}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" className={outline} onClick={onClose}>Cancel</Button>
          <Button className={amber} disabled={saving || loading} onClick={save}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AcceptancePanel({ demos }: { demos: Demographic[] }) {
  const { toast } = useToast();
  const [country, setCountry] = useState("Italy");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Uni[]>([]);
  const [loading, setLoading] = useState(true);
  const [tune, setTune] = useState<Uni | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = db.from("universities").select("id,university_name,country,wisescore_rank,base_acceptance,wisescore_enabled,image_url,apply_email").eq("country", country)
      .order("wisescore_rank", { ascending: true, nullsFirst: false }).order("university_name").limit(100);
    if (q.trim()) query = query.ilike("university_name", `%${q.trim().replace(/[%_,()]/g, " ")}%`);
    const { data, error } = await query;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" }); else setRows((data ?? []) as Uni[]);
    setLoading(false);
  }, [country, q, toast]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={country} onValueChange={setCountry}><SelectTrigger className={`${field} w-48`}><SelectValue /></SelectTrigger>
          <SelectContent>{DESTINATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent></Select>
        <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-white/40" /><Input className={`${field} w-56 pl-8`} placeholder="Search university…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <p className="text-sm text-white/50">Ranked 1–5 appear as the student's Top 5 · unranked ones fill any gaps.</p>
      </div>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-[#fbbf24]" /></div> : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <Table>
            <TableHeader><TableRow className="border-white/10 hover:bg-white/0">{["Rank", "University", "Baseline %", "In results", ""].map(h => <TableHead key={h} className="text-xs text-white/60">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {rows.map(u => (
                <TableRow key={u.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-sm text-white/80">{u.wisescore_rank ?? "—"}</TableCell>
                  <TableCell className="max-w-[340px] truncate text-sm font-medium text-white">{u.university_name}</TableCell>
                  <TableCell className="text-sm text-white/70">{u.base_acceptance}%</TableCell>
                  <TableCell><Badge className={u.wisescore_enabled ? "border-green-500/30 bg-green-500/20 text-green-400" : "border-red-500/30 bg-red-500/20 text-red-400"}>{u.wisescore_enabled ? "Yes" : "Hidden"}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline" className={outline} onClick={() => setTune(u)}><SlidersHorizontal className="mr-1 h-4 w-4" /> Tune</Button></TableCell>
                </TableRow>
              ))}
              {!rows.length && <TableRow><TableCell colSpan={5} className="py-8 text-center text-white/40">No universities found for {country}. Add one in the Universities tab.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}
      {tune && <TuneDialog uni={tune} demos={demos} onClose={() => setTune(null)} onSaved={load} />}
    </div>
  );
}

/* ─────────────────────────────── Shell ─────────────────────────────── */
export default function AdminWiseScoreTab() {
  const { toast } = useToast();
  const [demos, setDemos] = useState<Demographic[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const { data, error } = await db.from("wisescore_demographics").select("*").order("sort_order");
    if (error) toast({ title: "Could not load demographics", description: error.message, variant: "destructive" }); else setDemos((data ?? []) as Demographic[]);
    setLoading(false);
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#fbbf24]" /></div>;
  return (
    <Tabs defaultValue="acceptance" className="space-y-4">
      <TabsList className="border border-white/10 bg-white/5">
        <TabsTrigger value="acceptance" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f]"><SlidersHorizontal className="mr-2 h-4 w-4" /> Acceptance by university</TabsTrigger>
        <TabsTrigger value="demographics" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f]"><Users className="mr-2 h-4 w-4" /> Demographics</TabsTrigger>
      </TabsList>
      <TabsContent value="acceptance"><AcceptancePanel demos={demos} /></TabsContent>
      <TabsContent value="demographics"><DemographicsPanel demos={demos} reload={load} /></TabsContent>
    </Tabs>
  );
}
