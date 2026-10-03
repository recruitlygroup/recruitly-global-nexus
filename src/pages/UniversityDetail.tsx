import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { getUniversity, searchPrograms } from "@/lib/universityApi";
import { checkEligibility, loadStudentAnswers } from "@/lib/eligibility";
import { PageShell, DataStatusBadge, ExtLink, Notice, UNI_NOTICE, VisaSource, ProgramCard, SaveButton, ListSkeleton, ErrorState, whatsappUrl } from "@/components/study/parts";
import { Reveal } from "@/components/motion/Reveal";
import { COUNTRY_LIST } from "@/data/generated";

const Row = ({ k, v }: { k: string; v?: string | null }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-border last:border-0 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right text-foreground">{v || <span className="text-muted-foreground">Not available</span>}</dd></div>
);

const UniversityDetail = () => {
  const { slug = "" } = useParams();
  const uni = useQuery({ queryKey: ["uni", slug], queryFn: () => getUniversity(slug), staleTime: 10 * 60_000 });
  const u = uni.data;
  const progs = useQuery({ queryKey: ["uni-progs", u?.id], queryFn: () => searchPrograms({ universityId: u!.id }), enabled: !!u, staleTime: 10 * 60_000 });

  useSEO({
    title: u ? `${u.university_name}, ${u.country} — Programs & Admission | Recruitly Group` : "University | Recruitly Group",
    description: u ? `${u.university_name} in ${u.country}: official website, programs and admission information. Verify details with the university.` : "University information",
    canonicalUrl: `https://www.recruitlygroup.com/universities/${slug}`,
    noIndex: !!uni.data === false && !uni.isLoading,
  });

  if (uni.isError) return <PageShell><ErrorState onRetry={() => uni.refetch()} /></PageShell>;
  if (uni.isLoading) return <PageShell><ListSkeleton /></PageShell>;
  if (!u) return <PageShell><div className="py-20 text-center"><h1 className="text-2xl font-bold mb-3">University not found</h1><Button asChild><Link to="/universities">Search universities</Link></Button></div></PageShell>;

  const country = COUNTRY_LIST.find((c) => c.name === u.country);
  const elig = checkEligibility(loadStudentAnswers(), { cgpa: u.cgpa_requirement, english: u.english_cert, dataStatus: u.data_status });
  const hasAnswers = !!loadStudentAnswers();
  const past = u.deadline && new Date(u.deadline) < new Date();

  return (
    <PageShell>
      <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
        <Link to="/study-abroad" className="hover:underline">Study abroad</Link> / {country ? <Link to={`/study-abroad/${country.slug}`} className="hover:underline">{u.country}</Link> : u.country} / <span className="text-foreground">{u.university_name}</span>
      </nav>
      <Reveal><div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{u.university_name}</h1>
          <p className="text-muted-foreground mt-1">{[u.city, u.country, u.type].filter(Boolean).join(" · ")}</p>
          <div className="flex flex-wrap items-center gap-4 mt-3"><DataStatusBadge status={u.data_status} /><ExtLink href={u.website_url}>Official website</ExtLink><ExtLink href={u.admissions_url}>Official admissions page</ExtLink></div>
        </div>
        <SaveButton kind="university" id={u.id} />
      </div></Reveal>
      <Reveal delay={0.05}><div className="mt-4"><Notice>{UNI_NOTICE}</Notice></div></Reveal>

      <Reveal delay={0.08}><div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card><CardHeader><CardTitle className="text-lg">Admission information</CardTitle></CardHeader><CardContent>
          <dl>
            <Row k="Application fee" v={u.admission_fee} />
            <Row k="English requirement" v={u.english_cert} />
            <Row k="Academic requirement" v={u.cgpa_requirement} />
            <Row k="Intake opens" v={u.admission_date} />
            <Row k="Deadline" v={u.deadline ? `${u.deadline}${past ? " (date has passed — check the next intake)" : ""}` : null} />
          </dl>
          {!u.admissions_url && <p className="text-sm text-muted-foreground mt-3">Official admissions link not stored yet — use the university website above.</p>}
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg">Your eligibility check</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
          {!hasAnswers ? (
            <><p className="text-muted-foreground">Complete the free WiseScore profile to compare your grades and English score with this university's stated minimums.</p>
              <Button asChild size="sm"><Link to="/educational-consultancy">Start WiseScore</Link></Button></>
          ) : elig.overall === "unknown" ? (
            <p className="text-foreground">Not enough verified information to calculate this accurately. Please check the university's official admission and visa requirements.</p>
          ) : (
            <p className="text-foreground font-medium">{elig.overall === "likely" ? "You appear to meet the minimums we have on record." : "You may be below a stated minimum."}
              <span className="block font-normal text-muted-foreground mt-1">Academic: {elig.gpa} · English: {elig.english}</span></p>
          )}
          {elig.notes.map((n) => <p key={n} className="text-muted-foreground">{n}</p>)}
          {hasAnswers && <p className="text-xs text-muted-foreground">This compares only the requirements shown on this page ({u.data_status === "verified" ? "verified" : "not yet verified against the official source"}). It is not an admission prediction.</p>}
        </CardContent></Card>
      </div></Reveal>

      <Reveal><section className="mt-8"><h2 className="text-xl font-semibold mb-3">Visa information</h2><VisaSource country={u.country} /></section></Reveal>

      <Reveal><section className="mt-8">
        <div className="flex items-center justify-between mb-3"><h2 className="text-xl font-semibold">Programs</h2>
          {progs.data?.hasMore && <Link to={`/programs?uid=${u.id}`} className="text-sm text-primary hover:underline">See all programs</Link>}</div>
        {progs.isLoading ? <ListSkeleton /> : progs.data && progs.data.rows.length > 0
          ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{progs.data.rows.map((p) => <ProgramCard key={p.id} p={p} />)}</div>
          : <p className="text-muted-foreground">No programs are listed for this university in our data yet. Check the official website for its current course list.</p>}
      </section></Reveal>

      <div className="mt-10"><Button asChild variant="outline" className="hover-lift"><a href={whatsappUrl(`Hi Recruitly Group! I'd like guidance on applying to ${u.university_name} (${u.country}).`)} target="_blank" rel="noopener noreferrer">Talk to a counsellor <ExternalLink className="w-4 h-4 ml-2" /></a></Button></div>
    </PageShell>
  );
};
export default UniversityDetail;
