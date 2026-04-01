import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, GraduationCap, School, User, LogOut, Loader2,
  CheckCircle2, AlertTriangle, ArrowRight, MessageCircle, Target, Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import VisaPredictorForm, { type VisaFormData, type VisaPredictionResult } from "@/components/education/VisaPredictorForm";
import VisaPredictionResultDisplay from "@/components/education/VisaPredictionResult";

type TabId = "overview" | "admission" | "visa" | "universities" | "profile";

interface WiseScoreData {
  id: string;
  created_at: string;
  target_country: string | null;
  study_level: string | null;
  field: string | null;
  specific_program: string | null;
  nationality: string | null;
  age_range: string | null;
  highest_education: string | null;
  current_status: string | null;
  education_gap: string | null;
  grading_system: string | null;
  academic_score: number | null;
  english_test: string | null;
  english_score: number | null;
  has_passport: boolean | null;
  wise_score: number | null;
  admission_score: number | null;
  visa_score: number | null;
  scholarship_score: number | null;
  rejection_risk: string | null;
  top_universities: any[] | null;
  action_items: string[] | null;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  nationality: string | null;
  avatar_url: string | null;
}

interface VisaPredictionData {
  id: string;
  visa_success_probability: number | null;
  risk_flags: string[];
  action_items: string[];
  travel_history_boost: number | null;
  target_country: string | null;
}

