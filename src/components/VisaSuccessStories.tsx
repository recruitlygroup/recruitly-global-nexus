import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import visa1 from "@/assets/visa-success-1.png";
import visa2 from "@/assets/visa-success-2.png";
import visa3 from "@/assets/visa-success-3.png";
import visa4 from "@/assets/visa-success-4.png";
import visa5 from "@/assets/visa-success-5.png";
import visa6 from "@/assets/visa-success-6.png";
import visa7 from "@/assets/visa-success-7.png";
import visa8 from "@/assets/visa-success-8.png";
import visa9 from "@/assets/visa-success-9.png";
import visa10 from "@/assets/visa-success-10.png";

type Category = "All" | "Student" | "Intern" | "Worker";

interface SuccessStory {
  id: number;
  name: string;
  category: Exclude<Category, "All">;
  rating: number;
  review: string;
  photo?: string;
  youtubeId?: string;
  destination: string;
}

const stories: SuccessStory[] = [
  { id: 0, name: "Komal Karki", category: "Student", rating: 5, review: "Got a fully funded Italy study visa for University of Messina with €7,000 stipend. Dreams do come true!", youtubeId: "DxfNkJy1hrw", destination: "Italy" },
  { id: 1, name: "Ramesh K.", category: "Worker", rating: 5, review: "Got my Belarus work visa in just 2 weeks. Recruitly made the whole process stress-free!", photo: visa1, destination: "Belarus" },
  { id: 2, name: "Suman T.", category: "Worker", rating: 5, review: "Professional handling from start to finish. Highly recommend for work visa processing.", photo: visa2, destination: "Belarus" },
  { id: 3, name: "Bikram S.", category: "Worker", rating: 5, review: "Smooth documentation and fast approval. Now working abroad thanks to Recruitly Group.", photo: visa3, destination: "Belarus" },
  { id: 4, name: "Anita P.", category: "Worker", rating: 4, review: "Great support throughout. The team was always available to answer my queries.", photo: visa4, destination: "Belarus" },
  { id: 5, name: "Deepak M.", category: "Worker", rating: 5, review: "Exceptional service! They handled all my paperwork perfectly.", photo: visa5, destination: "Belarus" },
  { id: 6, name: "Prakash G.", category: "Worker", rating: 5, review: "Visa approved on first attempt. Very knowledgeable team.", photo: visa6, destination: "Belarus" },
  { id: 7, name: "Kamal R.", category: "Worker", rating: 5, review: "Secured my work visa quickly. The guidance was invaluable.", photo: visa7, destination: "Belarus" },
  { id: 8, name: "Sarita D.", category: "Worker", rating: 5, review: "From application to approval in record time. Truly professional service.", photo: visa8, destination: "Belarus" },
  { id: 9, name: "Arjun B.", category: "Worker", rating: 5, review: "Work visa processed flawlessly. Now employed in Europe!", photo: visa9, destination: "Belarus" },
  { id: 10, name: "Rajan H.", category: "Worker", rating: 4, review: "Helpful team, clear communication. Got my work visa without any issues.", photo: visa10, destination: "Belarus" },
];

const filters: Category[] = ["All", "Student", "Intern", "Worker"];

const categoryColors: Record<Exclude<Category, "All">, string> = {
  Student: "bg-blue-500/90 text-white",
  Intern: "bg-emerald-500/90 text-white",
  Worker: "bg-amber-500/90 text-white",
};

const flagEmoji: Record<string, string> = {
  Belarus: "🇧🇾",
  Italy: "🇮🇹",
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

const VisaSuccessStories = () => {
  const [activeFilter, setActiveFilter] = useState<Category>("All");
  const [lightbox, setLightbox] = useState<{ type: "image" | "youtube"; src: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const filtered = activeFilter === "All" ? stories : stories.filter((s) => s.category === activeFilter);

  // Auto-scroll
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

  const openStory = (story: SuccessStory) => {
    if (story.youtubeId) {
      setLightbox({ type: "youtube", src: story.youtubeId });
    } else if (story.photo) {
      setLightbox({ type: "image", src: story.photo });
    }
  };

  return (
    <section className="py-16 bg-background relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Visa Success Stories</h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">Real results from real clients — verified visas processed by Recruitly Group</p>
        </motion.div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filters.map((f) => (
            <Button key={f} variant={activeFilter === f ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(f)} className="rounded-full px-5 text-xs">
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
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
            className="flex-shrink-0 w-[260px] sm:w-[280px] rounded-xl border border-border/50 bg-card overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* Media */}
            <div className="relative aspect-[3/4] bg-muted cursor-pointer group overflow-hidden" onClick={() => openStory(story)}>
              {story.youtubeId ? (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${story.youtubeId}/hqdefault.jpg`}
                    alt={`${story.name} video`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img src={story.photo} alt={`${story.name} visa`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs bg-black/60 text-white px-3 py-1 rounded-full">Tap to enlarge</span>
                  </div>
                </>
              )}
              <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${categoryColors[story.category]}`}>
                {story.category}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-1.5 flex-1">
              <h3 className="text-sm font-semibold text-foreground">{story.name}</h3>
              <StarRating rating={story.rating} />
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-0.5">"{story.review}"</p>
              <Badge variant="secondary" className="mt-auto w-fit text-xs">
                {flagEmoji[story.destination] || "🌍"} {story.destination}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <>
            <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setLightbox(null)}>
              <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="absolute -top-12 right-0 text-white hover:bg-white/20" onClick={() => setLightbox(null)}>
                  <X className="w-6 h-6" />
                </Button>
                {lightbox.type === "youtube" ? (
                  <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${lightbox.src}?autoplay=1`}
                      title="Success story video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <img src={lightbox.src} alt="Visa approval" className="w-full h-auto rounded-xl shadow-2xl object-contain max-h-[85vh]" />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VisaSuccessStories;
