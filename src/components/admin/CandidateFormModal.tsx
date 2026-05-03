/**
 * CandidateFormModal — Add/Edit a candidate
 * BUG FIX: Was writing to "job_applications" table.
 * Now correctly writes to "candidates" table with proper field names.
 * - position_applied → trade
 * - Added recruiter_id from current session
 * - Expanded fields: trade, target_country, date_of_birth, interview_type
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Matches the candidates table (not job_applications)
export interface CandidateRow {
  id: string;
  full_name: string;
  trade: string | null;
  target_country: string | null;
  date_of_birth: string | null;
  marital_status: string | null;
  nationality: string | null;
  passport_number: string | null;
  passport_issue_date: string | null;
  passport_expiry_date: string | null;
  interview_type: string | null;
  interview_availability: string;
  interview_result: string;
  pcc_status: string;
  slc_status: string | null;
  work_permit_status: string;
  visa_status: string;
  drive_folder_url: string | null;
  drive_document_url: string | null;
  admin_notes: string | null;
  recruiter_id: string;
  created_at: string;
}

interface Props {
  candidate?: CandidateRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  isAdd?: boolean;
  isAdmin?: boolean;
}

const INTERVIEW_TYPES = ["Online","Physical","Zoom","Client Direct","Embassy","Skype","Teams"];

export default function CandidateFormModal({ candidate, open, onClose, onSaved, isAdd = false }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [fullName,      setFullName]      = useState("");
  const [trade,         setTrade]         = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [nationality,   setNationality]   = useState("");
  const [passport,      setPassport]      = useState("");
  const [dob,           setDob]           = useState("");
  const [interviewType, setInterviewType] = useState("");

  useEffect(() => {
    if (candidate) {
      setFullName(candidate.full_name ?? "");
      setTrade(candidate.trade ?? "");
      setTargetCountry(candidate.target_country ?? "");
      setNationality(candidate.nationality ?? "");
      setPassport(candidate.passport_number ?? "");
      setDob(candidate.date_of_birth ?? "");
      setInterviewType(candidate.interview_type ?? "");
    } else {
      setFullName(""); setTrade(""); setTargetCountry(""); setNationality("");
      setPassport(""); setDob(""); setInterviewType("");
    }
  }, [candidate, open]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({ title: "Full name is required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const payload: Record<string, string | null> = {
        full_name:       fullName.trim(),
        trade:           trade.trim() || null,           // ← correct field name
        target_country:  targetCountry.trim() || null,
        nationality:     nationality.trim() || null,
        passport_number: passport.trim() || null,
        date_of_birth:   dob.trim() || null,
        interview_type:  interviewType || null,
      };

      if (isAdd || !candidate) {
        // New candidate — get recruiter_id from current session
        const { data: { session } } = await supabase.auth.getSession();
        payload.recruiter_id = session?.user?.id ?? "";

        const { error } = await (supabase.from("candidates") as any).insert(payload);
        if (error) throw error;
        toast({ title: "Candidate added ✓" });
      } else {
        const { error } = await (supabase.from("candidates") as any)
          .update(payload).eq("id", candidate.id);
        if (error) throw error;
        toast({ title: "Candidate updated ✓" });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast({ title: "Save failed", description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const lbl = "text-xs font-medium text-white/70 mb-1 block";
  const inp = "bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-sm";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[#0f1f3d] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isAdd || !candidate ? "Add Candidate" : "Edit Candidate"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="col-span-2">
            <label className={lbl}>Full Name <span className="text-red-400">*</span></label>
            <Input className={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="As in passport" />
          </div>
          <div>
            <label className={lbl}>Trade / Position</label>
            <Input className={inp} value={trade} onChange={e => setTrade(e.target.value)} placeholder="e.g. Welder, Driver" />
          </div>
          <div>
            <label className={lbl}>Target Country</label>
            <Input className={inp} value={targetCountry} onChange={e => setTargetCountry(e.target.value)} placeholder="Germany" />
          </div>
          <div>
            <label className={lbl}>Nationality</label>
            <Input className={inp} value={nationality} onChange={e => setNationality(e.target.value)} placeholder="Nepalese" />
          </div>
          <div>
            <label className={lbl}>Passport Number</label>
            <Input className={inp} value={passport} onChange={e => setPassport(e.target.value)} placeholder="AB1234567" />
          </div>
          <div>
            <label className={lbl}>Date of Birth</label>
            <Input className={inp} value={dob} onChange={e => setDob(e.target.value)} placeholder="DD.MM.YYYY" />
          </div>
          <div>
            <label className={lbl}>Interview Type</label>
            <select
              value={interviewType}
              onChange={e => setInterviewType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-md h-9 px-3 focus:outline-none focus:ring-1 focus:ring-white/30"
            >
              <option value="">— Select —</option>
              {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a192f] font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving…" : (isAdd || !candidate ? "Add Candidate" : "Save Changes")}
        </button>
      </DialogContent>
    </Dialog>
  );
}
