// src/components/shared/NotificationBell.tsx
// Drop this into any dashboard header. Works for admin, recruiter, partner.
// Usage: <NotificationBell userId={userId} />

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  pcc_status_dispatched: "📤",
  slc_status_dispatched: "📤",
  pcc_status_received:   "✅",
  slc_status_received:   "✅",
  mou_sent:              "📝",
  agent_verified:        "🏅",
  broadcast:             "📣",
  default:               "🔔",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifs, setNotifs]   = useState<Notification[]>([]);
  const [open, setOpen]       = useState(false);
  const ref                   = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.is_read).length;

  const fetchNotifs = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifs(data as Notification[]);
  };

  useEffect(() => {
    fetchNotifs();
    // Realtime subscription
    const ch = supabase
      .channel(`notifs-${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifs(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-[#0f1f3d] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#fbbf24] hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-10 text-center text-white/40 text-sm">No notifications</div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    if (n.link) window.location.href = n.link;
                    setOpen(false);
                  }}
                  className={`flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.is_read ? "bg-white/[0.03]" : ""}`}
                >
                  <span className="text-lg mt-0.5 flex-shrink-0">
                    {TYPE_ICON[n.type] ?? TYPE_ICON.default}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-medium leading-snug ${!n.is_read ? "text-white" : "text-white/70"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] flex-shrink-0 mt-1" />
                      )}
                    </div>
                    {n.body && (
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10px] text-white/30 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
