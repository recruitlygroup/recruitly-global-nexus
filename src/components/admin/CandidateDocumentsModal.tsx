/**
 * CandidateDocumentsModal — View/manage documents for a candidate
 */
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, FileText } from "lucide-react";

interface DocLink {
  name: string;
  link: string;
  type: "drive" | "send-anywhere" | "uploaded";
}

interface Candidate {
  id: string;
  full_name: string;
  drive_folder_link?: string | null;
  doc_links?: DocLink[];
}

interface Props {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
}

export default function CandidateDocumentsModal({ candidate, open, onClose }: Props) {
  if (!candidate) return null;

  const docs = candidate.doc_links ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-[#fbbf24]" />
            Documents — {candidate.full_name}
          </DialogTitle>
        </DialogHeader>

        {candidate.drive_folder_link && (
          <a
            href={candidate.drive_folder_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 hover:underline text-sm mb-2"
          >
            <ExternalLink className="w-4 h-4" /> Open Google Drive Folder
          </a>
        )}

        {docs.length === 0 ? (
          <p className="text-white/40 text-sm py-4 text-center">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {docs.map((doc, i) => (
              <a
                key={i}
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
              >
                <FileText className="w-4 h-4 text-white/40 shrink-0" />
                <span className="text-white/80 text-sm flex-1 truncate">{doc.name}</span>
                <span className="text-white/30 text-xs">{doc.type}</span>
              </a>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
