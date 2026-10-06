// src/App.tsx
// ROOT CAUSE FIX: All dashboard routes were nested inside <Route element={<Layout />}>
// Layout renders the scam banner, sticky SiteHeader, SiteFooter, mobile CTA bar and cookie consent
// and sets bg-background (light grey). Dashboard pages have their own dark bg-[#0a192f]
// but the Layout header sits on top making them appear white/broken.
//
// FIX: Dashboard routes and /auth are moved OUTSIDE the Layout wrapper.
// Public marketing pages keep the Layout (header + footer).
// Dashboard pages render fullscreen with their own headers.

import { lazy, Suspense, useEffect } from "react";
import { Toaster }           from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider }   from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 }           from "lucide-react";
import Layout                from "./components/Layout";
import ProtectedRoute, { RECRUITER_DASHBOARD_URL } from "./components/ProtectedRoute";
import { I18nProvider } from "./i18n/I18nProvider";
import { EMPLOYER_DASHBOARD_URL, APOSTILLE_SEWA_URL } from "./config/nav";

// ── Lazy imports ──────────────────────────────────────────────────────────────
const Index                  = lazy(() => import("./pages/Index"));
const EducationalConsultancy = lazy(() => import("./pages/EducationalConsultancy"));
const ManpowerRecruitment    = lazy(() => import("./pages/ManpowerRecruitment"));
const InternRecruitment      = lazy(() => import("./pages/InternRecruitment"));
const NicheProgram           = lazy(() => import("./pages/niche/NicheProgram"));
const InfoPage               = lazy(() => import("./pages/InfoPage"));
const BlogAdminLogin         = lazy(() => import("./pages/BlogAdminLogin"));
const Universities           = lazy(() => import("./pages/Universities"));
const JobBoard               = lazy(() => import("./pages/JobBoard"));
const BlogArchive            = lazy(() => import("./pages/BlogArchive"));
const BlogPost               = lazy(() => import("./pages/BlogPost"));
const Auth                   = lazy(() => import("./pages/Auth"));
const StudentDashboard       = lazy(() => import("./pages/StudentDashboard"));
const CandidateDashboard     = lazy(() => import("./pages/CandidateDashboard"));
const StudyAbroadIndex       = lazy(() => import("./pages/StudyAbroad").then(m => ({ default: m.StudyAbroadIndex })));
const CountryPage            = lazy(() => import("./pages/StudyAbroad").then(m => ({ default: m.CountryPage })));
const UniversityDetail       = lazy(() => import("./pages/UniversityDetail"));
const Programs               = lazy(() => import("./pages/Programs"));
const ProgramDetail          = lazy(() => import("./pages/ProgramDetail"));
const ProfileSettings        = lazy(() => import("./pages/ProfileSettings"));
const AdminDashboard         = lazy(() => import("./pages/AdminDashboard"));
const NotFound               = lazy(() => import("./pages/NotFound"));
const RolePage               = lazy(() => import("./pages/RolePage"));
const SectionHub             = lazy(() => import("./pages/SectionHub"));
const IndustryPage           = lazy(() => import("./pages/IndustryPage"));
const JobLanding             = lazy(() => import("./pages/JobLanding"));
const LegalPage              = lazy(() => import("./pages/LegalPage"));
const SalaryCalculator       = lazy(() => import("./pages/SalaryCalculator"));
const TurnoverCalculator     = lazy(() => import("./pages/TurnoverCalculator"));
const MarketReport           = lazy(() => import("./pages/MarketReport"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
    <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
  </div>
);

// Recruiters/agents have their own dashboard site; old routes forward there instead of breaking.
const ExternalRedirect = ({ to }: { to: string }) => { useEffect(() => { window.location.replace(to); }, [to]); return <PageLoader />; };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            5 * 60 * 1000,
      gcTime:               10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry:                1,
    },
  },
});

