// src/components/ProtectedRoute.tsx — REPLACE existing file
//
// ROOT CAUSE OF REDIRECT BUG:
// The old ProtectedRoute only checked `requireAdmin`. It had no awareness of
// OTHER roles (recruiter, partner, candidate). So /recruiter-dashboard had no
// role guard — anyone authenticated could visit it — but the Auth.tsx redirect
// logic was checking roleData?.role === "recruiter" as a string comparison
// against the enum value. If the 'recruiter' enum value wasn't in the DB yet,
// the check silently fell through to the `else` branch → /dashboard (student).
//
// FIX: ProtectedRoute now accepts `requireRole` prop. Each protected route
// specifies exactly which role(s) are allowed. Wrong-role users are redirected
// to their correct dashboard, not to / (which confused users).

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AllowedRole = "admin" | "recruiter" | "partner" | "student" | "candidate";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;          // legacy prop — kept for backward compat
  requireRole?: AllowedRole | AllowedRole[];  // new: specific role(s) required
}

// Maps a role to its home dashboard path
export const ROLE_HOME: Record<string, string> = {
  admin:     "/admin-recruitly-secure",
  recruiter: "/recruiter-dashboard",
  partner:   "/partner-dashboard",
  candidate: "/candidate-dashboard",
  student:   "/dashboard",
};

type RouteStatus = "loading" | "authed" | "unauthed" | "wrong_role";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireRole,
}: ProtectedRouteProps) => {
  const [status,   setStatus]   = useState<RouteStatus>("loading");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus("unauthed"); return; }

      // Fetch the user's actual role from DB (source of truth)
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role, status")
        .eq("user_id", session.user.id)
        .maybeSingle();

      const role = (roleRow?.role as string) ?? "student";
      setUserRole(role);

      // Admin check (legacy prop)
      if (requireAdmin) {
        const { data: isAdmin } = await supabase.rpc("is_admin", {
          _user_id: session.user.id,
        });
        setStatus(isAdmin ? "authed" : "wrong_role");
        return;
      }

      // Role-specific check
      if (requireRole) {
        const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
        setStatus(allowed.includes(role as AllowedRole) ? "authed" : "wrong_role");
        return;
      }

      // No role requirement — any authenticated user is fine
      setStatus("authed");
    };

    check();
  }, [requireAdmin, requireRole]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "unauthed") {
    return <Navigate to="/auth" replace />;
  }

  if (status === "wrong_role") {
    // Redirect to the user's correct dashboard instead of dumping them at /
    const correctPath = userRole ? (ROLE_HOME[userRole] ?? "/") : "/auth";
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
