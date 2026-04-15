import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, MessageCircle, Mail, Phone, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerifiedRecruiter {
  id: string;
  full_name: string | null;
  company_name: string | null;
  contact_number: string | null;
  phone: string | null;
}

const VerifiedRecruiters = () => {
  const [recruiters, setRecruiters] = useState<VerifiedRecruiter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiters = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("id, full_name, company_name, contact_number, phone")
        .eq("role", "recruiter" as any)
        .eq("is_verified", true);

      setRecruiters((data as VerifiedRecruiter[]) || []);
      setLoading(false);
    };
    fetchRecruiters();
  }, []);

  if (loading) {
    return (
      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (recruiters.length === 0) return null;

  return (
    <section className="px-4 py-12 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3 text-xs font-semibold border-primary/30 text-primary">
            <Shield className="w-3.5 h-3.5 mr-1" /> Verified Recruiters
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">
            Want to Apply? Contact a Verified Recruiter
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto">
            Choose a verified recruiter below to start your application process. They will guide you through every step.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruiters.map((rec) => {
            const whatsappNum = (rec.contact_number || rec.phone || "").replace(/\D/g, "");
            const displayName = rec.full_name || "Recruiter";
            const company = rec.company_name;

            return (
              <div
                key={rec.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm truncate">{displayName}</h3>
                      <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    </div>
                    {company && (
                      <p className="text-xs text-muted-foreground truncate">{company}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {whatsappNum && (
                    <a
                      href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(`Hi ${displayName}, I found your profile on Recruitly Group's Job Board. I'm interested in applying for a job. Please guide me.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  )}
                  {whatsappNum && (
                    <a
                      href={`tel:${whatsappNum}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg transition-colors border border-border"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VerifiedRecruiters;
