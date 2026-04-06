
// src/components/admin/AdminJobsTab.tsx
// Full CRUD for job_listings table. Drop this tab into AdminDashboard.

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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Loader2, Search } from "lucide-react";

interface Job {
  id: string;
  country: string;
  country_code: string;
  category: string;
  job_title: string;
  vacancies: number | null;
  gender: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_display: string;
  nationality: string;
  status: string;
  demand_level: string;
  last_updated: string | null;
}

const EMPTY_JOB: Omit<Job, "id"> = {
  country: "",
  country_code: "",
  category: "Construction",
  job_title: "",
  vacancies: null,
  gender: "Any",
  salary_min: null,
  salary_max: null,
  salary_currency: "EUR",
  salary_display: "",
  nationality: "South Asian (GCC)",
  status: "OPEN",
  demand_level: "NORMAL",
  last_updated: new Date().toISOString().slice(0, 10),
};

const CATEGORIES = [
  "Construction","Driver","Engineering","Entertainment","Factory",
  "Health","Hospitality","Logistics","Retail","Technical","Trade","Transport",
];
const COUNTRIES = [
  { name: "Albania", code: "AL" },
  { name: "Belarus", code: "BY" },
  { name: "Bulgaria", code: "BG" },
  { name: "Croatia", code: "HR" },
  { name: "Germany", code: "DE" },
  { name: "Ireland", code: "IR" },
  { name: "Latvia", code: "LV" },
  { name: "Romania", code: "RO" },
];

