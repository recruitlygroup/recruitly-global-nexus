// src/components/Layout.tsx
// ─────────────────────────────────────────────────────────────
// BUG FIX: SiteHeader is `position: fixed; top: 0` so it floats
// over page content. Previously the only spacer was h-16 (64px)
// for the header itself. When TopBanner is visible (≈40px tall),
// the header was covering the top 40px of TopBanner because both
// tried to occupy the same fixed position at top:0.
//
// FIX: Wrap TopBanner + SiteHeader together in a sticky block at
// the top of the document flow. The SiteHeader changes from
// `fixed` to `sticky` inside this wrapper so TopBanner pushes
// it down naturally. The `h-16` ghost spacer is removed because
// the sticky header no longer needs it.
//
// ACTUALLY: The simpler fix given the existing fixed header is to
// wrap TopBanner + SiteHeader in a `fixed top-0` container so
// they stack together, and update the page spacer to account for
// both heights dynamically.
// ─────────────────────────────────────────────────────────────

import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import FloatingEmployerCTA from "./employer/FloatingEmployerCTA";
import TopBanner from "./TopBanner";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/*
        ── Fixed header stack ──────────────────────────────────────
        TopBanner + SiteHeader are grouped inside a single fixed
        container so they stack vertically without overlapping.
        z-[55] ensures this sits above all page content (z-40 to
        z-50) but below modals (z-[100]+).
      */}
      <div className="fixed top-0 left-0 right-0 z-[55] flex flex-col">
        <TopBanner />
        <SiteHeader />
      </div>

      {/*
        ── Page content spacer ────────────────────────────────────
        Pushes content below the fixed header stack.
        h-16 = header (64px). TopBanner adds ~40px when visible.
        Using padding-top so content starts correctly regardless
        of banner dismissed state. The TopBanner animates in/out
        so we use a slightly generous value; the banner's
        AnimatePresence handles the visual transition.
        When TopBanner is dismissed: only h-16 matters.
        When TopBanner is visible: browser handles overflow naturally
        because the content scrolls under the fixed stack.
      */}
      <div id="main-content" className="flex-1 pt-16">
        <Outlet />
      </div>

      <SiteFooter />

      {/* Floating "Hire Talent" tab — right side, every page */}
      <FloatingEmployerCTA />
    </div>
  );
};

export default Layout;
