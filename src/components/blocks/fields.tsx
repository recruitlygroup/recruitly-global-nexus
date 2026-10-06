// Small labelled number input used by the calculators.
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const NumberField = ({ id, label, value, onChange, hint, suffix, min = 0, step = 1 }: {
  id: string; label: string; value: number; onChange: (v: number) => void; hint?: string; suffix?: string; min?: number; step?: number;
}) => (
  <div>
    <Label htmlFor={id} className="font-semibold">{label}</Label>
    <div className="relative mt-1.5">
      <Input id={id} type="number" inputMode="decimal" min={min} step={step} value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Math.max(min, parseFloat(e.target.value) || 0))} className={suffix ? "pr-12" : ""} aria-describedby={hint ? `${id}-hint` : undefined} />
      {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">{suffix}</span>}
    </div>
    {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const money = (n: number, currency = "EUR") =>
  new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(Math.round(n));
