import baseConfig from "@repo/tailwind-config";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  presets: [baseConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};
