// Language switcher — globe + code, opens an accessible radio menu (EN / BG).
import { Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/I18nProvider";
import type { Lang } from "@/i18n/translations";
import { SITE } from "@/config/site";

const LanguageSwitcher = ({ dark = false, className = "" }: { dark?: boolean; className?: string }) => {
  const { lang, setLang, t } = useI18n();
  const tone = dark
    ? "text-slate-300 hover:text-white hover:bg-white/10"
    : "text-muted-foreground hover:text-foreground hover:bg-muted";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t("common.language")}: ${t(`lang.${lang}`)}`}
        className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold uppercase tracking-eyebrow transition-colors ${tone} ${className}`}
      >
        <Globe className="w-4 h-4" aria-hidden />
        {lang}
        <ChevronDown className="w-3 h-3 opacity-70" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem] z-[80]">
        <DropdownMenuRadioGroup value={lang} onValueChange={(v) => setLang(v as Lang)}>
          {SITE.languages.map((l) => (
            <DropdownMenuRadioItem key={l} value={l} lang={l} className="cursor-pointer">
              {t(`lang.${l}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
