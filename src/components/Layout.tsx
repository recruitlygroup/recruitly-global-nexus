/**
 * src/components/Layout.tsx
 *
 * CHANGE: Added <TopBanner /> above SiteHeader.
 * Everything else unchanged.
 */

import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import FloatingEmployerCTA from "./employer/FloatingEmployerCTA";
import TopBanner from "./TopBanner";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Dismissible dual-audience banner */}
      <TopBanner />

      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />

      {/* Floating "Hire Talent" tab — visible on every page */}
      <FloatingEmployerCTA />
    </div>
  );
};

export default Layout;
