import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  onSuccess?: () => void;
}

const EmployerHiringForm = ({ onSuccess }: Props) => {
  const [form, setForm] = useState({ role: "", email: "", company_name: "", quantity: "", target_country: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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
      message: form.message.trim() || null,
    }]);
    setSubmitting(false);
    if (err) {
      setError("Failed to submit. Please try again.");
    } else {
      setDone(true);
      onSuccess?.();
    }
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <p className="text-foreground font-semibold">Request submitted!</p>
        <p className="text-sm text-muted-foreground">We'll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Role needed *</Label>
        <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Truck Driver" />
      </div>
      <div>
        <Label>Email *</Label>
        <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@company.com" />
      </div>
      <div>
        <Label>Company name</Label>
        <Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Company Ltd." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Quantity</Label>
          <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="10" />
        </div>
        <div>
          <Label>Target country</Label>
          <Input value={form.target_country} onChange={e => setForm(f => ({ ...f, target_country: e.target.value }))} placeholder="Germany" />
        </div>
      </div>
      <div>
        <Label>Message</Label>
        <textarea
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Any additional details..."
          className="w-full p-2.5 rounded-lg border border-input bg-background text-sm min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Hiring Request"}
      </Button>
    </form>
  );
};

export default EmployerHiringForm;
