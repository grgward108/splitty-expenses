import baseConfig from "@repo/tailwind-config";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  presets: [baseConfig],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
};