const App = () => (
  <I18nProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── PUBLIC MARKETING ROUTES — with Layout (header + footer) ── */}
            <Route element={<Layout />}>
              <Route path="/"                        element={<Index />} />
              <Route path="/education"               element={<Navigate to="/student-recruitment" replace />} />
              <Route path="/educational-consultancy" element={<Navigate to="/student-recruitment" replace />} />

              {/* Three pillars */}
              <Route path="/student-recruitment"     element={<EducationalConsultancy />} />
              <Route path="/manpower-recruitment"    element={<ManpowerRecruitment />} />
              <Route path="/intern-recruitment"      element={<InternRecruitment />} />

              {/* Niche programmes */}
              <Route path="/specializations/:slug"   element={<NicheProgram />} />

              {/* Role pages — target of the "Roles we consistently fill" cards */}
              <Route path="/roles/:slug"            element={<RolePage />} />

              {/* ── Section overview pages (header dropdown "overview" links) ── */}
              <Route path="/why-recruitly"          element={<SectionHub id="why" />} />
              <Route path="/solutions"              element={<SectionHub id="solutions" />} />
              <Route path="/industries"             element={<SectionHub id="industries" />} />
              <Route path="/resources"              element={<SectionHub id="resources" />} />

              {/* ── Solutions ─────────────────────────────────────────────── */}
              <Route path="/solutions/temporary-staffing"    element={<InfoPage slug="temporary-placement" />} />
              <Route path="/solutions/permanent-recruitment" element={<InfoPage slug="permanent-placement" />} />
              <Route path="/solutions/managed-services"      element={<InfoPage slug="managed-services" />} />
              <Route path="/solutions/outsourcing"           element={<InfoPage slug="outsourcing" />} />
              <Route path="/solutions/onsite-management"     element={<InfoPage slug="onsite-management" />} />
              <Route path="/solutions/training"              element={<InfoPage slug="training" />} />
              <Route path="/solutions/document-attestation"  element={<InfoPage slug="document-attestation" />} />
              <Route path="/solutions/diversity-inclusion"   element={<InfoPage slug="diversity-inclusion" />} />

              {/* ── Job seekers ───────────────────────────────────────────── */}
              <Route path="/job-seekers/how-to-apply"        element={<InfoPage slug="how-to-apply" />} />
              <Route path="/job-seekers/working-with-us"     element={<InfoPage slug="working-with-recruitly" />} />
              <Route path="/job-seekers/faq"                 element={<InfoPage slug="faq" />} />
              <Route path="/job-seekers/companies"           element={<InfoPage slug="companies" />} />
              <Route path="/job-seekers/companies/:company"  element={<Navigate to="/job-seekers/companies" replace />} />

              {/* ── Employers ─────────────────────────────────────────────── */}
              <Route path="/employers/why-us"                element={<InfoPage slug="advantage" />} />
              <Route path="/employers/how-we-work"           element={<InfoPage slug="how-we-work" />} />
              <Route path="/employers/faq"                   element={<InfoPage slug="faq-employers" />} />
              <Route path="/employers/jobs-for-refugees"     element={<InfoPage slug="jobs-for-refugees" />} />
              <Route path="/employers/small-business-support" element={<InfoPage slug="small-business-support" />} />
              <Route path="/employers/mvp"                   element={<InfoPage slug="mvp" />} />
              <Route path="/career-center"                   element={<InfoPage slug="career-center" />} />
              <Route path="/employers/candidate-search"      element={<InfoPage slug="candidate-search" />} />
              <Route path="/employers/request-talent"        element={<InfoPage slug="request-talent" />} />

              {/* ── Industries, resources, job landing pages (built in later phases) ── */}
              <Route path="/industries/:industry"            element={<IndustryPage />} />
              <Route path="/resources/salary-calculator"     element={<SalaryCalculator />} />
              <Route path="/resources/cost-of-turnover"      element={<TurnoverCalculator />} />
              <Route path="/resources/market-report"        element={<MarketReport />} />
              <Route path="/jobs/type/:type"                 element={<JobLanding />} />
              <Route path="/jobs/sector/:sector"             element={<JobLanding />} />
              <Route path="/jobs/location/:city"             element={<JobLanding />} />

              {/* ── Company ───────────────────────────────────────────────── */}
              <Route path="/about"                           element={<InfoPage slug="about" />} />
              <Route path="/careers"                         element={<InfoPage slug="careers" />} />
              <Route path="/investors"                       element={<InfoPage slug="investors" />} />
              <Route path="/contact"                         element={<InfoPage slug="contact" />} />
              <Route path="/offices"                         element={<InfoPage slug="offices" />} />
              <Route path="/security-and-scams"              element={<InfoPage slug="security-and-scams" />} />

              {/* ── Legal ─────────────────────────────────────────────────── */}
              <Route path="/terms"                           element={<LegalPage slug="terms" />} />
              <Route path="/privacy"                         element={<LegalPage slug="privacy" />} />
              <Route path="/cookies"                         element={<LegalPage slug="cookies" />} />
              <Route path="/candidate-privacy"               element={<LegalPage slug="candidate-privacy" />} />
              <Route path="/equal-opportunity"               element={<LegalPage slug="equal-opportunity" />} />

              {/* ── Old URLs → new sitemap URLs ───────────────────────────── */}
              <Route path="/solutions/permanent-placement"        element={<Navigate to="/solutions/permanent-recruitment" replace />} />
              <Route path="/solutions/temporary-placement"        element={<Navigate to="/solutions/temporary-staffing" replace />} />
              <Route path="/job-seekers/working-with-recruitly"   element={<Navigate to="/job-seekers/working-with-us" replace />} />
              <Route path="/employers/advantage"                  element={<Navigate to="/employers/why-us" replace />} />
              <Route path="/employers/recruitment-hr-solutions"   element={<Navigate to="/solutions/managed-services" replace />} />
              <Route path="/employers/industry-sectors"           element={<Navigate to="/industries" replace />} />

              {/* Retired pages → redirects */}
              <Route path="/for-employers"        element={<ExternalRedirect to={EMPLOYER_DASHBOARD_URL} />} />
              <Route path="/apostille-services"   element={<ExternalRedirect to={APOSTILLE_SEWA_URL} />} />
              <Route path="/services/verifydocs/*" element={<ExternalRedirect to={APOSTILLE_SEWA_URL} />} />
              <Route path="/tours-and-travels"    element={<Navigate to="/" replace />} />

              <Route path="/universities"            element={<Universities />} />
              <Route path="/universities/:slug"      element={<UniversityDetail />} />
              <Route path="/programs"                element={<Programs />} />
              <Route path="/programs/:slug"          element={<ProgramDetail />} />
              <Route path="/study-abroad"            element={<StudyAbroadIndex />} />
              <Route path="/study-abroad/:country"   element={<CountryPage />} />
              <Route path="/jobs"                    element={<JobBoard />} />
              <Route path="/blog"                    element={<BlogArchive />} />
              <Route path="/blog/:slug"              element={<BlogPost />} />
            </Route>

            <Route path="/blog/login/admin" element={<BlogAdminLogin />} />

            {/* ── AUTH — no Layout (full-screen centered form) ── */}
            <Route path="/auth" element={<Auth />} />

            {/* ── DASHBOARD ROUTES — NO Layout wrapper ────────────────────────
                Each dashboard has its own sticky header. The public SiteHeader,
                SiteFooter and mobile CTA bar must NOT appear here.
            ──────────────────────────────────────────────────────────────────── */}

            <Route
              path="/admin-recruitly-secure"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/recruiter-dashboard" element={<ExternalRedirect to={RECRUITER_DASHBOARD_URL} />} />
            <Route path="/partner-dashboard"   element={<ExternalRedirect to={RECRUITER_DASHBOARD_URL} />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/candidate-dashboard"
              element={
                <ProtectedRoute requireRole="candidate">
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile-settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </I18nProvider>
);

export default App;
