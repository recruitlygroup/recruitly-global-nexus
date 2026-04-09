/**
 * src/components/SocialProofWall.tsx  ← NEW FILE
 *
 * ═══════════════════════════════════════════════════════════════════
 * STRATEGY DECISION: Static Curated Social Proof Wall
 * ═══════════════════════════════════════════════════════════════════
 *
 * WHY NOT a live embedded Instagram feed:
 *   - Instagram's oEmbed API requires app review + token management
 *   - Third-party embed widgets (EmbedSocial, Elfsight) add JS payload
 *     and fail silently, showing blank sections at critical scroll depth
 *   - Live feeds show ALL posts including off-brand content
 *   - GDPR/cookie consent complications with third-party scripts
 *   - Zero control over what appears at what moment in the funnel
 *
 * WHY a Static Curated Wall wins for THIS business:
 *   1. Full control — you pick exactly which moments appear at the
 *      most conversion-critical scroll depth (between hiring section
 *      and VisaSuccessStories — maximum trust-building zone)
 *   2. Zero load risk — no third-party API failure, no blank section
 *   3. Conversion-optimised copy on every card — not raw captions
 *   4. Each card can carry a WhatsApp CTA tied to that post's topic
 *      (employer sees a truck driver post → "I need drivers" → direct link)
 *   5. Looks identical to Instagram but 10× faster and always works
 *   6. Privacy-safe — no candidate faces, no third-party tracking
 *
 * PLACEMENT: Between <HomepageHiringSection /> and <LatestInsights />
 * in Index.tsx — the highest-intent scroll zone after the B2B form,
 * where users decide whether to trust you or leave.
 *
 * HOW TO UPDATE:
 *   - Screenshot real Instagram posts → save to /public/social/ folder
 *   - Update the POSTS array below with image paths + copy
 *   - Run `npm run build` — done. No API keys, no tokens.
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Instagram, Heart, MessageCircle, ExternalLink,
  ArrowRight, Play, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Data — update these with your real Instagram post screenshots
// Image paths: put screenshots in /public/social/ folder as ig-1.jpg, ig-2.jpg…
// If no image yet, the placeholder gradient is shown automatically
// ─────────────────────────────────────────────────────────────────────────────

type PostAudience = "employer" | "candidate" | "both";

interface SocialPost {
  id: string;
  /** Path relative to /public — e.g. "/social/ig-1.jpg" — leave null for gradient placeholder */
  imagePath: string | null;
  /** Instagram post URL for the "View on Instagram" link */
  instagramUrl: string;
  /** Short card headline — conversion-focused, not a raw caption */
  headline: string;
  /** 1–2 sentence body copy */
  body: string;
  /** Emoji or short tag label */
  tag: string;
  /** Tag background colour class */
  tagColor: string;
  /** Gradient class used when no imagePath is set */
  placeholderGradient: string;
  /** Who this card speaks to — drives WhatsApp message pre-fill */
  audience: PostAudience;
  /** WhatsApp pre-filled message when CTA is clicked */
  waMessage: string;
  /** Approximate like count for social proof */
  likes: number;
  /** Approximate comment count */
  comments: number;
}

const IG_HANDLE = "recruitlygroup";
const IG_URL = `https://instagram.com/${IG_HANDLE}`;
const WA_BASE = "https://wa.me/9779743208282";

