/**
 * CandidateFormModal — Add/Edit a candidate (job application)
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export interface CandidateRow {
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
  telegram_number?: string | null;
  position_applied: string;
  country_applied?: string | null;
  status: string;
  interview_status?: string | null;
  interview_availability?: string | null;
  pcc_status?: string | null;
  work_permit_status?: string | null;
  visa_status?: string | null;
  drive_folder_id?: string | null;
  drive_folder_link?: string | null;
  admin_notes?: string | null;
  agent_id?: string | null;
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

export default function CandidateFormModal({ candidate, open, onClose, onSaved, isAdd = false }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportNumber, setPassportNumber] = useState("");

  useEffect(() => {
    if (candidate) {
      setFullName(candidate.full_name || "");
      setPosition(candidate.position_applied || "");
      setWhatsapp(candidate.whatsapp_number || "");
      setNationality(candidate.nationality || "");
      setPassportNumber(candidate.passport_number || "");
    } else {
      setFullName("");
      setPosition("");
      setWhatsapp("");
      setNationality("");
      setPassportNumber("");
    }
  }, [candidate, open]);

  const handleSave = async () => {
    if (!fullName.trim() || !position.trim()) {
      toast({ title: "Name and position are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        position_applied: position.trim(),
        whatsapp_number: whatsapp.trim() || null,
        nationality: nationality.trim() || null,
        passport_number: passportNumber.trim() || null,
      };

      if (isAdd || !candidate) {
        const { error } = await supabase.from("job_applications").insert(payload);
        if (error) throw error;
        toast({ title: "Candidate added" });
      } else {
        const { error } = await supabase.from("job_applications").update(payload).eq("id", candidate.id);
        if (error) throw error;
        toast({ title: "Candidate updated" });
      }
      onSaved();
      onClose();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAdd || !candidate ? "Add Candidate" : "Edit Candidate"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>Position Applied *</Label>
            <Input value={position} onChange={e => setPosition(e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
          </div>
          <div>
            <Label>Nationality</Label>
            <Input value={nationality} onChange={e => setNationality(e.target.value)} />
          </div>
          <div>
            <Label>Passport Number</Label>
            <Input value={passportNumber} onChange={e => setPassportNumber(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
