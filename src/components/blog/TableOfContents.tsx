import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

const TableOfContents = ({ contentRef }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Extract headings from content
  useEffect(() => {
    if (!contentRef.current) return;

    const elements = contentRef.current.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    elements.forEach((el, index) => {
      const id = el.id || `heading-${index}`;
      if (!el.id) el.id = id;
      
      items.push({
        id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);
  }, [contentRef]);

  // Intersection Observer for active section
  useEffect(() => {
    if (!contentRef.current || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -66% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, contentRef]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block fixed left-8 top-32 w-56 max-h-[calc(100vh-200px)] overflow-y-auto">
        <nav className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            In this article
          </p>
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "block w-full text-left text-sm py-1.5 transition-colors duration-200",
                heading.level === 3 && "pl-3",
                activeId === heading.id
                  ? "text-accent font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Collapsible */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full p-4 bg-secondary/50 rounded-xl border border-border/50"
        >
          <List className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium flex-1 text-left">In this article</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-secondary/30 rounded-b-xl border-x border-b border-border/50"
            >
              <div className="p-4 space-y-2">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "block w-full text-left text-sm py-1.5 transition-colors",
                      heading.level === 3 && "pl-3",
                      activeId === heading.id
                        ? "text-accent font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {heading.text}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default TableOfContents;
