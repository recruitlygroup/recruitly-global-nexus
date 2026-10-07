// Inline bilingual helper for component-level strings: tr("English", "Български").
// Page-content specs are translated separately (see i18n/pageStrings.ts + translateDeep).
import { useCallback } from "react";
import { useI18n } from "./I18nProvider";

export const useTr = () => {
  const { lang } = useI18n();
  const tr = useCallback((en: string, bg: string) => (lang === "bg" ? bg : en), [lang]);
  return { tr, lang };
};