export default function AdminJobsTab() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCountry, setFilterCountry] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Job, "id"> & { id?: string }>(EMPTY_JOB);
  const [isEdit, setIsEdit] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("job_listings")
      .select("*")
      .order("country")
      .order("category");
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setJobs(data as Job[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const openAdd = () => {
    setForm(EMPTY_JOB);
    setIsEdit(false);
    setModalOpen(true);
  };

  const openEdit = (job: Job) => {
    setForm({ ...job });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.job_title || !form.country) {
      toast({ title: "Validation", description: "Job title and country are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...form };
    delete (payload as any).id;

    let error;
    if (isEdit && form.id) {
      ({ error } = await supabase.from("job_listings").update(payload).eq("id", form.id));
    } else {
      ({ error } = await supabase.from("job_listings").insert(payload));
    }
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "Job updated!" : "Job added!", description: form.job_title });
      setModalOpen(false);
      fetchJobs();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("job_listings").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job deleted" });
      setJobs(jobs.filter((j) => j.id !== deleteId));
    }
    setDeleteId(null);
  };

  const toggleStatus = async (job: Job) => {
    const newStatus = job.status === "OPEN" ? "CLOSED" : "OPEN";
    await supabase.from("job_listings").update({ status: newStatus }).eq("id", job.id);
    setJobs(jobs.map((j) => j.id === job.id ? { ...j, status: newStatus } : j));
  };

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.job_title.toLowerCase().includes(search.toLowerCase()) ||
      j.country.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || j.status === filterStatus;
    const matchCountry = filterCountry === "ALL" || j.country === filterCountry;
    return matchSearch && matchStatus && matchCountry;
  });

  const set = (key: keyof typeof form, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search jobs..."
              className="pl-8 bg-white/5 border-white/10 text-white w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="OPEN">OPEN</SelectItem>
              <SelectItem value="CLOSED">CLOSED</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Countries</SelectItem>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchJobs} className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={openAdd} className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]">
            <Plus className="w-4 h-4 mr-1" /> Add Job
          </Button>
        </div>
      </div>

      <p className="text-white/50 text-sm">{filtered.length} jobs shown</p>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/0">
                {["Country","Category","Job Title","Vacancies","Salary","Status","Demand","Actions"].map((h) => (
                  <TableHead key={h} className="text-white/60 text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white text-sm font-medium">
                    <span className="mr-1">{job.country_code}</span>
                    <span className="text-white/60">{job.country}</span>
                  </TableCell>
                  <TableCell className="text-white/70 text-sm">{job.category}</TableCell>
                  <TableCell className="text-white text-sm max-w-[200px] truncate">{job.job_title}</TableCell>
                  <TableCell className="text-white/70 text-sm text-center">{job.vacancies ?? "—"}</TableCell>
                  <TableCell className="text-white/70 text-sm">{job.salary_display || `${job.salary_min}–${job.salary_max} ${job.salary_currency}`}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleStatus(job)}>
                      <Badge className={job.status === "OPEN" ? "bg-green-500/20 text-green-400 border-green-500/30 cursor-pointer hover:bg-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer hover:bg-red-500/30"}>
                        {job.status}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge className={job.demand_level === "HIGH" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-white/10 text-white/60 border-white/20"}>
                      {job.demand_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(job)} className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(job.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-white/40 py-8">No jobs found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0d2137] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{isEdit ? "Edit Job" : "Add New Job"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Country */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Country</Label>
              <Select value={form.country} onValueChange={(v) => {
                const c = COUNTRIES.find(c => c.name === v);
                set("country", v);
                if (c) set("country_code", c.code);
              }}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Category */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Job Title */}
            <div className="col-span-2 space-y-1">
              <Label className="text-white/70 text-xs">Job Title *</Label>
              <Input className="bg-white/5 border-white/10 text-white" value={form.job_title}
                onChange={(e) => set("job_title", e.target.value)} placeholder="e.g. Truck Driver C/CE" />
            </div>
            {/* Vacancies */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Vacancies</Label>
              <Input type="number" className="bg-white/5 border-white/10 text-white"
                value={form.vacancies ?? ""}
                onChange={(e) => set("vacancies", e.target.value ? parseInt(e.target.value) : null)} />
            </div>
            {/* Gender */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Any","Male","Female","Male/Female"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Salary Min */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Salary Min</Label>
              <Input type="number" className="bg-white/5 border-white/10 text-white"
                value={form.salary_min ?? ""}
                onChange={(e) => set("salary_min", e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            {/* Salary Max */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Salary Max</Label>
              <Input type="number" className="bg-white/5 border-white/10 text-white"
                value={form.salary_max ?? ""}
                onChange={(e) => set("salary_max", e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            {/* Currency */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Currency</Label>
              <Select value={form.salary_currency} onValueChange={(v) => set("salary_currency", v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["EUR","USD","GBP"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Salary Display */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Salary Display (shown to users)</Label>
              <Input className="bg-white/5 border-white/10 text-white"
                value={form.salary_display}
                onChange={(e) => set("salary_display", e.target.value)}
                placeholder="e.g. €1,200–1,500 + OT" />
            </div>
            {/* Nationality */}
            <div className="col-span-2 space-y-1">
              <Label className="text-white/70 text-xs">Nationality Preference</Label>
              <Input className="bg-white/5 border-white/10 text-white"
                value={form.nationality}
                onChange={(e) => set("nationality", e.target.value)}
                placeholder="e.g. South Asian (GCC), Indian & Nepali" />
            </div>
            {/* Status */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">OPEN</SelectItem>
                  <SelectItem value="CLOSED">CLOSED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Demand Level */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Demand Level</Label>
              <Select value={form.demand_level} onValueChange={(v) => set("demand_level", v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="NORMAL">NORMAL</SelectItem>
                  <SelectItem value="LOW">LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Last Updated */}
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Last Updated</Label>
              <Input type="date" className="bg-white/5 border-white/10 text-white"
                value={form.last_updated ?? ""}
                onChange={(e) => set("last_updated", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : isEdit ? "Update Job" : "Add Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#0d2137] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Job?</DialogTitle>
          </DialogHeader>
          <p className="text-white/60">This action cannot be undone. The job listing will be permanently removed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
