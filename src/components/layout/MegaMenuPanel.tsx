// Desktop mega-menu panel for one NavSection. Rendered by SiteHeader.
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { NavItem, NavSection } from "@/config/nav";
import { useI18n } from "@/i18n/I18nProvider";

const ItemLink = ({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) => {
  const { t } = useI18n();
  const Icon = item.icon;
  const body = (
    <>
      {Icon && (
        <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
      )}
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground group-hover:text-primary">
          {t(item.labelKey)}
          {item.external && <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />}
        </span>
        {item.descKey && <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{t(item.descKey)}</span>}
      </span>
    </>
  );
  const cls = "group flex items-start gap-3 rounded-lg p-2.5 -mx-2.5 transition-colors hover:bg-muted/70";
  return item.external ? (
    <a href={item.path} target="_blank" rel="noopener noreferrer" className={cls} onClick={onNavigate}>{body}</a>
  ) : (
    <Link to={item.path} className={cls} onClick={onNavigate}>{body}</Link>
  );
};

const MegaMenuPanel = ({ section, onNavigate }: { section: NavSection; onNavigate: () => void }) => {
  const { t } = useI18n();
  const F = section.feature;
  const FeatureIcon = F?.icon;
  return (
    <div className="page-container py-8">
      <div className="flex gap-10">
        <div className="grid flex-1 gap-x-10 gap-y-6" style={{ gridTemplateColumns: `repeat(${section.columns.length}, minmax(0, 1fr))` }}>
          {section.columns.map((col, i) => (
            <div key={i}>
              {col.headingKey && <p className="eyebrow mb-3">{t(col.headingKey)}</p>}
              <ul className="space-y-1">
                {col.items.map((item) => (
                  <li key={item.path + item.labelKey}><ItemLink item={item} onNavigate={onNavigate} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {F && FeatureIcon && (
          <aside className="hidden w-80 flex-shrink-0 rounded-xl bg-primary p-6 text-primary-foreground xl:block">
            <FeatureIcon className="mb-4 h-7 w-7 text-amber" aria-hidden />
            <h3 className="text-lg font-bold leading-snug text-white">{t(F.titleKey)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{t(F.bodyKey)}</p>
            <Link
              to={F.path}
              onClick={onNavigate}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber hover:text-white"
            >
              {t(F.ctaKey)} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
};

export default MegaMenuPanel;
