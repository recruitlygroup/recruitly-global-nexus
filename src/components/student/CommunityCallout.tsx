// Free self-application support community callout, shown on every country hub.
import { MessageCircle, Users, Route, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { StudyCountry } from "@/data/studyCountries";

const PERKS = [
  { icon: Users, text: "Dedicated university-specific discussion groups" },
  { icon: Route, text: "Step-by-step visa guidance support" },
  { icon: FileText, text: "Free resources, flyers and guides for independent applicants" },
];

const CommunityCallout = ({ country }: { country: StudyCountry }) => (
  <section id="community" aria-labelledby="community-heading" className="scroll-mt-24 bg-primary text-white rounded-md p-6 md:p-10">
    <div className="grid md:grid-cols-5 gap-8 items-center">
      <div className="md:col-span-3">
        <span className="inline-block bg-accent text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm mb-4">Free community</span>
        <h2 id="community-heading" className="text-2xl md:text-3xl font-extrabold text-white mb-3">
          Applying to {country.name} on your own? You don’t have to do it alone.
        </h2>
        <p className="text-white/80 leading-relaxed mb-6">
          Our free student self-application support community is open to anyone preparing their own application.
        </p>
        <ul className="space-y-3">
          {PERKS.map((p) => (
            <li key={p.text} className="flex items-start gap-3 text-white/90">
              <p.icon className="w-5 h-5 mt-0.5 shrink-0 text-white" aria-hidden="true" />
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-2">
        {country.community ? (
          <a
            href={country.community.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white text-primary font-bold px-6 py-4 rounded-md hover:bg-white/90 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Join “{country.community.label}” on WhatsApp</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <div className="bg-white/10 border border-white/20 rounded-md p-5">
            <p className="font-semibold mb-1">The {country.name} group is opening soon</p>
            <p className="text-sm text-white/80 mb-4">Tell us you’re interested and we’ll add you when it launches.</p>
            <Link to="/contact" className="inline-block bg-white text-primary font-bold px-5 py-2.5 rounded-md hover:bg-white/90">
              Contact us
            </Link>
          </div>
        )}
      </div>
    </div>
  </section>
);

export default CommunityCallout;
