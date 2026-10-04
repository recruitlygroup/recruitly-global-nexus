// Lightweight auth state for the public header (user + role). Dashboards use useAuth.
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useHeaderAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
      setRole(data?.role || "student");
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setTimeout(() => fetchRole(session.user.id), 0);
      else setRole(null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  }, []);

  const isAdmin = role === "admin";
  const dashboardPath = isAdmin ? "/admin-recruitly-secure" : "/dashboard";
  return { user, role, isAdmin, dashboardPath, signOut };
};
