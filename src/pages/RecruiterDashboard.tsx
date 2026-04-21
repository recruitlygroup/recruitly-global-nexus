// src/pages/RecruiterDashboard.tsx
// FIXED:
//   1. Realtime channel uses Date.now() suffix → prevents freeze after tab-switch / remount
//   2. Interview Type dropdown added to candidate row and AddCandidateForm
//   3. Document upload section now shows instruction text + manual Drive link fallback
//   4. updateField is properly guarded against concurrent calls on same candidate
//   5. Cleanup is airtight: mounted flag + debounce timer cleared together

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Upload, Loader2, CheckCircle2, ExternalLink, RefreshCw,
  LogOut, User, Briefcase, FileText, FolderOpen, Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NotificationBell from "@/components/shared/NotificationBell";

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobListing {
  id: string;
  job_title: string;
  country: string | null;
  remaining_vacancies: number | null;
}

interface Candidate {
  id: string;
  full_name: string;
  trade: string | null;
  passport_number: string | null;
  passport_expiry_date: string | null;
  target_country: string | null;
  interview_availability: string;
  interview_type: string | null;
  pcc_status: string;
  slc_status: string | null;
  work_permit_status: string;
  visa_status: string;
  interview_result: string;
  drive_folder_url: string | null;
  drive_document_url: string | null;
  invoice_number: string | null;
  invoice_amount: number | null;
  created_at: string;
}

interface BroadcastMsg {
  id: string;
  subject: string;
  body: string;
  sent_at: string;
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Available:                 "bg-green-50 text-green-700 border border-green-200",
  "Not Available":           "bg-red-50 text-red-700 border border-red-200",
  "Not Responded":           "bg-gray-100 text-gray-600 border border-gray-200",
  Pending:                   "bg-amber-50 text-amber-700 border border-amber-200",
  Apostilled:                "bg-blue-50 text-blue-700 border border-blue-200",
  "Dispatched to Admin":     "bg-blue-100 text-blue-800 border border-blue-300",
  Received:                  "bg-green-100 text-green-800 border border-green-300",
  "Dispatched to Recruiter": "bg-green-50 text-green-700 border border-green-200",
  Selected:                  "bg-green-100 text-green-800 border border-green-300",
  Rejected:                  "bg-red-50 text-red-700 border border-red-200",
};

function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[value] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
      {value}
    </span>
  );
}

// ── Add Candidate Form ────────────────────────────────────────────────────────

interface AddCandidateFormProps {
  recruiterId: string;
  jobs: JobListing[];
  onClose: () => void;
  onAdded: () => void;
}

