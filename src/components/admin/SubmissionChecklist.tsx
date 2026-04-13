/**
 * src/components/admin/SubmissionChecklist.tsx
 *
 * Submission readiness checklist for a candidate.
 * Shows: Passport, CV, PCC, Video — checked vs missing.
 * Validates required fields before "Submit" is enabled.
 * Used inside CandidateFormModal and standalone in the candidates table.
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2, XCircle, AlertTriangle, Send, Loader2, ClipboardList,
} from "lucide-react";

interface Checklist {
  passport: boolean;
  cv: boolean;
  pcc: boolean;
  video: boolean;
}

interface Candidate {
  id: string;
  full_name: string;
  passport_number?: string | null;
  passport_expiry_date?: string | null;
  drive_folder_id?: string | null;
  drive_folder_link?: string | null;
  doc_links?: Array<{ name: string; link: string; type: string }>;
  submission_checklist?: Checklist;
  status?: string;
  interview_status?: string;
  interview_availability?: string;
  pcc_status?: string;
}

interface Props {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const CHECKLIST_ITEMS: Array<{
  key: keyof Checklist;
  label: string;
  description: string;
}> = [
  { key: "passport", label: "Passport Copy", description: "Clear scan of all pages" },
  { key: "cv",       label: "CV / Resume",   description: "Updated within 6 months" },
  { key: "pcc",      label: "PCC",           description: "Police Clearance Certificate" },
  { key: "video",    label: "Video",         description: "Introduction video (1-2 min)" },
];

/** Validate required candidate fields before submission */
function validateCandidate(c: Candidate): string[] {
  const missing: string[] = [];
  if (!c.passport_number)     missing.push("Passport Number");
  if (!c.passport_expiry_date) missing.push("Passport Expiry Date");
  if (!c.drive_folder_id)      missing.push("Google Drive folder (save candidate first)");
  return missing;
}

export default function SubmissionChecklist({ candidate, open, onClose, onUpdated }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const checklist: Checklist = {
    passport: false,
    cv: false,
    pcc: false,
    video: false,
    ...(candidate?.submission_checklist ?? {}),
  };

  const allChecked = Object.values(checklist).every(Boolean);
  const missingFields = candidate ? validateCandidate(candidate) : [];
  const canSubmit = allChecked && missingFields.length === 0;

  const toggleItem = async (key: keyof Checklist) => {
    if (!candidate) return;
    const updated = { ...checklist, [key]: !checklist[key] };
    const { error } = await supabase
      .from("job_applications")
      .update({ admin_notes: JSON.stringify({ submission_checklist: updated }) } as any)
      .eq("id", candidate.id);
    if (!error) onUpdated();
    else toast({ title: "Update failed", variant: "destructive" });
  };

  const handleSubmit = async () => {
    if (!candidate || !canSubmit) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: "submitted" })
        .eq("id", candidate.id);
      if (error) throw error;
      toast({ title: `✓ ${candidate.full_name} submitted successfully` });
      onUpdated();
      onClose();
    } catch {
      toast({ title: "Submission failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!candidate) return null;

  // Auto-detect docs from doc_links
  const docNames = (candidate.doc_links ?? []).map(d => d.name.toLowerCase());
  const autoDetected = {
    passport: docNames.some(n => n.includes("passport")),
    cv:       docNames.some(n => n.includes("cv") || n.includes("resume")),
    pcc:      docNames.some(n => n.includes("pcc") || n.includes("police")),
    video:    docNames.some(n => n.includes("video") || n.includes("mp4") || n.includes("mov")),
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ClipboardList className="w-5 h-5 text-[#fbbf24]" />
            Submission Checklist — {candidate.full_name}
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#fbbf24] rounded-full transition-all"
              style={{ width: `${(checkedCount / 4) * 100}%` }}
            />
          </div>
          <span className="text-white/60 text-sm shrink-0">{checkedCount}/4</span>
        </div>

        {/* Required field warnings */}
        {missingFields.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-1">
            <p className="text-red-400 text-xs font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Missing required fields:
            </p>
            {missingFields.map(f => (
              <p key={f} className="text-red-300/80 text-xs ml-5">• {f}</p>
            ))}
          </div>
        )}

        {/* Checklist items */}
        <div className="space-y-2">
          {CHECKLIST_ITEMS.map(item => {
            const checked = checklist[item.key];
            const autoFound = autoDetected[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleItem(item.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  checked
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                {checked
                  ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  : <XCircle className="w-5 h-5 text-white/20 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${checked ? "text-green-300" : "text-white/70"}`}>
                    {item.label}
                  </p>
                  <p className="text-white/40 text-xs">{item.description}</p>
                </div>
                {autoFound && !checked && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs shrink-0">
                    Found in Drive
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Submit button */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          {!allChecked && (
            <p className="text-white/40 text-xs text-center">
              All 4 items must be confirmed before submission
            </p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className={`w-full font-medium ${
              canSubmit
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            {saving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
              : <><Send className="w-4 h-4 mr-2" />Submit Candidate</>
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
