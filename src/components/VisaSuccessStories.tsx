import { useState } from "react";
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

type Category = "All" | "Worker" | "Student" | "Intern";

interface SuccessStory {
  id: number;
  name: string;
  category: Exclude<Category, "All">;
  rating: number;
  review: string;
  photo: string;
  videoUrl?: string;
  destination: string;
}

const stories: SuccessStory[] = [
  { id: 1, name: "Ramesh K.", category: "Worker", rating: 5, review: "Got my Belarus work visa in just 2 weeks. Recruitly made the whole process stress-free!", photo: visa1, destination: "Belarus" },
  { id: 2, name: "Suman T.", category: "Worker", rating: 5, review: "Professional handling from start to finish. Highly recommend for work visa processing.", photo: visa2, destination: "Belarus" },
  { id: 3, name: "Bikram S.", category: "Worker", rating: 5, review: "Smooth documentation and fast approval. Now working abroad thanks to Recruitly Group.", photo: visa3, destination: "Belarus" },
  { id: 4, name: "Anita P.", category: "Worker", rating: 4, review: "Great support throughout. The team was always available to answer my queries.", photo: visa4, destination: "Belarus" },
  { id: 5, name: "Deepak M.", category: "Worker", rating: 5, review: "Exceptional service! They handled all my paperwork perfectly.", photo: visa5, destination: "Belarus" },
  { id: 6, name: "Prakash G.", category: "Worker", rating: 5, review: "Visa approved on first attempt. Very knowledgeable team.", photo: visa6, destination: "Belarus" },
  { id: 7, name: "Kamal R.", category: "Intern", rating: 5, review: "Secured my internship visa quickly. The guidance was invaluable.", photo: visa7, destination: "Belarus" },
  { id: 8, name: "Sarita D.", category: "Intern", rating: 5, review: "From application to approval in record time. Truly professional service.", photo: visa8, destination: "Belarus" },
  { id: 9, name: "Arjun B.", category: "Student", rating: 5, review: "Study visa processed flawlessly. Now pursuing my degree in Europe!", photo: visa9, destination: "Belarus" },
  { id: 10, name: "Rajan H.", category: "Student", rating: 4, review: "Helpful team, clear communication. Got my student visa without any issues.", photo: visa10, destination: "Belarus" },
];

const filters: Category[] = ["All", "Student", "Intern", "Worker"];

const categoryColors: Record<Exclude<Category, "All">, string> = {
  Student: "bg-blue-500/90 text-white",
  Intern: "bg-emerald-500/90 text-white",
  Worker: "bg-amber-500/90 text-white",
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const VisaSuccessStories = () => {
  const [activeFilter, setActiveFilter] = useState<Category>("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filtered = activeFilter === "All" ? stories : stories.filter((s) => s.category === activeFilter);

  return (
    <section className="py-20 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Visa Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real results from real clients — verified visas processed by Recruitly Group
          </p>
        </motion.div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((f) => (
            <Button
              key={f}
              variant={activeFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(f)}
              className="rounded-full px-5"
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Cards Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((story, i) => (
              <motion.div
                key={story.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  {/* Image / Video placeholder */}
                  <div
                    className="relative aspect-[3/4] bg-muted cursor-pointer group overflow-hidden"
                    onClick={() => setLightboxImage(story.photo)}
                  >
                    <img
                      src={story.photo}
                      alt={`${story.name} visa approval`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Category Badge */}
                    <span
                      className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${categoryColors[story.category]}`}
                    >
                      {story.category}
                    </span>
                    {/* Play overlay for video placeholder */}
                    {story.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-foreground ml-0.5" />
                        </div>
                      </div>
                    )}
                    {/* Tap to view */}
                    <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs bg-black/60 text-white px-3 py-1 rounded-full">
                        Tap to enlarge
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {story.name}
                    </h3>
                    <StarRating rating={story.rating} />
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      "{story.review}"
                    </p>
                    <Badge variant="secondary" className="mt-auto w-fit text-xs">
                      🇧🇾 {story.destination}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setLightboxImage(null)}
            >
              <div className="relative max-w-2xl max-h-[90vh] w-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-12 right-0 text-white hover:bg-white/20"
                  onClick={() => setLightboxImage(null)}
                >
                  <X className="w-6 h-6" />
                </Button>
                <img
                  src={lightboxImage}
                  alt="Visa approval"
                  className="w-full h-auto rounded-xl shadow-2xl object-contain max-h-[85vh]"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VisaSuccessStories;
