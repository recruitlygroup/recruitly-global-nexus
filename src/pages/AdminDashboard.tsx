// src/pages/AdminDashboard.tsx — REPLACE existing file
// Changes: Added Broadcast tab, NotificationBell in header, no motion on stat cards.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, LogOut, Loader2, Users, GraduationCap, FileCheck,
  MessageSquare, Briefcase, Building2, BookOpen, ClipboardList, UserCheck, Send,
} from "lucide-react";
import AdminPartnersTab       from "@/components/admin/AdminPartnersTab";
import AdminDataTab           from "@/components/admin/AdminDataTab";
import AdminJobsTab           from "@/components/admin/AdminJobsTab";
import AdminUniversitiesTab   from "@/components/admin/AdminUniversitiesTab";
import AdminHiringRequestsTab from "@/components/admin/AdminHiringRequestsTab";
import AdminJobApplicationsTab from "@/components/admin/AdminJobApplicationsTab";
import AdminCandidatesTab     from "@/components/admin/AdminCandidatesTab";
import AdminBroadcastTab      from "@/components/admin/AdminBroadcastTab";
import NotificationBell       from "@/components/shared/NotificationBell";

interface DashboardStats {
  partners: number;
  wisescoreLeads: number;
  visaPredictions: number;
  consultations: number;
  jobs: number;
  universities: number;
  hiringRequests: number;
  jobApplications: number;
  candidates: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading]       = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId, setUserId]             = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    partners: 0, wisescoreLeads: 0, visaPredictions: 0, consultations: 0,
    jobs: 0, universities: 0, hiringRequests: 0, jobApplications: 0, candidates: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data: isAdmin, error: adminError } = await supabase
        .rpc("is_admin", { _user_id: session.user.id });
      if (adminError || !isAdmin) { navigate("/not-found"); return; }
      setIsAuthorized(true);
      setUserId(session.user.id);
      setIsLoading(false);
      fetchStats();
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) { navigate("/auth"); return; }
      const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: session.user.id });
      if (!isAdmin) navigate("/not-found");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const { data } = await supabase.functions.invoke("admin-actions", {
        body: { action: "get_dashboard_stats" },
      });
      const [
        { count: jobCount },
        { count: uniCount },
        { count: hrCount },
        { count: appCount },
        { count: candCount },
      ] = await Promise.all([
        supabase.from("job_listings").select("*", { count: "exact", head: true }),
        supabase.from("universities").select("*", { count: "exact", head: true }),
        supabase.from("employer_hiring_requests").select("*", { count: "exact", head: true }),
        supabase.from("job_applications").select("*", { count: "exact", head: true }),
        (supabase.from("candidates") as any).select("*", { count: "exact", head: true }),
      ]);
      setStats({
        ...(data ?? {}),
        jobs: jobCount ?? 0,
        universities: uniCount ?? 0,
        hiringRequests: hrCount ?? 0,
        jobApplications: appCount ?? 0,
        candidates: candCount ?? 0,
      });
    } catch {}
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
      </div>
    );
  }
  if (!isAuthorized) return null;

  const statCards = [
    { label: "Partners",             value: stats.partners,        icon: Users,         color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "WiseScore Leads",      value: stats.wisescoreLeads,  icon: GraduationCap, color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Visa Predictions",     value: stats.visaPredictions, icon: FileCheck,     color: "text-green-400",   bg: "bg-green-500/10 border-green-500/20" },
    { label: "Consultations",        value: stats.consultations,   icon: MessageSquare, color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Job Listings",         value: stats.jobs,            icon: Briefcase,     color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/20" },
    { label: "Universities",         value: stats.universities,    icon: BookOpen,      color: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/20" },
    { label: "Hiring Requests",      value: stats.hiringRequests,  icon: Building2,     color: "text-teal-400",    bg: "bg-teal-500/10 border-teal-500/20" },
    { label: "Job Applications",     value: stats.jobApplications, icon: ClipboardList, color: "text-lime-400",    bg: "bg-lime-500/10 border-lime-500/20" },
    { label: "Recruiter Candidates", value: stats.candidates,      icon: UserCheck,     color: "text-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#0a192f]">
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fbbf24]/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#fbbf24]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin <span className="text-[#fbbf24]">Dashboard</span></h1>
              <p className="text-white/60 text-xs">Recruitly Group Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userId && <NotificationBell userId={userId} />}
            <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid — no framer-motion for performance */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {statCards.map((s) => (
            <Card key={s.label} className={`${s.bg} border`}>
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex flex-col gap-2">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className={`${s.color} text-xs leading-tight`}>{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="candidates" className="space-y-4">
          <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto gap-1 p-1">
            {[
              { value: "candidates",    label: "Candidates",        icon: UserCheck     },
              { value: "broadcast",     label: "Broadcast",         icon: Send          },
              { value: "jobs",          label: "Jobs",              icon: Briefcase     },
              { value: "universities",  label: "Universities",      icon: BookOpen      },
              { value: "hiring",        label: "Hiring Requests",   icon: Building2     },
              { value: "applications",  label: "Job Applications",  icon: ClipboardList },
              { value: "partners",      label: "Partners",          icon: Users         },
              { value: "wisescore",     label: "WiseScore",         icon: GraduationCap },
              { value: "visa",          label: "Visa",              icon: FileCheck     },
              { value: "consultations", label: "Consultations",     icon: MessageSquare },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value}
                className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a192f] text-white/70">
                <t.icon className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="candidates"><AdminCandidatesTab /></TabsContent>
          <TabsContent value="broadcast"><AdminBroadcastTab /></TabsContent>
          <TabsContent value="jobs"><AdminJobsTab /></TabsContent>
          <TabsContent value="universities"><AdminUniversitiesTab /></TabsContent>
          <TabsContent value="hiring"><AdminHiringRequestsTab /></TabsContent>
          <TabsContent value="applications"><AdminJobApplicationsTab /></TabsContent>
          <TabsContent value="partners"><AdminPartnersTab /></TabsContent>

          <TabsContent value="wisescore">
            <AdminDataTab title="WiseScore Leads" action="get_wisescore_leads" dataKey="leads"
              columns={["full_name","email","phone","nationality","destination_country","wise_score","score_tier","created_at"]}
              columnLabels={{ full_name:"Name", email:"Email", phone:"Phone", nationality:"Nationality", destination_country:"Country", wise_score:"Score", score_tier:"Tier", created_at:"Date" }}
              fileName="wisescore_leads" />
          </TabsContent>
          <TabsContent value="visa">
            <AdminDataTab title="Visa Predictions" action="get_visa_predictions" dataKey="predictions"
              columns={["user_id","target_country","visa_success_probability","sponsor_type","total_funds","visa_refusals","created_at"]}
              columnLabels={{ user_id:"User ID", target_country:"Country", visa_success_probability:"Success %", sponsor_type:"Sponsor", total_funds:"Funds", visa_refusals:"Refusals", created_at:"Date" }}
              fileName="visa_predictions" />
          </TabsContent>
          <TabsContent value="consultations">
            <AdminDataTab title="Consultation Requests" action="get_consultation_requests" dataKey="consultations"
              columns={["full_name","email","phone","service_type","country_of_interest","status","created_at"]}
              columnLabels={{ full_name:"Name", email:"Email", phone:"Phone", service_type:"Service", country_of_interest:"Country", status:"Status", created_at:"Date" }}
              fileName="consultation_requests" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
