// "Nepal CEE 2083 guides" strip: internal links to the /cee/* pages and the CEE blog posts.
// Shown on the student-recruitment index and the blog archive so students (and Google) reach them in one click.
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const TOOLS = [
  { to: "/cee/result-2083", title: "CEE Result 2083", body: "Check your rank, score and percentile by roll number." },
  { to: "/cee/mbbs-colleges-nepal", title: "MBBS colleges in Nepal", body: "28 colleges: seats, MEC fee ceiling, scholarship cut-offs." },
  { to: "/cee/bds-colleges-nepal", title: "BDS colleges in Nepal", body: "625 seats in 15 colleges for 6,256 qualified candidates." },
  { to: "/cee/bsc-nursing-colleges-nepal", title: "BSc Nursing colleges in Nepal", body: "59 colleges, 2,640 seats and the MEC fee ceiling." },
  { to: "/cee/mbbs-scholarship-cutoff-rank", title: "MBBS scholarship cut-off ranks", body: "Closing rank for every quota, BS 2080–2082." },
  { to: "/cee/mbbs-abroad-for-nepali-students", title: "MBBS abroad for Nepali students", body: "Georgia, Philippines, India and Europe compared." },
];

const POSTS = [
  { to: "/blog/cee-result-2083-what-your-rank-and-percentile-mean", title: "What your CEE rank and percentile mean" },
  { to: "/blog/mbbs-in-nepal-with-cee-rank-5000-is-it-possible", title: "MBBS in Nepal with CEE rank 5,000: is it possible?" },
  { to: "/blog/bds-in-nepal-625-seats-6256-candidates-what-rank-do-you-need", title: "BDS in Nepal: 625 seats, 6,256 candidates" },
  { to: "/blog/bsc-nursing-nepal-vs-india-cost-comparison-nepali-students", title: "BSc Nursing in Nepal vs India: real cost" },
];

const CeeGuidesStrip = () => (
  <section aria-labelledby="cee-guides-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <h2 id="cee-guides-heading" className="text-2xl md:text-3xl font-extrabold text-primary mb-2">Nepal CEE 2083 guides and tools</h2>
    <p className="text-slate-600 mb-6 max-w-2xl">Results are out. Check your rank, see which colleges fit it, and compare back-up options. Free.</p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TOOLS.map((t) => (
        <Link key={t.to} to={t.to} className="group bg-white border border-border rounded-md p-4 hover:border-primary transition-colors">
          <p className="font-bold text-primary flex items-center gap-1">{t.title} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></p>
          <p className="text-sm text-slate-600 mt-1">{t.body}</p>
        </Link>
      ))}
    </div>
    <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {POSTS.map((p) => <li key={p.to}><Link to={p.to} className="underline text-primary">{p.title}</Link></li>)}
    </ul>
  </section>
);

export default CeeGuidesStrip;
