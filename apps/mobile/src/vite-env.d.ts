/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BETTER_AUTH_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