const TABS = [
  { id: "overview" as TabId, label: "Overview", icon: LayoutDashboard },
  { id: "admission" as TabId, label: "Admission", icon: GraduationCap },
  { id: "visa" as TabId, label: "Visa", icon: Shield },
  { id: "universities" as TabId, label: "Universities", icon: School },
  { id: "profile" as TabId, label: "Profile", icon: User },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wiseScore, setWiseScore] = useState<WiseScoreData | null>(null);
  const [allScores, setAllScores] = useState<WiseScoreData[]>([]);
  const [visaPrediction, setVisaPrediction] = useState<VisaPredictionData | null>(null);
  const [showVisaForm, setShowVisaForm] = useState(false);
  const [editProfile, setEditProfile] = useState({ full_name: "", whatsapp: "", nationality: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const [profileRes, scoresRes, visaRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
        supabase.from("wisescore_results").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("visa_predictions").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      const p = profileRes.data as UserProfile | null;
      setProfile(p);
      setEditProfile({
        full_name: p?.full_name || "",
        whatsapp: p?.whatsapp || "",
        nationality: p?.nationality || "",
      });

      const scores = (scoresRes.data || []) as unknown as WiseScoreData[];
      setAllScores(scores);
      if (scores.length > 0) setWiseScore(scores[0]);

      if (visaRes.data) {
        setVisaPrediction({
          id: visaRes.data.id,
          visa_success_probability: visaRes.data.visa_success_probability as number | null,
          risk_flags: (visaRes.data.risk_flags as string[]) || [],
          action_items: (visaRes.data.action_items as string[]) || [],
          travel_history_boost: visaRes.data.travel_history_boost as number | null,
          target_country: visaRes.data.target_country as string | null,
        });
      }

      setIsLoading(false);
    };

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: editProfile.full_name,
      whatsapp: editProfile.whatsapp,
      nationality: editProfile.nationality,
    }).eq("id", profile.id);
    setIsSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    } else {
      setProfile({ ...profile, ...editProfile });
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    }
  };

  const handleVisaComplete = async (result: VisaPredictionResult, formData: VisaFormData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const row = {
      user_id: session.user.id,
      target_country: formData.targetCountry,
      sponsor_type: formData.sponsorType,
      sponsor_profession: formData.sponsorProfession,
      income_source: formData.incomeSource,
      monthly_income: formData.monthlyIncome,
      tax_documents: formData.taxDocuments,
      total_funds: formData.totalFunds,
      funds_history: formData.fundsHistory,
      sudden_deposit: formData.suddenDeposit,
      accommodation: formData.accommodation,
      visa_refusals: formData.visaRefusals,
      refusal_country: formData.refusalCountry,
      reapplied_successfully: formData.reappliedSuccessfully,
      valid_visas: formData.validVisas,
      studied_abroad: formData.studiedAbroad,
      studied_abroad_country: formData.studiedAbroadCountry,
      family_in_destination: formData.familyInDestination,
      program_available_home: formData.programAvailableHome,
      career_plan: formData.careerPlan,
      offer_letter: formData.offerLetter,
      sop_status: formData.sopStatus,
      property_ownership: formData.propertyOwnership,
      employment: formData.employment,
      family_home: formData.familyHome,
      financial_liabilities: formData.financialLiabilities,
      passport_status: formData.passportStatus,
      police_clearance: formData.policeClearance,
      medical_test: formData.medicalTest,
      transcripts: formData.transcripts,
      visa_success_probability: result.visaScore,
      risk_flags: result.riskFlags,
      action_items: result.actionItems,
      travel_history_boost: result.travelBoost,
    };

    const { data, error } = await supabase.from("visa_predictions").insert(row as any).select().single();

    if (!error && data) {
      setVisaPrediction({
        id: data.id,
        visa_success_probability: result.visaScore,
        risk_flags: result.riskFlags,
        action_items: result.actionItems,
        travel_history_boost: result.travelBoost,
        target_country: formData.targetCountry,
      });
    }
    setShowVisaForm(false);
  };

  const scoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const strengths = useMemo(() => {
    if (!wiseScore) return [];
    const s: { label: string; detail: string }[] = [];
    if (wiseScore.academic_score && wiseScore.academic_score >= 3.0)
      s.push({ label: "Strong GPA ✅", detail: `Your academic score of ${wiseScore.academic_score} is competitive` });
    if (wiseScore.english_score && wiseScore.english_score >= 6.5)
      s.push({ label: "Strong English ✅", detail: `${wiseScore.english_test?.toUpperCase()} ${wiseScore.english_score} meets most requirements` });
    if (wiseScore.highest_education && ["bachelor", "master", "phd"].includes(wiseScore.highest_education.toLowerCase()))
      s.push({ label: "Qualified Education ✅", detail: "Your education level qualifies for most programs" });
    if (wiseScore.education_gap === "No Gap" || wiseScore.education_gap === "no_gap")
      s.push({ label: "Clean Timeline ✅", detail: "No education gap strengthens your profile" });
    if (wiseScore.has_passport)
      s.push({ label: "Passport Ready ✅", detail: "Travel document ready for visa application" });
    return s;
  }, [wiseScore]);

  const weaknesses = useMemo(() => {
    if (!wiseScore) return [];
    const w: { label: string; detail: string }[] = [];
    if (wiseScore.academic_score && wiseScore.academic_score < 3.0)
      w.push({ label: "⚠️ GPA needs improvement", detail: "Aim for 3.0+ for most programs" });
    if (wiseScore.english_score && wiseScore.english_score < 6.0)
      w.push({ label: "⚠️ Retake English test", detail: "Minimum 6.0 required for most visas" });
    if (!wiseScore.english_test || wiseScore.english_test === "moi" || wiseScore.english_test === "none")
      w.push({ label: "⚠️ Missing English test", detail: "Take IELTS/PTE/TOEFL before applying" });
    if (wiseScore.education_gap && wiseScore.education_gap !== "No Gap" && wiseScore.education_gap !== "no_gap")
      w.push({ label: "⚠️ Education gap detected", detail: "Explain your gap in a strong SOP" });
    if (!wiseScore.has_passport)
      w.push({ label: "⚠️ No passport", detail: "Apply for passport immediately" });
    return w;
  }, [wiseScore]);

  const profileCompleteness = useMemo(() => {
    if (!wiseScore) return 0;
    const fields = [
      wiseScore.target_country, wiseScore.study_level, wiseScore.field,
      wiseScore.nationality, wiseScore.highest_education, wiseScore.academic_score,
      wiseScore.english_test, wiseScore.english_score, wiseScore.has_passport,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [wiseScore]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Student";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border p-4 sticky top-16 h-[calc(100vh-4rem)]">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowVisaForm(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        <Button variant="ghost" onClick={handleLogout} className="justify-start text-muted-foreground mt-auto">
          <LogOut className="w-4 h-4 mr-2" /> Log Out
        </Button>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowVisaForm(false); }}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, {firstName}! 👋</h1>
              <p className="text-muted-foreground mt-1">Here's your study abroad progress</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">WiseScore</p>
                <p className={`text-2xl font-bold ${scoreColor(wiseScore?.wise_score ?? null)}`}>
                  {wiseScore?.wise_score ?? "—"}<span className="text-sm text-muted-foreground">/100</span>
                </p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Admission Match</p>
                <p className={`text-2xl font-bold ${scoreColor(wiseScore?.admission_score ?? null)}`}>
                  {wiseScore?.admission_score ?? "—"}%
                </p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Visa Prediction</p>
                <p className={`text-2xl font-bold ${scoreColor(visaPrediction?.visa_success_probability ?? null)}`}>
                  {visaPrediction?.visa_success_probability ? `${visaPrediction.visa_success_probability}%` : "Not predicted"}
                </p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Profile Complete</p>
                <p className="text-2xl font-bold text-foreground">{profileCompleteness}%</p>
              </CardContent></Card>
            </div>

            {!wiseScore && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Take Your WiseScore Assessment</h3>
                  <p className="text-muted-foreground mb-4">Find out which universities match your profile</p>
                  <Button asChild><Link to="/educational-consultancy">Check My WiseScore <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
                </CardContent>
              </Card>
            )}

            {wiseScore && (
              <Card><CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Quick Summary</h3>
                  <Link to="/educational-consultancy" className="text-sm text-primary hover:underline">Retake WiseScore →</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Country</span><p className="font-medium">{wiseScore.target_country || "—"}</p></div>
                  <div><span className="text-muted-foreground">Level</span><p className="font-medium">{wiseScore.study_level || "—"}</p></div>
                  <div><span className="text-muted-foreground">Field</span><p className="font-medium">{wiseScore.field || "—"}</p></div>
                  <div><span className="text-muted-foreground">Last Updated</span><p className="font-medium">{new Date(wiseScore.created_at).toLocaleDateString()}</p></div>
                </div>
              </CardContent></Card>
            )}
          </motion.div>
        )}

        {/* ADMISSION TAB */}
        {activeTab === "admission" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Admission Analysis</h1>

            {!wiseScore ? (
              <Card className="border-dashed"><CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assessment Yet</h3>
                <p className="text-muted-foreground mb-4">Complete your WiseScore to see admission analysis</p>
                <Button asChild><Link to="/educational-consultancy">Take WiseScore <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
              </CardContent></Card>
            ) : (
              <>
                {strengths.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" /> Strengths
                    </h2>
                    <div className="grid gap-3 md:grid-cols-2">
                      {strengths.map((s, i) => (
                        <Card key={i} className="border-green-200 bg-green-50/50"><CardContent className="p-4">
                          <p className="font-medium text-green-800">{s.label}</p>
                          <p className="text-sm text-green-700/80 mt-1">{s.detail}</p>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" /> Areas to Improve
                    </h2>
                    <div className="grid gap-3 md:grid-cols-2">
                      {weaknesses.map((w, i) => (
                        <Card key={i} className="border-orange-200 bg-orange-50/50"><CardContent className="p-4">
                          <p className="font-medium text-orange-800">{w.label}</p>
                          <p className="text-sm text-orange-700/80 mt-1">{w.detail}</p>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                )}
                {wiseScore.top_universities && Array.isArray(wiseScore.top_universities) && wiseScore.top_universities.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-3">Matched Programs</h2>
                    <div className="grid gap-3">
                      {(wiseScore.top_universities as any[]).slice(0, 5).map((uni: any, i: number) => (
                        <Card key={i}><CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{uni.name}</p>
                            <p className="text-sm text-muted-foreground">{uni.country}</p>
                          </div>
                          <Badge className={`${uni.matchPct >= 80 ? "bg-green-100 text-green-800" : uni.matchPct >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-orange-100 text-orange-800"}`}>
                            {uni.matchPct}% Match
                          </Badge>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                )}
                {wiseScore.action_items && Array.isArray(wiseScore.action_items) && wiseScore.action_items.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-3">Action Items</h2>
                    <Card><CardContent className="p-4 space-y-3">
                      {(wiseScore.action_items as string[]).map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                          <p className="text-sm text-foreground">{item}</p>
                        </div>
                      ))}
                    </CardContent></Card>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* VISA PREDICTOR TAB */}
        {activeTab === "visa" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Visa Predictor</h1>

            {showVisaForm ? (
              <VisaPredictorForm
                onComplete={handleVisaComplete}
                onCancel={() => setShowVisaForm(false)}
                prefillCountry={wiseScore?.target_country || ""}
                prefillWhatsapp={profile?.whatsapp || ""}
                prefillEmail={profile?.email || ""}
              />
            ) : visaPrediction ? (
              <VisaPredictionResultDisplay
                result={{
                  visaScore: visaPrediction.visa_success_probability || 0,
                  riskFlags: visaPrediction.risk_flags,
                  travelBoost: visaPrediction.travel_history_boost || 0,
                  actionItems: visaPrediction.action_items,
                }}
                targetCountry={visaPrediction.target_country || ""}
                onRedo={() => setShowVisaForm(true)}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">🛂 Predict Your Visa Success</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Answer a detailed questionnaire and our AI will calculate your visa approval probability based on our demographic model.
                  </p>
                  <Button onClick={() => setShowVisaForm(true)} className="gap-2">
                    Start Visa Assessment <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* UNIVERSITIES TAB */}
        {activeTab === "universities" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">My Universities</h1>
              <Button variant="outline" size="sm" asChild><Link to="/universities">Browse All →</Link></Button>
            </div>

            {wiseScore?.target_country ? (
              <Card><CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  Showing universities in <span className="font-semibold text-foreground">{wiseScore.target_country}</span> matching your profile
                </p>
                <Button asChild>
                  <Link to={`/universities?country=${encodeURIComponent(wiseScore.target_country)}`}>
                    View Matching Universities <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent></Card>
            ) : (
              <Card className="border-dashed"><CardContent className="p-8 text-center">
                <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Complete WiseScore First</h3>
                <p className="text-muted-foreground mb-4">Take the assessment to get personalized university matches</p>
                <Button asChild><Link to="/educational-consultancy">Check My WiseScore</Link></Button>
              </CardContent></Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex items-center gap-4">
                <MessageCircle className="w-8 h-8 text-green-600 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Need Help Applying?</h3>
                  <p className="text-sm text-muted-foreground">Our experts can guide you through the application process</p>
                </div>
                <Button asChild size="sm">
                  <a href="https://wa.me/9779743208282?text=Hi%20Recruitly!%20I%20need%20help%20with%20university%20applications." target="_blank" rel="noopener noreferrer">
                    WhatsApp Us
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

            <Card><CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={editProfile.full_name} onChange={(e) => setEditProfile({ ...editProfile, full_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email (read-only)</Label>
                <Input value={profile?.email || ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp</Label>
                <Input value={editProfile.whatsapp} onChange={(e) => setEditProfile({ ...editProfile, whatsapp: e.target.value })} placeholder="+977 98XXXXXXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Nationality</Label>
                <Input value={editProfile.nationality} onChange={(e) => setEditProfile({ ...editProfile, nationality: e.target.value })} />
              </div>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </CardContent></Card>

            {allScores.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">WiseScore History</h2>
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Score</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Country</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allScores.map((s) => (
                          <tr key={s.id} className="border-b border-border/50">
                            <td className="p-3">{new Date(s.created_at).toLocaleDateString()}</td>
                            <td className={`p-3 font-semibold ${scoreColor(s.wise_score)}`}>{s.wise_score ?? "—"}</td>
                            <td className="p-3">{s.target_country || "—"}</td>
                            <td className="p-3">{s.study_level || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
