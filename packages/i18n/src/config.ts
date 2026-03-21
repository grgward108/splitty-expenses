import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enLanding from "./locales/en/landing.json";
import enSettings from "./locales/en/settings.json";
import enTasks from "./locales/en/tasks.json";
import jaAuth from "./locales/ja/auth.json";
import jaCommon from "./locales/ja/common.json";
import jaLanding from "./locales/ja/landing.json";
import jaSettings from "./locales/ja/settings.json";
import jaTasks from "./locales/ja/tasks.json";

export const resources = {
  ja: {
    common: jaCommon,
    auth: jaAuth,
    tasks: jaTasks,
    settings: jaSettings,
    landing: jaLanding,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    tasks: enTasks,
    settings: enSettings,
    landing: enLanding,
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
