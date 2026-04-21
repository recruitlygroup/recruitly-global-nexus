import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Loader2, RefreshCw, LogOut,
  Briefcase, FileText, FolderOpen, Inbox, Users, CheckCheck,
  TrendingUp, FileCheck, Search, Pencil, Trash2, Download,
  ExternalLink, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NotificationBell from "@/components/shared/NotificationBell";

// ── Types ──────────────────────────────────────────────────────────────────
interface JobListing { id:string; job_title:string; country:string|null; remaining_vacancies:number|null; }
interface Candidate {
  id:string; full_name:string; trade:string|null; passport_number:string|null;
  passport_expiry_date:string|null; target_country:string|null;
  date_of_birth:string|null; marital_status:string|null; nationality:string|null;
  passport_issue_date:string|null; job_listing_id:string|null;
  interview_availability:string; interview_type:string|null;
  pcc_status:string; slc_status:string|null;
  work_permit_status:string; visa_status:string; interview_result:string;
  drive_folder_url:string|null; drive_document_url:string|null;
  invoice_number:string|null; invoice_amount:number|null; created_at:string;
}
interface BroadcastMsg { id:string; subject:string; body:string; sent_at:string; }

// ── Status badge ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string,string> = {
  Available:               "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Not Available":         "bg-red-50 text-red-700 border border-red-200",
  "Not Responded":         "bg-gray-100 text-gray-500 border border-gray-200",
  Pending:                 "bg-amber-50 text-amber-700 border border-amber-200",
  Apostilled:              "bg-blue-50 text-blue-700 border border-blue-200",
  "Dispatched to Admin":   "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Received:                "bg-emerald-100 text-emerald-800 border border-emerald-300",
  "Dispatched to Recruiter":"bg-emerald-50 text-emerald-700 border border-emerald-200",
  Selected:                "bg-emerald-100 text-emerald-800 border border-emerald-300",
  Rejected:                "bg-red-50 text-red-700 border border-red-200",
};
function SBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[value] ?? "bg-gray-100 text-gray-500 border border-gray-200"}`}>
      {value}
    </span>
  );
}

const AVAIL_OPTIONS   = ["Available","Not Available","Not Responded"];
const PCC_SLC_OPTIONS = ["Pending","Apostilled","Dispatched to Admin"];
const INTERVIEW_TYPES = ["Online","Physical","Zoom","Client Direct","Embassy","Skype","Teams"];
const lbl = "block text-xs font-medium text-gray-600 mb-1";

// ── Drive Upload Link ────────────────────────────────────────────────────────
const DRIVE_UPLOAD_URL = "https://drive.google.com/drive/folders/1wP9qTwiwCq7flVaEGicEwHmT51JLE3bd?usp=sharing";

// ── AddCandidateForm ────────────────────────────────────────────────────────
function AddCandidateForm({ recruiterId, jobs, onClose, onAdded }: {
  recruiterId:string; jobs:JobListing[]; onClose:()=>void; onAdded:()=>void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    full_name:"", date_of_birth:"", marital_status:"", job_listing_id:"",
    trade:"", target_country:"", passport_number:"", nationality:"",
    passport_issue_date:"", passport_expiry_date:"", interview_type:"",
  });
  const [submitting, setSubmitting] = useState(false);

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleJobChange = (id: string) => {
    const job = jobs.find(j => j.id === id);
    setForm(f => ({ ...f, job_listing_id:id, trade:job?.job_title ?? f.trade, target_country:job?.country ?? f.target_country }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast({ title:"Full name required", variant:"destructive" }); return; }
    setSubmitting(true);
    const { error } = await (supabase.from("candidates") as any).insert([{
      recruiter_id:    recruiterId,
      full_name:       form.full_name.trim(),
      date_of_birth:   form.date_of_birth || null,
      marital_status:  form.marital_status || null,
      job_listing_id:  form.job_listing_id || null,
      trade:           form.trade.trim() || null,
      target_country:  form.target_country.trim() || null,
      passport_number: form.passport_number.trim() || null,
      passport_issue_date:  form.passport_issue_date || null,
      passport_expiry_date: form.passport_expiry_date || null,
      nationality:     form.nationality.trim() || null,
      interview_type:  form.interview_type || null,
    }]);
    setSubmitting(false);
    if (error) toast({ title:"Failed to save", description:error.message, variant:"destructive" });
    else { toast({ title:"Candidate added! ✓" }); onAdded(); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Drive upload link */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-800 mb-2">📎 Upload Documents to Google Drive</p>
        <p className="text-xs text-blue-700 leading-relaxed mb-3">
          Upload all documents in <strong>ONE PDF</strong>: Passport, CV, Photo, Emirates ID
          (new &amp; old if UAE), Qatar/Kuwait ID (if applicable), PCC (recommended), and supporting certificates.
        </p>
        <a
          href={DRIVE_UPLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Google Drive Folder to Upload
        </a>
      </div>

      <div>
        <p className={`${lbl} uppercase tracking-wider mb-2`}>Personal Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className={lbl}>Full Name <span className="text-red-500">*</span></label><Input placeholder="As in passport" value={form.full_name} onChange={setF("full_name")} required className="h-9 text-sm" /></div>
          <div><label className={lbl}>Date of Birth</label><Input placeholder="DD.MM.YYYY" value={form.date_of_birth} onChange={setF("date_of_birth")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Marital Status</label>
            <Select onValueChange={v => setForm(f=>({...f,marital_status:v}))} value={form.marital_status}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{["Single","Married","Divorced","Widowed"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><label className={lbl}>Nationality</label><Input placeholder="Nepalese" value={form.nationality} onChange={setF("nationality")} className="h-9 text-sm" /></div>
        </div>
      </div>

      <div>
        <p className={`${lbl} uppercase tracking-wider mb-2`}>Job & Passport</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className={lbl}>Job Listing</label>
            <Select onValueChange={handleJobChange} value={form.job_listing_id}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select job…" /></SelectTrigger>
              <SelectContent>
                {jobs.map(j=><SelectItem key={j.id} value={j.id} disabled={(j.remaining_vacancies??0)<=0}>
                  {j.job_title} — {j.country ?? ""}{(j.remaining_vacancies??0)<=0?" (Full)":` (${j.remaining_vacancies} left)`}
                </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><label className={lbl}>Trade</label><Input placeholder="e.g. Welder, Driver" value={form.trade} onChange={setF("trade")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Target Country</label><Input placeholder="Germany" value={form.target_country} onChange={setF("target_country")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Interview Type</label>
            <Select onValueChange={v => setForm(f=>({...f,interview_type:v}))} value={form.interview_type}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{INTERVIEW_TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><label className={lbl}>Passport Number</label><Input placeholder="AB1234567" value={form.passport_number} onChange={setF("passport_number")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Passport Issue Date</label><Input type="date" value={form.passport_issue_date} onChange={setF("passport_issue_date")} className="h-9 text-sm" /></div>
          <div className="sm:col-span-2"><label className={lbl}>Passport Expiry Date</label><Input type="date" value={form.passport_expiry_date} onChange={setF("passport_expiry_date")} className="h-9 text-sm" /></div>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg py-2 text-sm transition-colors">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {submitting ? "Saving…" : "Add Candidate"}
        </button>
      </div>
    </form>
  );
}

// ── EditCandidateForm ────────────────────────────────────────────────────────
function EditCandidateForm({ candidate, jobs, onClose, onSaved }: {
  candidate:Candidate; jobs:JobListing[]; onClose:()=>void; onSaved:()=>void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    full_name:            candidate.full_name,
    date_of_birth:        candidate.date_of_birth ?? "",
    marital_status:       candidate.marital_status ?? "",
    job_listing_id:       candidate.job_listing_id ?? "",
    trade:                candidate.trade ?? "",
    target_country:       candidate.target_country ?? "",
    passport_number:      candidate.passport_number ?? "",
    nationality:          candidate.nationality ?? "",
    passport_issue_date:  candidate.passport_issue_date ?? "",
    passport_expiry_date: candidate.passport_expiry_date ?? "",
    interview_type:       candidate.interview_type ?? "",
  });
  const [saving, setSaving] = useState(false);

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast({ title:"Full name required", variant:"destructive" }); return; }
    setSaving(true);
    const { error } = await (supabase.from("candidates") as any).update({
      full_name:            form.full_name.trim(),
      date_of_birth:        form.date_of_birth || null,
      marital_status:       form.marital_status || null,
      job_listing_id:       form.job_listing_id || null,
      trade:                form.trade.trim() || null,
      target_country:       form.target_country.trim() || null,
      passport_number:      form.passport_number.trim() || null,
      nationality:          form.nationality.trim() || null,
      passport_issue_date:  form.passport_issue_date || null,
      passport_expiry_date: form.passport_expiry_date || null,
      interview_type:       form.interview_type || null,
    }).eq("id", candidate.id);
    setSaving(false);
    if (error) toast({ title:"Update failed", description:error.message, variant:"destructive" });
    else { toast({ title:"Candidate updated ✓" }); onSaved(); }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <p className={`${lbl} uppercase tracking-wider mb-2`}>Personal Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className={lbl}>Full Name <span className="text-red-500">*</span></label><Input value={form.full_name} onChange={setF("full_name")} required className="h-9 text-sm" /></div>
          <div><label className={lbl}>Date of Birth</label><Input placeholder="DD.MM.YYYY" value={form.date_of_birth} onChange={setF("date_of_birth")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Marital Status</label>
            <Select onValueChange={v => setForm(f=>({...f,marital_status:v}))} value={form.marital_status}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{["Single","Married","Divorced","Widowed"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><label className={lbl}>Nationality</label><Input placeholder="Nepalese" value={form.nationality} onChange={setF("nationality")} className="h-9 text-sm" /></div>
        </div>
      </div>
      <div>
        <p className={`${lbl} uppercase tracking-wider mb-2`}>Job & Passport</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className={lbl}>Job Listing</label>
            <Select onValueChange={v => setForm(f=>({...f,job_listing_id:v}))} value={form.job_listing_id}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select job…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">— None —</SelectItem>
                {jobs.map(j=><SelectItem key={j.id} value={j.id}>{j.job_title} — {j.country ?? ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><label className={lbl}>Trade</label><Input placeholder="e.g. Welder, Driver" value={form.trade} onChange={setF("trade")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Target Country</label><Input value={form.target_country} onChange={setF("target_country")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Interview Type</label>
            <Select onValueChange={v => setForm(f=>({...f,interview_type:v}))} value={form.interview_type}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">— None —</SelectItem>
                {INTERVIEW_TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><label className={lbl}>Passport Number</label><Input value={form.passport_number} onChange={setF("passport_number")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Passport Issue Date</label><Input type="date" value={form.passport_issue_date} onChange={setF("passport_issue_date")} className="h-9 text-sm" /></div>
          <div className="sm:col-span-2"><label className={lbl}>Passport Expiry Date</label><Input type="date" value={form.passport_expiry_date} onChange={setF("passport_expiry_date")} className="h-9 text-sm" /></div>
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg py-2 text-sm transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />} {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// ── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteConfirmDialog({ candidate, onClose, onDeleted }: {
  candidate:Candidate; onClose:()=>void; onDeleted:()=>void;
}) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await (supabase.from("candidates") as any).delete().eq("id", candidate.id);
    setDeleting(false);
    if (error) toast({ title:"Delete failed", description:error.message, variant:"destructive" });
    else { toast({ title:`${candidate.full_name} removed` }); onDeleted(); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-red-800 mb-1">⚠️ This action cannot be undone</p>
        <p className="text-sm text-red-700">
          You are about to permanently delete <strong>{candidate.full_name}</strong>
          {candidate.passport_number ? ` (${candidate.passport_number})` : ""}.
          All their data will be removed from the system.
        </p>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg py-2 text-sm transition-colors">
          Cancel
        </button>
        <button type="button" onClick={handleDelete} disabled={deleting}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {deleting ? "Deleting…" : "Yes, Delete"}
        </button>
      </div>
    </div>
  );
}

// ── Messages Inbox ──────────────────────────────────────────────────────────
function MessagesInbox() {
  const [messages, setMessages] = useState<BroadcastMsg[]>([]);
  const [selected, setSelected] = useState<BroadcastMsg|null>(null);
  const [loading, setLoading]   = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("broadcast_messages") as any)
        .select("*").order("sent_at", { ascending:false }).limit(30);
      if (data) setMessages(data as BroadcastMsg[]);
      setLoading(false);
    })();
  }, []);
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>;
  return (
    <div className="flex gap-4 h-[500px]">
      <div className="w-64 flex-shrink-0 border border-gray-200 rounded-xl overflow-y-auto bg-white">
        {messages.length === 0
          ? <p className="text-center py-12 text-gray-400 text-sm">No messages yet</p>
          : messages.map(m => (
            <button key={m.id} type="button" onClick={() => setSelected(m)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?.id===m.id ? "bg-blue-50" : ""}`}>
              <p className="text-sm font-medium text-gray-900 truncate">{m.subject}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(m.sent_at).toLocaleDateString()}</p>
            </button>
          ))
        }
      </div>
      <div className="flex-1 border border-gray-200 rounded-xl p-5 overflow-y-auto bg-white">
        {selected
          ? <>
              <h3 className="font-semibold text-gray-900 text-base mb-1">{selected.subject}</h3>
              <p className="text-xs text-gray-400 mb-4">From Recruitly Group Admin · {new Date(selected.sent_at).toLocaleString()}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.body}</p>
            </>
          : <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300">
              <Inbox className="w-10 h-10" />
              <p className="text-sm">Select a message to read</p>
            </div>
        }
      </div>
    </div>
  );
}

