import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Upload, Loader2, CheckCircle2, RefreshCw, LogOut,
  Briefcase, FileText, FolderOpen, Inbox, Users, CheckCheck,
  TrendingUp, FileCheck, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  interview_availability:string; interview_type:string|null;
  pcc_status:string; slc_status:string|null;
  work_permit_status:string; visa_status:string; interview_result:string;
  drive_folder_url:string|null; drive_document_url:string|null;
  invoice_number:string|null; invoice_amount:number|null; created_at:string;
}
interface BroadcastMsg { id:string; subject:string; body:string; sent_at:string; }

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

// ── AddCandidateForm ────────────────────────────────────────────────────────
function AddCandidateForm({ recruiterId, jobs, onClose, onAdded }: {
  recruiterId:string; jobs:JobListing[]; onClose:()=>void; onAdded:()=>void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name:"", date_of_birth:"", marital_status:"", job_listing_id:"",
    trade:"", target_country:"", passport_number:"", nationality:"",
    passport_issue_date:"", passport_expiry_date:"", interview_type:"",
  });
  const [file, setFile] = useState<File|null>(null);
  const [uploadState, setUploadState] = useState<"idle"|"uploading"|"done"|"error">("idle");
  const [driveResult, setDriveResult] = useState<{folderId:string;folderUrl:string;webViewLink:string}|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleJobChange = (id: string) => {
    const job = jobs.find(j => j.id === id);
    setForm(f => ({ ...f, job_listing_id:id, trade:job?.job_title ?? f.trade, target_country:job?.country ?? f.target_country }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setUploadState("idle"); setDriveResult(null);
  };

  const handleUpload = async () => {
    if (!file || !form.full_name || !form.passport_number) {
      toast({ title:"Fill name & passport first", variant:"destructive" }); return;
    }
    setUploading(true); setUploadState("uploading");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fd = new FormData();
      fd.append("candidateName", form.full_name);
      fd.append("passportNumber", form.passport_number);
      fd.append("file", file);
      const resp = await supabase.functions.invoke("upload-to-drive", {
        body: fd,
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.error || !resp.data?.success) throw new Error(resp.data?.error ?? "Upload failed");
      setDriveResult({ folderId:resp.data.folderId, folderUrl:resp.data.folderUrl, webViewLink:resp.data.webViewLink });
      setUploadState("done");
      toast({ title:"Uploaded to Google Drive ✓" });
    } catch (err: any) {
      setUploadState("error");
      toast({ title:"Upload failed", description:err.message, variant:"destructive" });
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast({ title:"Full name required", variant:"destructive" }); return; }
    setSubmitting(true);
    let folderData = driveResult;
    if (!folderData && form.passport_number.trim()) {
      try {
        const resp = await supabase.functions.invoke("create-candidate-drive-folder", {
          body: { candidateName:form.full_name.trim(), passportNumber:form.passport_number.trim() },
        });
        if (!resp.error && resp.data?.success) {
          folderData = { folderId:resp.data.folderId, folderUrl:resp.data.webViewLink, webViewLink:resp.data.webViewLink };
        }
      } catch {}
    }
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
      drive_folder_id:  folderData?.folderId ?? null,
      drive_folder_url: folderData?.folderUrl ?? null,
      drive_document_url: folderData?.webViewLink ?? null,
    }]);
    setSubmitting(false);
    if (error) toast({ title:"Failed to save", description:error.message, variant:"destructive" });
    else { toast({ title:"Candidate added! ✓" }); onAdded(); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Document upload notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-800 mb-1">📎 Document Upload Instructions</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          Upload all documents in <strong>ONE PDF</strong> including: Passport, CV, Photo,
          Emirates ID (new &amp; old if UAE), Qatar/Kuwait ID (if applicable), PCC (recommended),
          and supporting certificates.
        </p>
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
                  {j.job_title} — {j.country ?? ""}{(j.remaining_vacancies??0)<=0?" (Full)":`  (${j.remaining_vacancies} left)`}
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

      {/* File upload */}
      <div>
        <p className={`${lbl} uppercase tracking-wider mb-2`}>Documents (Google Drive)</p>
        <div
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${uploadState==="done" ? "border-emerald-400 bg-emerald-50" : uploadState==="error" ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"}`}
        >
          {uploadState==="uploading"
            ? <div className="flex flex-col items-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /><p className="text-sm text-blue-600">Uploading…</p></div>
            : uploadState==="done"
            ? <div className="flex flex-col items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /><p className="text-sm text-emerald-700 font-medium">Uploaded ✓</p>{driveResult && <a href={driveResult.folderUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline" onClick={e=>e.stopPropagation()}>View folder</a>}</div>
            : <div className="flex flex-col items-center gap-2"><Upload className="w-5 h-5 text-gray-400" /><p className="text-sm text-gray-600">{file ? file.name : "Click to select combined PDF"}</p><p className="text-xs text-gray-400">Max 20 MB</p></div>
          }
          <input ref={fileRef} type="file" accept=".pdf,.zip,.doc,.docx" onChange={handleFileSelect} className="hidden" />
        </div>
        {file && uploadState!=="done" && (
          <button type="button" onClick={handleUpload} disabled={uploading || !form.full_name || !form.passport_number}
            className="mt-2 w-full flex items-center justify-center gap-2 text-sm text-blue-700 border border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition-colors disabled:opacity-50">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload to Drive
          </button>
        )}
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

// ── Main ────────────────────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const navigate      = useNavigate();
  const { toast }     = useToast();
  const mountedRef    = useRef(true);

  const [loading,     setLoading]     = useState(true);
  const [userId,      setUserId]      = useState<string|null>(null);
  const [userName,    setUserName]    = useState("Recruiter");
  const [candidates,  setCandidates]  = useState<Candidate[]>([]);
  const [jobs,        setJobs]        = useState<JobListing[]>([]);
  const [showAdd,     setShowAdd]     = useState(false);
  const [updating,    setUpdating]    = useState<string|null>(null);

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
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">My Candidates ({candidates.length})</h2>
                <button type="button" onClick={fetchCandidates} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              {candidates.length === 0
                ? <div className="flex flex-col items-center py-16 gap-3 text-gray-300">
                    <Users className="w-10 h-10" />
                    <p className="text-sm">No candidates yet — click Add Candidate to start</p>
                  </div>
                : <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {["Name","Trade","Country","Passport","Availability","Interview Type","PCC","SLC","Work Permit","Visa","Result","Docs"].map(h=>(
                            <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map(c => (
                          <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${updating===c.id ? "opacity-50 pointer-events-none" : ""}`}>
                            <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap max-w-[140px] truncate">{c.full_name}</td>
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
                                : <span className="text-gray-300 text-xs">—</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              }
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
            <DialogDescription>Fill in candidate details and upload their documents to Google Drive.</DialogDescription>
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
    </div>
  );
}
