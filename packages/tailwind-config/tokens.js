/**
 * デザイントークン（配色）のマスター定義。
 * 配色を変更するときはこのファイルのみ編集する。
 * Tailwind設定・base.css・Ionic変数はここから派生する。
 * Zenn / Nani 風のブルー・Slate 系カラースキーム。
 */

export const colors = {
  primary: {
    50: { hex: "#EFF6FF", rgb: "239 246 255" },
    100: { hex: "#DBEAFE", rgb: "219 234 254" },
    200: { hex: "#BFDBFE", rgb: "191 219 254" },
    300: { hex: "#93C5FD", rgb: "147 197 253" },
    400: { hex: "#60A5FA", rgb: "96 165 250" },
    500: { hex: "#3EA8FF", rgb: "62 168 255" },
    600: { hex: "#2563EB", rgb: "37 99 235" },
    700: { hex: "#1D4ED8", rgb: "29 78 216" },
    800: { hex: "#1E40AF", rgb: "30 64 175" },
    900: { hex: "#1E3A8A", rgb: "30 58 138" },
    950: { hex: "#172554", rgb: "23 37 84" },
  },
  secondary: {
    50: { hex: "#F8FAFC", rgb: "248 250 252" },
    100: { hex: "#F1F5F9", rgb: "241 245 249" },
    200: { hex: "#E2E8F0", rgb: "226 232 240" },
    300: { hex: "#CBD5E1", rgb: "203 213 225" },
    400: { hex: "#94A3B8", rgb: "148 163 184" },
    500: { hex: "#64748B", rgb: "100 116 139" },
    600: { hex: "#475569", rgb: "71 85 105" },
    700: { hex: "#334155", rgb: "51 65 85" },
    800: { hex: "#1E293B", rgb: "30 41 59" },
    900: { hex: "#0F172A", rgb: "15 23 42" },
    950: { hex: "#020617", rgb: "2 6 23" },
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
