import path from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const appUrlForClient = process.env.BETTER_AUTH_URL ?? "";

export default defineConfig({
  define: {
    "import.meta.env.BETTER_AUTH_URL": JSON.stringify(appUrlForClient),
  },
  plugins: [
    TanStackRouterVite({
      routeFileIgnorePattern: "\\.model\\.",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite しない — Hono は /api/auth/* でマウントしている。/api を削ると /auth/get-session になり 404 になる
      },
    },
  },
});
