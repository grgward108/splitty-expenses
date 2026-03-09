import { setAuthToken, setBaseUrl } from "@repo/spec/fetcher";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App";
import { getToken } from "./lib/token-storage";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

/* Tailwind CSS */
import "./styles/globals.css";

import { setupIonicReact } from "@ionic/react";

setupIonicReact({
  mode: "ios",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function renderApp() {
  const rootElement = document.getElementById("root")!;
  createRoot(rootElement).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

async function init() {
  // API ベース URL を設定
  setBaseUrl(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000");

  try {
    // Preferences から保存済みセッショントークンを復元し、
    // React レンダリング前にメモリに設定することでセッション取得を確実にする
    const token = await getToken();
    if (token) {
      setAuthToken(token);
    }
  } catch {
    // Preferences の読み込みに失敗してもアプリのレンダリングは継続する
  }

  renderApp();
}

init();
