import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, RefreshCw, MessageCircle, Mail, Instagram, ExternalLink, Briefcase } from "lucide-react";
import { useJobBoard, Job, Terms } from "@/hooks/useJobBoard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const COUNTRY_CONFIG: Record<string, { flag: string; color: string; bg: string; text: string }> = {
  Bulgaria:  { flag: "🇧🇬", color: "hsl(122, 39%, 49%)", bg: "hsl(122, 39%, 94%)", text: "hsl(122, 39%, 30%)" },
  Romania:   { flag: "🇷🇴", color: "hsl(207, 90%, 54%)", bg: "hsl(207, 90%, 94%)", text: "hsl(207, 90%, 30%)" },
  Belarus:   { flag: "🇧🇾", color: "hsl(291, 64%, 42%)", bg: "hsl(291, 64%, 94%)", text: "hsl(291, 64%, 30%)" },
  Croatia:   { flag: "🇭🇷", color: "hsl(4, 77%, 52%)",   bg: "hsl(4, 77%, 94%)",   text: "hsl(4, 77%, 30%)" },
  Albania:   { flag: "🇦🇱", color: "hsl(26, 100%, 50%)", bg: "hsl(26, 100%, 94%)", text: "hsl(26, 100%, 30%)" },
};

const WA_NUMBER = "9779743208282";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;

function buildWhatsAppURL(title: string, country: string) {
  const msg = `Hi Recruitly Group! I'm interested in the ${title} position in ${country}. Please guide me on next steps.`;
  return `${WA_BASE}?text=${encodeURIComponent(msg)}`;
}

