import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed" | "forbidden">("loading");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus("unauthed"); return; }
      if (requireAdmin) {
        const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: session.user.id });
        setStatus(isAdmin ? "authed" : "forbidden");
      } else {
        setStatus("authed");
      }
    };
    check();
  }, [requireAdmin]);

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );
  if (status === "unauthed") return <Navigate to="/auth" replace />;
  if (status === "forbidden") return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
