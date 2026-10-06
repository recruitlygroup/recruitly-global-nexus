// src/components/blocks/index.tsx
// Visual building blocks shared by every content page. All colours come from the global CSS tokens
// (primary / amber / ink / border) so every page stays consistent with DESIGN_SYSTEM.md.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ExternalLink, Mail, MessageCircle, Phone, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";
import { ICONS, type IconName } from "./icons";
import type { Cta, FlowNode, PageSpec, Partner, Step } from "./spec";

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const C = ICONS[name];
  return <C aria-hidden className={className} />;
};

/** Link or anchor depending on the CTA shape. */
const CtaButton = ({ cta, variant = "default", size = "lg", className }: { cta: Cta; variant?: "default" | "secondary" | "amber" | "outline"; size?: "default" | "lg"; className?: string }) => {
  const inner = <>{cta.label}<ArrowRight aria-hidden /></>;
  return (
    <Button asChild variant={variant} size={size} className={className}>
      {cta.to ? <Link to={cta.to}>{inner}</Link> : <a href={cta.href} target={cta.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{inner}</a>}
    </Button>
  );
};

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fires once when the element scrolls into view. */
function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion() || typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

/* ───────────────────────── Hero ───────────────────────── */
/** The journey card is the one animated "moment" in the hero: the highlighted stage advances every ~2s. */
const JourneyCard = ({ title, steps }: { title?: string; steps: string[] }) => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % steps.length), 2200);
    return () => window.clearInterval(id);
  }, [steps.length]);
  return (
    <div className="rg-float rounded-lg border border-white/15 bg-white/[0.07] p-6 backdrop-blur-sm">
      <p className="mb-5 text-sm font-semibold text-white/70">{title ?? "Your journey with Recruitly"}</p>
      <ol className="space-y-3">
        {steps.map((s, i) => {
          const done = i < active; const now = i === active;
          return (
            <li key={s} className="flex items-center gap-3">
              <span className={cn("relative flex h-8 w-8 flex-none items-center justify-center rounded-full border text-xs font-bold transition-colors duration-500",
                now ? "rg-now border-amber bg-amber text-amber-foreground" : done ? "border-white/40 bg-white/20 text-white" : "border-white/20 text-white/50")}>
                {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <span className={cn("text-[15px] transition-colors duration-500", now ? "font-semibold text-white" : done ? "text-white/80" : "text-white/50")}>{s}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export const Hero = ({ hero }: { hero: PageSpec["hero"] }) => (
  <section className="relative isolate overflow-hidden bg-ink text-white">
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-primary-dark to-primary opacity-95" aria-hidden />
    <div className="rg-grid-bg absolute inset-0 -z-10" aria-hidden />
    <div className={cn("page-container grid items-center gap-12 py-16 md:py-24", hero.journey && "lg:grid-cols-[1.15fr_0.85fr]")}>
      <div>
        {hero.eyebrow && <p className="eyebrow-on-dark mb-4">{hero.eyebrow}</p>}
        <h1 className="max-w-3xl text-white">{hero.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{hero.lead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <CtaButton cta={hero.primary} variant="amber" />
          {hero.secondary && <CtaButton cta={hero.secondary} variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" />}
        </div>
      </div>
      {hero.journey && <JourneyCard title={hero.journey.title} steps={hero.journey.steps} />}
    </div>
  </section>
);

/* ───────────────────────── Section wrapper ───────────────────────── */
export const Section = ({ title, lead, children, tone = "plain", id }: { title?: string; lead?: string; children: ReactNode; tone?: "plain" | "tint"; id?: string }) => (
  <section id={id} className={cn("section", tone === "tint" ? "bg-secondary/60" : "bg-background")}>
    <div className="page-container">
      {title && (
        <header className="mb-10 max-w-3xl">
          <h2>{title}</h2>
          {lead && <p className="lead mt-3">{lead}</p>}
        </header>
      )}
      {children}
    </div>
  </section>
);

export const Notice = ({ tone, title, body }: NonNullable<PageSpec["notice"]>) => (
  <div className="page-container pt-8">
    <div role="note" className={cn("flex gap-3 rounded-lg border p-4", tone === "warning" ? "border-amber/50 bg-amber/10" : "border-primary/20 bg-primary/5")}>
      {tone === "warning" ? <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-accent" aria-hidden /> : <Info className="mt-0.5 h-5 w-5 flex-none text-primary" aria-hidden />}
      <div><p className="font-semibold text-foreground">{title}</p><p className="mt-1 text-[15px] text-muted-foreground">{body}</p></div>
    </div>
  </div>
);

/* ───────────────────────── Stats (count-up) ───────────────────────── */
const CountUp = ({ value }: { value: string }) => {
  const m = value.match(/^(\D*)(\d+)(\D*)$/);
  const [ref, seen] = useInView<HTMLSpanElement>(0.6);
  const [n, setN] = useState(0);
  const target = m ? parseInt(m[2], 10) : 0;
  useEffect(() => {
    if (!m || !seen) return;
    if (reducedMotion() || target === 0) { setN(target); return; }
    const t0 = performance.now(); let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, target]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{m[1]}{n}{m[3]}</span>;
};

export const StatBand = ({ items }: { items: NonNullable<PageSpec["stats"]> }) => (
  <section className="border-b border-border bg-card">
    <dl className="page-container grid grid-cols-2 gap-y-6 py-8 md:grid-cols-4 md:divide-x md:divide-border">
      {items.map((s) => (
        <div key={s.label} className="flex flex-col md:px-6 first:md:pl-0">
          <dt className="order-2 mt-1 text-sm leading-snug text-muted-foreground">{s.label}</dt>
          <dd className="text-4xl font-extrabold tracking-tight text-primary"><CountUp value={s.value} /></dd>
        </div>
      ))}
    </dl>
  </section>
);

/* ───────────────────────── Intro ───────────────────────── */
export const Intro = ({ intro }: { intro: NonNullable<PageSpec["intro"]> }) => (
  <Section>
    <div className={cn("grid gap-12", intro.aside && "lg:grid-cols-[1.3fr_0.7fr]")}>
      <div className="max-w-3xl">
        <h2>{intro.title}</h2>
        <div className="mt-5 space-y-4 text-[17px] leading-[1.7] text-foreground/80">{intro.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>
      </div>
      {intro.aside && (
        <aside className="rg-gradient-border self-start p-6">
          <h3 className="text-lg">{intro.aside.title}</h3>
          <ul className="mt-4 space-y-3">
            {intro.aside.items.map((i) => (
              <li key={i} className="flex gap-3 text-[15px]"><Check className="mt-0.5 h-4 w-4 flex-none text-success" aria-hidden />{i}</li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  </Section>
);

/* ───────────────────────── Feature grid ───────────────────────── */
export const FeatureGrid = ({ f }: { f: NonNullable<PageSpec["features"]> }) => (
  <Section title={f.title} lead={f.lead} tone="tint">
    <ul className={cn("grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2", f.cols === 4 ? "lg:grid-cols-4" : f.cols === 2 ? "" : "lg:grid-cols-3")}>
      {f.items.map((it) => (
        <li key={it.title} className="group relative bg-card p-6 transition-colors hover:bg-primary/[0.03]">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none"><Icon name={it.icon} className="h-5 w-5" /></span>
          <h3 className="text-lg">{it.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{it.body}</p>
          <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-amber transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none" aria-hidden />
        </li>
      ))}
    </ul>
  </Section>
);

/* ───────────────────────── Flow chart ───────────────────────── */
const nodeShell: Record<NonNullable<FlowNode["kind"]>, string> = {
  step: "border-border bg-card",
  decision: "border-primary/40 bg-primary/5",
  end: "border-success/40 bg-success/10",
  partner: "border-amber bg-amber/10",
};

const FlowCard = ({ n, index }: { n: FlowNode; index: number }) => {
  const kind = n.kind ?? "step";
  return (
    <div className="flex w-full flex-col items-stretch lg:w-auto lg:flex-1">
      <div className={cn("relative h-full rounded-lg border p-4 shadow-sm", nodeShell[kind], kind === "decision" && "border-dashed")}>
        <div className="flex items-center gap-2">
          <span className={cn("flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold", kind === "partner" ? "bg-amber text-amber-foreground" : kind === "end" ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground")}>
            {n.icon ? <Icon name={n.icon} className="h-4 w-4" /> : index + 1}
          </span>
          {n.tag && <span className="rounded-sm bg-foreground/5 px-1.5 py-0.5 text-xs font-semibold text-foreground/70">{n.tag}</span>}
        </div>
        <h3 className="mt-3 text-base leading-snug">{kind === "decision" ? `${n.title}` : n.title}</h3>
        {n.body && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{n.body}</p>}
      </div>
      {n.branch && (
        <div className="mx-auto flex flex-col items-center">
          <div className="rg-link-y" aria-hidden />
          <p className="max-w-[16rem] rounded-md border border-dashed border-destructive/40 bg-destructive/5 px-3 py-2 text-center text-sm">
            <span className="font-semibold text-destructive">{n.branch.label}: </span>{n.branch.text}
          </p>
        </div>
      )}
    </div>
  );
};

export const FlowChart = ({ f }: { f: NonNullable<PageSpec["flow"]> }) => (
  <Section title={f.title} lead={f.lead}>
    <ol className="flex flex-col items-stretch lg:flex-row lg:items-start" aria-label={f.title}>
      {f.nodes.map((n, i) => (
        <li key={n.title} className="flex flex-col items-stretch lg:flex-1 lg:flex-row lg:items-start">
          <FlowCard n={n} index={i} />
          {i < f.nodes.length - 1 && (
            <>
              <div className="rg-link-y lg:hidden" aria-hidden />
              <div className="hidden w-10 flex-none self-start pt-10 lg:block xl:w-14" aria-hidden><div className="rg-link-x" style={{ minWidth: 0, width: "100%" }} /></div>
            </>
          )}
        </li>
      ))}
    </ol>
  </Section>
);

/* ───────────────────────── Timeline ───────────────────────── */
const TimelineStep = ({ s, i, last }: { s: Step; i: number; last: boolean }) => {
  const [ref, seen] = useInView<HTMLLIElement>(0.5);
  return (
    <li ref={ref} data-in={seen} className="rg-step relative flex gap-5 pb-10 last:pb-0">
      {!last && <span className="rg-rail" aria-hidden><span className="rg-rail-fill" /></span>}
      <span className="rg-node relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full border-2 border-border bg-card text-sm font-bold text-foreground">{i + 1}</span>
      <div className="min-w-0 pt-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl">{s.title}</h3>
          {s.tag && <span className="rounded-sm bg-amber/20 px-2 py-0.5 text-xs font-semibold text-accent">{s.tag}</span>}
        </div>
        <p className="mt-1.5 max-w-2xl leading-relaxed text-muted-foreground">{s.body}</p>
        {s.bullets && <ul className="mt-3 space-y-1.5">{s.bullets.map((b) => <li key={b} className="flex gap-2 text-[15px]"><Check className="mt-1 h-4 w-4 flex-none text-primary" aria-hidden />{b}</li>)}</ul>}
      </div>
    </li>
  );
};

export const Timeline = ({ t }: { t: NonNullable<PageSpec["timeline"]> }) => (
  <Section title={t.title} lead={t.lead} tone="tint">
    <ol className="max-w-3xl">{t.steps.map((s, i) => <TimelineStep key={s.title} s={s} i={i} last={i === t.steps.length - 1} />)}</ol>
  </Section>
);

/* ───────────────────────── Partners ───────────────────────── */
const PartnerCard = ({ p }: { p: Partner }) => (
  <article className="card-lift flex flex-col p-7">
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-amber/20 text-accent"><Icon name={p.icon} className="h-6 w-6" /></span>
      <div><h3 className="text-xl">{p.name}</h3><p className="text-sm font-medium text-muted-foreground">{p.role}</p></div>
    </div>
    <p className="mt-4 leading-relaxed text-foreground/80">{p.body}</p>
    <ul className="mt-4 space-y-2">{p.points.map((x) => <li key={x} className="flex gap-2 text-[15px]"><Check className="mt-1 h-4 w-4 flex-none text-success" aria-hidden />{x}</li>)}</ul>
    <a href={p.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Visit {p.name} <ExternalLink className="h-4 w-4" aria-hidden /></a>
  </article>
);
export const Partners = ({ p }: { p: NonNullable<PageSpec["partners"]> }) => (
  <Section title={p.title} lead={p.lead}><div className="grid gap-6 md:grid-cols-2">{p.items.map((x) => <PartnerCard key={x.name} p={x} />)}</div></Section>
);

/* ───────────────────────── Checklists ───────────────────────── */
export const Checklists = ({ c }: { c: NonNullable<PageSpec["checklists"]> }) => (
  <Section title={c.title} lead={c.lead} tone="tint">
    <div className={cn("grid gap-6", c.groups.length > 1 && "md:grid-cols-2", c.groups.length > 2 && "lg:grid-cols-3")}>
      {c.groups.map((g) => (
        <div key={g.title} className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg">{g.title}</h3>
          <ul className="mt-4 space-y-2.5">{g.items.map((i) => <li key={i} className="flex gap-3 text-[15px]"><span className="mt-1 flex h-4 w-4 flex-none items-center justify-center rounded-sm border border-primary/40"><Check className="h-3 w-3 text-primary" aria-hidden /></span>{i}</li>)}</ul>
        </div>
      ))}
    </div>
  </Section>
);

/* ───────────────────────── Comparison ───────────────────────── */
export const Comparison = ({ c }: { c: NonNullable<PageSpec["comparison"]> }) => (
  <Section title={c.title} lead={c.lead}>
    <div className="relative overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[640px] text-left text-[15px]">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="p-4"><span className="sr-only">Feature</span></th>
            {c.columns.map((col, i) => <th key={col} scope="col" className={cn("p-4 text-base font-bold", i === c.highlight && "bg-primary text-primary-foreground")}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {c.rows.map((r) => (
            <tr key={r.label} className="border-b border-border last:border-0">
              <th scope="row" className="p-4 font-semibold">{r.label}</th>
              {r.cells.map((cell, i) => (
                <td key={i} className={cn("p-4", i === c.highlight && "bg-primary/5 font-medium")}>
                  {typeof cell === "boolean" ? (cell ? <><Check className="h-5 w-5 text-success" aria-hidden /><span className="sr-only">Yes</span></> : <span aria-label="No" className="text-muted-foreground">—</span>) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

/* ───────────────────────── Apply options (WhatsApp + online form) ───────────────────────── */
export const ApplyOptions = ({ context = "I would like to apply for a job through Recruitly Group.", title = "Ready to apply? Choose how." }: { context?: string; title?: string }) => (
  <Section title={title} lead="Every opening lives on our jobs page. Open a role, press Apply, and pick the route that suits you.">
    <div className="grid gap-5 md:grid-cols-2">
      <a href={`${SITE.whatsappUrl}?text=${encodeURIComponent(context)}`} target="_blank" rel="noopener noreferrer" className="card-lift group flex flex-col p-7">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-success-foreground"><MessageCircle className="h-6 w-6" aria-hidden /></span>
        <h3 className="mt-5 text-xl">Apply on WhatsApp</h3>
        <p className="mt-2 flex-1 text-muted-foreground">Message our team directly with your name, role and country. Fastest if you are on your phone.</p>
        <span className="mt-5 inline-flex items-center gap-2 font-semibold text-success">Open WhatsApp <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden /></span>
      </a>
      <Link to="/jobs" className="card-lift rg-gradient-border group flex flex-col p-7">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><ClipboardIcon /></span>
        <h3 className="mt-5 text-xl">Apply with the online form</h3>
        <p className="mt-2 flex-1 text-muted-foreground">Browse recruitlygroup.com/jobs, press Apply on a role, then choose “Apply with Form” to attach your details and CV.</p>
        <span className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">Browse open jobs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden /></span>
      </Link>
    </div>
    <p className="mt-5 text-sm text-muted-foreground">Placement is free for workers. If anyone asks you for a placement fee, read our <Link to="/security-and-scams" className="font-semibold text-primary underline-offset-4 hover:underline">scam-safety guide</Link>.</p>
  </Section>
);
const ClipboardIcon = () => { const C = ICONS.clipboard; return <C className="h-6 w-6" aria-hidden />; };

/* ───────────────────────── FAQ ───────────────────────── */
export const Faqs = ({ f }: { f: NonNullable<PageSpec["faqs"]> }) => (
  <Section title={f.title ?? "Frequently asked questions"} tone="tint">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: f.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })) }) }} />
    <Accordion type="single" collapsible className="max-w-3xl rounded-lg border border-border bg-card px-6">
      {f.items.map((i, n) => (
        <AccordionItem key={i.q} value={`q${n}`} className="last:border-b-0">
          <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{i.q}</AccordionTrigger>
          <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">{i.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </Section>
);

/* ───────────────────────── Related links ───────────────────────── */
export const Related = ({ r }: { r: NonNullable<PageSpec["related"]> }) => (
  <Section title={r.title}>
    <ul className="grid gap-x-12 md:grid-cols-2">
      {r.items.map((i) => (
        <li key={i.to} className="border-b border-border">
          <Link to={i.to} className="group flex items-start justify-between gap-6 py-5">
            <span><span className="block text-lg font-bold group-hover:text-primary">{i.label}</span>{i.body && <span className="mt-1 block text-[15px] text-muted-foreground">{i.body}</span>}</span>
            <ArrowRight className="mt-1.5 h-5 w-5 flex-none text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  </Section>
);

/* ───────────────────────── Closing CTA bar (consistent contact triggers) ───────────────────────── */
export const CtaBar = ({ title, body, primary }: { title: string; body: string; primary?: Cta }) => (
  <section className="relative isolate overflow-hidden bg-ink text-white">
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-dark to-ink" aria-hidden />
    <div className="rg-grid-bg absolute inset-0 -z-10 opacity-60" aria-hidden />
    <div className="page-container grid items-center gap-8 py-14 md:py-16 lg:grid-cols-[1fr_auto]">
      <div>
        <h2 className="max-w-2xl text-white">{title}</h2>
        <p className="mt-3 max-w-2xl text-white/80">{body}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {primary && <CtaButton cta={primary} variant="amber" />}
        <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"><a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden />WhatsApp</a></Button>
        <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"><a href={`mailto:${SITE.email}`}><Mail aria-hidden />Email</a></Button>
        <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"><a href={`tel:${SITE.phoneDisplay.replace(/\s/g, "")}`}><Phone aria-hidden />{SITE.phoneDisplay}</a></Button>
      </div>
    </div>
  </section>
);