// ── CSV export ──────────────────────────────────────────────────────────────
function exportCSV(candidates: Candidate[]) {
  const headers = ["Name","Trade","Country","Passport No.","Passport Expiry","Nationality",
    "Availability","Interview Type","PCC","SLC","Work Permit","Visa","Result","Date Added"];
  const rows = candidates.map(c => [
    c.full_name, c.trade ?? "", c.target_country ?? "",
    c.passport_number ?? "", c.passport_expiry_date ?? "", c.nationality ?? "",
    c.interview_availability, c.interview_type ?? "",
    c.pcc_status, c.slc_status ?? "Pending",
    c.work_permit_status, c.visa_status, c.interview_result,
    new Date(c.created_at).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `candidates_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const navigate      = useNavigate();
  const { toast }     = useToast();
  const mountedRef    = useRef(true);

  const [loading,      setLoading]      = useState(true);
  const [userId,       setUserId]       = useState<string|null>(null);
  const [userName,     setUserName]     = useState("Recruiter");
  const [candidates,   setCandidates]   = useState<Candidate[]>([]);
  const [jobs,         setJobs]         = useState<JobListing[]>([]);
  const [showAdd,      setShowAdd]      = useState(false);
  const [editTarget,   setEditTarget]   = useState<Candidate|null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Candidate|null>(null);
  const [updating,     setUpdating]     = useState<string|null>(null);
  const [search,       setSearch]       = useState("");

  useEffect(() => {
    mountedRef.current = true;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      if (!session) { navigate("/auth", { replace:true }); return; }
      const { data: role } = await supabase.from("user_roles")
        .select("role, full_name").eq("user_id", session.user.id).maybeSingle();
      if (!mountedRef.current) return;
      const r = role?.role as string;
      if (r !== "recruiter" && r !== "partner") { navigate("/", { replace:true }); return; }
      setUserId(session.user.id);
      setUserName(role?.full_name ?? session.user.email ?? "Recruiter");
      setLoading(false);
    };
    init();
    return () => { mountedRef.current = false; };
  }, [navigate]);

  const fetchCandidates = useCallback(async () => {
    if (!userId) return;
    const { data } = await (supabase.from("candidates") as any)
      .select("*").eq("recruiter_id", userId).order("created_at", { ascending:false });
    if (data && mountedRef.current) setCandidates(data as Candidate[]);
  }, [userId]);

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase.from("job_listings")
      .select("id, job_title, country, remaining_vacancies")
      .eq("status", "open").order("job_title");
    if (data) setJobs(data as JobListing[]);
  }, []);

  useEffect(() => { if (userId) { fetchCandidates(); fetchJobs(); } }, [userId, fetchCandidates, fetchJobs]);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    let debounce: ReturnType<typeof setTimeout>|null = null;
    const ch = supabase.channel(`rec-cands-${userId}`)
      .on("postgres_changes", { event:"*", schema:"public", table:"candidates", filter:`recruiter_id=eq.${userId}` }, () => {
        if (!mounted) return;
        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(() => { if (mounted) fetchCandidates(); }, 600);
      }).subscribe();
    return () => { mounted=false; if (debounce) clearTimeout(debounce); supabase.removeChannel(ch); };
  }, [userId, fetchCandidates]);

  const updateField = useCallback(async (candidate: Candidate, field: string, value: string) => {
    setCandidates(prev => prev.map(c => c.id===candidate.id ? {...c, [field]:value} : c));
    setUpdating(candidate.id);
    const { error } = await (supabase.from("candidates") as any).update({ [field]:value }).eq("id", candidate.id);
    setUpdating(null);
    if (error) {
      setCandidates(prev => prev.map(c => c.id===candidate.id ? candidate : c));
      toast({ title:"Update failed", description:error.message, variant:"destructive" }); return;
    }
    if ((field==="pcc_status"||field==="slc_status") && value==="Dispatched to Admin") {
      supabase.functions.invoke("document-status-alert", { body:{
        candidate_id:candidate.id, candidate_name:candidate.full_name,
        recruiter_id:userId, field, new_value:value, actor_role:"recruiter", actor_user_id:userId,
      }}).catch(()=>{});
      toast({ title:"Status updated — Admin notified ✓" });
    }
  }, [userId, toast]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/auth", { replace:true }); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Briefcase className="w-8 h-8 text-blue-600" />
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
    </div>
  );

  // Filtered candidates
  const filtered = candidates.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.passport_number ?? "").toLowerCase().includes(q) ||
      (c.trade ?? "").toLowerCase().includes(q) ||
      (c.target_country ?? "").toLowerCase().includes(q) ||
      (c.nationality ?? "").toLowerCase().includes(q)
    );
  });

  const stats = [
    { label:"Total Submitted",  value:candidates.length,                                                 color:"text-blue-600",   bg:"bg-blue-50 border-blue-100",   icon:Users     },
    { label:"Available",        value:candidates.filter(c=>c.interview_availability==="Available").length, color:"text-emerald-600",bg:"bg-emerald-50 border-emerald-100",icon:CheckCheck },
    { label:"Selected",         value:candidates.filter(c=>c.interview_result==="Selected").length,        color:"text-green-600",  bg:"bg-green-50 border-green-100",  icon:TrendingUp },
    { label:"PCC Dispatched",   value:candidates.filter(c=>c.pcc_status==="Dispatched to Admin").length,   color:"text-amber-600",  bg:"bg-amber-50 border-amber-100",  icon:FileCheck  },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 leading-tight">Recruiter Dashboard</h1>
              <p className="text-[11px] text-gray-400 leading-tight truncate max-w-[160px]">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {userId && (
              <div className="[&_button]:text-gray-500 [&_svg]:w-4 [&_svg]:h-4">
                <NotificationBell userId={userId} />
              </div>
            )}
            <button type="button" onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Candidate
            </button>
            <button type="button" onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg px-2.5 py-1.5 transition-all">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* ── STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color} leading-none`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <Tabs defaultValue="candidates">
          <TabsList className="bg-white border border-gray-200 rounded-xl p-1 h-auto gap-0.5">
            {[{value:"candidates",label:"My Candidates",icon:Users},{value:"messages",label:"Messages",icon:Inbox}].map(t=>(
              <TabsTrigger key={t.value} value={t.value}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 rounded-lg px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-all">
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="candidates" className="mt-3">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Table toolbar */}
              <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-800 flex-shrink-0">
                  My Candidates
                  <span className="ml-1.5 text-gray-400 font-normal">
                    {search ? `${filtered.length} of ${candidates.length}` : candidates.length}
                  </span>
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search name, passport, trade…"
                      className="text-xs border border-gray-200 rounded-lg pl-8 pr-3 h-8 w-52 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                    />
                    {search && (
                      <button type="button" onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {/* CSV Export */}
                  <button type="button" onClick={() => exportCSV(filtered)}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg px-2.5 py-1.5 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                  {/* Refresh */}
                  <button type="button" onClick={fetchCandidates}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>
              </div>

              {filtered.length === 0 && candidates.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3 text-gray-300">
                  <Users className="w-10 h-10" />
                  <p className="text-sm">No candidates yet — click Add Candidate to start</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-2 text-gray-400">
                  <Search className="w-8 h-8" />
                  <p className="text-sm">No candidates match "{search}"</p>
                  <button onClick={() => setSearch("")} className="text-xs text-blue-500 hover:underline">Clear search</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap sticky left-0 bg-gray-50 z-10">Name</th>
                        {["Trade","Country","Passport","Availability","Interview Type","PCC","SLC","Work Permit","Visa","Result","Docs","Actions"].map(h=>(
                          <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(c => (
                        <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${updating===c.id ? "opacity-50 pointer-events-none" : ""}`}>
                          <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap max-w-[140px] truncate sticky left-0 bg-white z-10">{c.full_name}</td>
                          <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{c.trade ?? "—"}</td>
                          <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{c.target_country ?? "—"}</td>
                          <td className="px-3 py-2.5 text-gray-400 font-mono text-xs whitespace-nowrap">{c.passport_number ?? "—"}</td>
                          <td className="px-3 py-2.5">
                            <select value={c.interview_availability} onChange={e=>updateField(c,"interview_availability",e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer">
                              {AVAIL_OPTIONS.map(o=><option key={o}>{o}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2.5">
                            <select value={c.interview_type ?? ""} onChange={e=>updateField(c,"interview_type",e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer">
                              <option value="">—</option>
                              {INTERVIEW_TYPES.map(o=><option key={o}>{o}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2.5">
                            <select value={c.pcc_status} onChange={e=>updateField(c,"pcc_status",e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer">
                              {PCC_SLC_OPTIONS.map(o=><option key={o}>{o}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2.5">
                            <select value={c.slc_status ?? "Pending"} onChange={e=>updateField(c,"slc_status",e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer">
                              {PCC_SLC_OPTIONS.map(o=><option key={o}>{o}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2.5"><SBadge value={c.work_permit_status} /></td>
                          <td className="px-3 py-2.5"><SBadge value={c.visa_status} /></td>
                          <td className="px-3 py-2.5"><SBadge value={c.interview_result} /></td>
                          <td className="px-3 py-2.5">
                            {c.drive_folder_url
                              ? <div className="flex items-center gap-1.5">
                                  <a href={c.drive_folder_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" title="Open folder"><FolderOpen className="w-4 h-4" /></a>
                                  {c.drive_document_url && <a href={c.drive_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" title="View doc"><FileText className="w-4 h-4" /></a>}
                                </div>
                              : <a href={DRIVE_UPLOAD_URL} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600" title="Upload docs to Drive"><FolderOpen className="w-4 h-4" /></a>
                            }
                          </td>
                          {/* Actions: Edit + Delete */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => setEditTarget(c)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit candidate">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => setDeleteTarget(c)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete candidate">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-3">
            <MessagesInbox />
          </TabsContent>
        </Tabs>
      </main>

      {/* ── ADD CANDIDATE DIALOG ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>Fill in candidate details. Upload documents to Google Drive using the link below.</DialogDescription>
          </DialogHeader>
          {userId && (
            <AddCandidateForm
              recruiterId={userId}
              jobs={jobs}
              onClose={() => setShowAdd(false)}
              onAdded={() => { setShowAdd(false); fetchCandidates(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── EDIT CANDIDATE DIALOG ── */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>Update {editTarget?.full_name}'s details below.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <EditCandidateForm
              candidate={editTarget}
              jobs={jobs}
              onClose={() => setEditTarget(null)}
              onSaved={() => { setEditTarget(null); fetchCandidates(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM DIALOG ── */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Candidate</DialogTitle>
            <DialogDescription>Please confirm you want to delete this candidate.</DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <DeleteConfirmDialog
              candidate={deleteTarget}
              onClose={() => setDeleteTarget(null)}
              onDeleted={() => { setDeleteTarget(null); fetchCandidates(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
