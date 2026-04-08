import { initI18n } from "@repo/i18n";
import { setBaseUrl } from "@repo/spec/fetcher";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App";

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
  await initI18n();
  setBaseUrl(import.meta.env.VITE_API_URL || "http://localhost:3000");
  renderApp();
}

init();
