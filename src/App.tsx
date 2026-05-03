// src/App.tsx
// ROOT CAUSE FIX: All dashboard routes were nested inside <Route element={<Layout />}>
// Layout renders the public SiteHeader (fixed white bar), SiteFooter, FloatingEmployerCTA
// and sets bg-background (light grey). Dashboard pages have their own dark bg-[#0a192f]
// but the Layout header sits on top making them appear white/broken.
//
// FIX: Dashboard routes and /auth are moved OUTSIDE the Layout wrapper.
// Public marketing pages keep the Layout (header + footer).
// Dashboard pages render fullscreen with their own headers.

import { lazy, Suspense } from "react";
import { Toaster }           from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider }   from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 }           from "lucide-react";
import Layout                from "./components/Layout";
import ProtectedRoute        from "./components/ProtectedRoute";

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
const PartnerDashboard       = lazy(() => import("./pages/PartnerDashboard"));
const RecruiterDashboard     = lazy(() => import("./pages/RecruiterDashboard"));
const ProfileSettings        = lazy(() => import("./pages/ProfileSettings"));
const AdminDashboard         = lazy(() => import("./pages/AdminDashboard"));
const NotFound               = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
    <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
  </div>
);

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
              <Route path="/education"               element={<Navigate to="/educational-consultancy" replace />} />
              <Route path="/educational-consultancy" element={<EducationalConsultancy />} />
              <Route path="/manpower-recruitment"    element={<ManpowerRecruitment />} />
              <Route path="/for-employers"           element={<ForEmployers />} />
              <Route path="/tours-and-travels"       element={<ToursAndTravels />} />
              <Route path="/apostille-services"      element={<ApostilleServices />} />
              <Route path="/universities"            element={<Universities />} />
              <Route path="/jobs"                    element={<JobBoard />} />
              <Route path="/blog"                    element={<BlogArchive />} />
              <Route path="/blog/:slug"              element={<BlogPost />} />
            </Route>

            {/* ── AUTH — no Layout (full-screen centered form) ── */}
            <Route path="/auth" element={<Auth />} />

            {/* ── DASHBOARD ROUTES — NO Layout wrapper ────────────────────────
                Each dashboard has its own sticky header. The public SiteHeader,
                SiteFooter, and FloatingEmployerCTA must NOT appear here.
            ──────────────────────────────────────────────────────────────────── */}

            <Route
              path="/admin-recruitly-secure"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recruiter-dashboard"
              element={
                <ProtectedRoute requireRole="recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/partner-dashboard"
              element={
                <ProtectedRoute requireRole="partner">
                  <PartnerDashboard />
                </ProtectedRoute>
              }
            />

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
);

export default App;
