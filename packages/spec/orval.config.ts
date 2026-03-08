import type { ConfigExternal } from "orval";
import { defineConfig } from "orval";

const config: ConfigExternal = defineConfig({
  // フロントエンド用（React Query クライアント）
  api: {
    input: "./generated/openapi.yaml",
    output: {
      mode: "tags-split",
      target: "./generated/client",
      schemas: "./generated/client/model",
      client: "react-query",
      httpClient: "fetch",
      override: {
        mutator: {
          path: "./src/fetcher.ts",
          name: "customFetch",
        },
        query: {
          useQuery: true,
          useMutation: true,
          useSuspenseQuery: true,
        },
      },
    },
  },
  // Note: Hono サーバー生成は apps/api/orval.config.ts に移動
});

export default config;
