import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, GraduationCap, Mail, MessageCircle, BadgeCheck, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DESTINATIONS, flagUrl } from "./options";
import { DOCS_EMAIL, mailtoLink, whatsappLink } from "./config";
import { lookupUniversityPhoto, type FormState, type Recommendation, type ScoreResult } from "./engine";

const initials = (n: string) => n.replace(/\([^)]*\)/g, "").split(/\s+/).filter((w) => /^[A-ZÀ-Þ]/.test(w)).slice(0, 3).map((w) => w[0]).join("");

const chanceColor = (c: number) => c >= 70 ? { bar: "bg-emerald-500", chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" }
  : c >= 45 ? { bar: "bg-amber-500", chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300" }
  : { bar: "bg-orange-500", chip: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };

// Photo: admin image → Wikipedia lead photo → designed placeholder.
const UniPhoto = ({ rec }: { rec: Recommendation }) => {
  const [src, setSrc] = useState<string | null>(rec.imageUrl);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let on = true;
    if (!rec.imageUrl) lookupUniversityPhoto(rec.name).then((u) => on && setSrc(u));
    return () => { on = false; };
  }, [rec.imageUrl, rec.name]);
  const iso = DESTINATIONS.find((d) => d.value === rec.country)?.iso;
  const showImg = src && !failed;
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary via-[hsl(var(--primary-dark))] to-[hsl(var(--ink))]">
      {!showImg || !loaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/90">
            <GraduationCap className="mx-auto mb-1 h-9 w-9 opacity-80" />
            <span className="text-2xl font-extrabold tracking-wider">{initials(rec.name)}</span>
          </div>
        </div>
      ) : null}
      {showImg && (
        <img src={src!} alt={`${rec.name} campus`} loading="lazy" referrerPolicy="no-referrer" onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
      {iso && <img src={flagUrl(iso)} alt="" width={28} height={20} className="absolute right-3 top-3 h-5 w-7 rounded-sm object-cover shadow ring-1 ring-white/50" onError={(e) => (e.currentTarget.style.display = "none")} />}
    </div>
  );
};

interface Props { rec: Recommendation; rank: number; form: FormState; result: ScoreResult }

export const UniversityCard = ({ rec, rank, form, result }: Props) => {
  const [open, setOpen] = useState(false);
  const col = chanceColor(rec.chance);
  const prog = rec.program;
  const who = `${form.fullName} (${form.phone}, ${form.email})`;
  const summary = `University: ${rec.name} (${rec.country})${prog ? `\nProgram: ${prog.course_name}` : ""}\nMy WiseScore: ${result.score}/100\nEstimated chance shown: ${rec.chance}%`;

  const waText = `Hi Recruitly Group! I just completed WiseScore and I want to apply.\n\n${summary}\nMy details: ${who}\n\nPlease guide me with the next steps.`;
  const mailBody = `Hello Recruitly Group team,\n\nI would like to apply to the university below.\n\n${summary}\n\nApplicant: ${form.fullName}\nPhone: ${form.phone}\nEmail: ${form.email}\nNationality: ${form.nationality}\n\nI am attaching these documents:\n- Passport (bio page)\n- Academic transcripts & certificates\n- English test result (IELTS / PTE / TOEFL / Duolingo), if available\n- Updated CV\n- Statement of Purpose\n\nThank you!`;

  return (
    <>
      <motion.article initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(rank - 1, 4) * 0.07 }}
        className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-md transition-shadow hover:shadow-xl">
        <div className="relative">
          <UniPhoto rec={rec} />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[hsl(var(--amber))] px-3 py-1 text-xs font-extrabold text-[hsl(var(--amber-foreground))] shadow">
            {rank === 1 ? <Trophy className="h-3.5 w-3.5" /> : null} #{rank}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div>
            <h3 className="flex items-start gap-1.5 text-lg font-extrabold leading-snug text-foreground">
              {rec.name}{rec.verified && <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-primary" aria-label="Verified data" />}
            </h3>
            <p className="text-sm text-muted-foreground">{rec.country}{rec.type ? ` · ${rec.type}` : ""}</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-end justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Acceptance chance</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${col.chip}`}>{rec.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold tabular-nums text-foreground">{rec.chance}%</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={rec.chance} aria-valuemin={0} aria-valuemax={100} aria-label={`Acceptance chance ${rec.chance}%`}>
                <motion.div className={`h-full rounded-full ${col.bar}`} initial={{ width: 0 }} animate={{ width: `${rec.chance}%` }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} />
              </div>
            </div>
          </div>

          {prog && (
            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              <p className="font-semibold text-foreground">Matching program</p>
              <p className="text-foreground/80">{prog.course_name}{prog.level ? ` · ${prog.level}` : ""}</p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {prog.internal_link && (prog.internal_link.startsWith("/")
                  ? <Link to={prog.internal_link} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">Program details</Link>
                  : <a href={prog.internal_link} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">Program details</a>)}
                {prog.external_link && <a href={prog.external_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">Official page <ExternalLink className="h-3.5 w-3.5" /></a>}
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
            <Button className="h-12 flex-1 gap-2 text-base font-bold" onClick={() => setOpen(true)}>Apply Now</Button>
            {rec.website && <Button variant="outline" asChild className="h-12 gap-2"><a href={rec.website} target="_blank" rel="noopener noreferrer">Website <ExternalLink className="h-4 w-4" /></a></Button>}
          </div>
        </div>
      </motion.article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Apply to {rec.name}</DialogTitle>
            <DialogDescription>Choose how you'd like to start your application.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <a href={whatsappLink(waText)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4 transition hover:border-emerald-500 hover:bg-emerald-500/15">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white"><MessageCircle className="h-6 w-6" /></span>
              <span><span className="block font-bold text-foreground">Direct WhatsApp Apply</span><span className="text-sm text-muted-foreground">Chat with a counsellor now — your details are pre-filled.</span></span>
            </a>
            <a href={mailtoLink(rec.applyEmail || DOCS_EMAIL, `Application – ${rec.name} – ${form.fullName}`, mailBody)}
              className="flex items-center gap-4 rounded-2xl border-2 border-primary/40 bg-primary/10 p-4 transition hover:border-primary hover:bg-primary/15">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><Mail className="h-6 w-6" /></span>
              <span><span className="block font-bold text-foreground">Email Documents</span><span className="text-sm text-muted-foreground">Opens your email app with a ready message — just attach your documents.</span></span>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
