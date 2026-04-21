import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, LogOut, Loader2, Users, GraduationCap, FileCheck,
  MessageSquare, Briefcase, Building2, BookOpen, ClipboardList,
  UserCheck, Send, PhoneCall, AlertCircle, RefreshCw,
} from "lucide-react";
import AdminPartnersTab        from "@/components/admin/AdminPartnersTab";
import AdminDataTab            from "@/components/admin/AdminDataTab";
import AdminJobsTab            from "@/components/admin/AdminJobsTab";
import AdminUniversitiesTab    from "@/components/admin/AdminUniversitiesTab";
import AdminHiringRequestsTab  from "@/components/admin/AdminHiringRequestsTab";
import AdminJobApplicationsTab from "@/components/admin/AdminJobApplicationsTab";
import AdminCandidatesTab      from "@/components/admin/AdminCandidatesTab";
import AdminBroadcastTab       from "@/components/admin/AdminBroadcastTab";
import AdminConsultationsTab   from "@/components/admin/AdminConsultationsTab";
import NotificationBell        from "@/components/shared/NotificationBell";

interface DashboardStats {
  partners: number; wisescoreLeads: number; visaPredictions: number;
  consultations: number; jobs: number; universities: number;
  hiringRequests: number; jobApplications: number; candidates: number;
}
const ZERO: DashboardStats = {
  partners:0, wisescoreLeads:0, visaPredictions:0, consultations:0,
  jobs:0, universities:0, hiringRequests:0, jobApplications:0, candidates:0,
};

