import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const betterAuthUrl =
    process.env.BETTER_AUTH_URL || fileEnv.BETTER_AUTH_URL || "http://localhost:3000";
  return {
    define: {
      "import.meta.env.BETTER_AUTH_URL": JSON.stringify(betterAuthUrl),
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 8100,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
