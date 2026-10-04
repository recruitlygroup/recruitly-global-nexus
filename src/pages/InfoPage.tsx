// Generic content page for the new navigation entries (Solutions, Job Seekers, Employers, Company).
import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import EmployerDashboardCTA from "@/components/EmployerDashboardCTA";
import { useSEO } from "@/hooks/useSEO";

interface Section { heading: string; body: string }
interface Info { title: string; subtitle: string; sections: Section[]; employerCta?: boolean; contact?: boolean }

const INFO: Record<string, Info> = {
  "permanent-placement": { title: "Permanent Placement", subtitle: "Long-term hires for EU employers, sourced and legally supplied by a registered Bulgarian agency.", employerCta: true, sections: [
    { heading: "What it is", body: "We find, screen and present candidates for permanent roles. Employers receive complete candidate files and video demonstrations before deciding." },
    { heading: "Where we source", body: "Bulgaria, Nepal, South Asia and EU countries, in line with applicable immigration and labour rules." } ] },
  "temporary-placement": { title: "Temporary Placement", subtitle: "Flexible seasonal and project-based staffing.", employerCta: true, sections: [
    { heading: "What it is", body: "Short-term and seasonal workers for hospitality, logistics, construction and more, with documentation handled for you." } ] },
  "training": { title: "Training", subtitle: "Pre-departure language and skills preparation.", sections: [
    { heading: "What it covers", body: "Language preparation, sector skills and workplace-readiness so candidates arrive prepared for their employers." } ] },
  "diversity-inclusion": { title: "Diversity & Inclusion", subtitle: "Fair, transparent recruitment.", sections: [
    { heading: "Our approach", body: "We assess candidates on skills and qualifications, and charge workers no placement fee." } ] },
  "outsourcing": { title: "Outsourcing", subtitle: "Managed workforce and recruitment process outsourcing.", employerCta: true, sections: [
    { heading: "What it is", body: "We can run all or part of your recruitment pipeline — sourcing, screening and documentation — as an extension of your HR team." } ] },
  "working-with-recruitly": { title: "Working with Recruitly", subtitle: "What to expect as a candidate.", sections: [
    { heading: "Free for candidates", body: "Recruitly Group does not charge workers a placement fee." },
    { heading: "Steps", body: "Create a profile, complete screening, interview with employers, then receive documentation and relocation support." } ] },
  "faq": { title: "Job Seeker FAQ", subtitle: "Answers to common candidate questions.", sections: [
    { heading: "Do I pay a placement fee?", body: "No. Placement is free of charge to workers." },
    { heading: "Is Recruitly registered?", body: "Yes. Recruitly Group is an officially registered recruitment agency in Sofia, Bulgaria." } ] },
  "advantage": { title: "The Recruitly Advantage", subtitle: "Why EU employers choose Recruitly.", employerCta: true, sections: [
    { heading: "Legal & compliant", body: "A Bulgarian-registered agency able to legally supply skilled talent from Bulgaria, Nepal, South Asia and EU countries." },
    { heading: "Complete candidate files", body: "Full files plus video demonstrations of skills before you commit." } ] },
  "how-we-work": { title: "How We Work", subtitle: "A transparent, step-by-step process.", employerCta: true, sections: [
    { heading: "Process", body: "Brief → sourcing → screening → shortlist & video demos → interviews → documentation → arrival and onboarding." } ] },
  "industry-sectors": { title: "Industry Sectors", subtitle: "Where we place talent.", employerCta: true, sections: [
    { heading: "Sectors", body: "Healthcare (nurses), transport (C/CE drivers), hospitality, engineering, skilled trades and vocational training." } ] },
  "recruitment-hr-solutions": { title: "Recruitment & HR Solutions", subtitle: "End-to-end support for employers.", employerCta: true, sections: [
    { heading: "Services", body: "Permanent and temporary placement, outsourcing, training and documentation support." } ] },
  "faq-employers": { title: "Employer FAQ", subtitle: "Answers for hiring managers.", employerCta: true, sections: [
    { heading: "How do I start?", body: "Open the Employer Dashboard to submit a hiring request and browse candidate files." } ] },
  "about": { title: "Who We Are", subtitle: "A registered recruitment agency in Sofia, Bulgaria.", sections: [
    { heading: "Company", body: "Recruitly Group is an officially registered recruitment agency in Sofia, Bulgaria, connecting employers, students and skilled workers across the EU, Nepal and South Asia." } ] },
  "careers": { title: "Careers @ Recruitly", subtitle: "Join the team.", sections: [
    { heading: "Open roles", body: "Send your CV to info@recruitlygroup.com and tell us how you'd like to contribute." } ] },
  "investors": { title: "Investors", subtitle: "Partnering with Recruitly Group.", sections: [
    { heading: "Get in touch", body: "For investor enquiries please email info@recruitlygroup.com." } ] },
  "contact": { title: "Contact Us", subtitle: "We're here to help.", contact: true, sections: [] },
};

const InfoPage = ({ slug }: { slug: string }) => {
  const info = INFO[slug];
  useSEO({ title: `${info?.title ?? "Recruitly Group"} | Recruitly Group`, description: info?.subtitle ?? "", canonicalUrl: `https://www.recruitlygroup.com/${slug}` });
  if (!info) return null;
  return (
    <div className="bg-background">
      <PageHero title={info.title} subtitle={info.subtitle} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-10">
        {info.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-extrabold text-primary mb-2">{s.heading}</h2>
            <p className="text-slate-700 leading-relaxed">{s.body}</p>
          </section>
        ))}
        {info.contact && (
          <address className="not-italic space-y-2 text-slate-700">
            <p className="font-bold text-primary">Recruitly Group</p>
            <p>Strandscha St 44, 1303 Sofia Center, Sofia, Bulgaria</p>
            <p><a className="text-accent font-semibold" href="mailto:info@recruitlygroup.com">info@recruitlygroup.com</a></p>
            <p><a className="text-accent font-semibold" href="https://wa.me/9779743208282">+977 974 320 8282</a></p>
          </address>
        )}
        {info.employerCta && <EmployerDashboardCTA />}
        <p className="text-sm"><Link to="/" className="text-accent font-semibold">← Back to home</Link></p>
      </div>
    </div>
  );
};
export default InfoPage;
