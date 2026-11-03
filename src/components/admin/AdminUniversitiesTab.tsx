// src/components/admin/AdminUniversitiesTab.tsx
// Full CRUD for universities and university_programs tables.

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Loader2, Search, GraduationCap, BookOpen } from "lucide-react";

interface University {
  id: string;
  country: string;
  university_name: string;
  type: string | null;
  admission_fee: string | null;
  english_cert: string | null;
  admission_date: string | null;
  deadline: string | null;
  status: string;
  link: string | null;
  cgpa_requirement: string | null;
  fee_numeric: number | null;
  // WiseScore
  image_url?: string | null;
  wisescore_enabled?: boolean;
  wisescore_rank?: number | null;
  base_acceptance?: number | null;
  apply_email?: string | null;
}

interface Program {
  id: string;
  university_name: string;
  country: string;
  course_name: string;
  level: string | null;
  department: string | null;
  tuition_fee: string | null;
  status: string;
  link: string | null;
  admission_requirement: string | null;
  // WiseScore
  external_link?: string | null;
  internal_link?: string | null;
  base_acceptance?: number | null;
  university_id?: string | null;
}

const COUNTRIES_LIST = [
  "Italy","Australia","Germany","Belgium","USA","Austria","Malta","Georgia",
  "Greece","New Zealand","Croatia","Czech Republic","Denmark",
  "Finland","France","Hungary","Iceland","Kosovo","Latvia","Liechtenstein",
  "Lithuania","Luxembourg","Montenegro","Netherlands","Norway","Poland",
  "Portugal","Romania","Serbia","Slovakia","Slovenia","Spain","Sweden",
  "Switzerland","Ireland","United Kingdom","China","Canada","Singapore",
  "UAE","Japan","Cyprus","Bulgaria","Albania","India","Estonia",
];

const EMPTY_UNI: Omit<University, "id"> = {
  country: "",
  university_name: "",
  type: "Public",
  admission_fee: "",
  english_cert: "",
  admission_date: null,
  deadline: null,
  status: "OPEN",
  link: "",
  cgpa_requirement: "",
  fee_numeric: null,
  image_url: "",
  wisescore_enabled: true,
  wisescore_rank: null,
  base_acceptance: 60,
  apply_email: "",
};

const EMPTY_PROG: Omit<Program, "id"> = {
  university_name: "",
  country: "",
  course_name: "",
  level: "Masters",
  department: "",
  tuition_fee: "Free/TBD",
  status: "OPEN",
  link: "",
  admission_requirement: "",
  external_link: "",
  internal_link: "",
  base_acceptance: null,
};

// ── helpers (WiseScore additions) ───────────────────────────────────────────
const slugify = (t: string) => t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);
const toIntOrNull = (v: unknown) => { const n = parseInt(String(v ?? ""), 10); return isNaN(n) ? null : n; };

// PostgREST returns max 1000 rows per request; the dataset is larger (USA alone has 1,100+), so page through it.
async function fetchAll<T>(table: string, orderCols: string[]): Promise<{ rows: T[]; error: string | null }> {
  const rows: T[] = []; const SIZE = 1000;
  for (let from = 0; ; from += SIZE) {
    let q: any = supabase.from(table as any).select("*");
    orderCols.forEach(c => { q = q.order(c); });
    const { data, error } = await q.range(from, from + SIZE - 1);
    if (error) return { rows, error: error.message };
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < SIZE) break;
  }
  return { rows, error: null };
}

