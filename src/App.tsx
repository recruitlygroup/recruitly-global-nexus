// src/App.tsx
// ROOT CAUSE FIX: All dashboard routes were nested inside <Route element={<Layout />}>
// Layout renders the public SiteHeader (fixed white bar), SiteFooter, FloatingEmployerCTA
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
import ProtectedRoute        from "./components/ProtectedRoute";

// ── Target URL for Recruiter / Partner Dashboard redirects ─────────────────────
const RECRUITER_DASHBOARD_URL = "https://recruiter.recruitlygroup.com"; // Adjust target URL if needed

// ── Lazy imports ──────────────────────────────────────────────────────────────
const Index                  = lazy(() => import("./pages/Index"));
const EducationalConsultancy = lazy(() => import("./pages/EducationalConsultancy"));
const ManpowerRecruitment    = lazy(() => import("./pages/ManpowerRecruitment"));
const ForEmployers           = lazy(() => import("./pages/ForEmployers"));
const ToursAndTravels        = lazy(() => import("./pages/ToursAndTravels"));
const ApostilleServices      = lazy(() => import("./pages/ApostilleServices"));
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
const Programs                = lazy(() => import("./Here is the complete, resolved `App.tsx` file. 

The structure is fully intact, ensuring all lazy-loaded routes, dashboard isolation outside `<Layout />`, route guards, external redirects, and provider trees are maintained without missing imports or typos.

```tsx
// src/App.tsx

import { lazy, Suspense, useEffect } from "react";
import { Toaster }           from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider }   from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 }           from "lucide-react";
import Layout                from "./components/Layout";
import ProtectedRoute, { RECRUITER_DASHBOARD_URL } from "./components/ProtectedRoute";

// ── Lazy imports ──────────────────────────────────────────────────────────────
const Index                  = lazy(() => import("./pages/Index"));
const EducationalConsultancy = lazy(() => import("./pages/EducationalConsultancy"));
const ManpowerRecruitment    = lazy(() => import("./pages/ManpowerRecruitment"));
const ForEmployers           = lazy(() => import("./pages/ForEmployers"));
const ToursAndTravels        = lazy(() => import("./pages/ToursAndTravels"));
const ApostilleServices      = lazy(() => import("./pages/ApostilleServices"));
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

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
    <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]"/>
  </div>
);

// Recruiters/agents have their own dashboard site; old routes forward there instead of breaking.
const ExternalRedirect = ({ to }: { to: string }) => { 
  useEffect(() => { 
    window.location.replace(to); 
  }, [to]); 
  return <PageLoader/>; 
};

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
  <QueryClientProvider client="{queryClient}">
    <TooltipProvider>
      <Toaster/>
      <Sonner/>
      <BrowserRouter>
        <Suspense fallback="{<PageLoader"/>}>
          <Routes>

            {/* ── PUBLIC MARKETING ROUTES — with Layout (header + footer) ── */}
            <Route element="{<Layout"/>}>
              <Route element="{<Index" path="/"/>} />
              <Route element="{<Navigate" path="/education" replace to="/educational-consultancy"/>} />
              <Route element="{<EducationalConsultancy" path="/educational-consultancy"/>} />
              <Route element="{<ManpowerRecruitment" path="/manpower-recruitment"/>} />
              <Route element="{<ForEmployers" path="/for-employers"/>} />
              <Route element="{<ToursAndTravels" path="/tours-and-travels"/>} />
              <Route element="{<ApostilleServices" path="/apostille-services"/>} />
              <Route element="{<Universities" path="/universities"/>} />
              <Route element="{<UniversityDetail" path="/universities/:slug"/>} />
              <Route element="{<Programs" path="/programs"/>} />
              <Route element="{<ProgramDetail" path="/programs/:slug"/>} />
              <Route element="{<StudyAbroadIndex" path="/study-abroad"/>} />
              <Route element="{<CountryPage" path="/study-abroad/:country"/>} />
              <Route element="{<JobBoard" path="/jobs"/>} />
              <Route element="{<BlogArchive" path="/blog"/>} />
              <Route element="{<BlogPost" path="/blog/:slug"/>} />
            </Route>

            {/* ── AUTH — no Layout (full-screen centered form) ── */}
            <Route element="{<Auth" path="/auth"/>} />

            {/* ── DASHBOARD ROUTES — NO Layout wrapper ────────────────────────
                Each dashboard has its own sticky header. The public SiteHeader,
                SiteFooter, and FloatingEmployerCTA must NOT appear here.
            ──────────────────────────────────────────────────────────────────── */}

            <Route <ProtectedRoute element="{" path="/admin-recruitly-secure" requireAdmin>
                  <AdminDashboard/>
                </ProtectedRoute>
              }
            />

            <Route element="{<ExternalRedirect" path="/recruiter-dashboard" to="{RECRUITER_DASHBOARD_URL}"/>} />
            <Route element="{<ExternalRedirect" path="/partner-dashboard" to="{RECRUITER_DASHBOARD_URL}"/>} />

            <Route <ProtectedRoute element="{" path="/dashboard" requireRole="student">
                  <StudentDashboard/>
                </ProtectedRoute>
              }
            />

            <Route <ProtectedRoute element="{" path="/candidate-dashboard" requireRole="candidate">
                  <CandidateDashboard/>
                </ProtectedRoute>
              }
            />

            <Route <ProtectedRoute element="{" path="/profile-settings">
                  <ProfileSettings/>
                </ProtectedRoute>
              }
            />

            {/* ── 404 ── */}
            <Route element="{<NotFound" path="*"/>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
