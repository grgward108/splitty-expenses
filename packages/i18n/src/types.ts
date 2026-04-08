import "i18next";

import type balances from "./locales/ja/balances.json";
import type common from "./locales/ja/common.json";
import type expenses from "./locales/ja/expenses.json";
import type groups from "./locales/ja/groups.json";
import type home from "./locales/ja/home.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      home: typeof home;
      groups: typeof groups;
      expenses: typeof expenses;
      balances: typeof balances;
    };
  }
}
