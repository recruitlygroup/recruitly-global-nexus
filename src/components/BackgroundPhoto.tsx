// Full-bleed photo with a built-in contrast overlay. Fill the parent (parent must be `relative`).
// - Decorative by default (alt=""), so screen readers skip it; pass `alt` if the photo carries meaning.
// - If the file is missing, shows a brand gradient so text on top is always readable.
// - `priority` = above-the-fold image (eager + high fetch priority); everything else lazy-loads.
import { useState } from "react";
import { cn } from "@/lib/utils";

type Overlay = "left" | "bottom" | "flat" | "none";

// Semi-transparent ink overlays — tuned so white text clears WCAG AA over bright photos.
const OVERLAYS: Record<Overlay, string> = {
  left:   "bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30",     // hero: copy on the left
  bottom: "bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10",     // cards: caption at the bottom
  flat:   "bg-ink/70",                                              // centred copy (CTA banner)
  none:   "",
};

interface Props {
  src: string;
  alt?: string;
  overlay?: Overlay;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

const BackgroundPhoto = ({ src, alt = "", overlay = "flat", priority = false, className, imgClassName }: Props) => {
  const [failed, setFailed] = useState(false);
  // `fetchpriority` is valid HTML but missing from React 18's typings, so it is spread in untyped.
  const priorityHint: Record<string, string> = priority ? { fetchpriority: "high" } : {};
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-gradient-to-br from-primary-dark to-ink", className)} aria-hidden={alt ? undefined : true}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          width={1920}
          height={1080}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          {...priorityHint}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      )}
      {overlay !== "none" && <div className={cn("absolute inset-0", OVERLAYS[overlay])} />}
    </div>
  );
};

export default BackgroundPhoto;