function AddCandidateForm({ recruiterId, jobs, onClose, onAdded }: AddCandidateFormProps) {
  const { toast } = useToast();
  const fileRef   = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: "", date_of_birth: "", marital_status: "", job_listing_id: "",
    trade: "", target_country: "", passport_number: "",
    passport_issue_date: "", passport_expiry_date: "", nationality: "",
    interview_type: "",
  });

  const [file, setFile]               = useState<File | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadState, setUploadState] = useState<"idle"|"uploading"|"done"|"error">("idle");
  const [driveResult, setDriveResult] = useState<{ folderId: string; folderUrl: string; webViewLink: string } | null>(null);
  const [submitting, setSubmitting]   = useState(false);

  const DRIVE_FALLBACK = "https://drive.google.com/drive/folders/1wP9qTwiwCq7flVaEGicEwHmT51JLE3bd?usp=sharing";

  const handleJobChange = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    setForm(f => ({ ...f, job_listing_id: jobId, trade: job?.job_title ?? f.trade, target_country: job?.country ?? f.target_country }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setUploadState("idle");
    setDriveResult(null);
  };

  const handleUpload = async () => {
    if (!file || !form.full_name || !form.passport_number) {
      toast({ title: "Fill in name and passport number first", variant: "destructive" }); return;
    }
    setUploading(true); setUploadState("uploading");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fd = new FormData();
      fd.append("candidateName", form.full_name);
      fd.append("passportNumber", form.passport_number);
      fd.append("file", file);
      const resp = await supabase.functions.invoke("upload-to-drive", {
        body: fd, headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.error || !resp.data?.success) throw new Error(resp.data?.error ?? "Upload failed");
      setDriveResult({ folderId: resp.data.folderId, folderUrl: resp.data.folderUrl, webViewLink: resp.data.webViewLink });
      setUploadState("done");
      toast({ title: "Uploaded to Google Drive ✓" });
    } catch (err: any) {
      setUploadState("error");
      toast({
        title: "Upload failed — use manual upload",
        description: "Open the Drive folder link below and upload manually.",
        variant: "destructive",
      });
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast({ title: "Full name is required", variant: "destructive" }); return; }
    setSubmitting(true);

    let folderData = driveResult;
    if (!folderData && form.passport_number.trim()) {
      try {
        const resp = await supabase.functions.invoke("create-candidate-drive-folder", {
          body: { candidateName: form.full_name.trim(), passportNumber: form.passport_number.trim() },
        });
        if (!resp.error && resp.data?.success) {
          folderData = { folderId: resp.data.folderId, folderUrl: resp.data.webViewLink, webViewLink: resp.data.webViewLink };
        }
      } catch { /* non-blocking */ }
    }

    const { error } = await (supabase.from("candidates") as any).insert([{
      recruiter_id:       recruiterId,
      full_name:          form.full_name.trim(),
      date_of_birth:      form.date_of_birth || null,
      marital_status:     form.marital_status || null,
      job_listing_id:     form.job_listing_id || null,
      trade:              form.trade.trim() || null,
      target_country:     form.target_country.trim() || null,
      passport_number:    form.passport_number.trim() || null,
      passport_issue_date:   form.passport_issue_date || null,
      passport_expiry_date:  form.passport_expiry_date || null,
      nationality:        form.nationality.trim() || null,
      interview_type:     form.interview_type || null,
      drive_folder_id:    folderData?.folderId ?? null,
      drive_folder_url:   folderData?.folderUrl ?? null,
      drive_document_url: folderData?.webViewLink ?? null,
    }]);

    setSubmitting(false);
    if (error) { toast({ title: "Failed to save candidate", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Candidate added ✓" }); onAdded(); }
  };

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const lbl = "text-xs font-medium text-gray-700 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Personal Info */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className={lbl}>Full Name <span className="text-red-500">*</span></label><Input placeholder="As in passport" value={form.full_name} onChange={setF("full_name")} required className="h-9 text-sm" /></div>
          <div>
            <label className={lbl}>Date of Birth (DD.MM.YYYY)</label>
            <Input
              placeholder="15.06.1990"
              value={form.date_of_birth}
              onChange={e => {
                let v = e.target.value;
                const p = v.split(".");
                if (p.length === 3 && p[2].length === 4) v = `${p[2]}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}`;
                setForm(f => ({ ...f, date_of_birth: v }));
              }}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className={lbl}>Marital Status</label>
            <Select onValueChange={v => setForm(f => ({ ...f, marital_status: v }))} value={form.marital_status}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{["Single","Married","Divorced","Widowed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><label className={lbl}>Nationality</label><Input placeholder="Nepalese" value={form.nationality} onChange={setF("nationality")} className="h-9 text-sm" /></div>
        </div>
      </div>

      {/* Passport & Job */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Passport & Job</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Select Job</label>
            <Select onValueChange={handleJobChange} value={form.job_listing_id}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select job…" /></SelectTrigger>
              <SelectContent>
                {jobs.map(j => (
                  <SelectItem key={j.id} value={j.id} disabled={(j.remaining_vacancies ?? 0) <= 0}>
                    {j.job_title} — {j.country ?? ""}{(j.remaining_vacancies ?? 0) <= 0 ? " (No Vacancy)" : ` (${j.remaining_vacancies} left)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><label className={lbl}>Trade (if not in list)</label><Input placeholder="e.g. Welder" value={form.trade} onChange={setF("trade")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Target Country</label><Input placeholder="Germany" value={form.target_country} onChange={setF("target_country")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Passport Number</label><Input placeholder="AB1234567" value={form.passport_number} onChange={setF("passport_number")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Passport Issue Date</label><Input type="date" value={form.passport_issue_date} onChange={setF("passport_issue_date")} className="h-9 text-sm" /></div>
          <div><label className={lbl}>Passport Expiry Date</label><Input type="date" value={form.passport_expiry_date} onChange={setF("passport_expiry_date")} className="h-9 text-sm" /></div>
          {/* Interview Type */}
          <div>
            <label className={lbl}>Interview Type</label>
            <Select onValueChange={v => setForm(f => ({ ...f, interview_type: v }))} value={form.interview_type}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type…" /></SelectTrigger>
              <SelectContent>
                {["Online","Physical","Zoom","Client Direct","Embassy"].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents (Google Drive)</p>

        {/* Instruction banner */}
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 leading-relaxed">
            📎 Upload all documents in <strong>ONE PDF</strong> including: Passport, CV, Photo,
            Emirates ID (new &amp; old if UAE), Qatar/Kuwait ID (if applicable),
            PCC (recommended), and supporting certificates.
          </p>
          <p className="text-xs text-amber-600 mt-1.5">
            Or upload manually:{" "}
            <a href={DRIVE_FALLBACK} target="_blank" rel="noopener noreferrer"
               className="underline font-medium hover:text-amber-800 inline-flex items-center gap-0.5">
              <FolderOpen className="w-3 h-3" /> Open Drive Folder
            </a>
          </p>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            uploadState === "done"  ? "border-green-400 bg-green-50" :
            uploadState === "error" ? "border-red-300 bg-red-50 cursor-default" :
            "border-gray-200 hover:border-blue-400 hover:bg-blue-50/40"
          }`}
        >
          {uploadState === "uploading" ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <p className="text-sm text-blue-600 font-medium">Uploading…</p>
            </div>
          ) : uploadState === "done" ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <p className="text-sm text-green-700 font-medium">Uploaded to Drive</p>
              {driveResult && (
                <a href={driveResult.folderUrl} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-blue-600 underline flex items-center gap-1"
                   onClick={e => e.stopPropagation()}>
                  <FolderOpen className="w-3 h-3" /> Open folder
                </a>
              )}
            </div>
          ) : uploadState === "error" ? (
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <p className="text-sm text-red-600 font-medium">Auto-upload failed</p>
              <p className="text-xs text-red-500">Please use the Drive folder link above to upload manually.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-600">{file ? file.name : "Drag & drop or click to select PDF"}</p>
              <p className="text-xs text-gray-400">Max 20MB · PDF preferred</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.zip,.doc,.docx" onChange={handleFileSelect} className="hidden" />
        </div>

        {file && uploadState !== "done" && uploadState !== "error" && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !form.full_name || !form.passport_number}
            variant="outline" size="sm"
            className="mt-2 w-full border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {uploading
              ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Uploading…</>
              : <><Upload className="w-3.5 h-3.5 mr-2" />Upload to Drive</>
            }
          </Button>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Add Candidate"}
        </Button>
      </div>
    </form>
  );
}

// ── Invoice Modal ─────────────────────────────────────────────────────────────

function InvoiceModal({ candidate, onClose, onSaved }: { candidate: Candidate; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [invoice_number, setNum]    = useState(candidate.invoice_number ?? "");
  const [invoice_amount, setAmount] = useState(candidate.invoice_amount?.toString() ?? "");
  const [invoice_notes, setNotes]   = useState("");
  const [saving, setSaving]         = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase.from("candidates") as any).update({
      invoice_number,
      invoice_amount: invoice_amount ? parseFloat(invoice_amount) : null,
      invoice_notes:  invoice_notes || null,
    }).eq("id", candidate.id);
    setSaving(false);
    if (error) { toast({ title: "Failed to save", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Invoice saved" }); onSaved(); }
  };

  return (
    <div className="space-y-4">
      <div><Label className="text-sm">Invoice Number</Label><Input value={invoice_number} onChange={e => setNum(e.target.value)} placeholder="INV-2026-001" className="mt-1 h-9 text-sm" /></div>
      <div><Label className="text-sm">Invoice Amount (€)</Label><Input type="number" value={invoice_amount} onChange={e => setAmount(e.target.value)} placeholder="1500.00" className="mt-1 h-9 text-sm" /></div>
      <div><Label className="text-sm">Notes</Label><textarea value={invoice_notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={save} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Invoice"}
        </Button>
      </div>
    </div>
  );
}

// ── Messages Inbox ─────────────────────────────────────────────────────────────

function MessagesInbox() {
  const [messages, setMessages] = useState<BroadcastMsg[]>([]);
  const [selected, setSelected] = useState<BroadcastMsg | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("broadcast_messages").select("*").order("sent_at", { ascending: false }).limit(30);
      if (data) setMessages(data as BroadcastMsg[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

  return (
    <div className="flex gap-4 h-[480px]">
      <div className="w-72 flex-shrink-0 border border-gray-200 rounded-xl overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No messages yet</div>
        ) : messages.map(m => (
          <div key={m.id} onClick={() => setSelected(m)}
            className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selected?.id === m.id ? "bg-blue-50" : ""}`}>
            <p className="text-sm font-medium text-gray-900 truncate">{m.subject}</p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(m.sent_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 border border-gray-200 rounded-xl p-5 overflow-y-auto">
        {selected ? (
          <>
            <h3 className="font-semibold text-gray-900 text-base mb-1">{selected.subject}</h3>
            <p className="text-xs text-gray-400 mb-4">From: Recruitly Group Admin · {new Date(selected.sent_at).toLocaleString()}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.body}</p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300">
            <Inbox className="w-10 h-10" />
            <p className="text-sm">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function RecruiterDashboard() {
  const navigate                    = useNavigate();
  const { toast }                   = useToast();
  const [loading, setLoading]       = useState(true);
  const [userId, setUserId]         = useState<string | null>(null);
  const [userName, setUserName]     = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs]             = useState<JobListing[]>([]);
  const [showAdd, setShowAdd]       = useState(false);
  const [invoiceFor, setInvoiceFor] = useState<Candidate | null>(null);
  const [updating, setUpdating]     = useState<string | null>(null);
  const mountedRef                  = useRef(true);
  const channelRef                  = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data: role } = await supabase.from("user_roles")
        .select("role, full_name").eq("user_id", session.user.id).maybeSingle();
      if ((role?.role as string) !== "recruiter") { navigate("/"); return; }
      setUserId(session.user.id);
      setUserName(role?.full_name ?? session.user.email ?? "Recruiter");
      setLoading(false);
    };
    init();
  }, [navigate]);

  const fetchCandidates = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await (supabase.from("candidates") as any)
      .select("*").eq("recruiter_id", userId).order("created_at", { ascending: false });
    if (!error && data && mountedRef.current) setCandidates(data as Candidate[]);
  }, [userId]);

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase.from("job_listings")
      .select("id, job_title, country, remaining_vacancies")
      .eq("status", "open").order("job_title");
    if (data) setJobs(data as JobListing[]);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchCandidates(); fetchJobs();
  }, [userId, fetchCandidates, fetchJobs]);

  // ── Realtime — unique channel name prevents freeze ────────────────────────
  useEffect(() => {
    if (!userId) return;
    mountedRef.current = true;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const ch = supabase.channel(`recruiter-candidates-${userId}-${Date.now()}`);
    channelRef.current = ch;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    ch.on("postgres_changes", {
      event: "*", schema: "public", table: "candidates",
      filter: `recruiter_id=eq.${userId}`,
    }, () => {
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
  }, [userId, fetchCandidates]);

  // ── Update field ──────────────────────────────────────────────────────────
  const updateField = async (candidate: Candidate, field: string, value: string) => {
    if (updating === candidate.id) return; // prevent concurrent updates on same row
    setUpdating(candidate.id);
    const { error } = await (supabase.from("candidates") as any)
      .update({ [field]: value }).eq("id", candidate.id);
    setUpdating(null);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }

    // Optimistic local update
    setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, [field]: value } : c));

    if ((field === "pcc_status" || field === "slc_status") && value === "Dispatched to Admin") {
      supabase.functions.invoke("document-status-alert", {
        body: {
          candidate_id:   candidate.id,
          candidate_name: candidate.full_name,
          recruiter_id:   userId,
          field,
          new_value:      value,
          actor_role:     "recruiter",
          actor_user_id:  userId,
        },
      }).catch(() => { /* non-blocking */ });
      toast({ title: "Status updated. Admin has been notified." });
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/auth"); };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const totalCandidates = candidates.length;
  const available       = candidates.filter(c => c.interview_availability === "Available").length;
  const selected        = candidates.filter(c => c.interview_result === "Selected").length;
  const pccDispatched   = candidates.filter(c => c.pcc_status === "Dispatched to Admin").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Recruiter Dashboard</h1>
              <p className="text-xs text-gray-500">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userId && (
              <div className="[&_button]:text-gray-500 [&_svg]:w-5 [&_svg]:h-5">
                <NotificationBell userId={userId} />
              </div>
            )}
            <Button onClick={() => setShowAdd(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
              <Plus className="w-4 h-4" /> Add Candidate
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Submitted", value: totalCandidates, color: "text-blue-600" },
            { label: "Available",       value: available,       color: "text-green-600" },
            { label: "Selected",        value: selected,        color: "text-emerald-600" },
            { label: "PCC Dispatched",  value: pccDispatched,   color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl border border-gray-200 bg-white">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="candidates">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="candidates">My Candidates</TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1">
              <Inbox className="w-3.5 h-3.5" /> Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="mt-4">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">My Candidates</h2>
                <Button variant="ghost" size="sm" onClick={fetchCandidates} className="gap-1.5 text-xs text-gray-500">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
              </div>

              {candidates.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
                  <User className="w-10 h-10" />
                  <p className="text-sm">No candidates yet. Click "Add Candidate" to start.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {["Name","Trade","Country","Passport","Availability","Interview Type","PCC Status","SLC Status","Work Permit","Visa","Result","Docs","Invoice"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map(c => (
                        <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${updating === c.id ? "opacity-60" : ""}`}>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{c.full_name}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.trade ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.target_country ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs whitespace-nowrap">{c.passport_number ?? "—"}</td>

                          {/* Availability */}
                          <td className="px-4 py-3">
                            <select value={c.interview_availability} onChange={e => updateField(c, "interview_availability", e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                              {["Available","Not Available","Not Responded"].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </td>

                          {/* Interview Type */}
                          <td className="px-4 py-3">
                            <select value={c.interview_type ?? ""} onChange={e => updateField(c, "interview_type", e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                              <option value="">—</option>
                              {["Online","Physical","Zoom","Client Direct","Embassy"].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </td>

                          {/* PCC */}
                          <td className="px-4 py-3">
                            <select value={c.pcc_status} onChange={e => updateField(c, "pcc_status", e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                              {["Pending","Apostilled","Dispatched to Admin"].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </td>

                          {/* SLC */}
                          <td className="px-4 py-3">
                            <select value={c.slc_status ?? "Pending"} onChange={e => updateField(c, "slc_status", e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                              {["Pending","Apostilled","Dispatched to Admin"].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </td>

                          {/* Read-only from admin */}
                          <td className="px-4 py-3"><StatusBadge value={c.work_permit_status} /></td>
                          <td className="px-4 py-3"><StatusBadge value={c.visa_status} /></td>
                          <td className="px-4 py-3"><StatusBadge value={c.interview_result} /></td>

                          {/* Drive */}
                          <td className="px-4 py-3">
                            {c.drive_folder_url ? (
                              <div className="flex items-center gap-1.5">
                                <a href={c.drive_folder_url} target="_blank" rel="noopener noreferrer" title="Open folder" className="text-blue-600 hover:text-blue-800"><FolderOpen className="w-4 h-4" /></a>
                                {c.drive_document_url && <a href={c.drive_document_url} target="_blank" rel="noopener noreferrer" title="View document" className="text-blue-600 hover:text-blue-800"><FileText className="w-4 h-4" /></a>}
                              </div>
                            ) : <span className="text-gray-300 text-xs">No doc</span>}
                          </td>

                          {/* Invoice */}
                          <td className="px-4 py-3">
                            {c.visa_status === "Received" && (
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => setInvoiceFor(c)}>
                                {c.invoice_number ? "Edit Invoice" : "Add Invoice"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <MessagesInbox />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Candidate */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>Fill in details and upload documents to Google Drive.</DialogDescription>
          </DialogHeader>
          {userId && (
            <AddCandidateForm
              recruiterId={userId} jobs={jobs}
              onClose={() => setShowAdd(false)}
              onAdded={() => { setShowAdd(false); fetchCandidates(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice */}
      <Dialog open={!!invoiceFor} onOpenChange={() => setInvoiceFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Invoice — {invoiceFor?.full_name}</DialogTitle></DialogHeader>
          {invoiceFor && (
            <InvoiceModal
              candidate={invoiceFor}
              onClose={() => setInvoiceFor(null)}
              onSaved={() => { setInvoiceFor(null); fetchCandidates(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
