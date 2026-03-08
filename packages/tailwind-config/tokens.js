/**
 * デザイントークン（配色）のマスター定義。
 * 配色を変更するときはこのファイルのみ編集する。
 * Tailwind設定・base.css・Ionic変数はここから派生する。
 */

export const colors = {
  primary: {
    50: { hex: "#FFF7ED", rgb: "255 247 237" },
    100: { hex: "#FFEDD5", rgb: "255 237 213" },
    200: { hex: "#FED7AA", rgb: "254 215 170" },
    300: { hex: "#FDBA74", rgb: "253 186 116" },
    400: { hex: "#FB923C", rgb: "251 146 60" },
    500: { hex: "#FF7000", rgb: "255 112 0" },
    600: { hex: "#EA6500", rgb: "234 101 0" },
    700: { hex: "#C2530A", rgb: "194 83 10" },
    800: { hex: "#9A420D", rgb: "154 66 13" },
    900: { hex: "#7C350E", rgb: "124 53 14" },
    950: { hex: "#431A07", rgb: "67 26 7" },
  },
  secondary: {
    50: { hex: "#FAFAFA", rgb: "250 250 250" },
    100: { hex: "#F4F4F5", rgb: "244 244 245" },
    200: { hex: "#E4E4E7", rgb: "228 228 231" },
    300: { hex: "#D4D4D8", rgb: "212 212 216" },
    400: { hex: "#A1A1AA", rgb: "161 161 170" },
    500: { hex: "#71717A", rgb: "113 113 122" },
    600: { hex: "#52525B", rgb: "82 82 91" },
    700: { hex: "#3F3F46", rgb: "63 63 70" },
    800: { hex: "#27272A", rgb: "39 39 42" },
    900: { hex: "#18181B", rgb: "24 24 27" },
    950: { hex: "#09090B", rgb: "9 9 11" },
  },
  success: {
    50: { hex: "#f0fdf4", rgb: "240 253 244" },
    500: { hex: "#22c55e", rgb: "34 197 94" },
    600: { hex: "#16a34a", rgb: "22 163 74" },
  },
  warning: {
    50: { hex: "#fffbeb", rgb: "255 251 235" },
    500: { hex: "#f59e0b", rgb: "245 158 11" },
    600: { hex: "#d97706", rgb: "217 119 6" },
  },
  danger: {
    50: { hex: "#fef2f2", rgb: "254 242 242" },
    500: { hex: "#ef4444", rgb: "239 68 68" },
    600: { hex: "#dc2626", rgb: "220 38 38" },
  },
};

/** セマンティックトークン（背景・前景・カード等）。base.css の CSS 変数と一致させる。 */
export const semanticTokens = {
  light: {
    background: "255 255 255",
    foreground: colors.secondary[900].rgb,
    card: "255 255 255",
    cardForeground: colors.secondary[900].rgb,
    border: colors.secondary[200].rgb,
    muted: colors.secondary[100].rgb,
    mutedForeground: colors.secondary[500].rgb,
  },
  dark: {
    background: colors.secondary[950].rgb,
    foreground: colors.secondary[50].rgb,
    card: colors.secondary[900].rgb,
    cardForeground: colors.secondary[50].rgb,
    border: colors.secondary[700].rgb,
    muted: colors.secondary[900].rgb,
    mutedForeground: colors.secondary[400].rgb,
  },
};
