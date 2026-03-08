import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
  sourcemap: true,
  // Storybook files are not included in the build (only src/index.ts is the entry point)
  // If using glob patterns for entry, add: "!src/**/*.stories.tsx"
});
