import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, X, GraduationCap, ExternalLink, ChevronDown, ChevronUp, RefreshCw, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_STORE, COUNTRY_PRIORITY_ORDER, COUNTRY_NAMES } from "@/data/countryStore";
import { useUniversityData, type University, type Program } from "@/hooks/useUniversityData";

const PROGRAMS_PER_PAGE = 50;

const UniversitiesPage = () => {
  useSEO({
    title: "Universities in Europe | Find Your Best Fit – Recruitly Group",
    description: "Explore top universities in Estonia and Europe. Compare programs, tuition fees, and admission requirements. Recruitly Group helps you choose the right university.",
    keywords: "universities in Estonia, European universities for Nepali students, top universities Europe, affordable universities abroad",
    canonicalUrl: "https://www.recruitlygroup.com/universities",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { universities, programs, loading, error, refresh } = useUniversityData();

  const [activeCountry, setActiveCountry] = useState<string | null>(searchParams.get("country"));
  const [searchQuery, setSearchQuery] = useState(searchParams.get("university") || "");
  const [levelFilter, setLevelFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [expandedUniId, setExpandedUniId] = useState<string | null>(null);
  const [expandedProgId, setExpandedProgId] = useState<number | null>(null);
  const [programsVisible, setProgramsVisible] = useState(PROGRAMS_PER_PAGE);

  // Apply URL params on mount
  useEffect(() => {
    const c = searchParams.get("country");
    const l = searchParams.get("level");
    if (c) setActiveCountry(c);
    if (l) setLevelFilter(l);
  }, [searchParams]);

  // Sort countries: priority first, then alphabetical
  const sortedCountries = useMemo(() => {
    const withData = COUNTRY_NAMES.filter(c => universities.has(c) || programs.has(c));
    const priority = COUNTRY_PRIORITY_ORDER.filter(c => withData.includes(c));
    const rest = withData.filter(c => !COUNTRY_PRIORITY_ORDER.includes(c)).sort();
    return [...priority, ...rest];
  }, [universities, programs]);

  // All universities flat
  const allUniversities = useMemo(() => {
    const result: University[] = [];
    for (const [, unis] of universities) result.push(...unis);
    return result;
  }, [universities]);

  // All programs flat
  const allPrograms = useMemo(() => {
    const result: Program[] = [];
    for (const [, progs] of programs) result.push(...progs);
    return result;
  }, [programs]);

  // Filtered universities
  const filteredUnis = useMemo(() => {
    let filtered = activeCountry ? (universities.get(activeCountry) || []) : allUniversities;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => u.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [activeCountry, allUniversities, universities, searchQuery]);

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    let filtered = activeCountry ? (programs.get(activeCountry) || []) : allPrograms;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.courseName.toLowerCase().includes(q) || 
        p.university.toLowerCase().includes(q)
      );
    }
    if (levelFilter !== "all") {
      filtered = filtered.filter(p => p.level.toLowerCase().includes(levelFilter.toLowerCase()));
    }
    if (departmentFilter !== "all") {
      filtered = filtered.filter(p => p.department.toLowerCase().includes(departmentFilter.toLowerCase()));
    }
    return filtered;
  }, [activeCountry, allPrograms, programs, searchQuery, levelFilter, departmentFilter]);

  // Unique levels and departments
  const uniqueLevels = useMemo(() => {
    const set = new Set<string>();
    allPrograms.forEach(p => { if (p.level) set.add(p.level); });
    return Array.from(set).sort();
  }, [allPrograms]);

  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    allPrograms.forEach(p => { if (p.department) set.add(p.department); });
    return Array.from(set).sort();
  }, [allPrograms]);

  const totalProgramCount = allPrograms.length;

  const handleCountryClick = (country: string | null) => {
    setActiveCountry(country);
    setProgramsVisible(PROGRAMS_PER_PAGE);
    if (country) {
      setSearchParams({ country });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setActiveCountry(null);
    setSearchQuery("");
    setLevelFilter("all");
    setDepartmentFilter("all");
    setProgramsVisible(PROGRAMS_PER_PAGE);
    setSearchParams({});
  };

  const getLevelColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes("bachelor")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (l.includes("master")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (l.includes("phd") || l.includes("doctor")) return "bg-gray-100 text-gray-700 border-gray-200";
    if (l.includes("diploma")) return "bg-teal-100 text-teal-700 border-teal-200";
    return "bg-muted text-muted-foreground";
  };

  const getWhatsAppUrl = (courseName: string, university: string, country: string) => {
    const msg = `Hi Recruitly Group! I'm interested in the *${courseName}* program at *${university}* in *${country}*. Please guide me on the application process.`;
    return `https://wa.me/9779743208282?text=${encodeURIComponent(msg)}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 text-center py-20">
          <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Failed to Load Data</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={refresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Study Abroad — Find Your Program
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Browse universities and programs across 40+ countries. Free to explore.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="text-base px-4 py-2">
              <GraduationCap className="w-4 h-4 mr-2" />
              {loading ? "Loading..." : `${totalProgramCount.toLocaleString()} Programs Available`}
            </Badge>
            <Button onClick={() => navigate("/educational-consultancy")} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Check My WiseScore →
            </Button>
          </div>
        </div>
      </section>

      {/* Country Pills */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleCountryClick(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                !activeCountry
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              🌍 All
            </button>
            {(loading ? COUNTRY_PRIORITY_ORDER.slice(0, 8) : sortedCountries).map((country) => {
              const config = COUNTRY_STORE[country];
              if (!config) return null;
              const count = (universities.get(country)?.length || 0);
              return (
                <button
                  key={country}
                  onClick={() => handleCountryClick(country)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                    activeCountry === country
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {config.flag} {country} {!loading && count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search universities or programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {uniqueLevels.map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {uniqueDepartments.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refresh} title="Refresh data">
              <RefreshCw className="w-4 h-4" />
            </Button>
            {(activeCountry || searchQuery || levelFilter !== "all" || departmentFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredUnis.length} universities · {filteredPrograms.length} programs
        </p>

        {/* University Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-20 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {filteredUnis.map((uni) => {
                const config = COUNTRY_STORE[uni.country];
                const isExpanded = expandedUniId === `${uni.country}-${uni.id}`;
                return (
                  <Card
                    key={`${uni.country}-${uni.id}`}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setExpandedUniId(isExpanded ? null : `${uni.country}-${uni.id}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            backgroundColor: `${config?.color}15`,
                            borderColor: `${config?.color}40`,
                            color: config?.color,
                          }}
                        >
                          {config?.flag} {uni.country}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          ✅ Open
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground text-base mb-3 line-clamp-2">{uni.name}</h3>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        {uni.cgpaRequirement && <p>📊 CGPA: {uni.cgpaRequirement}</p>}
                        {uni.admissionFee && <p>💰 Fee: {uni.admissionFee}</p>}
                        {uni.deadline && <p>📅 Deadline: {uni.deadline}</p>}
                        {uni.englishCert && <p>📝 English: {uni.englishCert}</p>}
                      </div>
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-border space-y-2 text-sm">
                          {uni.type && <p className="text-muted-foreground">Type: {uni.type}</p>}
                          {uni.admissionDate && <p className="text-muted-foreground">Admission: {uni.admissionDate}</p>}
                          {uni.daysLeft && <p className="text-muted-foreground">Days Left: {uni.daysLeft}</p>}
                          {uni.link && (
                            <a href={uni.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
                              Visit Website <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCountryClick(uni.country);
                              document.getElementById("programs-section")?.scrollIntoView({ behavior: "smooth" });
                            }}
                          >
                            View Programs →
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center justify-end mt-3">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredUnis.length === 0 && !loading && (
              <div className="text-center py-12 mb-12">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No universities match your filters.</p>
                <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
              </div>
            )}

            {/* WiseScore Banner */}
            <div className="rounded-xl bg-primary p-8 md:p-12 text-center mb-12">
              <p className="text-3xl mb-2">🎯</p>
              <h2 className="text-xl md:text-2xl font-bold text-primary-foreground mb-3">
                Get Your Personal University Match
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
                WiseScore AI predicts your admission chances, visa success rate, and scholarship eligibility.
              </p>
              <Button
                onClick={() => navigate("/educational-consultancy")}
                variant="secondary"
                size="lg"
              >
                Check My WiseScore →
              </Button>
            </div>

            {/* Programs Table */}
            <div id="programs-section" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-foreground mb-6">Programs</h2>

              {/* Desktop Table */}
              <div className="hidden md:block border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Country</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">University</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Course</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Level</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Tuition</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Apply</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrograms.slice(0, programsVisible).map((prog, idx) => {
                      const config = COUNTRY_STORE[prog.country];
                      const isExpanded = expandedProgId === prog.id;
                      return (
                        <>
                          <tr
                            key={prog.id}
                            className={`border-b border-border cursor-pointer transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? "bg-card" : "bg-background"}`}
                            onClick={() => setExpandedProgId(isExpanded ? null : prog.id)}
                          >
                            <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className="text-xs whitespace-nowrap"
                                style={{
                                  backgroundColor: `${config?.color}15`,
                                  borderColor: `${config?.color}40`,
                                  color: config?.color,
                                }}
                              >
                                {config?.flag} {prog.country}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground max-w-[200px] truncate">{prog.university}</td>
                            <td className="px-4 py-3 text-sm text-foreground font-medium max-w-[250px] truncate">{prog.courseName}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={`text-xs ${getLevelColor(prog.level)}`}>
                                {prog.level}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{prog.tuitionFee || "—"}</td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href={getWhatsAppUrl(prog.courseName, prog.university, prog.country)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  Apply
                                </Button>
                              </a>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${prog.id}-detail`} className="bg-muted/20">
                              <td colSpan={7} className="px-4 py-4">
                                <div className="flex flex-wrap gap-4 text-sm">
                                  {prog.department && <span className="text-muted-foreground">Department: <strong className="text-foreground">{prog.department}</strong></span>}
                                  {prog.tuitionFee && <span className="text-muted-foreground">Tuition: <strong className="text-foreground">{prog.tuitionFee}</strong></span>}
                                  {prog.admissionRequirement && <span className="text-muted-foreground">Requirements: <strong className="text-foreground">{prog.admissionRequirement}</strong></span>}
                                  {prog.link && (
                                    <a href={prog.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                                      Program Page <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredPrograms.slice(0, programsVisible).map((prog) => {
                  const config = COUNTRY_STORE[prog.country];
                  return (
                    <Card key={prog.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: `${config?.color}15`,
                              borderColor: `${config?.color}40`,
                              color: config?.color,
                            }}
                          >
                            {config?.flag} {prog.country}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getLevelColor(prog.level)}`}>
                            {prog.level}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">{prog.courseName}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{prog.university}</p>
                        {prog.tuitionFee && <p className="text-xs text-muted-foreground mb-3">💰 {prog.tuitionFee}</p>}
                        <a
                          href={getWhatsAppUrl(prog.courseName, prog.university, prog.country)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Apply via WhatsApp
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredPrograms.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No programs match your filters.</p>
                  <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
                </div>
              )}

              {programsVisible < filteredPrograms.length && (
                <div className="text-center mt-8">
                  <Button variant="outline" onClick={() => setProgramsVisible(v => v + PROGRAMS_PER_PAGE)}>
                    Load More ({filteredPrograms.length - programsVisible} remaining)
                  </Button>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <section className="mt-16 mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-3">Need help applying?</h2>
              <p className="text-muted-foreground mb-6">Our team guides you through every step of the process.</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a href="https://wa.me/9779743208282" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Us
                  </Button>
                </a>
                <a href="mailto:info@recruitlygroup.com">
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </Button>
                </a>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default UniversitiesPage;
