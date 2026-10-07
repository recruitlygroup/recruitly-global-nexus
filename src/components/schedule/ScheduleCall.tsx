// src/components/schedule/ScheduleCall.tsx
// "Hire from us" scheduler: employer context + a Cal.com-style booking panel.
//
//   mode="embed"   (default) → real availability from https://cal.com/recruitly-group/hire-talent-consultation (iframe)
//   mode="preview"           → fully interactive demo UI (dummy slots). "Confirm" hands the chosen date/duration to the real
//                              Cal.com page so nothing is ever booked against fake availability.
//
// To use @calcom/embed-react instead of the iframe, replace <CalIframe/> with:
//   import Cal from "@calcom/embed-react";
//   <Cal calLink="recruitly-group/hire-talent-consultation" style={{ width: "100%", height: "100%" }} config={{ layout: "month_view" }} />
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, ChevronDown, Clock, ExternalLink, Globe2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTr } from "@/i18n/useTr";
import { cn } from "@/lib/utils";

export const CAL_URL = "https://cal.com/recruitly-group/hire-talent-consultation";

type Mode = "embed" | "preview";
const DURATIONS = [15, 30, 60] as const;
type Duration = (typeof DURATIONS)[number];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

const detectTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };
const allTimezones = (current: string) => {
  let list: string[] = [];
  try { list = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? []; } catch { /* older browsers */ }
  if (!list.length) list = ["UTC", "Europe/Sofia", "Europe/London", "Asia/Kathmandu", "Asia/Dubai", "Asia/Kolkata", "Australia/Sydney", "Pacific/Auckland", "America/New_York", "America/Los_Angeles"];
  return list.includes(current) ? list : [current, ...list];
};

/** Business-hour slots, stepped by the chosen duration (15 → every 15 min, 30 → half-hourly, 60 → hourly). */
const buildSlots = (duration: Duration, date: Date, now: Date, h24: boolean) => {
  const out: { label: string; value: string }[] = [];
  const sameDay = iso(date) === iso(now);
  for (let m = 9 * 60; m + duration <= 17 * 60; m += duration) {
    if (sameDay && m <= now.getHours() * 60 + now.getMinutes()) continue;
    const h = Math.floor(m / 60), mm = m % 60;
    out.push({ value: `${pad(h)}:${pad(mm)}`, label: h24 ? `${pad(h)}:${pad(mm)}` : `${((h + 11) % 12) + 1}:${pad(mm)}${h < 12 ? "am" : "pm"}` });
  }
  return out;
};

const TOPICS = [
  { id: "manpower", en: "Skilled manpower", bg: "Квалифициран персонал" },
  { id: "interns", en: "Interns", bg: "Стажанти" },
  { id: "students", en: "Student-recruitment partnership", bg: "Партньорство за студентски набор" },
  { id: "mvp", en: "Master Vendor Program", bg: "Master Vendor Program" },
] as const;

/* ───────────────────────── Live embed ───────────────────────── */
const CalIframe = ({ notes }: { notes: string }) => {
  const { tr } = useTr();
  const src = `${CAL_URL}?embed=true&layout=month_view&overlayCalendar=true&notes=${encodeURIComponent(notes)}`;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <iframe title={tr("Book a consultation with Recruitly Group", "Резервирайте консултация с Recruitly Group")} src={src} loading="lazy" className="block h-[760px] w-full md:h-[680px]" />
      <p className="border-t border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
        {tr("Calendar not loading?", "Календарът не се зарежда?")}{" "}
        <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          {tr("Open it in a new tab", "Отворете го в нов раздел")} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </p>
    </div>
  );
};

