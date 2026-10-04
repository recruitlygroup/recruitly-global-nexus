// "What our clients say" — featured video (opens in an accessible dialog) + testimonial quotes.
// Replaces the former "Visa Success Stories" section. Content lives in src/data/clientTestimonials.ts.
import { useState } from "react";
import { ArrowLeft, ArrowRight, Play, Quote } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CLIENT_QUOTES, CLIENT_VIDEO } from "@/data/clientTestimonials";
import { useI18n } from "@/i18n/I18nProvider";

// Placeholder samples are visible in development only — never in a production build.
const QUOTES = CLIENT_QUOTES.filter((q) => !q.placeholder || import.meta.env.DEV);

const ClientTestimonials = () => {
  const { t } = useI18n();
  const [videoOpen, setVideoOpen] = useState(false);
  const [i, setI] = useState(0);
  // maxresdefault (1280×720) isn't generated for every video; fall back to hqdefault if it is missing.
  const [thumb, setThumb] = useState("maxresdefault");
  const quote = QUOTES[i];
  const ctrl = "flex h-11 w-11 items-center justify-center rounded-sm border border-ink text-ink transition-colors hover:bg-ink hover:text-white";

  return (
    <section aria-labelledby="testimonials-heading" className="bg-secondary/60">
      <div className="page-container py-16 md:py-24">
        <div className="mb-10 max-w-2xl">
          <h2 id="testimonials-heading" className="text-ink">{t("home.testi.title")}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{t("home.testi.lead")}</p>
        </div>

        <div className={`grid items-stretch gap-8 ${quote ? "lg:grid-cols-12" : ""}`}>
          {/* Video showcase */}
          <div className={quote ? "lg:col-span-7" : "mx-auto w-full max-w-4xl"}>
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              aria-label={`${t("home.testi.watch")}: ${CLIENT_VIDEO.name}`}
              className="group relative block aspect-video w-full overflow-hidden rounded-sm bg-ink text-left"
            >
              <img
                src={`https://img.youtube.com/vi/${CLIENT_VIDEO.youtubeId}/${thumb}.jpg`}
                onError={() => setThumb("hqdefault")}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              {/* dark overlay keeps the caption legible over any thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/10" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber text-amber-foreground shadow-lg transition-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
              </span>
              <span className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
                <span className="block text-sm font-semibold text-amber">{t("home.testi.videoCaption")}</span>
                <span className="mt-1 block text-lg font-bold md:text-xl">{CLIENT_VIDEO.name}, {CLIENT_VIDEO.destination}</span>
                <span className="mt-1 line-clamp-2 block max-w-2xl text-sm text-white/85 md:text-base">{CLIENT_VIDEO.quote}</span>
              </span>
            </button>
          </div>

          {/* Quotes */}
          {quote && (
            <div className="flex flex-col justify-between rounded-sm bg-white p-7 md:p-9 lg:col-span-5">
              <figure>
                <Quote className="h-9 w-9 text-primary" aria-hidden />
                <blockquote className="mt-5 text-xl font-medium leading-relaxed text-ink md:text-2xl" aria-live="polite">
                  {quote.quote}
                </blockquote>
                <figcaption className="mt-6">
                  <p className="font-bold text-ink">{quote.name}</p>
                  <p className="text-sm text-muted-foreground">{quote.role}, {quote.organisation}</p>
                  {quote.placeholder && (
                    <span className="mt-3 inline-block rounded-sm bg-amber px-2 py-0.5 text-xs font-semibold text-amber-foreground">{t("home.testi.sample")}</span>
                  )}
                </figcaption>
              </figure>
              {QUOTES.length > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground" aria-hidden>{i + 1} / {QUOTES.length}</p>
                  <div className="flex gap-2">
                    <button type="button" className={ctrl} onClick={() => setI((i - 1 + QUOTES.length) % QUOTES.length)} aria-label={t("home.testi.prev")}>
                      <ArrowLeft className="h-5 w-5" aria-hidden />
                    </button>
                    <button type="button" className={ctrl} onClick={() => setI((i + 1) % QUOTES.length)} aria-label={t("home.testi.next")}>
                      <ArrowRight className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-4xl overflow-hidden border-0 bg-black p-0 text-white">
          <DialogTitle className="sr-only">{t("home.testi.videoTitle")}</DialogTitle>
          <DialogDescription className="sr-only">{CLIENT_VIDEO.name}, {CLIENT_VIDEO.destination}</DialogDescription>
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${CLIENT_VIDEO.youtubeId}?autoplay=1&rel=0`}
              title={t("home.testi.videoTitle")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
export default ClientTestimonials;
