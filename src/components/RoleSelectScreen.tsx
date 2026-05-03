
// RoleSelectScreen.tsx
// Post-auth screen shown if no role is assigned yet.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Briefcase, Users, Loader2 } from "lucide-react";

const ROLES = [
  { id: "student",  label: "Student",           icon: GraduationCap, desc: "Study abroad, visa & university guidance" },
  { id: "partner",  label: "Recruiter / Agent",  icon: Users,         desc: "Manage candidates & recruitment pipeline" },
  { id: "candidate",label: "Job Seeker",         icon: Briefcase,     desc: "Apply for jobs via a verified recruiter" },
] as const;

const ROLE_HOME: Record<string, string> = {
  student:   "/dashboard",
  partner:   "/partner-dashboard",
  candidate: "/candidate-dashboard",
};

export default function RoleSelectScreen({ userId }: { userId: string }) {
  const navigate        = useNavigate();
  const [saving, setSaving] = useState(false);

  const pick = async (role: typeof ROLES[number]["id"]) => {
    setSaving(true);
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: role as any,
      status: "pending",
    });
    setSaving(false);
    if (!error) navigate(ROLE_HOME[role] ?? "/");
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Choose your role</h1>
        <p className="text-white/50 text-sm text-center mb-8">Select how you'll use Recruitly Group</p>
        <div className="space-y-3">
          {ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => pick(r.id)}
              disabled={saving}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#fbbf24]/50 hover:bg-white/5 transition-all text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-[#fbbf24]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <r.icon className="w-5 h-5 text-[#fbbf24]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{r.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{r.desc}</p>
              </div>
              {saving && <Loader2 className="w-4 h-4 animate-spin text-[#fbbf24] ml-auto" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
