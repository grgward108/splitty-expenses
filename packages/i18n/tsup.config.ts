import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  external: ["react", "i18next", "react-i18next", "i18next-browser-languagedetector"],
  sourcemap: true,
});
