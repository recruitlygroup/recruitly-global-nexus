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
  type: string;
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
  onUpdated?: () => void;
}

export default function CandidateDocumentsModal({ candidate, open, onClose }: Props) {
  if (!candidate) return null;

  const docs = (candidate.doc_links ?? []) as DocLink[];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
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
          <p className="text-muted-foreground text-sm py-4 text-center">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {docs.map((doc, i) => (
              <a
                key={i}
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border hover:border-border/80 transition-colors"
              >
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground/80 text-sm flex-1 truncate">{doc.name}</span>
                <span className="text-muted-foreground text-xs">{doc.type}</span>
              </a>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
