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
const ApostilleServices      = lazy(() => import("./pages/The build failed because AI response conversational text was accidentally pasted directly into line 41 of your **`src/App.tsx`** file during a copy-paste update:

```tsx
// ❌ What is currently on line 41:
const Programs = lazy(() => import("./Here is the complete, resolved `App.tsx` file. 
The structure is fully intact...
