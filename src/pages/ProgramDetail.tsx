import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { getProgram } from "@/lib/universityApi";
import { checkEligibility, loadStudentAnswers } from "@/lib/eligibility";
import { PageShell, DataStatusBadge, ExtLink, Notice, UNI_NOTICE, VisaSource, SaveButton, ListSkeleton, ErrorState, whatsappUrl } from "@/components/study/parts";
import { Reveal } from "@/components/motion/Reveal";

const ProgramDetail = () => {
  const { slug = "" } = useParams();
  const q = useQuery({ queryKey: ["prog", slug], queryFn: () => getProgram(slug), staleTime: 10 * 60_000 });
  const p = q.data;
  useSEO({
    title: p ? `${p.course_name} at ${p.university_name} | Recruitly Group` : "Program | Recruitly Group",
    description: p ? `${p.level ?? "Program"} in ${p.course_name} at ${p.university_name}, ${p.country}. Tuition and admission information — verify with the university.` : "Program information",
    canonicalUrl: `https://www.recruitlygroup.com/programs/${slug}`,
  });

  if (q.isError) return <PageShell><ErrorState onRetry={() => q.refetch()} /></PageShell>;
  if (q.isLoading) return <PageShell><ListSkeleton /></PageShell>;
  if (!p) return <PageShell><div className="py-20 text-center"><h1 className="text-2xl font-bold mb-3">Program not found</h1><Button asChild><Link to="/programs">Search programs</Link></Button></div></PageShell>;

  const official = p.program_url || p.link;
  const answers = loadStudentAnswers();
  const elig = checkEligibility(answers, { cgpa: p.university?.cgpa_requirement, english: p.university?.english_cert, dataStatus: p.data_status });

  return (
    <PageShell>
      <nav className="text-sm text-muted-foreground mb-4"><Link to="/programs" className="hover:underline">Programs</Link> / <span className="text-foreground">{p.course_name}</span></nav>
      <Reveal><div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{p.course_name}</h1>
          <p className="text-muted-foreground mt-1">
            {p.university ? <Link to={`/universities/${p.university.slug}`} className="text-primary hover:underline">{p.university_name}</Link> : p.university_name} · {p.country}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-3"><DataStatusBadge status={p.data_status} />
            <ExtLink href={official}>Official program page</ExtLink><ExtLink href={p.university?.admissions_url}>Official admissions page</ExtLink><ExtLink href={p.university?.website_url}>University website</ExtLink></div>
        </div>
        <SaveButton kind="program" id={p.id} />
      </div></Reveal>
      <Reveal delay={0.05}><div className="mt-4"><Notice>{UNI_NOTICE}</Notice></div></Reveal>

      <Reveal delay={0.08}><div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card><CardHeader><CardTitle className="text-lg">Program details</CardTitle></CardHeader><CardContent>
          <dl className="text-sm">
            {[["Level", p.level], ["Field", p.department], ["Tuition", p.tuition_fee], ["Admission requirement", p.admission_requirement]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2 border-b border-border last:border-0"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v || <span className="text-muted-foreground">Not available</span>}</dd></div>))}
          </dl>
          {!official && <p className="text-sm text-muted-foreground mt-3">No official program link stored yet — search for this program on the university's website.</p>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Your eligibility check</CardTitle></CardHeader><CardContent className="text-sm space-y-2">
          {!answers ? <><p className="text-muted-foreground">Complete the free WiseScore profile to compare your profile with this university's stated minimums.</p><Button asChild size="sm"><Link to="/educational-consultancy">Start WiseScore</Link></Button></>
            : elig.overall === "unknown" ? <p>Not enough verified information to calculate this accurately. Please check the university's official admission and visa requirements.</p>
            : <p className="font-medium">{elig.overall === "likely" ? "You appear to meet the minimums we have on record." : "You may be below a stated minimum."}</p>}
          {elig.notes.map((n) => <p key={n} className="text-muted-foreground">{n}</p>)}
        </CardContent></Card>
      </div></Reveal>

      <Reveal><section className="mt-8"><h2 className="text-xl font-semibold mb-3">Visa information</h2><VisaSource country={p.country} /></section></Reveal>
      <div className="mt-10"><Button asChild variant="outline" className="hover-lift"><a href={whatsappUrl(`Hi Recruitly Group! I'm interested in ${p.course_name} at ${p.university_name} (${p.country}). Please guide me.`)} target="_blank" rel="noopener noreferrer">Talk to a counsellor <ExternalLink className="w-4 h-4 ml-2" /></a></Button></div>
    </PageShell>
  );
};
export default ProgramDetail;
