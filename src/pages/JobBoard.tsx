import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, RefreshCw, ChevronDown, ChevronUp, MessageCircle, Flame, Mail, Instagram, ExternalLink, Briefcase } from "lucide-react";
import { useJobBoard, Job, Terms } from "@/hooks/useJobBoard";
import { Skeleton } from "@/components/ui/skeleton";
import recruitlyLogo from "@/assets/recruitly-logo.png";

const COUNTRY_CONFIG: Record<string, { flag: string; color: string; bg: string }> = {
  Bulgaria:  { flag: "🇧🇬", color: "#4caf50", bg: "rgba(76,175,80,0.15)" },
  Romania:   { flag: "🇷🇴", color: "#2196f3", bg: "rgba(33,150,243,0.15)" },
  Belarus:   { flag: "🇧🇾", color: "#9c27b0", bg: "rgba(156,39,176,0.15)" },
  Croatia:   { flag: "🇭🇷", color: "#e53935", bg: "rgba(229,57,53,0.15)" },
  Albania:   { flag: "🇦🇱", color: "#ff6f00", bg: "rgba(255,111,0,0.15)" },
};

const WA_NUMBER = "9779743208282";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;

function buildWhatsAppURL(title: string, country: string) {
  const msg = `Hi Recruitly Group! I'm interested in the ${title} position in ${country}. Please guide me on next steps.`;
  return `${WA_BASE}?text=${encodeURIComponent(msg)}`;
}

// --- Terms Modal ---
function TermsModal({ terms, country, onClose }: { terms: Terms | null; country: string; onClose: () => void }) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-xl border overflow-hidden"
        style={{ background: "#12151f", borderColor: "rgba(255,255,255,0.07)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="text-lg font-bold" style={{ color: "#e8eaf2", fontFamily: "'Syne', sans-serif" }}>
            📋 Terms — {country}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" style={{ color: "#7a7f96" }} />
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {fields.map(f => (
            <div key={f.key}>
              <p className="text-xs font-medium mb-1" style={{ color: "#7a7f96" }}>{f.label}</p>
              <p className="text-sm font-medium" style={{ color: "#e8eaf2" }}>{terms[f.key] || "—"}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// --- Skeleton Loader ---
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }} />
      ))}
    </div>
  );
}

