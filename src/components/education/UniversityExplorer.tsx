import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ExternalLink, Filter, GraduationCap, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUniversityData, University } from "@/hooks/useUniversityData";

const COUNTRY_STYLES: Record<string, { bg: string; text: string; flag: string }> = {
  Italy: { bg: "bg-emerald-100", text: "text-emerald-800", flag: "🇮🇹" },
  Australia: { bg: "bg-blue-100", text: "text-blue-800", flag: "🇦🇺" },
  Canada: { bg: "bg-red-100", text: "text-red-800", flag: "🇨🇦" },
  USA: { bg: "bg-indigo-100", text: "text-indigo-800", flag: "🇺🇸" },
  Germany: { bg: "bg-amber-100", text: "text-amber-800", flag: "🇩🇪" },
  France: { bg: "bg-sky-100", text: "text-sky-800", flag: "🇫🇷" },
  Portugal: { bg: "bg-green-100", text: "text-green-800", flag: "🇵🇹" },
  Belgium: { bg: "bg-yellow-100", text: "text-yellow-800", flag: "🇧🇪" },
  Austria: { bg: "bg-rose-100", text: "text-rose-800", flag: "🇦🇹" },
  Georgia: { bg: "bg-violet-100", text: "text-violet-800", flag: "🇬🇪" },
  "New Zealand": { bg: "bg-teal-100", text: "text-teal-800", flag: "🇳🇿" },
};

function getStyle(country: string) {
  return COUNTRY_STYLES[country] || { bg: "bg-muted", text: "text-muted-foreground", flag: "🌍" };
}

const UniversityExplorer = () => {
  const { data: universities, isLoading, error, refetch } = useUniversityData();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feeRange, setFeeRange] = useState("all");

  const countries = useMemo(() => {
    if (!universities) return [];
    return [...new Set(universities.map((u) => u.country))].sort();
  }, [universities]);

  const filtered = useMemo(() => {
    if (!universities) return [];
    return universities.filter((u) => {
      if (countryFilter !== "all" && u.country !== countryFilter) return false;
      if (statusFilter !== "all" && u.status.toUpperCase() !== statusFilter) return false;
      if (feeRange === "free" && u.feeNumeric > 0) return false;
      if (feeRange === "under50" && u.feeNumeric > 50) return false;
      if (feeRange === "over50" && u.feeNumeric <= 50) return false;
      if (search) {
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.cgpaRequirement.toLowerCase().includes(q);
      }
      return true;
    });
  }, [universities, search, countryFilter, statusFilter, feeRange]);

  const clearFilters = () => {
    setSearch("");
    setCountryFilter("all");
    setStatusFilter("all");
    setFeeRange("all");
  };

  const hasFilters = search || countryFilter !== "all" || statusFilter !== "all" || feeRange !== "all";

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <p className="text-destructive font-medium mb-3">Failed to load university data</p>
          <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search universities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{getStyle(c).flag} {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={feeRange} onValueChange={setFeeRange}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Fee Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fees</SelectItem>
                <SelectItem value="free">No Fee</SelectItem>
                <SelectItem value="under50">Under €50</SelectItem>
                <SelectItem value="over50">€50+</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="w-3 h-3" /> Clear
              </Button>
            )}
          </div>
          {universities && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing {filtered.length} of {universities.length} universities
            </p>
          )}
        </CardContent>
      </Card>

      {/* Country Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCountryFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            countryFilter === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/50"
          }`}
        >
          🌍 All ({universities?.length || 0})
        </button>
        {countries.map((c) => {
          const count = universities?.filter((u) => u.country === c).length || 0;
          const style = getStyle(c);
          return (
            <button
              key={c}
              onClick={() => setCountryFilter(c === countryFilter ? "all" : c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                countryFilter === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {style.flag} {c} ({count})
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* University List */}
      {!isLoading && filtered.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No universities match your filters.</p>
            <Button variant="link" onClick={clearFilters}>Clear filters</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-3">
          {filtered.map((uni, index) => (
            <UniversityRow key={uni.id} university={uni} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

function UniversityRow({ university: u, index }: { university: University; index: number }) {
  const style = getStyle(u.country);
  const isOpen = u.status.toUpperCase() === "OPEN";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
    >
      <Card className="hover:shadow-md transition-shadow border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="secondary" className={`${style.bg} ${style.text} text-xs`}>
                  {style.flag} {u.country}
                </Badge>
                <Badge variant={isOpen ? "default" : "secondary"} className={`text-xs ${isOpen ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-muted text-muted-foreground"}`}>
                  {isOpen ? "✅ Open" : "Closed"}
                </Badge>
                <span className="text-xs text-muted-foreground">{u.type}</span>
              </div>
              <h3 className="font-semibold text-foreground truncate">{u.name}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                <span>Fee: {u.admissionFee || "N/A"}</span>
                <span>{u.englishCertificate}</span>
                {u.deadline && <span>Deadline: {u.deadline}</span>}
                {u.cgpaRequirement && u.cgpaRequirement !== "NO CGPA REQUIREMENT" && (
                  <span className="text-amber-600 font-medium">{u.cgpaRequirement}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {u.link && (
                <Button variant="outline" size="sm" asChild className="gap-1 text-xs">
                  <a href={u.link} target="_blank" rel="noopener noreferrer">
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              )}
              <Button size="sm" asChild className="gap-1 text-xs">
                <a
                  href={`https://wa.me/9779743208282?text=${encodeURIComponent(`Hi Recruitly Group! I'm interested in ${u.name} in ${u.country}. Please guide me.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default UniversityExplorer;
