import type { ConfigExternal } from "orval";
import { defineConfig } from "orval";

const config: ConfigExternal = defineConfig({
  hono: {
    input: "../../packages/spec/generated/openapi.yaml",
    output: {
      mode: "tags-split",
      client: "hono",
      target: "./src/generated/endpoints",
      schemas: "./src/generated/schemas",
      override: {
        hono: {
          compositeRoute: "./src/generated/routes.ts",
          handlers: "./src/handlers",
        },
      },
    },
  },
});

export default config;