// --- Job Row ---
function JobRow({ job, index, isExpanded, onToggle, terms }: {
  job: Job; index: number; isExpanded: boolean; onToggle: () => void; terms: Terms[];
}) {
  const [showTerms, setShowTerms] = useState(false);
  const cc = COUNTRY_CONFIG[job.Country] || { flag: "🌍", color: "#888", bg: "rgba(136,136,136,0.15)" };
  const isHigh = job.Demand_Level?.toUpperCase() === "HIGH";
  const isClosed = job.Status?.toUpperCase() === "CLOSED";

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        onClick={onToggle}
        className="cursor-pointer transition-colors group"
        style={{ background: index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
      >
        <td className="px-3 py-3 whitespace-nowrap">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: cc.bg, color: cc.color }}
          >
            {cc.flag} {job.Country}
          </span>
        </td>
        <td className="px-3 py-3">
          <span className="text-sm font-medium" style={{ color: "#e8eaf2" }}>{job.Job_Title}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="text-sm font-bold" style={{ color: "#4fffb0" }}>{job.Vacancies}</span>
        </td>
        <td className="px-3 py-3 hidden sm:table-cell">
          <span className="text-sm" style={{ color: "#7a7f96" }}>{job.Gender}</span>
        </td>
        <td className="px-3 py-3 hidden md:table-cell">
          <span className="text-sm font-medium" style={{ color: "#e8eaf2" }}>{job.Salary_Display}</span>
        </td>
        <td className="px-3 py-3 hidden lg:table-cell">
          <span className="text-xs" style={{ color: "#7a7f96" }}>{job.Nationality}</span>
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          {isHigh ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(255,152,0,0.15)", color: "#ff9800" }}>
              🔥 HIGH DEMAND
            </span>
          ) : isClosed ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(255,255,255,0.05)", color: "#7a7f96" }}>
              CLOSED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(76,175,80,0.15)", color: "#4caf50" }}>
              ✅ OPEN
            </span>
          )}
        </td>
        <td className="px-3 py-3">
          <a
            href={buildWhatsAppURL(job.Job_Title, job.Country)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
            style={{ background: "#25D366", color: "#fff" }}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Apply
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
            <td colSpan={8} className="px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "#7a7f96" }}>
                <span><strong style={{ color: "#e8eaf2" }}>Category:</strong> {job.Category}</span>
                <span><strong style={{ color: "#e8eaf2" }}>Last Updated:</strong> {job.Last_Updated}</span>
                <span><strong style={{ color: "#e8eaf2" }}>Salary:</strong> {job.Salary_Display}</span>
                <span><strong style={{ color: "#e8eaf2" }}>Gender:</strong> {job.Gender}</span>
                <button
                  onClick={() => setShowTerms(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#4fffb0" }}
                >
                  📋 View Terms & Conditions
                </button>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTerms && (
          <TermsModal
            terms={terms.find(t => t.Country === job.Country) || null}
            country={job.Country}
            onClose={() => setShowTerms(false)}
          />
        )}
      </AnimatePresence>
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
    <div className="min-h-screen" style={{ background: "#0a0c14", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "rgba(10,12,20,0.85)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={recruitlyLogo} alt="Recruitly Group" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-lg font-bold hidden sm:block" style={{ color: "#e8eaf2", fontFamily: "'Syne', sans-serif" }}>
              Recruitly Group
            </span>
            <span className="relative flex h-2.5 w-2.5 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#4fffb0" }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#4fffb0" }} />
            </span>
          </div>
          <a
            href={WA_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
            style={{ background: "#25D366", color: "#fff" }}
          >
            <MessageCircle className="w-4 h-4" /> 💬 Apply on WhatsApp
          </a>
        </div>
      </header>

      <div className="relative z-10">
        {/* Hero */}
        <section className="py-16 sm:py-24 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium" style={{ background: "rgba(79,255,176,0.1)", color: "#4fffb0", border: "1px solid rgba(79,255,176,0.2)" }}>
              <Briefcase className="w-4 h-4" /> Live Job Board
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 leading-tight" style={{ color: "#e8eaf2", fontFamily: "'Syne', sans-serif" }}>
              Find Your Next<br />
              <span style={{ color: "#4fffb0" }}>International Career</span>
            </h1>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "#7a7f96" }}>
              Verified positions across Europe — Updated weekly
            </p>
            {!loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-2xl font-extrabold"
                style={{ background: "rgba(79,255,176,0.08)", color: "#4fffb0", border: "1px solid rgba(79,255,176,0.15)", fontFamily: "'Syne', sans-serif" }}
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
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap"
                style={{
                  background: countryFilter === "All" ? "#4fffb0" : "rgba(255,255,255,0.05)",
                  color: countryFilter === "All" ? "#0a0c14" : "#7a7f96",
                  border: "1px solid " + (countryFilter === "All" ? "#4fffb0" : "rgba(255,255,255,0.07)"),
                }}
              >
                🌍 All Countries ({totalVacancies})
              </button>
              {countries.map(([country, count]) => {
                const cc = COUNTRY_CONFIG[country] || { flag: "🌍", color: "#888" };
                const active = countryFilter === country;
                return (
                  <button
                    key={country}
                    onClick={() => setCountryFilter(active ? "All" : country)}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap"
                    style={{
                      background: active ? cc.color : "rgba(255,255,255,0.05)",
                      color: active ? "#fff" : "#7a7f96",
                      border: `1px solid ${active ? cc.color : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    {cc.flag} {country} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="sticky top-16 z-40 px-4 py-3 backdrop-blur-xl border-b" style={{ background: "rgba(10,12,20,0.9)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#7a7f96" }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search job title or nationality..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#e8eaf2", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              {/* Category dropdown */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg text-sm outline-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", color: "#e8eaf2", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {/* Gender dropdown */}
              <select
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg text-sm outline-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", color: "#e8eaf2", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <option value="All">All Genders</option>
                <option value="Any">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Male/Female">Male/Female</option>
              </select>
              {/* High demand toggle */}
              <button
                onClick={() => setHighDemandOnly(!highDemandOnly)}
                className="px-3 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
                style={{
                  background: highDemandOnly ? "rgba(255,152,0,0.2)" : "rgba(255,255,255,0.05)",
                  color: highDemandOnly ? "#ff9800" : "#7a7f96",
                  border: `1px solid ${highDemandOnly ? "rgba(255,152,0,0.4)" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                🔥 High Demand
              </button>
              {/* Clear */}
              {hasFilters && (
                <button onClick={clearAll} className="px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10" style={{ color: "#e53935" }}>
                  ✕ Clear All
                </button>
              )}
              {/* Refresh */}
              <button onClick={refetch} className="p-2.5 rounded-lg transition-all hover:bg-white/10" style={{ color: "#7a7f96" }} title="Refresh data">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs mt-2 font-medium" style={{ color: "#7a7f96" }}>
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
                <p className="text-lg mb-4" style={{ color: "#e53935" }}>❌ {error}</p>
                <button onClick={refetch} className="px-6 py-3 rounded-lg font-bold transition-all hover:scale-105" style={{ background: "#4fffb0", color: "#0a0c14" }}>
                  Try Again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg mb-2" style={{ color: "#e8eaf2" }}>No jobs match your filters.</p>
                <p className="text-sm mb-6" style={{ color: "#7a7f96" }}>Try clearing your search or adjusting filters.</p>
                <button onClick={clearAll} className="px-6 py-3 rounded-lg font-bold transition-all hover:scale-105" style={{ background: "#4fffb0", color: "#0a0c14" }}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                      {["Country", "Job Title", "Vacancies", "Gender", "Salary", "Nationality", "Status", "Apply"].map((h, i) => (
                        <th
                          key={h}
                          className={`px-3 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            h === "Gender" ? "hidden sm:table-cell" :
                            h === "Salary" ? "hidden md:table-cell" :
                            h === "Nationality" ? "hidden lg:table-cell" : ""
                          } ${h === "Vacancies" ? "text-center" : ""}`}
                          style={{ color: "#7a7f96", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
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

        {/* Footer */}
        <footer className="border-t py-12 px-4" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0c14" }}>
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={recruitlyLogo} alt="Recruitly Group" className="h-10 w-10 rounded-lg object-contain" />
              <span className="text-xl font-bold" style={{ color: "#e8eaf2", fontFamily: "'Syne', sans-serif" }}>Recruitly Group</span>
            </div>
            <p className="text-sm mb-6" style={{ color: "#7a7f96" }}>Your gateway to international careers</p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <a href={WA_BASE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80" style={{ color: "#4fffb0" }}>
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href="mailto:recruitlygroup@gmail.com" className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80" style={{ color: "#4fffb0" }}>
                <Mail className="w-4 h-4" /> recruitlygroup@gmail.com
              </a>
              <a href="https://instagram.com/recruitlygroup" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80" style={{ color: "#4fffb0" }}>
                <Instagram className="w-4 h-4" /> @recruitlygroup
              </a>
              <a href="https://www.recruitlygroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80" style={{ color: "#4fffb0" }}>
                <ExternalLink className="w-4 h-4" /> recruitlygroup.com
              </a>
            </div>
            <p className="text-xs mb-2 font-bold" style={{ color: "#ff9800" }}>
              ⚠️ Recruitly Group never charges fees before placement. Beware of scams.
            </p>
            <p className="text-xs" style={{ color: "#7a7f96" }}>
              © {new Date().getFullYear()} Recruitly Group. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