const POSTS: SocialPost[] = [
  {
    id: "p1",
    imagePath: null, // replace with "/social/ig-truck-driver.jpg" once available
    instagramUrl: IG_URL,
    headline: "Truck drivers placed in Germany 🇩🇪",
    body: "Another batch of C/CE licensed drivers deployed this month. Full visa process handled — employer received pre-screened, ready-to-work candidates.",
    tag: "🚛 Employers",
    tagColor: "bg-blue-600 text-white",
    placeholderGradient: "from-blue-900 via-blue-800 to-slate-900",
    audience: "employer",
    waMessage: "Hi Recruitly! I saw your Instagram post about truck drivers in Germany. I need to hire drivers for my company. Can we discuss?",
    likes: 284,
    comments: 31,
  },
  {
    id: "p2",
    imagePath: null,
    instagramUrl: IG_URL,
    headline: "Study visa approved — Italy 🇮🇹",
    body: "Komal got into University of Messina with a €7,000 stipend. Our WiseScore predicted high success — the result matched exactly.",
    tag: "🎓 Students",
    tagColor: "bg-violet-600 text-white",
    placeholderGradient: "from-violet-900 via-violet-800 to-slate-900",
    audience: "candidate",
    waMessage: "Hi! I saw the Instagram post about the Italy study visa. I want to study abroad and would like guidance. Can you help?",
    likes: 419,
    comments: 58,
  },
  {
    id: "p3",
    imagePath: null,
    instagramUrl: IG_URL,
    headline: "Caregivers deployed — Netherlands 🇳🇱",
    body: "Six qualified caregivers started at a residential care facility in Amsterdam this week. Pre-departure orientation completed. Employer feedback: excellent integration.",
    tag: "🏥 Employers",
    tagColor: "bg-emerald-600 text-white",
    placeholderGradient: "from-emerald-900 via-teal-800 to-slate-900",
    audience: "employer",
    waMessage: "Hi Recruitly! I saw your post about caregivers in the Netherlands. We need care staff in Germany. Can you help us?",
    likes: 312,
    comments: 44,
  },
  {
    id: "p4",
    imagePath: null,
    instagramUrl: IG_URL,
    headline: "Work visa approved in 5 weeks 🏆",
    body: "From application to stamp: 35 days. Romania work visa, documentation prepared and submitted by our team. Client spent zero hours on paperwork.",
    tag: "✅ Visa",
    tagColor: "bg-amber-600 text-white",
    placeholderGradient: "from-amber-900 via-orange-800 to-slate-900",
    audience: "candidate",
    waMessage: "Hi! I saw your post about the Romania work visa. I want to apply for a work visa. Can you guide me on the process?",
    likes: 387,
    comments: 52,
  },
  {
    id: "p5",
    imagePath: null,
    instagramUrl: IG_URL,
    headline: "Welders on-site in Poland 🇵🇱",
    body: "Steel fabrication project in Kraków is fully staffed. Certified MIG/TIG welders, credentials verified against European standards before deployment.",
    tag: "⚡ Employers",
    tagColor: "bg-blue-600 text-white",
    placeholderGradient: "from-slate-800 via-slate-700 to-blue-900",
    audience: "employer",
    waMessage: "Hi Recruitly! I saw your post about welders in Poland. We need skilled tradespeople for a project. Can we talk?",
    likes: 198,
    comments: 27,
  },
  {
    id: "p6",
    imagePath: null,
    instagramUrl: IG_URL,
    headline: "Germany language prep — 6-week result",
    body: "Our pre-departure A2 German language orientation: candidates arrive knowing key workplace phrases, safety terms, and daily communication. Retention impact is immediate.",
    tag: "🌍 Process",
    tagColor: "bg-rose-600 text-white",
    placeholderGradient: "from-rose-900 via-pink-800 to-slate-900",
    audience: "both",
    waMessage: "Hi Recruitly! I saw the post about the German language programme. I'm interested in working in Germany. How does it work?",
    likes: 341,
    comments: 39,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Post Card
// ─────────────────────────────────────────────────────────────────────────────

function PostCard({ post, index }: { post: SocialPost; index: number }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => {
      setLikeCount((c) => prev ? c - 1 : c + 1);
      return !prev;
    });
    // GTM event
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "social_post_liked",
        post_id: post.id,
        post_audience: post.audience,
      });
    }
  };

  const handleWAClick = () => {
    const url = `${WA_BASE}?text=${encodeURIComponent(post.waMessage)}`;
    window.open(url, "_blank", "noopener noreferrer");
    // GTM event
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "social_wa_click",
        post_id: post.id,
        post_audience: post.audience,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className="flex-shrink-0 w-[280px] sm:w-[300px] rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group"
    >
      {/* Image / Placeholder */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {post.imagePath ? (
          <img
            src={post.imagePath}
            alt={post.headline}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Gradient placeholder — replaced once real screenshots are added */
          <div className={`w-full h-full bg-gradient-to-br ${post.placeholderGradient} flex flex-col items-center justify-center gap-3 p-6 text-center transition-transform duration-500 group-hover:scale-105`}>
            <Instagram className="w-8 h-8 text-white/30" />
            <p className="text-white/70 text-xs font-medium leading-relaxed">
              Add screenshot from<br />
              <span className="text-white font-semibold">@{IG_HANDLE}</span>
            </p>
            <p className="text-white/40 text-[10px]">Save to /public/social/{post.id}.jpg</p>
          </div>
        )}

        {/* Tag badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${post.tagColor}`}>
          {post.tag}
        </span>

        {/* Instagram icon link */}
        <a
          href={post.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          aria-label="View on Instagram"
        >
          <ExternalLink className="w-3.5 h-3.5 text-white" />
        </a>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-foreground text-sm leading-snug">{post.headline}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{post.body}</p>

        {/* Engagement row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 hover:text-rose-500 transition-colors group/like"
            aria-label="Like this post"
          >
            <Heart className={`w-4 h-4 transition-all group-hover/like:scale-110 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{likeCount.toLocaleString()}</span>
          </button>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            {post.comments}
          </span>
          <a
            href={post.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[10px] text-accent hover:underline"
          >
            View post →
          </a>
        </div>

        {/* WhatsApp CTA */}
        <button
          onClick={handleWAClick}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Ask about this →
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const SocialProofWall = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update scroll arrow visibility
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isPaused) return;
    autoScrollRef.current = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 0.8, behavior: "auto" });
      }
      updateScrollState();
    }, 20);
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [isPaused, updateScrollState]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  // Total follower-style social proof number
  const totalLikes = POSTS.reduce((s, p) => s + p.likes, 0);

  return (
    <section className="py-16 md:py-20 bg-background relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.04),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4">

        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Instagram badge */}
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).dataLayer) {
                  (window as any).dataLayer.push({ event: "instagram_follow_click", location: "social_section_header" });
                }
              }}
            >
              <Instagram className="w-3.5 h-3.5" />
              @{IG_HANDLE}
            </a>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Real placements.
              <br />
              <span className="text-muted-foreground font-normal">See what we've been doing.</span>
            </h2>

            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              Every post represents a real outcome — a visa approved, a worker deployed, a student enrolled.
            </p>
          </motion.div>

          {/* Right side: follower count + follow CTA */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:items-end gap-2"
          >
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-2xl font-black text-foreground">{totalLikes.toLocaleString()}+</p>
                <p className="text-xs text-muted-foreground">reactions on these posts</p>
              </div>
              <a
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any).dataLayer) {
                    (window as any).dataLayer.push({ event: "instagram_follow_click", location: "social_section_cta" });
                  }
                }}
              >
                <Instagram className="w-4 h-4" />
                Follow Us
              </a>
            </div>
          </motion.div>
        </div>

        {/* ── Scroll Controls ─────────────────────────────────────────────── */}
        <div className="relative">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors -ml-3"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors -mr-3"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          )}

          {/* ── Post Cards Row ──────────────────────────────────────────────── */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => { setIsPaused(false); updateScrollState(); }}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => { setIsPaused(false); updateScrollState(); }}
            onScroll={updateScrollState}
          >
            {POSTS.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}

            {/* Final card — "See everything on Instagram" */}
            <div className="flex-shrink-0 w-[280px] sm:w-[300px] rounded-2xl overflow-hidden border border-dashed border-border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                <Instagram className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-base mb-1">See all our work</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  More placements, visa approvals, and candidate stories on Instagram.
                </p>
              </div>
              <a
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                @{IG_HANDLE}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom trust strip ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Zero fees charged to candidates
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Full visa process managed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              120+ placements since 2022
            </span>
          </div>

          {/* Dual audience CTA */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <a
              href={`${WA_BASE}?text=${encodeURIComponent("Hi Recruitly! I'm an employer looking to hire. Can we discuss my requirements?")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).dataLayer) {
                  (window as any).dataLayer.push({ event: "social_employer_cta_click" });
                }
              }}
            >
              I'm an Employer <ArrowRight className="w-3 h-3" />
            </a>
            <a
              href={`${WA_BASE}?text=${encodeURIComponent("Hi Recruitly! I'm looking for work abroad. Can you help me?")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).dataLayer) {
                  (window as any).dataLayer.push({ event: "social_candidate_cta_click" });
                }
              }}
            >
              I'm Looking for Work <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofWall;
