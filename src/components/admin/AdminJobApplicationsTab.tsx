/**
 * src/components/admin/AdminJobApplicationsTab.tsx  ← NEW FILE
 *
 * Admin view for job_applications table.
 * Features: status dropdown, filter, export CSV, email template copy.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Loader2, Mail, Phone, Download, Copy, CheckCircle2 } from "lucide-react";

interface Application {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  current_location: string | null;
  nationality: string | null;
  whatsapp_number: string | null;
  telegram_number: string | null;
  passport_number: string | null;
  position_applied: string;
  country_applied: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  "pending",
  "interview_scheduled",
  "rejected",
  "pcc_applied",
  "placed",
  "withdrawn",
];

const STATUS_COLORS: Record<string, string> = {
  pending:              "bg-blue-500/20 text-blue-400 border-blue-500/30",
  interview_scheduled:  "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  rejected:             "bg-red-500/20 text-red-400 border-red-500/30",
  pcc_applied:          "bg-purple-500/20 text-purple-400 border-purple-500/30",
  placed:               "bg-green-500/20 text-green-400 border-green-500/30",
  withdrawn:            "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  pending:              "Pending",
  interview_scheduled:  "Interview Scheduled",
  rejected:             "Rejected",
  pcc_applied:          "PCC Applied",
  placed:               "Placed",
  withdrawn:            "Withdrawn",
};

// Email templates for each status change
function buildEmailTemplate(applicant: Application, status: string): string {
  const name = applicant.full_name;
  const position = applicant.position_applied;
  const country = applicant.country_applied || "your target country";

  const templates: Record<string, string> = {
    interview_scheduled: `Subject: Interview Scheduled — ${position} (${country})

Dear ${name},

We are pleased to inform you that your application for the position of ${position} in ${country} has been shortlisted.

Your interview has been scheduled. Our team will contact you shortly with the exact date, time, and format (in-person / video call / phone).

Please ensure:
✅ Your passport and documents are ready
✅ You are available on short notice

Best regards,
Recruitly Group
info@recruitlygroup.com | +977 974 320 8282`,

    rejected: `Subject: Application Update — ${position} (${country})

Dear ${name},

Thank you for applying for the ${position} position in ${country} through Recruitly Group.

After careful consideration, we regret to inform you that your application has not progressed to the next stage for this particular vacancy.

We encourage you to:
👉 Keep your profile updated on our platform
👉 Apply for other open positions
👉 Improve your WiseScore at recruitlygroup.com/educational-consultancy

We will keep your profile on file for future opportunities.

Best regards,
Recruitly Group`,

    pcc_applied: `Subject: Action Required — Police Clearance Certificate (PCC)

Dear ${name},

Your application for ${position} in ${country} is progressing well!

We need you to apply for your Police Clearance Certificate (PCC) immediately. This is a mandatory requirement for your work visa.

Steps to apply for PCC:
1. Visit your nearest District Administration Office
2. Bring: passport, citizenship certificate, 2 passport photos
3. Submit the application form

Please share the PCC receipt / reference number with us once applied.

Best regards,
Recruitly Group
info@recruitlygroup.com`,

    placed: `Subject: 🎉 Congratulations! You Have Been Placed — ${position}

Dear ${name},

We are delighted to inform you that you have been successfully placed for the position of ${position} in ${country}!

Next steps will be communicated to you by our team. Please ensure all your documents are ready and stay in close contact with us.

Welcome to your new journey! 🌍

Best regards,
Recruitly Group
info@recruitlygroup.com | +977 974 320 8282`,
  };

  return templates[status] || `Dear ${name},\n\nYour application status has been updated to: ${STATUS_LABEL[status] || status}.\n\nBest regards,\nRecruitly Group`;
}

export default function AdminJobApplicationsTab() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [emailModal, setEmailModal] = useState<{ app: Application; status: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setApplications(data as Application[]);
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id: string, status: string, app: Application) => {
    const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast({ title: "Status updated" });
      // Show email template modal for actionable statuses
      if (["interview_scheduled", "rejected", "pcc_applied", "placed"].includes(status)) {
        setEmailModal({ app: { ...app, status }, status });
      }
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Full Name", "Position", "Country", "DOB", "Nationality", "WhatsApp", "Telegram", "Status", "Submitted"],
      ...applications.map(a => [
        a.full_name, a.position_applied, a.country_applied ?? "", a.date_of_birth ?? "",
        a.nationality ?? "", a.whatsapp_number ?? "", a.telegram_number ?? "",
        a.status, new Date(a.created_at).toLocaleDateString()
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job_applications_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filtered = filterStatus === "ALL" ? applications : applications.filter(a => a.status === filterStatus);
  const pendingCount = applications.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold">Job Applications</h3>
          {pendingCount > 0 && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">
              {pendingCount} PENDING
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchApplications} className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/20 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      <p className="text-white/50 text-sm">{filtered.length} applications</p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/0">
                {["Name", "Position", "Country", "WhatsApp", "Nationality", "Status", "Submitted", "Action"].map(h => (
                  <TableHead key={h} className="text-white/60 text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(app => (
                <TableRow key={app.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white text-sm font-medium">{app.full_name}</TableCell>
                  <TableCell className="text-white/70 text-sm">{app.position_applied}</TableCell>
                  <TableCell className="text-white/60 text-sm">{app.country_applied ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {app.whatsapp_number ? (
                      <a href={`https://wa.me/${app.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-400 hover:underline">
                        <Phone className="w-3 h-3" />{app.whatsapp_number}
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">{app.nationality ?? "—"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[app.status] ?? "bg-white/10 text-white/60"}>
                      {STATUS_LABEL[app.status] ?? app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/50 text-xs">
                    {new Date(app.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v, app)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs w-36 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-white/40 py-8">No applications yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Email Template Modal */}
      {emailModal && (
        <Dialog open={!!emailModal} onOpenChange={() => { setEmailModal(null); setCopied(false); }}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>📧 Email Template — {STATUS_LABEL[emailModal.status]}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-2">
              Copy this template and send it to <strong>{emailModal.app.whatsapp_number || emailModal.app.full_name}</strong>:
            </p>
            <pre className="text-xs bg-muted p-3 rounded-lg whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
              {buildEmailTemplate(emailModal.app, emailModal.status)}
            </pre>
            <Button
              className="w-full mt-2"
              onClick={() => {
                navigator.clipboard.writeText(buildEmailTemplate(emailModal!.app, emailModal!.status));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <><CheckCircle2 className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Email Template</>}
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

