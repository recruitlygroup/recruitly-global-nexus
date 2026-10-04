import { useI18n } from "@/i18n/I18nProvider";

const LanguageSwitcher = ({ dark = false }: { dark?: boolean }) => {
  const { lang, setLang, t } = useI18n();
  const base = dark ? "text-slate-300 hover:text-white" : "text-muted-foreground hover:text-foreground";
  return (
    <div role="group" aria-label={t("common.language")} className="flex items-center text-xs font-bold tracking-wide">
      {(["en", "bg"] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className={dark ? "text-slate-600" : "text-border"} aria-hidden>|</span>}
          <button
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`px-2 py-1 uppercase transition-colors ${lang === l ? "text-accent" : base}`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
