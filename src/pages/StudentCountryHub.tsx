// /student-recruitment/:country — data-driven country hub.
// All copy comes from src/data/studyCountries.ts; add a country there and this page renders it.
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import PageHero from "@/components/PageHero";
import BlogCard from "@/components/blog/BlogCard";
import CommunityCallout from "@/components/student/CommunityCallout";
import OrientationBanner from "@/components/student/OrientationBanner";
import { useSEO } from "@/hooks/useSEO";
import { useHashnodeBlog } from "@/hooks/useHashnodeBlog";
import { STUDY_COUNTRIES, buildRoadmap, filterPostsByCountry, getStudyCountry } from "@/data/studyCountries";
import NotFound from "./NotFound";

const HUB_POST_LIMIT = 6;

const linkClass =
  "inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-4 py-2.5 rounded-md text-sm";

const StudentCountryHub = () => {
  const { country: slug } = useParams();
  const country = getStudyCountry(slug);
  const { posts, loading } = useHashnodeBlog(Infinity);

  useSEO({
    title: country ? `Study in ${country.name}: Step-by-Step Guide for Students | Recruitly Group` : "Study destination | Recruitly Group",
    description: country ? `${country.tagline} Follow our step-by-step roadmap for ${country.name}: WiseScore, documents, apostille, visa and scholarships.` : "Study destination",
    canonicalUrl: `https://www.recruitlygroup.com/student-recruitment/${country?.slug ?? slug ?? ""}`,
    noIndex: !country,
  });

  if (!country) return <NotFound />;

  const steps = buildRoadmap(country);
  const countryPosts = filterPostsByCountry(posts, country);
  const others = STUDY_COUNTRIES.filter((c) => c.slug !== country.slug);

  return (
    <div className="bg-background">
      <PageHero
        eyebrow="Student Recruitment"
        title={`Study in ${country.name}`}
        subtitle={country.tagline}
        photo="students.jpg"
        photoAlt={`Students planning to study in ${country.name}`}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/wisescore" className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">
            Check my WiseScore <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <a href="#community" className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-6 py-3 rounded-md hover:bg-white hover:text-primary transition-colors">
            Join the free community
          </a>
        </div>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-16">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600 -mb-8">
          <Link to="/student-recruitment" className="hover:underline">Student recruitment</Link>
          <span aria-hidden="true"> / </span>
          <span className="text-primary font-semibold" aria-current="page">{country.name}</span>
        </nav>

        {/* Section 1 — Why study */}
        <section aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-2xl md:text-3xl font-extrabold text-primary mb-6">Why Study in {country.name}</h2>
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-4 text-slate-700 leading-relaxed max-w-prose">
              <p className="text-lg text-primary font-medium">{country.overview.intro}</p>
              {country.overview.paragraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {country.overview.highlights.map((h) => (
                <div key={h.title} className="bg-white border border-border rounded-md p-5">
                  <h3 className="font-bold text-primary mb-1">{h.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{h.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 — Roadmap */}
        <section aria-labelledby="roadmap-heading">
          <h2 id="roadmap-heading" className="text-2xl md:text-3xl font-extrabold text-primary mb-2">Your step-by-step application roadmap</h2>
          <p className="text-slate-600 mb-8 max-w-2xl">Follow these six steps in order. Each one builds on the one before.</p>
          <ol className="space-y-5">
            {steps.map((s, i) => (
              <li key={s.id} className="bg-white border border-border rounded-md p-6 md:p-8 flex gap-5">
                <span aria-hidden="true" className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-primary mb-1">
                    <span className="sr-only">Step {i + 1}: </span>{s.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-3 max-w-prose">{s.summary}</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 leading-relaxed max-w-prose">
                    {s.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                  {s.links.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-5">
                      {s.links.map((l) =>
                        l.internal ? (
                          <Link key={l.url} to={l.url} className={linkClass}>{l.label} <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
                        ) : (
                          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                            {l.label} <ExternalLink className="w-4 h-4" aria-hidden="true" />
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <CommunityCallout country={country} />
        <OrientationBanner />

        {/* Blog posts mapped to this country by category/tag */}
        <section aria-labelledby="posts-heading">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <h2 id="posts-heading" className="text-2xl md:text-3xl font-extrabold text-primary">Latest {country.name} guides</h2>
            {countryPosts.length > HUB_POST_LIMIT && (
              <Link to={`/blog?country=${country.slug}`} className="text-primary font-semibold hover:underline">
                See all {countryPosts.length} articles
              </Link>
            )}
          </div>
          {loading ? (
            <p className="text-slate-600">Loading articles…</p>
          ) : countryPosts.length === 0 ? (
            <div className="bg-white border border-border rounded-md p-6 text-slate-600">
              No {country.name} articles yet. New guides appear here automatically as soon as they’re published.{" "}
              <Link to="/blog" className="text-primary font-semibold hover:underline">Browse all articles</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {countryPosts.slice(0, HUB_POST_LIMIT).map((p, i) => <BlogCard key={p.id} post={p} index={i} />)}
            </div>
          )}
        </section>

        {/* Other destinations */}
        <section aria-labelledby="others-heading">
          <h2 id="others-heading" className="text-xl font-extrabold text-primary mb-4">Compare other destinations</h2>
          <ul className="flex flex-wrap gap-3">
            {others.map((c) => (
              <li key={c.slug}>
                <Link to={`/student-recruitment/${c.slug}`} className="inline-flex items-center gap-2 bg-white border border-border rounded-md px-4 py-2.5 font-semibold text-primary hover:border-accent hover:text-accent transition-colors">
                  <span aria-hidden="true">{c.flag}</span> Study in {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default StudentCountryHub;
