import type { ReactNode } from "react";
import PhotoSlot from "./PhotoSlot";

interface Props { eyebrow?: string; title: string; subtitle?: string; photo?: string; photoAlt?: string; children?: ReactNode }

const PageHero = ({ eyebrow, title, subtitle, photo, photoAlt = "", children }: Props) => (
  <section className="bg-primary text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
      <div>
        {eyebrow && <span className="inline-block bg-accent text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm mb-4">{eyebrow}</span>}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">{title}</h1>
        {subtitle && <p className="text-white/80 text-lg leading-relaxed mb-6">{subtitle}</p>}
        {children}
      </div>
      {photo && <PhotoSlot file={photo} alt={photoAlt} className="w-full h-64 md:h-96 rounded-md" />}
    </div>
  </section>
);
export default PageHero;
