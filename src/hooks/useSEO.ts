import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  /** One JSON-LD object or several (emitted as a single @graph). Removed again when the next page sets none. */
  structuredData?: object | object[];
}

const BASE_URL = "https://www.recruitlygroup.com";

export const useSEO = ({
  title,
  description,
  keywords,
  ogImage = `${BASE_URL}/og-image.jpg`,
  ogType = "website",
  canonicalUrl,
  noIndex = false,
  structuredData,
}: SEOProps) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        const attr = selector.includes("property=") ? "property" : "name";
        const val = selector.replace(/.*["'](.+)["'].*/, "$1");
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    setMeta('meta[name="description"]', description);
    if (keywords) setMeta('meta[name="keywords"]', keywords);
    setMeta('meta[name="robots"]', noIndex ? "noindex, nofollow" : "index, follow");

    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[property="og:url"]', canonicalUrl || window.location.href);
    setMeta('meta[property="og:site_name"]', "Recruitly Group");

    setMeta('meta[name="twitter:card"]', "summary_large_image");
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', ogImage);

    // Canonical always reflects the current route (no query/hash) unless a page passes its own.
    setLink("canonical", canonicalUrl || `${BASE_URL}${window.location.pathname}`);

    // JSON-LD: set when provided, REMOVE when not — otherwise the previous route's schema lingers after navigation.
    const existing = document.querySelector('script[data-seo="structured-data"]') as HTMLScriptElement | null;
    if (structuredData) {
      const script = existing ?? document.createElement("script");
      if (!existing) {
        script.setAttribute("type", "application/ld+json");
        script.setAttribute("data-seo", "structured-data");
        document.head.appendChild(script);
      }
      const payload = Array.isArray(structuredData)
        ? { "@context": "https://schema.org", "@graph": structuredData }
        : structuredData;
      script.textContent = JSON.stringify(payload);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, noIndex, structuredData]);
};
