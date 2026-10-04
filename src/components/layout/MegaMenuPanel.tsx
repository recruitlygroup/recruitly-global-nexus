// Desktop dropdown panel for one employer-menu section. Rendered by SiteHeader.
// Left: section title + overview link (first item). Right: the remaining pages in two columns.
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { NavSection } from "@/config/nav";
import { useI18n } from "@/i18n/I18nProvider";

const MegaMenuPanel = ({ section, onNavigate }: { section: NavSection; onNavigate: () => void }) => {
  const { t } = useI18n();
  const [overview, ...rest] = section.items;
  return (
    <div className="page-container py-8">
      <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
        <div className="border-b border-border pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
          <p className="text-2xl font-extrabold leading-tight text-ink">{t(section.labelKey)}</p>
          <Link
            to={overview.path}
            onClick={onNavigate}
            className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            {t(overview.labelKey)}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" aria-hidden />
          </Link>
        </div>

        <ul className="grid gap-x-10 sm:grid-cols-2">
          {rest.map((item) => (
            <li key={item.path + item.labelKey} className="border-b border-border/70">
              <Link
                to={item.path}
                onClick={onNavigate}
                className="group flex items-center justify-between py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:text-primary"
              >
                {t(item.labelKey)}
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MegaMenuPanel;