/* ───────────────────────── Interactive preview ───────────────────────── */
const CalPreview = ({ notes, hostName, hostRole }: { notes: string; hostName: string; hostRole?: string }) => {
  const { tr, lang } = useTr();
  const now = useMemo(() => new Date(), []);
  const today = startOfDay(now);
  const firstOpen = useMemo(() => { const d = new Date(today); while (isWeekend(d)) d.setDate(d.getDate() + 1); return d; }, [today]);

  const [duration, setDuration] = useState<Duration>(30);
  const [month, setMonth] = useState(new Date(firstOpen.getFullYear(), firstOpen.getMonth(), 1));
  const [date, setDate] = useState<Date | null>(firstOpen);
  const [slot, setSlot] = useState<string | null>(null);
  const [tz, setTz] = useState(detectTz);
  const zones = useMemo(() => allTimezones(tz), [tz]);
  const locale = lang === "bg" ? "bg-BG" : "en-GB";

  useEffect(() => setSlot(null), [duration, date]);

  const slots = date ? buildSlots(duration, date, now, lang === "bg") : [];
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))] as (Date | null)[];
  }, [month]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 7 + i))), [locale]);
  const canGoBack = month > new Date(today.getFullYear(), today.getMonth(), 1);

  const confirmHref = date ? `${CAL_URL}?date=${iso(date)}&duration=${duration}&notes=${encodeURIComponent(notes)}` : CAL_URL;

  return (
    <div className="grid overflow-hidden rounded-xl border border-border shadow-lg lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      {/* LEFT — dark brand panel: host + month calendar */}
      <div className="bg-ink p-6 text-white md:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber text-lg font-extrabold" aria-hidden>R</span>
          <div>
            <p className="text-sm text-white/60">{tr("Meet with", "Среща с")}</p>
            <p className="text-lg font-bold leading-tight">{hostName}</p>
            <p className="text-sm text-white/70">{hostRole ?? tr("Global Mobility & Recruitment", "Глобална мобилност и подбор на персонал")}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            {new Intl.DateTimeFormat(locale, { month: "long" }).format(month)} <span className="font-normal text-white/60">{month.getFullYear()}</span>
          </h3>
          <div className="flex gap-1">
            <button type="button" disabled={!canGoBack} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label={tr("Previous month", "Предишен месец")} className="rounded-md p-2 hover:bg-white/10 disabled:opacity-30"><ArrowLeft className="h-5 w-5" aria-hidden /></button>
            <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label={tr("Next month", "Следващ месец")} className="rounded-md p-2 hover:bg-white/10"><ArrowRight className="h-5 w-5" aria-hidden /></button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center" role="grid" aria-label={tr("Choose a date", "Изберете дата")}>
          {weekdays.map((w) => <div key={w} className="pb-1 text-xs font-semibold uppercase tracking-wide text-white/50">{w}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} />;
            const disabled = d < today || isWeekend(d);
            const selected = date && iso(d) === iso(date);
            return (
              <button key={iso(d)} type="button" disabled={disabled} onClick={() => setDate(d)} aria-pressed={!!selected}
                className={cn("relative aspect-square rounded-md text-sm font-semibold transition-colors",
                  disabled ? "text-white/25" : selected ? "bg-amber text-amber-foreground" : "bg-white/10 text-white hover:bg-white/20")}>
                {d.getDate()}
                {iso(d) === iso(today) && <span className={cn("absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full", selected ? "bg-amber-foreground" : "bg-amber")} aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT — light panel: meta, duration, timezone, slots */}
      <div className="bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm font-medium"><Video className="h-4 w-4 text-primary" aria-hidden />Google Meet</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm font-medium"><Video className="h-4 w-4 text-primary" aria-hidden />Microsoft Teams</span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" aria-hidden />
          <div role="tablist" aria-label={tr("Meeting length", "Продължителност")} className="inline-flex rounded-md border border-border p-1">
            {DURATIONS.map((d) => (
              <button key={d} role="tab" aria-selected={duration === d} onClick={() => setDuration(d)}
                className={cn("rounded px-4 py-1.5 text-sm font-semibold transition-colors", duration === d ? "bg-ink text-white" : "text-foreground/70 hover:bg-secondary")}>
                {d === 60 ? "1h" : `${d}m`}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-4">
          <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="tz" className="sr-only">{tr("Time zone", "Часова зона")}</label>
          <select id="tz" value={tz} onChange={(e) => setTz(e.target.value)} className="w-full appearance-none rounded-md border border-border bg-background py-2.5 pl-9 pr-9 text-sm">
            {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        </div>

        <p className="mt-6 font-semibold">{date ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(date) : tr("Pick a date", "Изберете дата")}</p>
        <ul className="mt-3 max-h-[300px] space-y-2 overflow-y-auto pr-1" aria-label={tr("Available times", "Свободни часове")}>
          {slots.length === 0 && <li className="text-sm text-muted-foreground">{tr("No times left on this day. Try another date.", "Няма свободни часове за този ден. Опитайте друга дата.")}</li>}
          {slots.map((s) => (
            <li key={s.value}>
              <button type="button" onClick={() => setSlot(s.value)} aria-pressed={slot === s.value}
                className={cn("flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors",
                  slot === s.value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60 hover:bg-primary/5")}>
                <span className={cn("h-2 w-2 rounded-full", slot === s.value ? "bg-white" : "bg-success")} aria-hidden />{s.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-border pt-5" aria-live="polite">
          {slot && date ? (
            <>
              <p className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 flex-none text-success" aria-hidden />
                {tr(`You chose ${duration} min on ${iso(date)} at ${slot} (${tz.replace(/_/g, " ")}).`, `Избрахте ${duration} мин на ${iso(date)} в ${slot} (${tz.replace(/_/g, " ")}).`)}</p>
              <Button asChild size="lg" className="mt-3 w-full"><a href={confirmHref} target="_blank" rel="noopener noreferrer"><CalendarCheck aria-hidden />{tr("Confirm on Cal.com", "Потвърдете в Cal.com")}</a></Button>
              <p className="mt-2 text-xs text-muted-foreground">{tr("This preview shows sample times. Final availability is confirmed on Cal.com.", "Това е преглед с примерни часове. Окончателната наличност се потвърждава в Cal.com.")}</p>
            </>
          ) : <p className="text-sm text-muted-foreground">{tr("Select a time to continue.", "Изберете час, за да продължите.")}</p>}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────── Public component ───────────────────────── */
const ScheduleCall = ({ mode = "embed", hostName = "Recruitly Talent Partnerships", hostRole }: { mode?: Mode; hostName?: string; hostRole?: string }) => {
  const { tr } = useTr();
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["id"]>("manpower");
  const topicLabel = TOPICS.find((t) => t.id === topic)!.en; // notes are always sent to the team in English
  const notes = `Topic: ${topicLabel}`;
  return (
    <div>
      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold">{tr("What would you like to discuss?", "Какво искате да обсъдим?")}</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button key={t.id} type="button" aria-pressed={topic === t.id} onClick={() => setTopic(t.id)}
              className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition-colors", topic === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>
              {tr(t.en, t.bg)}
            </button>
          ))}
        </div>
      </fieldset>
      {mode === "embed" ? <CalIframe notes={notes} /> : <CalPreview notes={notes} hostName={hostName} hostRole={hostRole} />}
    </div>
  );
};
export default ScheduleCall;
