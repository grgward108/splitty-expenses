import "i18next";

import type auth from "./locales/ja/auth.json";
import type common from "./locales/ja/common.json";
import type landing from "./locales/ja/landing.json";
import type settings from "./locales/ja/settings.json";
import type tasks from "./locales/ja/tasks.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      auth: typeof auth;
      tasks: typeof tasks;
      settings: typeof settings;
      landing: typeof landing;
    };
  }
}
