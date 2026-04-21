// src/components/admin/AdminBroadcastTab.tsx
// FIXED:
//   1. Delete broadcast message — calls admin-actions edge function (service role bypass)
//   2. Optimistic UI removal on delete
//   3. Minor: import X icon for delete button

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, MessageSquare, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface BroadcastMsg {
  id: string;
  subject: string;
  body: string;
  recipient_type: string;
  sent_at: string;
}

interface Recruiter {
  id: string;
  user_id: string;
  full_name: string | null;
}

export default function AdminBroadcastTab() {
  const { toast }                     = useToast();
  const [messages, setMessages]       = useState<BroadcastMsg[]>([]);
  const [recruiters, setRecruiters]   = useState<Recruiter[]>([]);
  const [loading, setLoading]         = useState(true);
  const [sending, setSending]         = useState(false);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<BroadcastMsg | null>(null);

  const [subject, setSubject]         = useState("");
  const [body, setBody]               = useState("");
  const [recipType, setRecipType]     = useState<"all_recruiters" | "specific">("all_recruiters");
  const [specificId, setSpecificId]   = useState("");
  const [senderId, setSenderId]       = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSenderId(session?.user?.id ?? null));
    fetchMessages();
    fetchRecruiters();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await (supabase.from("broadcast_messages") as any)
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(50);
    if (data) setMessages(data as BroadcastMsg[]);
    setLoading(false);
  };

  const fetchRecruiters = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("id, user_id, full_name")
      .eq("role", "recruiter")
      .eq("status", "approved");
    if (data) setRecruiters(data as Recruiter[]);
  };

  // ── Send ─────────────────────────────────────────────────────────────────
  const send = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Subject and message are required", variant: "destructive" });
      return;
    }
    setSending(true);

    // 1. Insert broadcast record
    const { data: msg, error } = await (supabase.from("broadcast_messages") as any).insert({
      sender_id:      senderId,
      subject:        subject.trim(),
      body:           body.trim(),
      recipient_type: recipType,
    }).select().single();

    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
      setSending(false);
      return;
    }

    // 2. Resolve recipients
    let targets: Recruiter[] = [];
    if (recipType === "all_recruiters") {
      targets = recruiters;
    } else if (recipType === "specific" && specificId) {
      targets = recruiters.filter(r => r.id === specificId);
    }

    // 3. Insert notification per recruiter
    if (targets.length > 0) {
      const notifRows = targets.map(r => ({
        user_id:  r.user_id,
        type:     "broadcast",
        title:    subject.trim(),
        body:     body.trim().slice(0, 120),
        link:     "/partner-dashboard",
        metadata: { broadcast_id: msg.id },
      }));
      await (supabase.from("notifications") as any).insert(notifRows);
    }

    toast({ title: `✅ Message sent to ${targets.length} recruiter(s)` });
    setSubject(""); setBody(""); setRecipType("all_recruiters"); setSpecificId("");
    fetchMessages();
    setSending(false);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const deleteMessage = async (id: string) => {
    if (!window.confirm("Delete this broadcast message? This cannot be undone.")) return;
    setDeleting(id);

    // Use admin-actions edge function (service role) to bypass RLS cleanly
    const { error } = await supabase.functions.invoke("admin-actions", {
      body: { action: "delete_broadcast", broadcast_id: id },
    });

    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      // Optimistic UI update
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMsg?.id === id) setSelectedMsg(null);
      toast({ title: "Message deleted" });
    }
    setDeleting(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Sent messages list ──────────────────────────────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#fbbf24]" />
          <span className="text-sm font-semibold text-white">Sent Messages</span>
          <span className="ml-auto text-xs text-white/40">{messages.length} total</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#fbbf24]" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-white/40 text-sm">No messages sent yet</div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto">
            {messages.map(m => (
              <div
                key={m.id}
                onClick={() => setSelectedMsg(selectedMsg?.id === m.id ? null : m)}
                className={`px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors group ${selectedMsg?.id === m.id ? "bg-white/10" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate flex-1">{m.subject}</p>
                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); deleteMessage(m.id); }}
                    disabled={deleting === m.id}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-400/70 hover:text-red-400 disabled:opacity-30"
                    title="Delete message"
                  >
                    {deleting === m.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${m.recipient_type === "all_recruiters" ? "bg-teal-500/20 text-teal-400" : "bg-blue-500/20 text-blue-400"}`}>
                    {m.recipient_type === "all_recruiters" ? "All Recruiters" : "Specific"}
                  </span>
                  <span className="text-white/30 text-xs flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {format(new Date(m.sent_at), "dd MMM, HH:mm")}
                  </span>
                </div>
                {selectedMsg?.id === m.id && (
                  <p className="text-white/60 text-xs mt-2 whitespace-pre-wrap">{m.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Compose ─────────────────────────────────────────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Send className="w-4 h-4 text-[#fbbf24]" />
          <span className="text-sm font-semibold text-white">Compose Message</span>
        </div>

        {/* Recipients */}
        <div>
          <label className="text-xs text-white/60 mb-1 block uppercase tracking-wider">Recipients</label>
          <div className="flex gap-2">
            {(["all_recruiters", "specific"] as const).map(t => (
              <button
                key={t}
                onClick={() => setRecipType(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${recipType === t ? "bg-[#fbbf24] text-[#0a192f]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                {t === "all_recruiters" ? `All Recruiters (${recruiters.length})` : "Specific Recruiter"}
              </button>
            ))}
          </div>
          {recipType === "specific" && (
            <select
              value={specificId}
              onChange={e => setSpecificId(e.target.value)}
              className="mt-2 w-full bg-white/5 border border-white/20 text-white text-xs rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">Select recruiter…</option>
              {recruiters.map(r => <option key={r.id} value={r.id}>{r.full_name ?? r.user_id}</option>)}
            </select>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs text-white/60 mb-1 block uppercase tracking-wider">Subject</label>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Interview Schedule — Week of Feb 3"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-9 text-sm"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs text-white/60 mb-1 block uppercase tracking-wider">Message</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={8}
            placeholder={"Type your message here.\n\nYou can include:\n• Interview schedules\n• Google Meet links\n• Document updates\n• Urgent announcements"}
            className="w-full bg-white/5 border border-white/20 text-white placeholder:text-white/20 text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/40"
          />
        </div>

        <Button
          onClick={send}
          disabled={sending}
          className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a192f] font-semibold"
        >
          {sending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
            : <><Send className="w-4 h-4 mr-2" /> Send Message</>
          }
        </Button>
      </div>
    </div>
  );
}
