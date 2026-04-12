// src/components/employer/EmployerHiringForm.tsx
// Upgraded from the minimal stub to a proper form with dropdowns

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
    role: "",
    email: "",
    company_name: "",
    quantity: "",
    target_country: "",
    message: "",
    contact_name: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role.trim() || !form.email.trim()) {
      setError("Role and email are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: err } = await supabase.from("employer_hiring_requests").insert([{
      role: form.role.trim(),
      email: form.email.trim(),
      company_name: form.company_name.trim() || null,
      quantity: form.quantity ? parseInt(form.quantity) : null,
      target_country: form.target_country.trim() || null,
      message: [
        form.contact_name ? `Contact: ${form.contact_name}` : "",
        form.phone ? `Phone: ${form.phone}` : "",
        form.message,
      ].filter(Boolean).join("\n") || null,
    }]);
    setSubmitting(false);
    if (err) {
      setError("Failed to submit. Please try again or WhatsApp us directly.");
    } else {
      setDone(true);
      onSuccess?.();
    }
  };

  if (done) {
    return (
      <div className="text-center py-8 space-y-3">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
        <p className="text-foreground font-bold text-lg">Request received!</p>
        <p className="text-sm text-muted-foreground">
          We'll review your requirement and respond within 24 hours.
        </p>
        <p className="text-sm text-muted-foreground">
          Urgent? WhatsApp us:{" "}
          <a href="https://wa.me/9779743208282" target="_blank" rel="noopener noreferrer" className="text-accent underline">
            +977 974 320 8282
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name + Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ef-name" className="text-sm">Your Name</Label>
          <Input
            id="ef-name"
            placeholder="John Smith"
            value={form.contact_name}
            onChange={set("contact_name")}
          />
        </div>
        <div>
          <Label htmlFor="ef-company" className="text-sm">Company Name</Label>
          <Input
            id="ef-company"
            placeholder="Acme Logistics GmbH"
            value={form.company_name}
            onChange={set("company_name")}
          />
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ef-email" className="text-sm">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ef-email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={set("email")}
            required
          />
        </div>
        <div>
          <Label htmlFor="ef-phone" className="text-sm">Phone / WhatsApp</Label>
          <Input
            id="ef-phone"
            type="tel"
            placeholder="+49 151 234 5678"
            value={form.phone}
            onChange={set("phone")}
          />
        </div>
      </div>

      {/* Role dropdown */}
      <div>
        <Label className="text-sm">
          Role Needed <span className="text-destructive">*</span>
        </Label>
        <Select onValueChange={(v) => setForm(f => ({ ...f, role: v }))} value={form.role}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role…" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity + Country */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ef-qty" className="text-sm">How Many Workers?</Label>
          <Input
            id="ef-qty"
            type="number"
            min="1"
            placeholder="e.g. 10"
            value={form.quantity}
            onChange={set("quantity")}
          />
        </div>
        <div>
          <Label className="text-sm">Target Country</Label>
          <Select onValueChange={(v) => setForm(f => ({ ...f, target_country: v }))} value={form.target_country}>
            <SelectTrigger>
              <SelectValue placeholder="Country…" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="ef-msg" className="text-sm">Additional Details</Label>
        <textarea
          id="ef-msg"
          value={form.message}
          onChange={set("message")}
          placeholder="Licences required, shift patterns, salary range, timeline…"
          className="w-full p-2.5 rounded-lg border border-input bg-background text-sm min-h-[70px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full font-semibold">
        {submitting
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending…</>
          : <><Send className="w-4 h-4 mr-2" />Submit Hiring Request</>
        }
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We respond within 24 hrs ·{" "}
        <a href="https://wa.me/9779743208282" target="_blank" rel="noopener noreferrer" className="text-accent underline">
          WhatsApp for urgent needs
        </a>
      </p>
    </form>
  );
};

export default EmployerHiringForm;
