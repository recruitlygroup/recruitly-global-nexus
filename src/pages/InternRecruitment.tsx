import { GraduationCap, Hotel, Wrench, Globe2, ClipboardCheck, Handshake } from "lucide-react";
import PageHero from "@/components/PageHero";
import PhotoSlot from "@/components/PhotoSlot";
import EmployerDashboardCTA from "@/components/EmployerDashboardCTA";
import { useSEO } from "@/hooks/useSEO";
import { EMPLOYER_DASHBOARD_URL } from "@/config/nav";

const TRACKS = [
  { icon: Hotel,  title: "Hospitality interns", body: "Front office, housekeeping, F&B and kitchen interns trained before arrival.", photo: "hospitality.jpg", alt: "Hospitality interns in a hotel kitchen" },
  { icon: Wrench, title: "Engineering interns", body: "Mechanical, electrical and civil engineering trainees for site and workshop placements.", photo: "engineers.jpg", alt: "Engineering interns on site" },
];

const STEPS = [
  { icon: ClipboardCheck, title: "Brief", body: "Tell us the role, duration and location. We confirm the profile and timeline." },
  { icon: GraduationCap,  title: "Select & train", body: "Candidates are screened and prepared for your sector before shortlisting." },
  { icon: Handshake,      title: "Interview", body: "Review candidate files and interview your shortlist." },
  { icon: Globe2,         title: "Mobilise", body: "We support documentation and arrival for interns from South Asia or from inside the EU." },
];

const InternRecruitment = () => {
  useSEO({
    title: "Intern Recruitment for EU Employers | Recruitly Group",
    description: "Trained hospitality and engineering interns from South Asia or inside the EU, placed with EU and global employers by a registered Bulgarian recruitment agency.",
    canonicalUrl: "https://www.recruitlygroup.com/intern-recruitment",
  });
  return (
    <div className="bg-background">
      <PageHero
        eyebrow="Intern Recruitment"
        title="Trained interns for your hospitality and engineering teams"
        subtitle="For EU and global employers looking for trained hospitality and engineering interns from South Asia or from inside the EU."
        photo="interns.jpg" photoAlt="Interns in hands-on training"
      >
        <a href={EMPLOYER_DASHBOARD_URL} className="inline-block bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">Request interns</a>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-16">
        <section>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-8">Internship tracks</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TRACKS.map((t) => (
              <article key={t.title} className="bg-white border border-border rounded-md overflow-hidden">
                <PhotoSlot file={t.photo} alt={t.alt} className="w-full h-56" />
                <div className="p-6">
                  <t.icon className="w-6 h-6 text-accent mb-3" />
                  <h3 className="text-xl font-bold text-primary mb-2">{t.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{t.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-8">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="bg-white border border-border rounded-md p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <s.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-primary mb-1">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <EmployerDashboardCTA />
      </div>
    </div>
  );
};
export default InternRecruitment;
