import { Link, useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, ExternalLink, ShieldCheck, AlertTriangle, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useShortlist, type ShortlistKind } from "@/hooks/useShortlist";
import { VISA_SOURCES, SCHENGEN_PORTAL } from "@/data/visaSources";
import type { DataStatus, UniListItem, ProgramListItem } from "@/lib/universityApi";

const STATUS = {
  verified: { label: "Verified", cls: "bg-green-100 text-green-800 border-green-200", Icon: ShieldCheck },
  partial:  { label: "Partial data", cls: "bg-yellow-100 text-yellow-800 border-yellow-200", Icon: AlertTriangle },
  unknown:  { label: "Official source required", cls: "bg-muted text-muted-foreground border-border", Icon: HelpCircle },
} as const;

export const DataStatusBadge = ({ status }: { status: DataStatus }) => {
  const s = STATUS[status] ?? STATUS.unknown;
  return <Badge variant="outline" className={`${s.cls} gap-1 font-normal`}><s.Icon className="w-3 h-3" />{s.label}</Badge>;
};

export const SaveButton = ({ kind, id }: { kind: ShortlistKind; id: string }) => {
  const { isSaved, toggle, loggedIn } = useShortlist();
  const navigate = useNavigate();
  const saved = isSaved(kind, id);
  return (
    <Button variant="ghost" size="sm" aria-pressed={saved} aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
      onClick={(e) => { e.preventDefault(); if (loggedIn) toggle(kind, id); else navigate("/auth"); }}>
      {saved ? <BookmarkCheck className="w-4 h-4 text-accent" /> : <Bookmark className="w-4 h-4" />}
    </Button>
  );
};

export const ExtLink = ({ href, children }: { href?: string | null; children: React.ReactNode }) =>
  href ? <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{children}<ExternalLink className="w-3.5 h-3.5" /></a> : null;

export const UNI_NOTICE = "Program information may change. Please verify admission requirements directly with the university's official website.";
export const VISA_NOTICE = "Visa requirements can change. Please verify the current requirements through the official immigration/embassy source.";

export const Notice = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground bg-muted/60 border border-border rounded-lg px-3 py-2">{children}</p>
);

export const VisaSource = ({ country }: { country: string }) => {
  const s = VISA_SOURCES[country];
  const link = s ?? SCHENGEN_PORTAL;
  return (
    <div className="space-y-2">
      <Notice>{VISA_NOTICE}</Notice>
      {s ? <ExtLink href={link.url}>{link.label}</ExtLink>
         : <p className="text-sm text-muted-foreground">No verified official link stored for {country} yet. For EU/Schengen countries see the <ExtLink href={link.url}>{link.label}</ExtLink> (general information, not country-specific).</p>}
    </div>
  );
};

export const UniversityCard = ({ u }: { u: UniListItem }) => (
  <Card className="hover:border-primary/40 transition-colors"><CardContent className="p-4 flex items-start gap-2">
    <div className="min-w-0 flex-1">
      <Link to={`/universities/${u.slug}`} className="font-semibold text-foreground hover:text-primary line-clamp-2">{u.university_name}</Link>
      <p className="text-sm text-muted-foreground mt-0.5">{u.country}{u.type ? ` · ${u.type}` : ""}</p>
      <div className="mt-2 flex items-center gap-3 flex-wrap"><DataStatusBadge status={u.data_status} /><ExtLink href={u.website_url}>Official site</ExtLink></div>
    </div>
    <SaveButton kind="university" id={u.id} />
  </CardContent></Card>
);

export const ProgramCard = ({ p }: { p: ProgramListItem }) => (
  <Card className="hover:border-primary/40 transition-colors"><CardContent className="p-4 flex items-start gap-2">
    <div className="min-w-0 flex-1">
      <Link to={`/programs/${p.slug}`} className="font-semibold text-foreground hover:text-primary line-clamp-2">{p.course_name}</Link>
      <p className="text-sm text-muted-foreground mt-0.5">{p.university_name} · {p.country}</p>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {p.level && <Badge variant="secondary">{p.level}</Badge>}
        {p.department && <Badge variant="outline" className="font-normal">{p.department}</Badge>}
        {p.tuition_fee && <span className="text-sm text-foreground">{p.tuition_fee}</span>}
        <DataStatusBadge status={p.data_status} />
      </div>
    </div>
    <SaveButton kind="program" id={p.id} />
  </CardContent></Card>
);

export const ListSkeleton = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
);

export const Pager = ({ page, hasMore, onPage }: { page: number; hasMore: boolean; onPage: (p: number) => void }) => (
  <div className="flex items-center justify-center gap-3 mt-6">
    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPage(page - 1)}><ChevronLeft className="w-4 h-4" />Previous</Button>
    <span className="text-sm text-muted-foreground">Page {page + 1}</span>
    <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => onPage(page + 1)}>Next<ChevronRight className="w-4 h-4" /></Button>
  </div>
);

export const EmptyState = ({ text, onClear }: { text: string; onClear?: () => void }) => (
  <div className="text-center py-16 text-muted-foreground"><p>{text}</p>{onClear && <Button variant="outline" className="mt-4" onClick={onClear}>Clear filters</Button>}</div>
);

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="text-center py-16"><p className="text-foreground mb-3">We couldn't load this right now.</p><Button onClick={onRetry}>Try again</Button></div>
);

export const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background pt-24 pb-16"><div className="max-w-7xl mx-auto px-4">{children}</div></div>
);

export const whatsappUrl = (text: string) => `https://wa.me/9779743208282?text=${encodeURIComponent(text)}`;
