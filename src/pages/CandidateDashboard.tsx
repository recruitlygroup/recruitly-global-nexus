import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Briefcase, 
  LogOut,
  Loader2,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  BookOpen,
  Globe,
  Star,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Offer {
  id: string;
  type: "job" | "study";
  title: string;
  company?: string;
  university?: string;
  location: string;
  salary?: string;
  scholarship?: string;
  deadline: string;
  description: string;
  tags: string[];
  featured?: boolean;
}

const mockOffers: Offer[] = [
  {
    id: "1",
    type: "job",
    title: "Software Engineer",
    company: "Tech Corp International",
    location: "Dubai, UAE",
    salary: "$4,500 - $6,000/month",
    deadline: "March 15, 2026",
    description: "Join our growing engineering team to build scalable web applications using React and Node.js.",
    tags: ["React", "Node.js", "Remote-friendly"],
    featured: true,
  },
  {
    id: "2",
    type: "study",
    title: "MSc Computer Science",
    university: "University of Melbourne",
    location: "Melbourne, Australia",
    scholarship: "Up to 50% tuition covered",
    deadline: "April 30, 2026",
    description: "World-ranked program with research opportunities in AI and machine learning.",
    tags: ["STEM", "Research", "Scholarship Available"],
    featured: true,
  },
  {
    id: "3",
    type: "job",
    title: "Healthcare Assistant",
    company: "Royal London Hospital",
    location: "London, UK",
    salary: "£25,000 - £30,000/year",
    deadline: "February 28, 2026",
    description: "Support nursing staff in providing patient care across various hospital departments.",
    tags: ["Healthcare", "Visa Sponsorship", "Training Provided"],
  },
  {
    id: "4",
    type: "study",
    title: "BBA International Business",
    university: "Humber College",
    location: "Toronto, Canada",
    scholarship: "Entry scholarship available",
    deadline: "May 15, 2026",
    description: "Practical business education with co-op work experience opportunities.",
    tags: ["Business", "Co-op", "Post-grad Work Permit"],
  },
  {
    id: "5",
    type: "job",
    title: "Hotel Management Trainee",
    company: "Marriott International",
    location: "Singapore",
    salary: "SGD 3,000 - 3,500/month",
    deadline: "March 30, 2026",
    description: "18-month rotational program across all hotel departments with management track.",
    tags: ["Hospitality", "Training Program", "Career Growth"],
  },
  {
    id: "6",
    type: "study",
    title: "MBBS Medicine",
    university: "Kathmandu University",
    location: "Nepal",
    scholarship: "Merit-based scholarships",
    deadline: "June 30, 2026",
    description: "Internationally recognized medical degree with clinical rotations.",
    tags: ["Medicine", "Clinical", "Affordable"],
  },
];

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; fullName: string } | null>(null);
  const [appliedOffers, setAppliedOffers] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "job" | "study">("all");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      setUser({ 
        email: session.user.email || "", 
        fullName: profileData?.full_name || session.user.user_metadata?.full_name || "Candidate"
      });
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleApply = (offerId: string, offerTitle: string) => {
    setAppliedOffers(prev => new Set(prev).add(offerId));
    toast({
      title: "Application Submitted!",
      description: `Your application for "${offerTitle}" has been received. We'll be in touch soon.`,
    });
  };

  const filteredOffers = mockOffers.filter(offer => {
    if (filter === "all") return true;
    return offer.type === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a192f]">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome, <span className="text-[#fbbf24]">{user?.fullName}</span>
            </h1>
            <p className="text-white/60 text-sm">{user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Available Jobs</p>
                  <p className="text-2xl font-bold text-white">{mockOffers.filter(o => o.type === "job").length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Study Programs</p>
                  <p className="text-2xl font-bold text-white">{mockOffers.filter(o => o.type === "study").length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Your Applications</p>
                  <p className="text-2xl font-bold text-white">{appliedOffers.size}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "job", "study"] as const).map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? "default" : "outline"}
              className={filter === f 
                ? "bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]" 
                : "border-white/20 text-white hover:bg-white/10"
              }
            >
              {f === "all" ? "All Opportunities" : f === "job" ? "Jobs" : "Study Programs"}
            </Button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOffers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-white/5 border-white/10 backdrop-blur-lg hover:border-[#fbbf24]/30 transition-all duration-300 ${offer.featured ? "ring-1 ring-[#fbbf24]/30" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {offer.type === "job" ? (
                          <Briefcase className="w-4 h-4 text-blue-400" />
                        ) : (
                          <GraduationCap className="w-4 h-4 text-purple-400" />
                        )}
                        <Badge variant="outline" className={offer.type === "job" ? "border-blue-400/50 text-blue-400" : "border-purple-400/50 text-purple-400"}>
                          {offer.type === "job" ? "Job" : "Study"}
                        </Badge>
                        {offer.featured && (
                          <Badge className="bg-[#fbbf24]/20 text-[#fbbf24] border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-white text-lg">{offer.title}</CardTitle>
                      <CardDescription className="text-white/70 flex items-center gap-2 mt-1">
                        {offer.type === "job" ? (
                          <>
                            <Building2 className="w-4 h-4" />
                            {offer.company}
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4" />
                            {offer.university}
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/60 text-sm">{offer.description}</p>
                  
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1 text-white/70">
                      <MapPin className="w-4 h-4 text-[#fbbf24]" />
                      {offer.location}
                    </div>
                    {offer.salary && (
                      <div className="flex items-center gap-1 text-white/70">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        {offer.salary}
                      </div>
                    )}
                    {offer.scholarship && (
                      <div className="flex items-center gap-1 text-white/70">
                        <Globe className="w-4 h-4 text-purple-400" />
                        {offer.scholarship}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-white/70">
                      <Clock className="w-4 h-4 text-orange-400" />
                      Deadline: {offer.deadline}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {offer.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/10 text-white/80 border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleApply(offer.id, offer.title)}
                    disabled={appliedOffers.has(offer.id)}
                    className={appliedOffers.has(offer.id) 
                      ? "w-full bg-green-500/20 text-green-400 border border-green-400/30 cursor-not-allowed" 
                      : "w-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d97706] text-[#0a192f] font-semibold"
                    }
                  >
                    {appliedOffers.has(offer.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
