/** @type {import('tailwindcss').Config} */
import { brand, colors } from "./tokens.js";

const toHexPalette = (palette) =>
  Object.fromEntries(
    Object.entries(palette).map(([k, v]) => [
      k,
      typeof v === "object" && v?.hex != null ? v.hex : v,
    ])
  );

export default {
  darkMode: "class",
  content: [],
  theme: {
    extend: {
      colors: {
        primary: toHexPalette(colors.primary),
        accent: toHexPalette(colors.accent),
        secondary: toHexPalette(colors.secondary),
        success: toHexPalette(colors.success),
        warning: toHexPalette(colors.warning),
        danger: toHexPalette(colors.danger),
        brand: {
          background: brand.background.hex,
          foreground: brand.text.hex,
          orange: brand.orange.hex,
          cyan: brand.cyan.hex,
        },
      },
      backgroundImage: {
        "gradient-brand": `linear-gradient(90deg, ${brand.orange.hex} 0%, ${brand.cyan.hex} 100%)`,
        "gradient-brand-br": `linear-gradient(135deg, ${brand.orange.hex} 0%, ${brand.cyan.hex} 100%)`,
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 6px 12px -2px rgba(0, 0, 0, 0.04)",
        modern: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 20px -5px rgba(0, 0, 0, 0.06)",
        card: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        morph: "morph 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        morph: {
          "0%, 100%": {
            borderRadius: "20%",
            transform: "rotate(0deg) scale(1)",
          },
          "25%": {
            borderRadius: "50%",
            transform: "rotate(90deg) scale(0.9)",
          },
          "50%": {
            borderRadius: "5%",
            transform: "rotate(180deg) scale(1.1)",
          },
          "75%": {
            borderRadius: "50%",
            transform: "rotate(270deg) scale(0.9)",
          },
        },
      },
    },
  },
  plugins: [],
};