export default function AdminDashboard() {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const mountedRef = useRef(true);

  const [isLoading,    setIsLoading]    = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId,       setUserId]       = useState<string | null>(null);
  const [stats,        setStats]        = useState<DashboardStats>(ZERO);
  const [statsError,   setStatsError]   = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsError(false);
    setStatsLoading(true);
    try {
      const { data: edgeData, error: edgeErr } = await supabase.functions.invoke("admin-actions", {
        body: { action: "get_dashboard_stats" },
      });
      if (edgeErr) throw new Error(edgeErr.message);

      const results = await Promise.allSettled([
        supabase.from("job_listings").select("*", { count: "exact", head: true }),
        supabase.from("universities").select("*", { count: "exact", head: true }),
        supabase.from("employer_hiring_requests").select("*", { count: "exact", head: true }),
        supabase.from("job_applications").select("*", { count: "exact", head: true }),
        (supabase.from("candidates") as any).select("*", { count: "exact", head: true }),
      ]);

      const getCount = (r: PromiseSettledResult<any>) =>
        r.status === "fulfilled" ? (r.value.count ?? 0) : 0;

      if (mountedRef.current) {
        setStats({
          ...(edgeData ?? {}),
          jobs:            getCount(results[0]),
          universities:    getCount(results[1]),
          hiringRequests:  getCount(results[2]),
          jobApplications: getCount(results[3]),
          candidates:      getCount(results[4]),
        });
      }
    } catch (err: any) {
      console.error("fetchStats:", err);
      if (mountedRef.current) setStatsError(true);
    } finally {
      if (mountedRef.current) setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      if (!session) { navigate("/auth", { replace: true }); return; }

      const { data: isAdmin, error } = await supabase.rpc("is_admin", { _user_id: session.user.id });
      if (!mountedRef.current) return;
      if (error || !isAdmin) { navigate("/not-found", { replace: true }); return; }

      setIsAuthorized(true);
      setUserId(session.user.id);
      setIsLoading(false);
      fetchStats();
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return;
      if (!session) navigate("/auth", { replace: true });
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [navigate, fetchStats]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#fbbf24]/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#fbbf24]" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-[#fbbf24]" />
          <p className="text-white/40 text-sm">Verifying access…</p>
        </div>
      </div>
    );
  }
  if (!isAuthorized) return null;

  const statCards = [
    { label:"Partners",             value:stats.partners,        icon:Users,         color:"text-blue-400",   bg:"bg-blue-500/10 border-blue-500/20"    },
    { label:"WiseScore Leads",      value:stats.wisescoreLeads,  icon:GraduationCap, color:"text-purple-400", bg:"bg-purple-500/10 border-purple-500/20" },
    { label:"Visa Predictions",     value:stats.visaPredictions, icon:FileCheck,     color:"text-green-400",  bg:"bg-green-500/10 border-green-500/20"   },
    { label:"Consultations",        value:stats.consultations,   icon:MessageSquare, color:"text-orange-400", bg:"bg-orange-500/10 border-orange-500/20" },
    { label:"Job Listings",         value:stats.jobs,            icon:Briefcase,     color:"text-yellow-400", bg:"bg-yellow-500/10 border-yellow-500/20" },
    { label:"Universities",         value:stats.universities,    icon:BookOpen,      color:"text-pink-400",   bg:"bg-pink-500/10 border-pink-500/20"     },
    { label:"Hiring Requests",      value:stats.hiringRequests,  icon:Building2,     color:"text-teal-400",   bg:"bg-teal-500/10 border-teal-500/20"     },
    { label:"Job Applications",     value:stats.jobApplications, icon:ClipboardList, color:"text-lime-400",   bg:"bg-lime-500/10 border-lime-500/20"     },
    { label:"Recruiter Candidates", value:stats.candidates,      icon:UserCheck,     color:"text-cyan-400",   bg:"bg-cyan-500/10 border-cyan-500/20"     },
  ];

  const tabs = [
    { value:"candidates",    label:"Candidates",    icon:UserCheck     },
    { value:"broadcast",     label:"Broadcast",     icon:Send          },
    { value:"consultations", label:"Consultations", icon:PhoneCall     },
    { value:"jobs",          label:"Jobs",          icon:Briefcase     },
    { value:"universities",  label:"Universities",  icon:BookOpen      },
    { value:"hiring",        label:"Hiring",        icon:Building2     },
    { value:"applications",  label:"Applications",  icon:ClipboardList },
    { value:"partners",      label:"Partners",      icon:Users         },
    { value:"wisescore",     label:"WiseScore",     icon:GraduationCap },
    { value:"visa",          label:"Visa",          icon:FileCheck     },
  ];

  return (
    <div className="min-h-screen bg-[#0a192f]">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#0a192f]/95 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-[#fbbf24]/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4.5 h-4.5 text-[#fbbf24]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white leading-tight">
                Admin <span className="text-[#fbbf24]">Dashboard</span>
              </h1>
              <p className="text-white/40 text-[11px] leading-tight hidden sm:block">Recruitly Group</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {statsError && (
              <button
                type="button"
                onClick={fetchStats}
                className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                <AlertCircle className="w-3 h-3" /> Retry Stats
              </button>
            )}
            {userId && <NotificationBell userId={userId} />}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── STAT CARDS ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white/70 text-xs font-semibold uppercase tracking-widest">Overview</h2>
            <button
              type="button"
              onClick={fetchStats}
              disabled={statsLoading}
              className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${statsLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
            {statCards.map(s => (
              <Card key={s.label} className={`${s.bg} border`}>
                <CardContent className="p-3.5">
                  <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
                  <p className="text-xl font-bold text-white leading-none">{statsLoading ? "—" : s.value}</p>
                  <p className={`${s.color} text-[10px] font-medium leading-tight mt-1 truncate`}>{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <Tabs defaultValue="candidates">
          <div className="overflow-x-auto pb-0 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            <TabsList className="bg-white/[0.04] border border-white/[0.08] inline-flex h-auto gap-0.5 p-1 rounded-xl min-w-max">
              {tabs.map(t => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f] data-[state=active]:font-semibold data-[state=active]:shadow-sm text-white/50 hover:text-white/80 rounded-lg px-3 py-1.5 text-xs transition-all flex items-center gap-1.5"
                >
                  <t.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden md:inline whitespace-nowrap">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4 bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 sm:p-6">
            <TabsContent value="candidates"    className="mt-0"><AdminCandidatesTab /></TabsContent>
            <TabsContent value="broadcast"     className="mt-0"><AdminBroadcastTab /></TabsContent>
            <TabsContent value="consultations" className="mt-0"><AdminConsultationsTab /></TabsContent>
            <TabsContent value="jobs"          className="mt-0"><AdminJobsTab /></TabsContent>
            <TabsContent value="universities"  className="mt-0"><AdminUniversitiesTab /></TabsContent>
            <TabsContent value="hiring"        className="mt-0"><AdminHiringRequestsTab /></TabsContent>
            <TabsContent value="applications"  className="mt-0"><AdminJobApplicationsTab /></TabsContent>
            <TabsContent value="partners"      className="mt-0"><AdminPartnersTab /></TabsContent>
            <TabsContent value="wisescore"     className="mt-0">
              <AdminDataTab title="WiseScore Leads" action="get_wisescore_leads" dataKey="leads"
                columns={["full_name","email","phone","nationality","destination_country","wise_score","score_tier","created_at"]}
                columnLabels={{ full_name:"Name",email:"Email",phone:"Phone",nationality:"Nationality",destination_country:"Country",wise_score:"Score",score_tier:"Tier",created_at:"Date" }}
                fileName="wisescore_leads" />
            </TabsContent>
            <TabsContent value="visa"          className="mt-0">
              <AdminDataTab title="Visa Predictions" action="get_visa_predictions" dataKey="predictions"
                columns={["user_id","target_country","visa_success_probability","sponsor_type","total_funds","visa_refusals","created_at"]}
                columnLabels={{ user_id:"User ID",target_country:"Country",visa_success_probability:"Success %",sponsor_type:"Sponsor",total_funds:"Funds",visa_refusals:"Refusals",created_at:"Date" }}
                fileName="visa_predictions" />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
