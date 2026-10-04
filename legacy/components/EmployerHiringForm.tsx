// src/components/employer/EmployerHiringForm.tsx
// Premium UI upgrade: cleaner inputs, better focus states, improved spacing

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, Send } from "lucide-react";

const ROLES = [
  "Truck Driver (C/CE)",
  "Truck Driver (C)",
  "Bus / Coach Driver",
  "Caregiver / Care Assistant",
  "Nurse (RN/LPN)",
  "Welder",
  "Construction Worker",
  "Electrician",
  "Plumber / Pipefitter",
  "Warehouse / Factory Worker",
  "Hospitality Staff",
  "Other (describe in message)",
];

const COUNTRIES = [
  "Germany", "Poland", "Croatia", "Romania", "Bulgaria",
  "Austria", "Netherlands", "Belgium", "Czech Republic",
  "Hungary", "France", "UAE", "Saudi Arabia", "Other",
];

interface Props {
  onSuccess?: () => void;
}

const EmployerHiringForm = ({ onSuccess }: Props) => {
  const [form, setForm] = useState({
    contact_name: "",
    company_name: "",
    email: "",
    phone: "",
    role: "",
    quantity: "",
    target_country: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role || !form.email.trim()) {
      setError("Role and email are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: err } = await supabase.from("employer_hiring_requests").insert([{
      role: form.role,
      email: form.email.trim(),
      company_name: form.company_name.trim() || null,
      quantity: form.quantity ? parseInt(form.quantity) : null,
      target_country: form.target_country || null,
      message: [
        form.contact_name ? `Contact: ${form.contact_name}` : "",
        form.phone        ? `Phone: ${form.phone}` : "",
        form.message,
      ].filter(Boolean).join("\n") || null,
    }]);
    setSubmitting(false);
    if (err) {
      setError("Submission failed. Please try again or WhatsApp us.");
    } else {
      setDone(true);
      onSuccess?.();
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-10 gap-3">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <p className="text-foreground font-bold text-lg">Request received!</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          We'll review your requirement and respond within 24 hours with a tailored proposal.
        </p>
        <p className="text-sm text-muted-foreground">
          Urgent?{" "}
          <a
            href="https://wa.me/9779743208282"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            WhatsApp +977 974 320 8282
          </a>
        </p>
      </div>
    );
  }

  const labelClass = "text-sm font-medium text-foreground";
  const inputClass = "mt-1 h-9 text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ef-name" className={labelClass}>Your Name</Label>
          <Input id="ef-name" placeholder="John Smith" value={form.contact_name} onChange={set("contact_name")} className={inputClass} />
        </div>
        <div>
          <Label htmlFor="ef-company" className={labelClass}>Company</Label>
          <Input id="ef-company" placeholder="Acme Logistics GmbH" value={form.company_name} onChange={set("company_name")} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ef-email" className={labelClass}>
            Email <span className="text-red-500">*</span>
          </Label>
          <Input id="ef-email" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} required className={inputClass} />
        </div>
        <div>
          <Label htmlFor="ef-phone" className={labelClass}>Phone / WhatsApp</Label>
          <Input id="ef-phone" type="tel" placeholder="+49 151 234 5678" value={form.phone} onChange={set("phone")} className={inputClass} />
        </div>
      </div>

      <div>
        <Label className={labelClass}>
          Role Needed <span className="text-red-500">*</span>
        </Label>
        <Select onValueChange={(v) => setForm(f => ({ ...f, role: v }))} value={form.role}>
          <SelectTrigger className="mt-1 h-9 text-sm">
            <SelectValue placeholder="Select role…" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map(r => <SelectItem key={r} value={r} className="text-sm">{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ef-qty" className={labelClass}>Quantity</Label>
          <Input id="ef-qty" type="number" min="1" placeholder="e.g. 10" value={form.quantity} onChange={set("quantity")} className={inputClass} />
        </div>
        <div>
          <Label className={labelClass}>Target Country</Label>
          <Select onValueChange={(v) => setForm(f => ({ ...f, target_country: v }))} value={form.target_country}>
            <SelectTrigger className="mt-1 h-9 text-sm">
              <SelectValue placeholder="Country…" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="ef-msg" className={labelClass}>Additional Details</Label>
        <textarea
          id="ef-msg"
          value={form.message}
          onChange={set("message")}
          placeholder="Licences required, shift patterns, timeline…"
          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground min-h-[72px] resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-10 font-semibold bg-accent hover:bg-accent/90 text-white shadow-sm"
      >
        {submitting
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending…</>
          : <><Send className="w-4 h-4 mr-2" />Submit Requirement</>
        }
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We respond within 24 hrs ·{" "}
        <a href="https://wa.me/9779743208282" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          WhatsApp for urgent needs
        </a>
      </p>
    </form>
  );
};

export default EmployerHiringForm;
