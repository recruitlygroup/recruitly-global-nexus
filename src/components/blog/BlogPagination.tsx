// Numbered pagination for the blog index. Renders real <a href="?page=N"> links
// (crawlable, open-in-new-tab friendly) and handles plain clicks client-side.
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  /** Builds the URL (path + query) for a page number. */
  hrefFor: (page: number) => string;
}

/** 1 … 4 5 6 … 12 — always shows first, last and a window around the current page. */
function getPageWindow(page: number, total: number): (number | "gap-l" | "gap-r")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "gap-l" | "gap-r")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("gap-l");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < total - 1) out.push("gap-r");
  out.push(total);
  return out;
}

const BlogPagination = ({ page, totalPages, hrefFor }: Props) => {
  const navigate = useNavigate();
  if (totalPages <= 1) return null;

  const go = (p: number) => (e: React.MouseEvent) => {
    // Let modified clicks (new tab, etc.) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(hrefFor(p));
  };

  const atStart = page <= 1;
  const atEnd = page >= totalPages;
  const disabled = "pointer-events-none opacity-50";

  return (
    <Pagination aria-label="Blog pages" className="mt-10">
      <PaginationContent className="flex-wrap justify-center gap-1">
        <PaginationItem>
          <PaginationPrevious
            href={hrefFor(Math.max(1, page - 1))}
            onClick={go(page - 1)}
            aria-disabled={atStart}
            tabIndex={atStart ? -1 : undefined}
            className={cn(atStart && disabled)}
          />
        </PaginationItem>

        {getPageWindow(page, totalPages).map((p) =>
          typeof p === "number" ? (
            <PaginationItem key={p}>
              <PaginationLink
                href={hrefFor(p)}
                onClick={go(p)}
                isActive={p === page}
                aria-label={`Page ${p}`}
                className={cn(p === page && "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={hrefFor(Math.min(totalPages, page + 1))}
            onClick={go(page + 1)}
            aria-disabled={atEnd}
            tabIndex={atEnd ? -1 : undefined}
            className={cn(atEnd && disabled)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default BlogPagination;
