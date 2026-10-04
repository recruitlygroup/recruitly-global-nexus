// Search field shown under the header (desktop) or inside the mobile drawer.
// Submits to the job board, which reads ?q= as its initial search term.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface Props { onDone: () => void; autoFocus?: boolean; showClose?: boolean; className?: string }

const HeaderSearch = ({ onDone, autoFocus = false, showClose = false, className = "" }: Props) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/jobs?q=${encodeURIComponent(term)}` : "/jobs");
    setQ("");
    onDone();
  };

  return (
    <form role="search" aria-label={t("header.searchLabel")} onSubmit={submit} className={`flex items-center gap-3 ${className}`}>
      <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder={t("header.searchPlaceholder")}
        aria-label={t("header.searchLabel")}
        className="h-11 min-w-0 flex-1 border-0 border-b-2 border-border bg-transparent px-1 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <button type="submit" className="h-11 rounded-sm bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark">
        {t("header.searchSubmit")}
      </button>
      {showClose && (
        <button type="button" onClick={onDone} aria-label={t("header.searchClose")} className="flex h-11 w-11 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-5 w-5" aria-hidden />
        </button>
      )}
    </form>
  );
};

export default HeaderSearch;
