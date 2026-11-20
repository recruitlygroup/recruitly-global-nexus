// src/components/australia/AuAudienceForm.tsx
// B2B hiring / agency-partnership intake for the Australia market. Submits through the
// `submit-b2b-lead` edge function (honeypot + rate limit + server-side validation), never straight to the table.
import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE } from "@/config/site";
import { AU_TIMEFRAMES, AU_TRADES, AU_WORKER_COUNTS, CONTACT_TYPES, SOURCING_POOLS, type PoolId } from "@/config/markets";

// Optional email notification via Web3Forms. The access key is public by design — restrict it to your domain in the
// Web3Forms dashboard. The lead is already saved in Supabase before this runs, so a failure here never loses it.
const W3F_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;
const notifyTeam = async (payload: Record<string, string>) => {
  if (!W3F_KEY) return;
  try {
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: W3F_KEY, from_name: "Recruitly Australia enquiry", botcheck: "", ...payload }),
    });
  } catch { /* notification is best-effort */ }
};

type ContactType = (typeof CONTACT_TYPES)[number]["value"];
interface Props { defaultContactType?: ContactType; sourcePage?: string; compact?: boolean; onSuccess?: () => void }

const selectCls = "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent";
const labelCls = "text-sm font-medium text-foreground";

const AuAudienceForm = ({ defaultContactType, sourcePage, compact = false, onSuccess }: Props) => {
  const [f, setF] = useState({
    contactType: (defaultContactType ?? "") as ContactType | "", companyName: "", abn: "", contactName: "", email: "", phone: "",
    trade: "", workersNeeded: "", timeframe: "", sponsorStatus: "", message: "", honeypot: "",
  });
  const [pools, setPools] = useState<PoolId[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const togglePool = (id: PoolId) => setPools((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.contactType) return setError("Please tell us whether you are a direct employer or a licensed agency.");
    if (pools.length === 0) return setError("Select at least one sourcing pool.");
    setError(""); setSubmitting(true);
    const { data, error: err } = await supabase.functions.invoke("submit-b2b-lead", {
      body: { market: "australia", ...f, pools, sourcePage: sourcePage ?? window.location.pathname },
    });
    setSubmitting(false);
    if (err || (data && data.error)) {
      // Show the real reason so problems are diagnosable (status code + server message when available).
      let reason = (data && data.error) || "";
      let status = "";
      const ctx = (err as { context?: Response } | null)?.context;
      if (ctx && typeof ctx.json === "function") {
        status = ` (code ${ctx.status})`;
        try { const body = await ctx.clone().json(); reason = body?.error || body?.message || reason; } catch { /* no JSON body */ }
      } else if (err) {
        reason = "the form service could not be reached (it may not be deployed on this Supabase project)";
      }
      console.error("submit-b2b-lead failed", err, data);
      setError(`We couldn't send your enquiry${reason ? `: ${reason}` : ""}${status}. Please email us or message us on WhatsApp.`);
      return;
    }
    void notifyTeam({
      subject: `New ${f.contactType === "licensed_agency" ? "agency" : "employer"} enquiry (Australia): ${f.companyName}`,
      name: f.contactName, email: f.email, phone: f.phone, company: f.companyName, abn: f.abn,
      contact_type: f.contactType, trade: f.trade, workers_needed: f.workersNeeded, timeframe: f.timeframe,
      sourcing_pools: pools.join(", "), sponsor_status: f.sponsorStatus, message: f.message,
      source_page: sourcePage ?? window.location.pathname,
    });
    // GTM is already loaded in index.html; this lets you count leads as a conversion.
    (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event: "generate_lead", market: "australia", contact_type: f.contactType });
    setDone(true); onSuccess?.();
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center" role="status">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-200 bg-green-50"><CheckCircle2 className="h-7 w-7 text-green-600" aria-hidden /></div>
        <p className="text-lg font-bold text-foreground">Enquiry received</p>
        <p className="max-w-sm text-sm text-muted-foreground">We will review your brief and reply with a sourcing plan. For anything urgent, message us on <a className="text-accent underline underline-offset-2" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate={false} aria-label="Australia hiring enquiry">
      {/* honeypot — real users never see or fill this */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>Leave blank<input tabIndex={-1} autoComplete="off" value={f.honeypot} onChange={set("honeypot")} /></label>
      </div>

      <fieldset>
        <legend className={labelCls}>I am a <span className="text-red-500">*</span></legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {CONTACT_TYPES.map((c) => (
            <label key={c.value} className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${f.contactType === c.value ? "border-primary bg-primary/5" : "border-input"}`}>
              <input type="radio" name="contactType" className="mt-0.5" value={c.value} checked={f.contactType === c.value} onChange={set("contactType")} required />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="au-company" className={labelCls}>Company / agency name <span className="text-red-500">*</span></Label><Input id="au-company" required maxLength={200} value={f.companyName} onChange={set("companyName")} className="mt-1 h-10 text-sm" /></div>
        <div><Label htmlFor="au-abn" className={labelCls}>ABN (optional)</Label><Input id="au-abn" maxLength={20} inputMode="numeric" value={f.abn} onChange={set("abn")} className="mt-1 h-10 text-sm" /></div>
        <div><Label htmlFor="au-name" className={labelCls}>Your name <span className="text-red-500">*</span></Label><Input id="au-name" required maxLength={100} autoComplete="name" value={f.contactName} onChange={set("contactName")} className="mt-1 h-10 text-sm" /></div>
        <div><Label htmlFor="au-email" className={labelCls}>Work email <span className="text-red-500">*</span></Label><Input id="au-email" type="email" required maxLength={255} autoComplete="email" value={f.email} onChange={set("email")} className="mt-1 h-10 text-sm" /></div>
        <div className="sm:col-span-2"><Label htmlFor="au-phone" className={labelCls}>Phone / WhatsApp (optional)</Label><Input id="au-phone" type="tel" maxLength={30} autoComplete="tel" value={f.phone} onChange={set("phone")} className="mt-1 h-10 text-sm" /></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label htmlFor="au-trade" className={labelCls}>Trade / role <span className="text-red-500">*</span></Label>
          <select id="au-trade" required className={selectCls} value={f.trade} onChange={set("trade")}><option value="">Select…</option>{AU_TRADES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><Label htmlFor="au-count" className={labelCls}>Workers needed <span className="text-red-500">*</span></Label>
          <select id="au-count" required className={selectCls} value={f.workersNeeded} onChange={set("workersNeeded")}><option value="">Select…</option>{AU_WORKER_COUNTS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><Label htmlFor="au-time" className={labelCls}>Target timeframe <span className="text-red-500">*</span></Label>
          <select id="au-time" required className={selectCls} value={f.timeframe} onChange={set("timeframe")}><option value="">Select…</option>{AU_TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}</select></div>
      </div>

      <fieldset>
        <legend className={labelCls}>Sourcing pools of interest <span className="text-red-500">*</span></legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.values(SOURCING_POOLS).map((p) => (
            <label key={p.id} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${pools.includes(p.id) ? "border-primary bg-primary/5" : "border-input"}`}>
              <input type="checkbox" checked={pools.includes(p.id)} onChange={() => togglePool(p.id)} />{p.name}
            </label>
          ))}
        </div>
      </fieldset>

      {!compact && (
        <div><Label htmlFor="au-sponsor" className={labelCls}>Sponsorship position (optional)</Label>
          <select id="au-sponsor" className={selectCls} value={f.sponsorStatus} onChange={set("sponsorStatus")}>
            <option value="">Select…</option><option value="approved">Approved sponsor</option><option value="applying">Applying / in progress</option><option value="not_yet">Not yet started</option><option value="not_sure">Not sure</option>
          </select></div>
      )}

      <div><Label htmlFor="au-msg" className={labelCls}>Anything we should know? (optional)</Label>
        <textarea id="au-msg" maxLength={2000} value={f.message} onChange={set("message")} placeholder="Licences or tickets required, location, pay range, project dates…"
          className="mt-1 min-h-[88px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent" /></div>

      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="h-11 w-full bg-accent font-semibold text-white shadow-sm hover:bg-accent/90">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />Sending…</> : <><Send className="mr-2 h-4 w-4" aria-hidden />Send hiring enquiry</>}
      </Button>
      <p className="text-xs text-muted-foreground">By submitting you agree to our <Link to="/privacy" className="underline">Privacy Policy</Link>. This form is for employers and licensed agencies; we do not give immigration advice.</p>
    </form>
  );
};
export default AuAudienceForm;
