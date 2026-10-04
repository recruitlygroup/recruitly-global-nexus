import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Play, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// NOTE: the raw visa/passport document scans previously shown here have been removed.
// The marker redaction over names and passport numbers was incomplete — fragments of
// both were still visible around the edges — so this is a privacy fix, not just a
// visual one. Verified outcomes are now shown as clean cards instead of document photos.

type Category = "All" | "Student" | "Worker";

interface SuccessStory {
  id: number;
  name: string;
  category: Exclude<Category, "All">;
  rating: number;
  review: string;
  role?: string;
  youtubeId?: string;
  destination: string;
}

const stories: SuccessStory[] = [
  { id: 0, name: "Komal Karki", category: "Student", rating: 5, review: "Got a fully funded Italy study visa for University of Messina with €7,000 stipend. Dreams do come true!", youtubeId: "DxfNkJy1hrw", destination: "Italy" },
  { id: 1, name: "Ramesh K.", category: "Worker", rating: 5, review: "Got my Belarus work visa in just 2 weeks. Recruitly made the whole process stress-free!", role: "Work visa", destination: "Belarus" },
  { id: 2, name: "Suman T.", category: "Worker", rating: 5, review: "Professional handling from start to finish. Highly recommend for work visa processing.", role: "Work visa", destination: "Belarus" },
  { id: 3, name: "Bikram S.", category: "Worker", rating: 5, review: "Smooth documentation and fast approval. Now working abroad thanks to Recruitly Group.", role: "Work visa", destination: "Belarus" },
  { id: 4, name: "Anita P.", category: "Worker", rating: 4, review: "Great support throughout. The team was always available to answer my queries.", role: "Work visa", destination: "Belarus" },
  { id: 5, name: "Deepak M.", category: "Worker", rating: 5, review: "Exceptional service! They handled all my paperwork perfectly.", role: "Work visa", destination: "Belarus" },
  { id: 6, name: "Prakash G.", category: "Worker", rating: 5, review: "Visa approved on first attempt. Very knowledgeable team.", role: "Work visa", destination: "Belarus" },
  { id: 7, name: "Kamal R.", category: "Worker", rating: 5, review: "Secured my work visa quickly. The guidance was invaluable.", role: "Work visa", destination: "Belarus" },
  { id: 8, name: "Sarita D.", category: "Worker", rating: 5, review: "From application to approval in record time. Truly professional service.", role: "Work visa", destination: "Belarus" },
  { id: 9, name: "Arjun B.", category: "Worker", rating: 5, review: "Work visa processed flawlessly. Now employed in Europe!", role: "Work visa", destination: "Belarus" },
  { id: 10, name: "Rajan H.", category: "Worker", rating: 4, review: "Helpful team, clear communication. Got my work visa without any issues.", role: "Work visa", destination: "Belarus" },
];

const filters: Category[] = ["All", "Student", "Worker"];

const categoryColors: Record<Exclude<Category, "All">, string> = {
  Student: "bg-blue-500/90 text-white",
  Worker: "bg-amber-500/90 text-white",
};

const flagEmoji: Record<string, string> = {
  Belarus: "🇧🇾",
  Italy: "🇮🇹",
};

// Deterministic pastel avatar background from the name, so each card looks distinct without any image asset.
const AVATAR_HUES = ["bg-rose-500/15 text-rose-700", "bg-sky-500/15 text-sky-700", "bg-emerald-500/15 text-emerald-700", "bg-violet-500/15 text-violet-700", "bg-amber-500/15 text-amber-700"];
const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const hueFor = (name: string) => AVATAR_HUES[name.charCodeAt(0) % AVATAR_HUES.length];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

const VisaSuccessStories = () => {
  const [activeFilter, setActiveFilter] = useState<Category>("All");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const filtered = activeFilter === "All" ? stories : stories.filter((s) => s.category === activeFilter);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isPaused) return;
    const interval = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 1, behavior: "auto" });
      }
    }, 20);
    return () => clearInterval(interval);
  }, [isPaused, filtered]);

  return (
    <section className="py-16 bg-background relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Visa Success Stories</h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">Real results from real clients — verified visas processed by Recruitly Group</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filters.map((f) => (
            <Button key={f} variant={activeFilter === f ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(f)} className="rounded-full px-5 text-xs">
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-hide cursor-grab"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {filtered.map((story) => (
          <div
            key={story.id}
            className="flex-shrink-0 w-[260px] sm:w-[280px] rounded-2xl border border-border/50 bg-card overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {story.youtubeId ? (
              <div className="relative aspect-video bg-muted cursor-pointer group overflow-hidden" onClick={() => setLightbox(story.youtubeId!)}>
                <img
                  src={`https://img.youtube.com/vi/${story.youtubeId}/hqdefault.jpg`}
                  alt={`${story.name} video testimonial`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
                  </div>
                </div>
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${categoryColors[story.category]}`}>{story.category}</span>
              </div>
            ) : (
              <div className={`relative h-24 flex items-center justify-center ${hueFor(story.name)}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-card shadow-sm ${hueFor(story.name).split(" ")[1]}`}>
                  {initials(story.name)}
                </div>
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${categoryColors[story.category]}`}>{story.category}</span>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-card/90 text-emerald-700 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            )}

            <div className="p-4 flex flex-col gap-1.5 flex-1">
              <h3 className="text-sm font-semibold text-foreground">{story.name}</h3>
              <StarRating rating={story.rating} />
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-0.5">"{story.review}"</p>
              <div className="mt-auto flex items-center gap-2 flex-wrap">
                {story.role && <Badge variant="secondary" className="text-xs">{story.role}</Badge>}
                <Badge variant="secondary" className="text-xs">{flagEmoji[story.destination] || "🌍"} {story.destination}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <>
            <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setLightbox(null)}>
              <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="absolute -top-12 right-0 text-white hover:bg-white/20" onClick={() => setLightbox(null)}>
                  <X className="w-6 h-6" />
                </Button>
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${lightbox}?autoplay=1`}
                    title="Success story video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VisaSuccessStories;
