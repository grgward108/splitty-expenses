import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enGroups from "./locales/en/groups.json";
import enExpenses from "./locales/en/expenses.json";
import enBalances from "./locales/en/balances.json";
import jaCommon from "./locales/ja/common.json";
import jaHome from "./locales/ja/home.json";
import jaGroups from "./locales/ja/groups.json";
import jaExpenses from "./locales/ja/expenses.json";
import jaBalances from "./locales/ja/balances.json";

export const resources = {
  ja: {
    common: jaCommon,
    home: jaHome,
    groups: jaGroups,
    expenses: jaExpenses,
    balances: jaBalances,
  },
  en: {
    common: enCommon,
    home: enHome,
    groups: enGroups,
    expenses: enExpenses,
    balances: enBalances,
  },
} as const;

export type SupportedLanguage = "ja" | "en";

export function getLocaleForDate(lang: string): string {
  if (lang.startsWith("ja")) return "ja-JP";
  return "en-US";
}

export type InitI18nOptions = {
  defaultNS?: string;
};

export async function initI18n(options?: InitI18nOptions): Promise<typeof i18n> {
  if (i18n.isInitialized) {
    return i18n;
  }

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "ja",
      supportedLngs: ["ja", "en"],
      nonExplicitSupportedLngs: true,
      load: "languageOnly",
      defaultNS: options?.defaultNS ?? "common",
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
    });

  return i18n;
}

export { i18n };
