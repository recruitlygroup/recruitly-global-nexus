import { ExternalLink } from "lucide-react";
import { APOSTILLE_SEWA_URL } from "@/config/nav";

// Replaces the old internal Apostille pages.
const ExternalPartnerBanner = () => (
  <section className="bg-white border border-border rounded-md p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <p className="text-primary leading-relaxed max-w-3xl">
      Looking for fast document legalization &amp; Apostille services? Visit our specialized partner platform{" "}
      <strong>Apostille Sewa Nepal</strong> at{" "}
      <a href={APOSTILLE_SEWA_URL} target="_blank" rel="noopener noreferrer" className="text-accent font-bold underline underline-offset-2">apostillesewa.com</a>.
    </p>
    <a href={APOSTILLE_SEWA_URL} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-3 rounded-md text-sm whitespace-nowrap hover:bg-primary/90">
      apostillesewa.com <ExternalLink className="w-4 h-4" />
    </a>
  </section>
);
export default ExternalPartnerBanner;