export default function AdminUniversitiesTab() {
  const { toast } = useToast();
  const [tab, setTab] = useState("universities");

  // Universities state
  const [unis, setUnis] = useState<University[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);
  const [uniSearch, setUniSearch] = useState("");
  const [uniCountry, setUniCountry] = useState("ALL");
  const [uniModal, setUniModal] = useState(false);
  const [uniForm, setUniForm] = useState<Omit<University,"id"> & { id?: string }>(EMPTY_UNI);
  const [uniEdit, setUniEdit] = useState(false);
  const [uniDeleteId, setUniDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Programs state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingProgs, setLoadingProgs] = useState(true);
  const [progSearch, setProgSearch] = useState("");
  const [progCountry, setProgCountry] = useState("ALL");
  const [progModal, setProgModal] = useState(false);
  const [progForm, setProgForm] = useState<Omit<Program,"id"> & { id?: string }>(EMPTY_PROG);
  const [progEdit, setProgEdit] = useState(false);
  const [progDeleteId, setProgDeleteId] = useState<string | null>(null);

  // Load universities
  const fetchUnis = async () => {
    setLoadingUnis(true);
    const { rows, error } = await fetchAll<University>("universities", ["country", "university_name"]);
    if (error) toast({ title: "Error", description: error, variant: "destructive" });
    else setUnis(rows);
    setLoadingUnis(false);
  };

  // Load programs
  const fetchProgs = async () => {
    setLoadingProgs(true);
    const { rows, error } = await fetchAll<Program>("university_programs", ["country", "university_name"]);
    if (error) toast({ title: "Error", description: error, variant: "destructive" });
    else setPrograms(rows);
    setLoadingProgs(false);
  };

  useEffect(() => { fetchUnis(); fetchProgs(); }, []);

  // University CRUD
  const saveUni = async () => {
    if (!uniForm.university_name || !uniForm.country) {
      toast({ title: "Required", description: "University name and country are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: any = { ...uniForm };
    delete payload.id;
    payload.image_url = emptyToNull(payload.image_url);
    payload.apply_email = emptyToNull(payload.apply_email);
    payload.wisescore_rank = toIntOrNull(payload.wisescore_rank);
    payload.base_acceptance = Math.min(99, Math.max(1, toIntOrNull(payload.base_acceptance) ?? 60));
    payload.wisescore_enabled = payload.wisescore_enabled !== false;
    let error;
    if (uniEdit && uniForm.id) {
      ({ error } = await supabase.from("universities").update(payload).eq("id", uniForm.id));
    } else {
      // New rows need a slug: public /universities/:slug pages are looked up by it.
      const base = slugify(`${uniForm.university_name}-${uniForm.country}`);
      payload.slug = base;
      let res: any = await supabase.from("universities").insert(payload);
      if (res.error?.code === "23505") { payload.slug = `${base}-${Math.random().toString(36).slice(2, 6)}`; res = await supabase.from("universities").insert(payload); }
      error = res.error;
    }
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: uniEdit ? "Updated!" : "Added!", description: uniForm.university_name });
      setUniModal(false);
      fetchUnis();
    }
  };

  const deleteUni = async () => {
    if (!uniDeleteId) return;
    await supabase.from("universities").delete().eq("id", uniDeleteId);
    setUnis(unis.filter(u => u.id !== uniDeleteId));
    setUniDeleteId(null);
    toast({ title: "Deleted" });
  };

  const toggleUniStatus = async (uni: University) => {
    const ns = uni.status === "OPEN" ? "CLOSED" : "OPEN";
    await supabase.from("universities").update({ status: ns }).eq("id", uni.id);
    setUnis(unis.map(u => u.id === uni.id ? { ...u, status: ns } : u));
  };

  // Program CRUD
  const saveProg = async () => {
    if (!progForm.course_name || !progForm.university_name) {
      toast({ title: "Required", description: "Course name and university are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: any = { ...progForm };
    delete payload.id;
    payload.external_link = emptyToNull(payload.external_link);
    payload.internal_link = emptyToNull(payload.internal_link);
    const b = toIntOrNull(payload.base_acceptance);
    payload.base_acceptance = b === null ? null : Math.min(99, Math.max(1, b));
    // link the program to its university row so WiseScore can match it by id
    const parent = unis.find(u => u.university_name === progForm.university_name && u.country === progForm.country);
    if (parent) payload.university_id = parent.id;
    let error;
    if (progEdit && progForm.id) {
      ({ error } = await supabase.from("university_programs").update(payload).eq("id", progForm.id));
    } else {
      const base = slugify(`${progForm.course_name}-${progForm.university_name}-${progForm.level ?? ""}`);
      payload.slug = base;
      let res: any = await supabase.from("university_programs").insert(payload);
      if (res.error?.code === "23505") { payload.slug = `${base}-${Math.random().toString(36).slice(2, 6)}`; res = await supabase.from("university_programs").insert(payload); }
      error = res.error;
    }
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: progEdit ? "Updated!" : "Added!", description: progForm.course_name });
      setProgModal(false);
      fetchProgs();
    }
  };

  const deleteProg = async () => {
    if (!progDeleteId) return;
    await supabase.from("university_programs").delete().eq("id", progDeleteId);
    setPrograms(programs.filter(p => p.id !== progDeleteId));
    setProgDeleteId(null);
    toast({ title: "Deleted" });
  };

  const toggleProgStatus = async (prog: Program) => {
    const ns = prog.status === "OPEN" ? "CLOSED" : "OPEN";
    await supabase.from("university_programs").update({ status: ns }).eq("id", prog.id);
    setPrograms(programs.map(p => p.id === prog.id ? { ...p, status: ns } : p));
  };

  const filteredUnis = unis.filter(u => {
    const ms = u.university_name.toLowerCase().includes(uniSearch.toLowerCase()) || u.country.toLowerCase().includes(uniSearch.toLowerCase());
    const mc = uniCountry === "ALL" || u.country === uniCountry;
    return ms && mc;
  });

  const filteredProgs = programs.filter(p => {
    const ms = p.course_name.toLowerCase().includes(progSearch.toLowerCase()) ||
      p.university_name.toLowerCase().includes(progSearch.toLowerCase()) ||
      (p.department ?? "").toLowerCase().includes(progSearch.toLowerCase());
    const mc = progCountry === "ALL" || p.country === progCountry;
    return ms && mc;
  });

  const setU = (key: string, val: any) => setUniForm(prev => ({ ...prev, [key]: val }));
  const setP = (key: string, val: any) => setProgForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="universities" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f]">
            <GraduationCap className="w-4 h-4 mr-2" /> Universities ({unis.length})
          </TabsTrigger>
          <TabsTrigger value="programs" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f]">
            <BookOpen className="w-4 h-4 mr-2" /> Programs ({programs.length})
          </TabsTrigger>
        </TabsList>

        {/* =================== UNIVERSITIES TAB =================== */}
        <TabsContent value="universities" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-white/40" />
                <Input placeholder="Search..." className="pl-8 bg-white/5 border-white/10 text-white w-48"
                  value={uniSearch} onChange={e => setUniSearch(e.target.value)} />
              </div>
              <Select value={uniCountry} onValueChange={setUniCountry}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Countries</SelectItem>
                  {COUNTRIES_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchUnis} className="border-white/20 text-white hover:bg-white/10">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button size="sm" onClick={() => { setUniForm(EMPTY_UNI); setUniEdit(false); setUniModal(true); }}
                className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]">
                <Plus className="w-4 h-4 mr-1" /> Add University
              </Button>
            </div>
          </div>

          <p className="text-white/50 text-sm">{filteredUnis.length} universities</p>

          {loadingUnis ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div> : (
            <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/0">
                    {["Country","University Name","Type","Admission Fee","Deadline","WS Rank","Base %","Status","Actions"].map(h => (
                      <TableHead key={h} className="text-white/60 text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnis.map(uni => (
                    <TableRow key={uni.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white/70 text-sm">{uni.country}</TableCell>
                      <TableCell className="text-white text-sm font-medium max-w-[200px] truncate">{uni.university_name}</TableCell>
                      <TableCell className="text-white/60 text-sm">{uni.type}</TableCell>
                      <TableCell className="text-white/60 text-sm">{uni.admission_fee}</TableCell>
                      <TableCell className="text-white/60 text-sm">{uni.deadline ? uni.deadline.slice(0, 10) : "—"}</TableCell>
                      <TableCell className="text-white/60 text-sm">{uni.wisescore_rank ?? "—"}</TableCell>
                      <TableCell className="text-white/60 text-sm">{uni.base_acceptance ?? "—"}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleUniStatus(uni)}>
                          <Badge className={uni.status === "OPEN" ? "bg-green-500/20 text-green-400 border-green-500/30 cursor-pointer" : "bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer"}>
                            {uni.status}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button onClick={() => { setUniForm({ ...uni }); setUniEdit(true); setUniModal(true); }} className="text-blue-400 hover:text-blue-300">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setUniDeleteId(uni.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUnis.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center text-white/40 py-8">No universities found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* University Modal */}
          <Dialog open={uniModal} onOpenChange={setUniModal}>
            <DialogContent className="bg-[#0d2137] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-white">{uniEdit ? "Edit University" : "Add University"}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Country *</Label>
                  <Select value={uniForm.country} onValueChange={v => setU("country", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{COUNTRIES_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Type</Label>
                  <Select value={uniForm.type ?? "Public"} onValueChange={v => setU("type", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Public","Private","State"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-white/70 text-xs">University Name *</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={uniForm.university_name}
                    onChange={e => setU("university_name", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Admission Fee</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={uniForm.admission_fee ?? ""}
                    onChange={e => setU("admission_fee", e.target.value)} placeholder="e.g. €50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">English Cert</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={uniForm.english_cert ?? ""}
                    onChange={e => setU("english_cert", e.target.value)} placeholder="IELTS / TOEFL" />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Admission Date</Label>
                  <Input type="date" className="bg-white/5 border-white/10 text-white" value={uniForm.admission_date ?? ""}
                    onChange={e => setU("admission_date", e.target.value || null)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Deadline</Label>
                  <Input type="date" className="bg-white/5 border-white/10 text-white" value={uniForm.deadline ?? ""}
                    onChange={e => setU("deadline", e.target.value || null)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">CGPA Requirement</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={uniForm.cgpa_requirement ?? ""}
                    onChange={e => setU("cgpa_requirement", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Status</Label>
                  <Select value={uniForm.status} onValueChange={v => setU("status", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="OPEN">OPEN</SelectItem><SelectItem value="CLOSED">CLOSED</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-white/70 text-xs">Application Link</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={uniForm.link ?? ""}
                    onChange={e => setU("link", e.target.value)} placeholder="https://" />
                </div>

                {/* ── WiseScore settings ── */}
                <div className="col-span-2 mt-2 border-t border-white/10 pt-3">
                  <p className="text-[#fbbf24] text-xs font-semibold uppercase tracking-wide">WiseScore recommendation settings</p>
                  <p className="text-white/40 text-xs">Per-demographic percentages are edited in the “WiseScore Engine” tab.</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Show in WiseScore results</Label>
                  <Select value={uniForm.wisescore_enabled === false ? "no" : "yes"} onValueChange={v => setU("wisescore_enabled", v === "yes")}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No (hidden)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Top-5 rank (1 = first, blank = unranked)</Label>
                  <Input type="number" min={1} className="bg-white/5 border-white/10 text-white" value={uniForm.wisescore_rank ?? ""}
                    onChange={e => setU("wisescore_rank", e.target.value === "" ? null : parseInt(e.target.value, 10))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Baseline acceptance % (1–99)</Label>
                  <Input type="number" min={1} max={99} className="bg-white/5 border-white/10 text-white" value={uniForm.base_acceptance ?? ""}
                    onChange={e => setU("base_acceptance", e.target.value === "" ? null : parseInt(e.target.value, 10))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Documents email (optional)</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={uniForm.apply_email ?? ""} placeholder="defaults to info@recruitlygroup.com"
                    onChange={e => setU("apply_email", e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-white/70 text-xs">Card photo URL (optional — otherwise auto-fetched from Wikipedia)</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={uniForm.image_url ?? ""} placeholder="https://…/campus.jpg"
                    onChange={e => setU("image_url", e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUniModal(false)} className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
                <Button onClick={saveUni} disabled={saving} className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : uniEdit ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!uniDeleteId} onOpenChange={() => setUniDeleteId(null)}>
            <DialogContent className="bg-[#0d2137] border-white/10 text-white">
              <DialogHeader><DialogTitle>Delete University?</DialogTitle></DialogHeader>
              <p className="text-white/60">This cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUniDeleteId(null)} className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
                <Button onClick={deleteUni} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* =================== PROGRAMS TAB =================== */}
        <TabsContent value="programs" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-white/40" />
                <Input placeholder="Search programs..." className="pl-8 bg-white/5 border-white/10 text-white w-48"
                  value={progSearch} onChange={e => setProgSearch(e.target.value)} />
              </div>
              <Select value={progCountry} onValueChange={setProgCountry}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Countries</SelectItem>
                  {COUNTRIES_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchProgs} className="border-white/20 text-white hover:bg-white/10">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button size="sm" onClick={() => { setProgForm(EMPTY_PROG); setProgEdit(false); setProgModal(true); }}
                className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]">
                <Plus className="w-4 h-4 mr-1" /> Add Program
              </Button>
            </div>
          </div>

          <p className="text-white/50 text-sm">{filteredProgs.length} programs</p>

          {loadingProgs ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div> : (
            <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/0">
                    {["Country","University","Course","Level","Dept","Tuition","Status","Actions"].map(h => (
                      <TableHead key={h} className="text-white/60 text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProgs.map(prog => (
                    <TableRow key={prog.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white/70 text-sm">{prog.country}</TableCell>
                      <TableCell className="text-white/60 text-sm max-w-[140px] truncate">{prog.university_name}</TableCell>
                      <TableCell className="text-white text-sm font-medium max-w-[180px] truncate">{prog.course_name}</TableCell>
                      <TableCell className="text-white/60 text-sm">{prog.level}</TableCell>
                      <TableCell className="text-white/60 text-sm max-w-[120px] truncate">{prog.department}</TableCell>
                      <TableCell className="text-white/60 text-sm">{prog.tuition_fee}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleProgStatus(prog)}>
                          <Badge className={prog.status === "OPEN" ? "bg-green-500/20 text-green-400 border-green-500/30 cursor-pointer" : "bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer"}>
                            {prog.status}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button onClick={() => { setProgForm({ ...prog }); setProgEdit(true); setProgModal(true); }} className="text-blue-400 hover:text-blue-300">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setProgDeleteId(prog.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProgs.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-white/40 py-8">No programs found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Program Modal */}
          <Dialog open={progModal} onOpenChange={setProgModal}>
            <DialogContent className="bg-[#0d2137] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-white">{progEdit ? "Edit Program" : "Add Program"}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Country *</Label>
                  <Select value={progForm.country} onValueChange={v => setP("country", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{COUNTRIES_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Level</Label>
                  <Select value={progForm.level ?? "Masters"} onValueChange={v => setP("level", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Bachelors","Masters","PhD","Diploma","Certificate"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-white/70 text-xs">University Name *</Label>
                  <Input list="ws-uni-names" className="bg-white/5 border-white/10 text-white" value={progForm.university_name}
                    onChange={e => setP("university_name", e.target.value)} placeholder="Start typing to pick an existing university" />
                  <datalist id="ws-uni-names">
                    {unis.filter(u => !progForm.country || u.country === progForm.country).slice(0, 400).map(u => <option key={u.id} value={u.university_name} />)}
                  </datalist>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-white/70 text-xs">Course Name *</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={progForm.course_name}
                    onChange={e => setP("course_name", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Department</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={progForm.department ?? ""}
                    onChange={e => setP("department", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Tuition Fee</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={progForm.tuition_fee ?? ""}
                    onChange={e => setP("tuition_fee", e.target.value)} placeholder="Free/TBD or €5,000/yr" />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Status</Label>
                  <Select value={progForm.status} onValueChange={v => setP("status", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="OPEN">OPEN</SelectItem><SelectItem value="CLOSED">CLOSED</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Program Link</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={progForm.link ?? ""}
                    onChange={e => setP("link", e.target.value)} placeholder="https://" />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">External link (official / partner page)</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={progForm.external_link ?? ""} placeholder="https://"
                    onChange={e => setP("external_link", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Internal link (on this site)</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={progForm.internal_link ?? ""} placeholder="/programs/your-program"
                    onChange={e => setP("internal_link", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Baseline acceptance % (blank = use university)</Label>
                  <Input type="number" min={1} max={99} className="bg-white/5 border-white/10 text-white" value={progForm.base_acceptance ?? ""}
                    onChange={e => setP("base_acceptance", e.target.value === "" ? null : parseInt(e.target.value, 10))} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-white/70 text-xs">Admission Requirement</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={progForm.admission_requirement ?? ""}
                    onChange={e => setP("admission_requirement", e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProgModal(false)} className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
                <Button onClick={saveProg} disabled={saving} className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : progEdit ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!progDeleteId} onOpenChange={() => setProgDeleteId(null)}>
            <DialogContent className="bg-[#0d2137] border-white/10 text-white">
              <DialogHeader><DialogTitle>Delete Program?</DialogTitle></DialogHeader>
              <p className="text-white/60">This cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProgDeleteId(null)} className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
                <Button onClick={deleteProg} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