// --- Terms Modal ---
function TermsModal({ terms, country, open, onClose }: { terms: Terms | null; country: string; open: boolean; onClose: () => void }) {
  if (!terms) return null;
  const fields: { label: string; key: keyof Terms }[] = [
    { label: "Contract Period", key: "Contract_Period" },
    { label: "Probation", key: "Probation" },
    { label: "Working Hours", key: "Working_Hours" },
    { label: "Working Days", key: "Working_Days" },
    { label: "Accommodation", key: "Accommodation" },
    { label: "Transportation", key: "Transportation" },
    { label: "Food", key: "Food" },
    { label: "Annual Leave", key: "Annual_Leave" },
    { label: "Joining Ticket", key: "Joining_Ticket" },
    { label: "Return Ticket", key: "Return_Ticket" },
    { label: "Overtime", key: "Overtime" },
    { label: "Special Notes", key: "Special_Notes" },
  ];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📋 Terms & Conditions — {country}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pt-2">
          {fields.map(f => (
            <div key={f.key}>
              <p className="text-xs font-medium text-muted-foreground mb-1">{f.label}</p>
              <p className="text-sm font-medium text-foreground">{terms[f.key] || "—"}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Skeleton Loader ---
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

// --- Job Row ---
function JobRow({ job, index, isExpanded, onToggle, terms }: {
  job: Job; index: number; isExpanded: boolean; onToggle: () => void; terms: Terms[];
}) {
  const [showTerms, setShowTerms] = useState(false);
  const cc = COUNTRY_CONFIG[job.Country] || { flag: "🌍", color: "hsl(220, 10%, 50%)", bg: "hsl(220, 10%, 94%)", text: "hsl(220, 10%, 30%)" };
  const isHigh = job.Demand_Level?.toUpperCase() === "HIGH";
  const isClosed = job.Status?.toUpperCase() === "CLOSED";

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        onClick={onToggle}
        className={`cursor-pointer transition-colors hover:bg-muted/50 ${index % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
      >
        <td className="px-3 py-3 whitespace-nowrap">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: cc.bg, color: cc.text }}
          >
            {cc.flag} {job.Country}
          </span>
        </td>
        <td className="px-3 py-3">
          <span className="text-sm font-medium text-foreground">{job.Job_Title}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="text-sm font-bold text-accent">{job.Vacancies}</span>
        </td>
        <td className="px-3 py-3 hidden sm:table-cell">
          <span className="text-sm text-muted-foreground">{job.Gender}</span>
        </td>
        <td className="px-3 py-3 hidden md:table-cell">
          <span className="text-sm font-medium text-foreground">{job.Salary_Display}</span>
        </td>
        <td className="px-3 py-3 hidden lg:table-cell">
          <span className="text-xs text-muted-foreground">{job.Nationality}</span>
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          {isHigh ? (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-bold">
              🔥 HIGH DEMAND
            </Badge>
          ) : isClosed ? (
            <Badge variant="secondary" className="text-xs font-bold">CLOSED</Badge>
          ) : (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
              ✅ OPEN
            </Badge>
          )}
        </td>
        <td className="px-3 py-3">
          <a
            href={buildWhatsAppURL(job.Job_Title, job.Country)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            <Button size="sm" className="gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" /> Apply
            </Button>
          </a>
        </td>
      </motion.tr>
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <td colSpan={8} className="px-4 py-3 bg-muted/30">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span><strong className="text-foreground">Category:</strong> {job.Category}</span>
                <span><strong className="text-foreground">Last Updated:</strong> {job.Last_Updated}</span>
                <span><strong className="text-foreground">Salary:</strong> {job.Salary_Display}</span>
                <span><strong className="text-foreground">Gender:</strong> {job.Gender}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTerms(true)}
                  className="gap-1.5"
                >
                  📋 View Terms & Conditions
                </Button>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
      <TermsModal
        terms={terms.find(t => t.Country === job.Country) || null}
        country={job.Country}
        open={showTerms}
        onClose={() => setShowTerms(false)}
      />
    </>
  );
}

// --- Main Page ---
export default function JobBoard() {
  const { jobs, terms, loading, error, refetch } = useJobBoard();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [highDemandOnly, setHighDemandOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const countries = useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach(j => {
      const v = parseInt(j.Vacancies) || 0;
      map[j.Country] = (map[j.Country] || 0) + v;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const categories = useMemo(() => {
    const s = new Set(jobs.map(j => j.Category).filter(Boolean));
    return Array.from(s).sort();
  }, [jobs]);

  const totalVacancies = useMemo(() => jobs.reduce((sum, j) => sum + (parseInt(j.Vacancies) || 0), 0), [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (countryFilter !== "All" && j.Country !== countryFilter) return false;
      if (categoryFilter !== "All" && j.Category !== categoryFilter) return false;
      if (genderFilter !== "All" && j.Gender !== genderFilter) return false;
      if (highDemandOnly && j.Demand_Level?.toUpperCase() !== "HIGH") return false;
      if (search) {
        const q = search.toLowerCase();
        if (!j.Job_Title.toLowerCase().includes(q) && !j.Nationality.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [jobs, search, countryFilter, categoryFilter, genderFilter, highDemandOnly]);

  const hasFilters = search || countryFilter !== "All" || categoryFilter !== "All" || genderFilter !== "All" || highDemandOnly;

  const clearAll = () => {
    setSearch("");
    setCountryFilter("All");
    setCategoryFilter("All");
    setGenderFilter("All");
    setHighDemandOnly(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge variant="secondary" className="mb-6 gap-2 px-4 py-1.5">
            <Briefcase className="w-4 h-4" /> Live Job Board
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Find Your Next{" "}
            <span className="text-accent">International Career</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Verified positions across Europe — Updated weekly
          </p>
          {!loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-2xl font-bold text-accent bg-accent/10 border border-accent/20"
            >
              {totalVacancies.toLocaleString()}+ open positions
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Country Pills */}
      <section className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setCountryFilter("All")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                countryFilter === "All"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              🌍 All Countries ({totalVacancies})
            </button>
            {countries.map(([country, count]) => {
              const cc = COUNTRY_CONFIG[country] || { flag: "🌍" };
              const active = countryFilter === country;
              return (
                <button
                  key={country}
                  onClick={() => setCountryFilter(active ? "All" : country)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                    active
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {cc.flag} {country} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-16 z-40 px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search job title or nationality..."
                className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm bg-background text-foreground border border-input outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-md text-sm bg-background text-foreground border border-input outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="px-3 py-2.5 rounded-md text-sm bg-background text-foreground border border-input outline-none cursor-pointer"
            >
              <option value="All">All Genders</option>
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Male/Female">Male/Female</option>
            </select>
            <button
              onClick={() => setHighDemandOnly(!highDemandOnly)}
              className={`px-3 py-2.5 rounded-md text-sm font-semibold transition-all whitespace-nowrap border ${
                highDemandOnly
                  ? "bg-orange-50 text-orange-700 border-orange-200"
                  : "bg-background text-muted-foreground border-input hover:bg-muted"
              }`}
            >
              🔥 High Demand
            </button>
            {hasFilters && (
              <button onClick={clearAll} className="px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-all">
                ✕ Clear All
              </button>
            )}
            <button onClick={refetch} className="p-2.5 rounded-md text-muted-foreground hover:bg-muted transition-all" title="Refresh data">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs mt-2 font-medium text-muted-foreground">
            Showing {filtered.length} of {jobs.length} jobs
          </p>
        </div>
      </section>

      {/* Job Table */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-lg text-destructive mb-4">❌ {error}</p>
              <Button onClick={refetch}>Try Again</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-foreground mb-2">No jobs match your filters.</p>
              <p className="text-sm text-muted-foreground mb-6">Try clearing your search or adjusting filters.</p>
              <Button onClick={clearAll}>Clear All Filters</Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["Country", "Job Title", "Vacancies", "Gender", "Salary", "Nationality", "Status", "Apply"].map(h => (
                      <th
                        key={h}
                        className={`px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground ${
                          h === "Gender" ? "hidden sm:table-cell" :
                          h === "Salary" ? "hidden md:table-cell" :
                          h === "Nationality" ? "hidden lg:table-cell" : ""
                        } ${h === "Vacancies" ? "text-center" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job, i) => (
                    <JobRow
                      key={job.ID}
                      job={job}
                      index={i}
                      isExpanded={expandedId === job.ID}
                      onToggle={() => setExpandedId(expandedId === job.ID ? null : job.ID)}
                      terms={terms}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
