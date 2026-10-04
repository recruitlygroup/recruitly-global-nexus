// "Roles we consistently fill" — swipeable carousel of clickable role cards.
// Each card links to its dedicated page (/roles/:slug). Also used on /manpower-recruitment.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import BackgroundPhoto from "./BackgroundPhoto";
import { ROLES } from "@/data/roles";
import { useI18n } from "@/i18n/I18nProvider";

const RolesGrid = () => {
  const { t } = useI18n();
  const [api, setApi] = useState<CarouselApi>();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const sync = () => { setCanPrev(api.canScrollPrev()); setCanNext(api.canScrollNext()); };
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => { api.off("select", sync); api.off("reInit", sync); };
  }, [api]);

  const ctrl = "flex h-11 w-11 items-center justify-center rounded-sm border border-ink text-ink transition-colors hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <section aria-labelledby="roles-heading">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h2 id="roles-heading" className="text-ink">{t("home.roles.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("home.roles.lead")}</p>
        </div>
        {(canPrev || canNext) && (
          <div className="flex gap-2">
            <button type="button" className={ctrl} onClick={() => api?.scrollPrev()} disabled={!canPrev} aria-label={t("home.roles.prev")}>
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className={ctrl} onClick={() => api?.scrollNext()} disabled={!canNext} aria-label={t("home.roles.next")}>
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}
      </div>

      <Carousel setApi={setApi} opts={{ align: "start" }} aria-label={t("home.roles.title")}>
        <CarouselContent className="-ml-4">
          {ROLES.map((r) => (
            <CarouselItem key={r.slug} className="basis-[80%] pl-4 sm:basis-1/2 md:basis-1/3 xl:basis-1/5">
              <Link to={`/roles/${r.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-sm text-white">
                <BackgroundPhoto
                  src={r.photo}
                  overlay="bottom"
                  imgClassName="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-2xl text-white">{t(`role.${r.slug}.title`)}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-white/85">{t(`role.${r.slug}.sum`)}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber">
                    {t("home.roles.explore")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" aria-hidden />
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};
export default RolesGrid;
